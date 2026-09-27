const logger = require('./logger');

// Simple in-memory cache implementation
class SimpleCache {
  constructor(options = {}) {
    this.data = new Map();
    this.timers = new Map();
    this.ttl = options.stdTTL || 3600; // Default TTL in seconds
    this.maxKeys = options.maxKeys || 1000;
  }

  set(key, value, ttl = null) {
    // Remove existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Check if we need to make room
    if (this.data.size >= this.maxKeys && !this.data.has(key)) {
      // Remove oldest entry
      const firstKey = this.data.keys().next().value;
      this.del(firstKey);
    }

    this.data.set(key, value);
    
    const expireTime = (ttl || this.ttl) * 1000;
    const timer = setTimeout(() => {
      this.del(key);
    }, expireTime);
    
    this.timers.set(key, timer);
    return true;
  }

  get(key) {
    return this.data.get(key);
  }

  has(key) {
    return this.data.has(key);
  }

  del(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.data.delete(key);
  }

  keys() {
    return Array.from(this.data.keys());
  }

  flushAll() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.data.clear();
  }

  mget(keys) {
    const result = {};
    keys.forEach(key => {
      if (this.data.has(key)) {
        result[key] = this.data.get(key);
      }
    });
    return result;
  }

  mset(keyValuePairs) {
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      this.set(key, value);
    });
    return true;
  }

  getStats() {
    return {
      keys: this.data.size,
      hits: 0, // Simplified stats
      misses: 0
    };
  }

  flushStats() {
    // No-op for compatibility
  }

  on(event, callback) {
    // No-op for compatibility with NodeCache events
  }
}

// Create cache instances for different data types
const mainCache = new SimpleCache({
  stdTTL: 3600, // Default TTL of 1 hour
  maxKeys: 1000, // Maximum number of keys
});

const nasaDataCache = new SimpleCache({
  stdTTL: 7200, // NASA data cached for 2 hours
  maxKeys: 500,
});

const riskCache = new SimpleCache({
  stdTTL: 1800, // Risk calculations cached for 30 minutes
  maxKeys: 200,
});

const interventionCache = new SimpleCache({
  stdTTL: 3600, // Intervention calculations cached for 1 hour
  maxKeys: 300,
});

// Cache statistics
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  flushes: 0,
};

// Cache manager class
class CacheManager {
  constructor() {
    this.caches = {
      main: mainCache,
      nasa: nasaDataCache,
      risk: riskCache,
      intervention: interventionCache,
    };

    // Set up event listeners for cache statistics
    this.setupEventListeners();
  }

  setupEventListeners() {
    Object.entries(this.caches).forEach(([name, cache]) => {
      cache.on('set', (key, value) => {
        cacheStats.sets++;
        logger.debug(`Cache SET [${name}]: ${key}`);
      });

      cache.on('del', (key, value) => {
        cacheStats.deletes++;
        logger.debug(`Cache DELETE [${name}]: ${key}`);
      });

      cache.on('expired', (key, value) => {
        logger.debug(`Cache EXPIRED [${name}]: ${key}`);
      });

      cache.on('flush', () => {
        cacheStats.flushes++;
        logger.info(`Cache FLUSH [${name}]`);
      });
    });
  }

  // Get data from cache
  get(key, cacheType = 'main') {
    const cache = this.caches[cacheType];
    if (!cache) {
      logger.warn(`Invalid cache type: ${cacheType}`);
      return undefined;
    }

    const value = cache.get(key);
    if (value !== undefined) {
      cacheStats.hits++;
      logger.debug(`Cache HIT [${cacheType}]: ${key}`);
      return value;
    } else {
      cacheStats.misses++;
      logger.debug(`Cache MISS [${cacheType}]: ${key}`);
      return undefined;
    }
  }

