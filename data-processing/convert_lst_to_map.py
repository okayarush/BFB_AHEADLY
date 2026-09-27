import os
import glob
import json
import numpy as np
import rasterio
import matplotlib.pyplot as plt
from matplotlib.colors import Normalize

def create_lst_overlay():
    # candidate paths (preferred names first)
    processed_dir = "data-processing/processed"
    candidates = [
        os.path.join(processed_dir, "dhaka_LST_map.tif"),
        os.path.join(processed_dir, "dhaka_LST_clipped.tif"),
        os.path.join(processed_dir, "dhaka_LST.tif"),
    ]
    # fallback: first .tif in processed_dir
    if not any(os.path.exists(p) for p in candidates):
        tifs = sorted(glob.glob(os.path.join(processed_dir, "*.tif")))
        if len(tifs) == 0:
            print(f"ERROR: No TIFFs found in {processed_dir}")
            return None
        candidates = tifs

    # pick the first existing candidate
    tif_path = next(p for p in candidates if os.path.exists(p))

    # Save into public so the dev server / static host serves them at /data/...
    output_png = "client/public/data/dhaka_lst_overlay.png"
    output_bounds = "client/public/data/dhaka_lst_bounds.json"
    os.makedirs(os.path.dirname(output_png), exist_ok=True)

    try:
        with rasterio.open(tif_path) as src:
            arr = src.read(1)
            bounds = src.bounds

            # handle nodata
            nodata = src.nodata
            if nodata is not None:
                valid_mask = (arr != nodata) & ~np.isnan(arr)
            else:
                valid_mask = ~np.isnan(arr)

            valid_data = arr[valid_mask]
            if valid_data.size == 0:
                print("ERROR: No valid data in LST raster")
                return None

            # percentile-based normalization (use 2-98 to preserve extremes)
            p_low, p_high = np.percentile(valid_data, [2, 98])
            if p_high == p_low:
                p_low, p_high = valid_data.min(), valid_data.max()
                if p_high == p_low:
                    p_high = p_low + 1.0

            norm = Normalize(vmin=p_low, vmax=p_high, clip=True)
            cmap = plt.get_cmap("inferno")

            # prepare normalized RGBA image
            normed = np.zeros_like(arr, dtype=np.float32)
            normed[valid_mask] = norm(arr[valid_mask])
            rgba = cmap(normed)  # returns MxNx4 float RGBA in 0..1

            # set alpha: transparent where invalid
            alpha = np.zeros_like(normed, dtype=np.float32)
            alpha[valid_mask] = 0.75  # 75% opacity on valid pixels
            rgba[..., 3] = alpha

            # Plot and save with geographic extent
            fig, ax = plt.subplots(figsize=(10, 8), dpi=150)
            im = ax.imshow(rgba,
                           extent=[bounds.left, bounds.right, bounds.bottom, bounds.top],
                           origin="upper",
                           interpolation="bilinear",
                           aspect="auto")
            ax.axis("off")
            plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
            plt.savefig(output_png, bbox_inches="tight", pad_inches=0, transparent=True)
            plt.close()

            bounds_dict = {
                "north": float(bounds.top),
                "south": float(bounds.bottom),
                "east": float(bounds.right),
                "west": float(bounds.left)
            }

            # write bounds json so the map can position the overlay
            with open(output_bounds, "w") as f:
                json.dump(bounds_dict, f, indent=2)

            print(f"Created {output_png} from {tif_path}")
            print(f"Created {output_bounds}")
            return {
                "source_tif": tif_path,
                "output_png": output_png,
                "bounds": bounds_dict
            }

    except Exception as e:
        print(f"ERROR processing LST TIFF: {e}")
        return None

if __name__ == "__main__":
    res = create_lst_overlay()
    if res:
        print("Done.")
    else:
        print("Failed.")
