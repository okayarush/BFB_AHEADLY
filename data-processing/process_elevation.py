import json
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import geopandas as gpd
import rasterio
from rasterio.merge import merge
from rasterio.mask import mask
from rasterio.transform import from_bounds
import os
import struct

def read_hgt_file(filename):
    """Read SRTM HGT file and return elevation data and metadata"""
    file_size = os.path.getsize(filename)
    size = int(np.sqrt(file_size / 2))
    
    with open(filename, 'rb') as hgt_data:
        data = hgt_data.read()
        elevations = []
        for i in range(0, len(data), 2):
            value = struct.unpack('>h', data[i:i+2])[0]
            elevations.append(value)
    
    elevation_array = np.array(elevations).reshape((size, size)).astype(np.float32)
    elevation_array[elevation_array < 0] = np.nan
    
    return elevation_array, size

def create_flood_risk_colormap():
    """Create a colormap for flood risk visualization"""
    colors = [
        '#8B0000',  # Dark red - Very high flood risk
        '#DC143C',  # Crimson - High flood risk
        '#FF4500',  # Orange red - Moderate-high flood risk
        '#FF6347',  # Tomato - Moderate flood risk
        '#FFA500',  # Orange - Moderate flood risk
        '#FFD700',  # Gold - Lower moderate flood risk
        '#FFFF00',  # Yellow - Transitional
        '#ADFF2F',  # Green yellow - Lower flood risk
        '#32CD32',  # Lime green - Low flood risk
        '#228B22',  # Forest green - Very low flood risk
        '#006400'   # Dark green - Minimal flood risk
    ]
    
    return LinearSegmentedColormap.from_list('flood_risk', colors, N=256)

def enhance_elevation_contrast(elevation_data):
    """Enhance the contrast of elevation data"""
    valid_mask = ~np.isnan(elevation_data)
    valid_data = elevation_data[valid_mask]
    
    if len(valid_data) == 0:
        return elevation_data
    
    # Use percentile stretching to enhance contrast
    p2, p98 = np.percentile(valid_data, [2, 98])
    enhanced_data = elevation_data.copy()
    
    # Clip and stretch
    clipped = np.clip(valid_data, p2, p98)
    stretched = (clipped - p2) / (p98 - p2) * (valid_data.max() - valid_data.min()) + valid_data.min()
    enhanced_data[valid_mask] = stretched
    
    return enhanced_data

def create_merged_tiff(hgt_files, output_dir):
    """Create a merged TIFF from multiple HGT files"""
    temp_files = []
    src_files = []
    
    for hgt_file in hgt_files:
        # Read HGT file
        elevation_data, size = read_hgt_file(hgt_file)
        
        # Determine bounds based on filename
        filename = os.path.basename(hgt_file)
        lat = int(filename[1:3])
        lon = int(filename[4:7])
        
        if filename[0] == 'S':
            lat = -lat
        if filename[3] == 'W':
            lon = -lon
        
        # Create transform
        transform = from_bounds(lon, lat, lon+1, lat+1, size, size)
        
        # Create a temporary GeoTIFF
        temp_tiff = os.path.join(output_dir, f"temp_{filename.replace('.hgt', '.tif')}")
        meta = {
            'driver': 'GTiff',
            'dtype': 'float32',
            'nodata': np.nan,
            'width': size,
            'height': size,
            'count': 1,
            'crs': 'EPSG:4326',
            'transform': transform
        }
        
        with rasterio.open(temp_tiff, 'w', **meta) as dst:
            dst.write(elevation_data.astype('float32'), 1)
        
        temp_files.append(temp_tiff)
    
    # Merge all temporary TIFF files
    src_files = [rasterio.open(f) for f in temp_files]
    merged, out_transform = merge(src_files)
    
    # Save merged TIFF
    merged_tiff = os.path.join(output_dir, "merged_elevation.tif")
    out_meta = src_files[0].meta.copy()
    out_meta.update({
        "height": merged.shape[1],
        "width": merged.shape[2],
        "transform": out_transform
    })
    
    with rasterio.open(merged_tiff, 'w', **out_meta) as dest:
        dest.write(merged)
    
    # Close all source files
    for src in src_files:
        src.close()
    
    # Clean up temporary files
    for temp_file in temp_files:
        if os.path.exists(temp_file):
            os.remove(temp_file)
    
    return merged_tiff, out_meta, out_transform

def process_dhaka_elevation():
    # Paths to files
    hgt_files = [
        "data-processing/raw/N23E090.hgt",
        "data-processing/raw/N24E090.hgt"
    ]
    geojson_file = "data-processing/raw/geoBoundaries-BGD-ADM2.geojson"
    output_dir = "data-processing/processed"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Output files
    output_tif = os.path.join(output_dir, "dhaka_elevation.tif")
    output_png = os.path.join(output_dir, "dhaka_elevation_map.png")
    
    # Remove existing files
    for file_path in [output_tif, output_png]:
        if os.path.exists(file_path):
            os.remove(file_path)
    
    # Load the GeoJSON and extract Dhaka boundary
    gdf = gpd.read_file(geojson_file)
    dhaka_boundary = gdf[gdf['shapeName'] == 'Dhaka']
    
    if dhaka_boundary.empty:
        print("Dhaka boundary not found in GeoJSON")
        return
    
    # Create merged TIFF from all HGT files
    print("Merging HGT files...")
    merged_tiff, merged_meta, merged_transform = create_merged_tiff(hgt_files, output_dir)
    
    # Clip the merged elevation data to Dhaka boundary
    with rasterio.open(merged_tiff) as src:
        geoms = [json.loads(dhaka_boundary.to_json())['features'][0]['geometry']]
        
        try:
            out_image, out_transform = mask(src, geoms, crop=True, all_touched=True)
            out_meta = src.meta.copy()
            
            out_meta.update({
                "height": out_image.shape[1],
                "width": out_image.shape[2],
                "transform": out_transform
            })
            
            elevation_data_clipped = out_image[0]
            
            # Get elevation statistics
            valid_data = elevation_data_clipped[~np.isnan(elevation_data_clipped)]
            if len(valid_data) > 0:
                min_val = np.min(valid_data)
                max_val = np.max(valid_data)
                
                # Apply contrast enhancement
                enhanced_elevation = enhance_elevation_contrast(elevation_data_clipped)
                
                # Create colormap
                cmap = create_flood_risk_colormap()
                
                # Save enhanced clipped raster
                with rasterio.open(output_tif, "w", **out_meta) as dest:
                    dest.write(enhanced_elevation.astype('float32')[np.newaxis, :, :])
                
                # Create visualization
                plt.figure(figsize=(10, 8))
                im = plt.imshow(enhanced_elevation, cmap=cmap,
                               extent=[out_transform[2], out_transform[2] + out_transform[0] * out_image.shape[2],
                                      out_transform[5] + out_transform[4] * out_image.shape[1], out_transform[5]])
                plt.colorbar(im, label='Elevation (meters)', shrink=0.8)
                plt.title('Dhaka Elevation Map - Flood Risk Visualization\n(Red = High Risk, Green = Low Risk)', 
                         fontsize=12)
                plt.axis('off')
                plt.savefig(output_png, dpi=150, bbox_inches='tight', facecolor='white')
                plt.close()
                
                print(f"Created {output_tif}")
                print(f"Created {output_png}")
                
        except Exception as e:
            print(f"Error during clipping: {e}")
    
    # Clean up temporary files
    if os.path.exists(merged_tiff):
        os.remove(merged_tiff)

if __name__ == "__main__":
    process_dhaka_elevation()