  // Set data in cache
  set(key, value, ttl = null, cacheType = 'main') {
    const cache = this.caches[cacheType];
    if (!cache) {
      logger.warn(`Invalid cache type: ${cacheType}`);
      return false;
    }

    const success = ttl ? cache.set(key, value, ttl) : cache.set(key, value);
    if (success) {
      logger.debug(`Cache SET [${cacheType}]: ${key} (TTL: ${ttl || 'default'})`);
    }
    return success;
  }

  // Delete data from cache
  del(key, cacheType = 'main') {
    const cache = this.caches[cacheType];
    if (!cache) {
      logger.warn(`Invalid cache type: ${cacheType}`);
      return 0;
    }

    return cache.del(key);
  }

  // Check if key exists
  has(key, cacheType = 'main') {
    const cache = this.caches[cacheType];
    if (!cache) {
      return false;
    }

    return cache.has(key);
  }

  // Get multiple keys
  mget(keys, cacheType = 'main') {
    const cache = this.caches[cacheType];
    if (!cache) {
      logger.warn(`Invalid cache type: ${cacheType}`);
      return {};
    }

    return cache.mget(keys);
  }

  // Set multiple key-value pairs
  mset(keyValuePairs, cacheType = 'main') {
    const cache = this.caches[cacheType];
    if (!cache) {
      logger.warn(`Invalid cache type: ${cacheType}`);
      return false;
    }

    return cache.mset(keyValuePairs);
  }

  // Get all keys
  keys(cacheType = 'main') {
    const cache = this.caches[cacheType];
    if (!cache) {
      return [];
    }

    return cache.keys();
  }

  // Flush specific cache
  flushCache(cacheType = 'main') {
    const cache = this.caches[cacheType];
    if (!cache) {
      logger.warn(`Invalid cache type: ${cacheType}`);
      return;
    }

    cache.flushAll();
    logger.info(`Flushed ${cacheType} cache`);
  }

  // Flush all caches
  flushAll() {
    Object.entries(this.caches).forEach(([name, cache]) => {
      cache.flushAll();
    });
    logger.info('Flushed all caches');
  }

  // Get cache statistics
  getStats() {
    const cacheInfo = {};
    
    Object.entries(this.caches).forEach(([name, cache]) => {
      cacheInfo[name] = {
        keys: cache.keys().length,
        stats: cache.getStats(),
      };
    });

    return {
      ...cacheStats,
      caches: cacheInfo,
      hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
    };
  }

  // NASA-specific cache methods
  getNASAData(latitude, longitude, dataType, dateRange = null) {
    const key = this.generateNASAKey(latitude, longitude, dataType, dateRange);
    return this.get(key, 'nasa');
  }

  setNASAData(latitude, longitude, dataType, data, dateRange = null, ttl = 7200) {
    const key = this.generateNASAKey(latitude, longitude, dataType, dateRange);
    return this.set(key, data, ttl, 'nasa');
  }

  generateNASAKey(latitude, longitude, dataType, dateRange) {
    const baseKey = `${dataType}_${latitude}_${longitude}`;
    return dateRange ? `${baseKey}_${dateRange.start}_${dateRange.end}` : baseKey;
  }

  // Risk assessment cache methods
  getRiskData(latitude, longitude, parameters = null) {
    const key = this.generateRiskKey(latitude, longitude, parameters);
    return this.get(key, 'risk');
  }

  setRiskData(latitude, longitude, data, parameters = null, ttl = 1800) {
    const key = this.generateRiskKey(latitude, longitude, parameters);
    return this.set(key, data, ttl, 'risk');
  }

  generateRiskKey(latitude, longitude, parameters) {
    const baseKey = `risk_${latitude}_${longitude}`;
    return parameters ? `${baseKey}_${JSON.stringify(parameters)}` : baseKey;
  }

  // Intervention cache methods
  getInterventionData(interventionType, parameters) {
    const key = this.generateInterventionKey(interventionType, parameters);
    return this.get(key, 'intervention');
  }

