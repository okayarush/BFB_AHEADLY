#!/usr/bin/env python3
"""
Current Situation Analysis Script
Analyzes polygon AOI and generates environmental baseline statistics
"""

import json
import sys
import argparse
import numpy as np
import rasterio
import rasterio.mask
from shapely.geometry import shape
from shapely.ops import transform
from typing import List, Dict, Any
import pyproj


import os

# Get the directory of this script and construct paths dynamically
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "processed")
ELEVATION_FILE = os.path.join(DATA_PATH, "dhaka_elevation.tif")
GREEN_FILE = os.path.join(DATA_PATH, "dhaka_green_space.tif")
LST_FILE = os.path.join(DATA_PATH, "dhaka_LST_map.tif")  # Fixed typo: LSR -> LST


def summarize_raster(raster_path: str, polygon_geom) -> Dict[str, Any]:
    """Clip raster to polygon and return summary statistics"""
    try:
        if not os.path.exists(raster_path):
            print(f"Raster file not found: {raster_path}", file=sys.stderr)
            return {"error": f"File not found: {raster_path}"}
            
        print(f"Analyzing raster: {raster_path}", file=sys.stderr)
        
        with rasterio.open(raster_path) as src:
            print(f"Raster info - CRS: {src.crs}, bounds: {src.bounds}", file=sys.stderr)
            print(f"Original polygon bounds: {polygon_geom.bounds}", file=sys.stderr)
            
            # Transform polygon to match raster CRS if needed
            polygon_for_analysis = polygon_geom
            if str(src.crs) != 'EPSG:4326':
                print(f"Transforming polygon from EPSG:4326 to {src.crs}", file=sys.stderr)
                # Create transformer from WGS84 to raster CRS
                transformer = pyproj.Transformer.from_crs('EPSG:4326', src.crs, always_xy=True)
                polygon_for_analysis = transform(transformer.transform, polygon_geom)
                print(f"Transformed polygon bounds: {polygon_for_analysis.bounds}", file=sys.stderr)
            
            # Check if polygon overlaps with raster
            raster_bounds = src.bounds
            poly_bounds = polygon_for_analysis.bounds
            
            print(f"Checking overlap - Raster: {raster_bounds}, Polygon: {poly_bounds}", file=sys.stderr)
            
            if (poly_bounds[2] < raster_bounds[0] or poly_bounds[0] > raster_bounds[2] or
                poly_bounds[3] < raster_bounds[1] or poly_bounds[1] > raster_bounds[3]):
                return {"error": "Polygon does not overlap with raster data"}
            
            out_image, out_transform = rasterio.mask.mask(src, [polygon_for_analysis], crop=True)
            out_data = out_image[0].astype(float)
            out_data[out_data == src.nodata] = np.nan

            values = out_data[~np.isnan(out_data)]
            if len(values) == 0:
                return {"mean": None, "min": None, "max": None, "valid_pixels": 0}

            result = {
                "mean": float(np.nanmean(values)),
                "min": float(np.nanmin(values)),
                "max": float(np.nanmax(values)),
                "valid_pixels": int(values.size),
                "total_pixels": int(out_data.size),
                "raster_crs": str(src.crs)
            }
            
            print(f"Raster analysis complete - Mean: {result['mean']:.2f}, Valid pixels: {result['valid_pixels']}", file=sys.stderr)
            return result
            
    except Exception as e:
        print(f"Error analyzing raster {raster_path}: {e}", file=sys.stderr)
        return {"error": str(e)}


def compute_geometry_info(polygon_geom) -> Dict[str, Any]:
    """Compute area, perimeter, centroid, bounding box of polygon"""

    # Reproject to UTM for accurate area/perimeter (Dhaka ~ UTM zone 46N EPSG:32646)
    project_to_utm = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:32646", always_xy=True).transform
    polygon_utm = transform(project_to_utm, polygon_geom)

    area_m2 = polygon_utm.area
    perimeter_m = polygon_utm.length
    centroid = list(polygon_geom.centroid.coords)[0]
    bounds = polygon_geom.bounds  # (minx, miny, maxx, maxy)

    return {
        "area_m2": float(area_m2),
        "area_km2": float(area_m2 / 1e6),
        "perimeter_m": float(perimeter_m),
        "centroid": {"lon": centroid[0], "lat": centroid[1]},
        "bounding_box": {
            "min_lon": bounds[0],
            "min_lat": bounds[1],
            "max_lon": bounds[2],
            "max_lat": bounds[3],
        }
    }


