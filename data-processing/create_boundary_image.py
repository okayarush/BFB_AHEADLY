import geopandas as gpd
import rasterio
from rasterio.features import rasterize
from affine import Affine
import numpy as np
import os

# Try to import scipy for enhanced effects
try:
    from scipy import ndimage
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    print("scipy not available, some highlight effects will be skipped")

# --- Define paths ---
current_dir = os.path.dirname(os.path.abspath(__file__))
input_geojson_path = os.path.join(current_dir, 'raw', 'dhaka_boundary.geojson')
output_dir = os.path.join(current_dir, '..', 'client', 'public', 'data')
output_raster_path = os.path.join(output_dir, 'dhaka_boundary.png')

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# --- Main script ---
def create_boundary_image():
    """
    Creates a transparent PNG raster image with a thick, red boundary of Dhaka
    with highlight and glow effects for enhanced visibility.
    """
    print("Starting boundary image creation...")

    # 1. Check if the input GeoJSON file exists
    if not os.path.exists(input_geojson_path):
        print(f"Error: GeoJSON file not found at {input_geojson_path}")
        return

    # 2. Read the GeoJSON into a GeoDataFrame
    try:
        gdf = gpd.read_file(input_geojson_path)
    except Exception as e:
        print(f"Error reading GeoJSON file: {e}")
        return

    # 3. Get the bounding box of the geometry and define raster properties
    bounds = gdf.total_bounds
    xmin, ymin, xmax, ymax = bounds
    
    # A smaller pixel size means higher resolution and a thicker line when buffered.
    # Adjust this value to control line thickness. Smaller value = thicker line.
    pixel_size = 0.00005 # Adjusted for a thicker line

    width = int((xmax - xmin) / pixel_size)
    height = int((ymax - ymin) / pixel_size)
    transform = Affine(pixel_size, 0, xmin, 0, -pixel_size, ymax)

    # 4. Extract the boundary lines and apply a buffer to make them thicker
    # The buffer distance is in degrees, so a small value is needed.
    # Adjust this value to change the line thickness.
    buffered_boundary_polygons = gdf.boundary.buffer(0.001)

    # 5. Create a generator of (geometry, value) pairs for rasterization
    shapes_for_raster = ((geom, 1) for geom in buffered_boundary_polygons)

    # 6. Rasterize the buffered geometry
    try:
        raster = rasterize(
            shapes=shapes_for_raster, 
            out_shape=(height, width), 
            transform=transform, 
            fill=0, 
            all_touched=True,
            dtype=rasterio.uint8
        )
    except Exception as e:
        print(f"Error during rasterization: {e}")
        return

    # 7. Create an RGBA image with a transparent background and highlight effect
    raster_rgba = np.zeros((4, height, width), dtype=np.uint8)

    # Define colors for the boundary with highlight effect
    main_boundary_color = [220, 20, 60]  # RGB for crimson red
    highlight_color = [255, 100, 100]     # RGB for lighter red highlight
    glow_color = [255, 182, 193]          # RGB for light pink glow

    # Create different layers for highlight effect
    # First, create a slightly larger buffer for the glow effect
    glow_buffered_boundary = gdf.boundary.buffer(0.0015)  # Slightly larger buffer for glow
    shapes_for_glow = ((geom, 1) for geom in glow_buffered_boundary)
    
    try:
        glow_raster = rasterize(
            shapes=shapes_for_glow, 
            out_shape=(height, width), 
            transform=transform, 
            fill=0, 
            all_touched=True,
            dtype=rasterio.uint8
        )
    except Exception as e:
        print(f"Error during glow rasterization: {e}")
        glow_raster = np.zeros((height, width), dtype=np.uint8)

    # Apply the glow effect (outermost layer, semi-transparent)
    glow_mask = (glow_raster == 1) & (raster == 0)  # Only glow where main boundary isn't
    raster_rgba[0] = np.where(glow_mask, glow_color[0], 0)      # Red channel
    raster_rgba[1] = np.where(glow_mask, glow_color[1], 0)      # Green channel  
    raster_rgba[2] = np.where(glow_mask, glow_color[2], 0)      # Blue channel
    raster_rgba[3] = np.where(glow_mask, 80, 0)                 # Alpha channel (semi-transparent glow)

    # Apply the main boundary color (opaque, overrides glow where present)
    main_mask = raster == 1
    raster_rgba[0] = np.where(main_mask, main_boundary_color[0], raster_rgba[0])  # Red channel
    raster_rgba[1] = np.where(main_mask, main_boundary_color[1], raster_rgba[1])  # Green channel
    raster_rgba[2] = np.where(main_mask, main_boundary_color[2], raster_rgba[2])  # Blue channel
    raster_rgba[3] = np.where(main_mask, 255, raster_rgba[3])                     # Alpha channel (fully opaque)

    # Add inner highlight effect for extra pop
    if HAS_SCIPY:
        try:
            # Erode the boundary slightly to create inner highlight
            eroded = ndimage.binary_erosion(raster, iterations=2)
            inner_highlight_mask = (raster == 1) & (eroded == 0)
            
            # Apply highlight color to inner edges
            raster_rgba[0] = np.where(inner_highlight_mask, highlight_color[0], raster_rgba[0])
            raster_rgba[1] = np.where(inner_highlight_mask, highlight_color[1], raster_rgba[1])  
            raster_rgba[2] = np.where(inner_highlight_mask, highlight_color[2], raster_rgba[2])
            raster_rgba[3] = np.where(inner_highlight_mask, 255, raster_rgba[3])
        except Exception as e:
            print(f"Error applying inner highlight: {e}")
    else:
        print("Skipping inner highlight effect (scipy not available)")
    
    # 8. Save the final RGBA raster to a PNG file
    profile = {
        'driver': 'PNG',
        'height': height,
        'width': width,
        'count': 4, # Number of bands (R, G, B, Alpha)
        'dtype': rasterio.uint8,
        'crs': gdf.crs,
        'transform': transform,
    }

    try:
        with rasterio.open(output_raster_path, 'w', **profile) as dst:
            dst.write(raster_rgba)
        print(f"Successfully created a thick, transparent PNG boundary image at:\n{output_raster_path}")
    except Exception as e:
        print(f"Error saving PNG file: {e}")

if __name__ == "__main__":
    create_boundary_image()