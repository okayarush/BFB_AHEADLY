import rasterio
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import json
import os

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

def create_elevation_overlay():
    # File paths
    tif_path = "data-processing/processed/dhaka_elevation.tif"
    output_png = "client/public/data/dhaka_elevation_overlay.png"
    output_bounds = "client/public/data/dhaka_elevation_bounds.json"
    
    # Create output directories if they don't exist
    os.makedirs(os.path.dirname(output_png), exist_ok=True)
    
    # Check if TIF file exists
    if not os.path.exists(tif_path):
        print(f"ERROR: TIF file not found at: {tif_path}")
        return None
    
    # Remove existing output files, for re generation
    for output_file in [output_png, output_bounds]:
        if os.path.exists(output_file):
            os.remove(output_file)
    
    try:
        # reading the tif file to elevation data variable
        with rasterio.open(tif_path) as src:
            elevation_data = src.read(1)
            
            # Get the bounds, it is already there
            bounds = src.bounds
            bounds_dict = {
                "north": float(bounds.top),
                "south": float(bounds.bottom),
                "east": float(bounds.right),
                "west": float(bounds.left)
            }
            
            # validity checking (optionl)
            valid_mask = ~np.isnan(elevation_data) & (elevation_data > 0)
            valid_data = elevation_data[valid_mask]
            
            if len(valid_data) == 0:
                print("no data found")
                return bounds_dict
            
            # color mapping
            cmap = create_flood_risk_colormap()
            
            # Normalize data for better color mapping
            norm_data = np.zeros_like(elevation_data, dtype=np.float32)
            valid_mask = ~np.isnan(elevation_data)
            
            # Use percentile-based normalization
            p5, p95 = np.percentile(valid_data, [5, 95])
            clipped_data = np.clip(elevation_data, p5, p95)
            norm_data[valid_mask] = (clipped_data[valid_mask] - p5) / (p95 - p5)
            
            # Apply colormap
            colored_data = cmap(norm_data)
            
            # Set transparency
            alpha_channel = np.zeros_like(norm_data, dtype=np.float32)
            alpha_channel[valid_mask] = 0.75  # 75% opacity for valid data
            colored_data[:, :, 3] = alpha_channel
            
            # Create the plot
            fig, ax = plt.subplots(figsize=(10, 8), dpi=150)
            
            # Display the image with correct geographic coordinates
            im = ax.imshow(colored_data, 
                          extent=[bounds.left, bounds.right, bounds.bottom, bounds.top],
                          aspect='auto',
                          origin='upper',
                          interpolation='bilinear')
            
            # Remove axis and borders
            ax.axis('off')
            plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
            
            # Save the image
            plt.savefig(output_png, 
                       bbox_inches='tight', 
                       pad_inches=0, 
                       transparent=True, 
                       dpi=150,
                       facecolor='none',
                       format='png')
            plt.close()
            
            # Save bounds information
            with open(output_bounds, 'w') as f:
                json.dump(bounds_dict, f, indent=2)
            
            print(f"Created {output_png}")
            print(f"Created {output_bounds}")
            
            return bounds_dict
            
    except Exception as e:
        print(f"ERROR processing TIF file: {e}")
        return None

if __name__ == "__main__":
    result = create_elevation_overlay()
    if result:
        print("Process completed successfully!")
    else:
        print("Process failed!")