  setInterventionData(interventionType, parameters, data, ttl = 3600) {
    const key = this.generateInterventionKey(interventionType, parameters);
    return this.set(key, data, ttl, 'intervention');
  }

  generateInterventionKey(interventionType, parameters) {
    return `${interventionType}_${JSON.stringify(parameters)}`;
  }

  // Cache warming - preload commonly requested data
  async warmCache() {
    logger.info('Starting cache warming process');

    // Common cities and their coordinates
    const commonCities = [
      { name: 'Dhaka', lat: 23.8103, lon: 90.4125 },
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    ];

    const dataTypes = ['temperature', 'precipitation', 'vegetation', 'elevation', 'air_quality'];

    // Warm cache for common cities and data types
    for (const city of commonCities) {
      for (const dataType of dataTypes) {
        const key = this.generateNASAKey(city.lat, city.lon, dataType);
        
        // Only warm if not already cached
        if (!this.has(key, 'nasa')) {
          // This would trigger actual data fetching in a real implementation
          logger.debug(`Would warm cache for ${city.name} - ${dataType}`);
        }
      }
    }

    logger.info('Cache warming completed');
  }

  // Cache cleanup - remove expired or least recently used items
  cleanup() {
    Object.entries(this.caches).forEach(([name, cache]) => {
      const keysBefore = cache.keys().length;
      // NodeCache handles this automatically, but we can force cleanup
      cache.flushStats();
      const keysAfter = cache.keys().length;
      
      if (keysBefore !== keysAfter) {
        logger.info(`Cache cleanup [${name}]: ${keysBefore - keysAfter} items removed`);
      }
    });
  }

  // Export cache data for backup
  exportCache(cacheType = 'all') {
    if (cacheType === 'all') {
      const exportData = {};
      Object.entries(this.caches).forEach(([name, cache]) => {
        exportData[name] = {};
        cache.keys().forEach(key => {
          exportData[name][key] = cache.get(key);
        });
      });
      return exportData;
    } else {
      const cache = this.caches[cacheType];
      if (!cache) return null;
      
      const exportData = {};
      cache.keys().forEach(key => {
        exportData[key] = cache.get(key);
      });
      return exportData;
    }
  }

  // Import cache data from backup
  importCache(data, cacheType = 'all') {
    if (cacheType === 'all') {
      Object.entries(data).forEach(([cacheName, cacheData]) => {
        const cache = this.caches[cacheName];
        if (cache) {
          Object.entries(cacheData).forEach(([key, value]) => {
            cache.set(key, value);
          });
          logger.info(`Imported ${Object.keys(cacheData).length} items to ${cacheName} cache`);
        }
      });
    } else {
      const cache = this.caches[cacheType];
      if (cache) {
        Object.entries(data).forEach(([key, value]) => {
          cache.set(key, value);
        });
        logger.info(`Imported ${Object.keys(data).length} items to ${cacheType} cache`);
      }
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Schedule periodic cleanup
setInterval(() => {
  cacheManager.cleanup();
}, 30 * 60 * 1000); // Every 30 minutes

// Schedule cache warming (optional)
if (process.env.ENABLE_CACHE_WARMING === 'true') {
  setInterval(() => {
    cacheManager.warmCache();
  }, 60 * 60 * 1000); // Every hour
}

// Log cache stats periodically
setInterval(() => {
  const stats = cacheManager.getStats();
  logger.info('Cache Statistics', {
    type: 'cache_stats',
    ...stats
  });
}, 15 * 60 * 1000); // Every 15 minutes

// Graceful shutdown - export cache data
process.on('SIGTERM', () => {
  logger.info('Exporting cache data before shutdown...');
  const exportData = cacheManager.exportCache();
  // In a real implementation, you might save this to a file or database
  logger.info(`Exported ${Object.keys(exportData).length} cache types`);
});

module.exports = {
  cacheManager,
  CacheManager
};
