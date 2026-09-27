import os
import sys
import json
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import Normalize
import geopandas as gpd
import rasterio
from rasterio.merge import merge
from rasterio.mask import mask
from shapely.geometry import mapping


def merge_and_clip(tif_files, geojson_path, output_dir, out_tif_name='dhaka_LST_map.tif', out_png_name='dhaka_LST_map.png'):
    os.makedirs(output_dir, exist_ok=True)

    # Load GeoJSON boundary and prefer the Dhaka feature if present
    gdf = gpd.read_file(geojson_path)

    # If GeoJSON has a 'shapeName' field, try to select only the Dhaka feature.
    if 'shapeName' in gdf.columns:
        dhaka_gdf = gdf[gdf['shapeName'] == 'Dhaka']
        if len(dhaka_gdf) == 0:
            print("Warning: no feature with shapeName == 'Dhaka' found in GeoJSON; using entire geometry.")
            used_gdf = gdf
        else:
            used_gdf = dhaka_gdf
    else:
        used_gdf = gdf

    # Combine geometries into a single geometry using union_all()
    try:
        combined = used_gdf.geometry.union_all()
    except Exception:
        # fallback to unary_union for very old geopandas versions
        combined = used_gdf.unary_union
    geom = [mapping(combined)]

    # Open first tif to get CRS
    with rasterio.open(tif_files[0]) as src0:
        raster_crs = src0.crs

    # Reproject the used GeoDataFrame (only Dhaka if selected) to raster CRS if needed
    if used_gdf.crs != raster_crs:
        try:
            used_gdf = used_gdf.to_crs(raster_crs)
            try:
                combined = used_gdf.geometry.union_all()
            except Exception:
                combined = used_gdf.unary_union
            geom = [mapping(combined)]
        except Exception as e:
            print(f"Warning: failed to reproject GeoJSON to raster CRS: {e}")

    # Open all tifs
    src_files = [rasterio.open(p) for p in tif_files]

    # Merge
    merged_array, merged_transform = merge(src_files)

    # Construct metadata for merged raster
    out_meta = src_files[0].meta.copy()
    out_meta.update({
        'height': merged_array.shape[1],
        'width': merged_array.shape[2],
        'transform': merged_transform,
        'count': merged_array.shape[0]
    })

    # Close sources
    for s in src_files:
        s.close()

    merged_tif = os.path.join(output_dir, 'merged_LST.tif')
    with rasterio.open(merged_tif, 'w', **out_meta) as dst:
        dst.write(merged_array)

    # Clip merged raster (perform in-memory; also write clipped TIFF to disk)
    with rasterio.open(merged_tif) as src:
        nodata = src.nodata
        try:
            out_image, out_transform = mask(src, geom, crop=True, nodata=nodata, filled=True)
        except Exception as e:
            # try without nodata argument if mask fails
            out_image, out_transform = mask(src, geom, crop=True)

        out_meta = src.meta.copy()
        out_meta.update({
            'height': out_image.shape[1],
            'width': out_image.shape[2],
            'transform': out_transform,
            'count': out_image.shape[0]
        })

        # Write the clipped TIFF to disk
        clipped_tif = os.path.join(output_dir, out_tif_name)
        with rasterio.open(clipped_tif, 'w', **out_meta) as dest:
            dest.write(out_image)

        # Prepare for plotting: use first band
        lst = out_image[0]
        if nodata is not None:
            lst_masked = np.ma.masked_equal(lst, nodata)
        else:
            # Some rasters use extreme negative values, mask nan or very small
            lst_masked = np.ma.masked_invalid(lst)

        # Plot
        plt.figure(figsize=(10, 8))
        vmin = np.nanpercentile(lst_masked.compressed(), 2) if lst_masked.count() > 0 else None
        vmax = np.nanpercentile(lst_masked.compressed(), 98) if lst_masked.count() > 0 else None
        norm = Normalize(vmin=vmin, vmax=vmax)
        im = plt.imshow(lst_masked, cmap='inferno', norm=norm)
        plt.colorbar(im, label='LST')
        plt.axis('off')
        plt.title('Clipped Land Surface Temperature - Dhaka')
        out_png = os.path.join(output_dir, out_png_name)
        plt.savefig(out_png, dpi=150, bbox_inches='tight', facecolor='white')
        plt.close()

    # Remove temporary merged tif
    try:
        os.remove(merged_tif)
    except Exception:
        pass

    # Return path to the saved clipped TIFF and the PNG path
    return clipped_tif, out_png


def main(argv):
    # Defaults based on workspace content
    raw_dir = 'data-processing/raw/LST'
    tif_basenames = [
        'ECO_L2T_LSTE.002_LST_doy2025092040705_aid0001_45N.tif',
        'ECO_L2T_LSTE.002_LST_doy2025092040757_aid0001_45N.tif',
        'ECO_L2T_LSTE.002_LST_doy2025092040757_aid0001_46N.tif',
        'ECO_L2T_LSTE.002_LST_doy2025093130909_aid0001_45N.tif',
        'ECO_L2T_LSTE.002_LST_doy2025134113354_aid0001_45N.tif',
        'ECO_L2T_LSTE.002_LST_doy2025004145336_aid0001_45N.tif',
        'ECO_L2T_LSTE.002_LST_doy2025006230436_aid0001_45N.tif'
    ]
    # Default to files inside raw/
    tif_files = [os.path.join(raw_dir, b) for b in tif_basenames]
    geojson = 'data-processing/raw/geoBoundaries-BGD-ADM2.geojson'
    output_dir = 'data-processing/processed'

    if len(argv) >= 3:
        # user may pass comma-separated names or full paths
        user_tifs = argv[1].split(',')
        geojson = argv[2]
        # prefer given path, but fall back to raw/<name> if the given path doesn't exist
        tif_files = [t if os.path.exists(t) else os.path.join(raw_dir, t) if os.path.exists(os.path.join(raw_dir, t)) else t for t in user_tifs]
    elif len(argv) == 2:
        geojson = argv[1]

    # Resolve any remaining basenames by checking raw/ as a fallback
    resolved = []
    for p in tif_files:
        if os.path.exists(p):
            resolved.append(p)
        elif os.path.exists(os.path.join(raw_dir, p)):
            resolved.append(os.path.join(raw_dir, p))
        else:
            resolved.append(p)
    tif_files = resolved

    # Validate inputs
    missing = [p for p in tif_files + [geojson] if not os.path.exists(p)]
    if missing:
        print('Missing files:', missing)
        print('Please run from workspace root or provide full paths. If TIFFs are in the raw folder, ensure they exist there.')
        return 2

    clipped_tif, out_png = merge_and_clip(tif_files, geojson, output_dir)
    if clipped_tif:
        print('Saved clipped TIFF:', clipped_tif)
    else:
        print('No clipped TIFF saved.')
    print('Saved visualization PNG:', out_png)


if __name__ == '__main__':
    sys.exit(main(sys.argv))