def analyze_polygon(polygon: Dict) -> Dict[str, Any]:
    """Perform full analysis for one polygon"""
    geom = shape(polygon["geometry"])

    # Geometry info
    geom_info = compute_geometry_info(geom)

    # Elevation stats
    elevation_stats = summarize_raster(ELEVATION_FILE, geom)

    # Green space stats (NDVI)
    green_stats = summarize_raster(GREEN_FILE, geom)
    green_area_percent = None
    if green_stats.get("mean") is not None and os.path.exists(GREEN_FILE):
        try:
            with rasterio.open(GREEN_FILE) as src:
                # Transform polygon to match raster CRS if needed
                polygon_for_analysis = geom
                if str(src.crs) != 'EPSG:4326':
                    transformer = pyproj.Transformer.from_crs('EPSG:4326', src.crs, always_xy=True)
                    polygon_for_analysis = transform(transformer.transform, geom)
                
                out_image, _ = rasterio.mask.mask(src, [polygon_for_analysis], crop=True)
                data = out_image[0].astype(float)
                data[data == src.nodata] = np.nan
                valid = data[~np.isnan(data)]
                if len(valid) > 0:
                    green_area_percent = float(np.sum(valid > 0.4) / valid.size * 100)
        except Exception as e:
            print(f"Error calculating green area percentage: {e}", file=sys.stderr)

    # Heat stats (LST)
    lst_stats = summarize_raster(LST_FILE, geom)

    return {
        "geometry_info": geom_info,
        "elevation": elevation_stats,
        "vegetation": {
            **green_stats,
            "green_area_percent": green_area_percent
        },
        "temperature": lst_stats
    }


def analyze_polygons(polygons_data: List[Dict]) -> Dict[str, Any]:
    """Analyze all polygons and return JSON result"""
    
    # Check file availability
    available_files = {
        'elevation': ELEVATION_FILE if os.path.exists(ELEVATION_FILE) else None,
        'vegetation': GREEN_FILE if os.path.exists(GREEN_FILE) else None,
        'temperature': LST_FILE if os.path.exists(LST_FILE) else None
    }
    
    print(f"=== File Status ===", file=sys.stderr)
    for data_type, file_path in available_files.items():
        if file_path:
            print(f"✓ Found {data_type}: {file_path}", file=sys.stderr)
        else:
            print(f"✗ Missing {data_type} data", file=sys.stderr)
    print("==================", file=sys.stderr)
    
    results = []
    for i, poly in enumerate(polygons_data):
        try:
            print(f"\n--- Processing Polygon {i+1} ---", file=sys.stderr)
            poly_result = analyze_polygon(poly)
            results.append({
                "polygon_index": i + 1,
                "geometry_type": poly.get("geometry", {}).get("type", "Unknown"),
                "analysis": poly_result
            })
        except Exception as e:
            print(f"Error processing polygon {i+1}: {e}", file=sys.stderr)
            results.append({
                "polygon_index": i + 1,
                "error": str(e)
            })

    return {
        "total_polygons": len(polygons_data),
        "analysis_results": results,
        "metadata": {
            "script_version": "4.0",
            "analysis_type": "environmental_baseline_plus_geometry",
            "available_data_files": [k for k, v in available_files.items() if v is not None]
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Analyze polygon AOI against environmental rasters")
    parser.add_argument("--input", type=str, help="JSON string containing polygon data")
    parser.add_argument("--file", type=str, help="Path to JSON file containing polygon data")
    args = parser.parse_args()

    try:
        if args.input:
            polygons_data = json.loads(args.input)
        elif args.file:
            with open(args.file, "r") as f:
                polygons_data = json.load(f)
        else:
            polygons_data = json.load(sys.stdin)

        if not isinstance(polygons_data, list):
            raise ValueError("Input must be a list of polygon objects")

        result = analyze_polygons(polygons_data)
        print(json.dumps(result, indent=2))

    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "message": "Failed to analyze polygon AOI"
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()

