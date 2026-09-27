/**
 * Service for loading and managing Solapur boundary data
 */

class BoundaryService {
  static boundaryData = null;
  static wardData = null;
  static loadPromise = null;
  static wardLoadPromise = null;

  /**
   * Load Solapur boundary GeoJSON data (cached after first load)
   * @returns {Promise<Object>} GeoJSON boundary data
   */
  static async loadBoundaryData() {
    if (this.boundaryData) {
      return this.boundaryData;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._fetchBoundaryData();

    try {
      this.boundaryData = await this.loadPromise;
      return this.boundaryData;
    } catch (error) {
      this.loadPromise = null; // Reset promise on error so retry is possible
      throw error;
    }
  }

  /**
   * Helper to get bounds from loaded boundary data
   * @returns {Promise<Array>} Leaflet bounds object/array
   */
  static async getBounds() {
    const data = await this.loadBoundaryData();
    if (!data) return null;

    // Basic bounds calculation from GeoJSON (if not using library like turk/leaflet directly here)
    // For now, we'll return a rough Solapur bounds if calculation is complex, 
    // OR we can trust the component using L.geoJSON(data).getBounds()
    // BUT since this is a service, we should probably return the generic GeoJSON and let the component handle bounds,
    // OR implement a simple bbox extractor.
    // Let's assume the component wraps this data in L.geoJSON to get bounds.
    // Actually, MapController needs the bounds.

    // Let's return the simplified features and let leaflet handle it in the component if passed to L.geoJSON
    // But MapController uses `map.fitBounds(bounds)`.

    // Hardcoded fallback Solapur bounds to ensure it works even if calculation fails
    // Solapur is approx: 17.6599° N, 75.9064° E
    // Bounds: [[17.55, 75.80], [17.75, 76.00]]
    return [[17.61, 75.84], [17.72, 76.00]];
  }

  /**
   * Load Solapur Ward boundary GeoJSON data (cached after first load)
   * @returns {Promise<Object>} GeoJSON ward data
   */
  static async loadWardData() {
    if (this.wardData) {
      return this.wardData;
    }

    if (this.wardLoadPromise) {
      return this.wardLoadPromise;
    }

    this.wardLoadPromise = this._fetchWardData();

    try {
      this.wardData = await this.wardLoadPromise;
      return this.wardData;
    } catch (error) {
      this.wardLoadPromise = null;
      throw error;
    }
  }

  /**
   * Private method to fetch boundary data from the server
   * @private
   */
  static async _fetchBoundaryData() {
    try {
      // Updated to fetch Solapur city boundary
      const response = await fetch("/solapur_city_boundary.geojson");

      if (!response.ok) {
        throw new Error(`Failed to load boundary data: ${response.statusText}`);
      }

      const geojsonData = await response.json();

      if (!geojsonData.features || geojsonData.features.length === 0) {
        throw new Error("Invalid boundary GeoJSON data");
      }

      return geojsonData;
    } catch (error) {
      console.error("Error loading Solapur boundary:", error);
      throw error;
    }
  }

  /**
   * Private method to fetch ward data from the server
   * @private
   */
  static async _fetchWardData() {
    try {
      const response = await fetch("/solapur_wards.geojson");

      if (!response.ok) {
        throw new Error(`Failed to load ward data: ${response.statusText}`);
      }

      const geojsonData = await response.json();

      if (!geojsonData.features || geojsonData.features.length === 0) {
        throw new Error("Invalid ward GeoJSON data");
      }

      return geojsonData;
    } catch (error) {
      console.error("Error loading Solapur wards:", error);
      throw error;
    }
  }

  /**
   * Get boundary style configuration for red boundary with glow effect
   * @param {string} layer - The layer type: 'glow-outer', 'glow-middle', or 'main'
   * @returns {Object} Leaflet style configuration
   */
  static getBoundaryStyle(layer = "main") {
    const styles = {
      "glow-outer": {
        color: "#FFB6C1", // Light pink glow
        weight: 3, // Thickest for outer glow
        opacity: 0.3, // Semi-transparent
        fillOpacity: 0, // No fill for glow
        lineCap: "round",
        lineJoin: "round",
      },
      "glow-middle": {
        color: "#FF6464", // Medium red glow
        weight: 2, // Medium thickness
        opacity: 0.5, // Semi-transparent
        fillOpacity: 0, // No fill for glow
        lineCap: "round",
        lineJoin: "round",
      },
      main: {
        color: "#DC143C", // Crimson red main boundary
        weight: 1, // Main border thickness
        opacity: 1, // Full opacity
        fillColor: "#DC143C", // Same color for fill
        fillOpacity: 0, // No fill - completely transparent
        dashArray: null, // Solid line
        lineCap: "round",
        lineJoin: "round",
      },
    };

    return styles[layer] || styles.main;
  }

  /**
   * Unused in Solapur implementation but kept for compatibility
   * Get ward style configuration
   */
  static getWardStyle(isSelected = false, isHovered = false) {
    return {
      color: isSelected ? "#FCD34D" : isHovered ? "#60A5FA" : "#9ca3af",
      weight: isSelected ? 2 : isHovered ? 2 : 1,
      opacity: 1,
      fillColor: isSelected ? "#FCD34D" : isHovered ? "#60A5FA" : "#374151",
      fillOpacity: isSelected ? 0.3 : isHovered ? 0.2 : 0.05,
      dashArray: isSelected || isHovered ? null : "3",
    };
  }

  /**
   * Clear cached boundary data
   */
  static clearCache() {
    this.boundaryData = null;
    this.wardData = null;
    this.loadPromise = null;
    this.wardLoadPromise = null;
  }

  /**
   * Get the bounds of the boundary for map fitting
   * @returns {Promise<Array>} Array of [[south, west], [north, east]] coordinates
   */
  static async getBounds() {
    const boundaryData = await this.loadBoundaryData();

    if (!boundaryData.features || boundaryData.features.length === 0) {
      throw new Error("No boundary features found");
    }

    // Calculate bounds from the GeoJSON
    let minLat = Infinity,
      maxLat = -Infinity;
    let minLng = Infinity,
      maxLng = -Infinity;

    boundaryData.features.forEach((feature) => {
      // Check for different geometry types (Polygon vs MultiPolygon)
      const geometries =
        feature.geometry.type === "MultiPolygon"
          ? feature.geometry.coordinates.flat(1)
          : feature.geometry.coordinates;

      geometries.forEach((ring) => {
        ring.forEach((coord) => {
          const [lng, lat] = coord;
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        });
      });
    });

    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ];
  }
}

export default BoundaryService;
