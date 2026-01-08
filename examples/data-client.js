/**
 * Complete iRacing Data API Client Example
 * 
 * This example demonstrates how to interact with the iRacing Data API,
 * including caching, error handling, and common data operations.
 */

const https = require('https');

/**
 * iRacing Data API Client
 * Provides methods to access all iRacing Data API endpoints
 */
class iRacingDataClient {
  constructor(authManager) {
    this.auth = authManager;
    this.baseUrl = 'https://members-ng.iracing.com/data';
    this.cache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Make authenticated GET request to iRacing API
   * @param {string} endpoint - API endpoint path
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<Object>} API response data
   */
  async request(endpoint, maxRetries = 3) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const token = await this.auth.getValidToken();
        const url = `${this.baseUrl}/${endpoint}`;
        
        const data = await this.makeHttpsRequest(url, token);
        return data;

      } catch (error) {
        lastError = error;

        // Handle specific error cases
        if (error.statusCode === 401) {
          // Token invalid, try to refresh and retry
          console.log('Token invalid, refreshing...');
          await this.auth.refreshAccessToken();
          continue;
        }

        if (error.statusCode === 429) {
          // Rate limited, wait and retry
          const retryAfter = error.retryAfter || Math.pow(2, attempt);
          console.log(`Rate limited, waiting ${retryAfter}s...`);
          await this.sleep(retryAfter * 1000);
          continue;
        }

        if (error.statusCode >= 500) {
          // Server error, retry with exponential backoff
          if (attempt < maxRetries - 1) {
            const backoff = Math.pow(2, attempt) * 1000;
            console.log(`Server error, retrying in ${backoff}ms...`);
            await this.sleep(backoff);
            continue;
          }
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Request with caching support
   * @param {string} endpoint - API endpoint
   * @param {number} ttl - Cache time-to-live in milliseconds
   * @returns {Promise<Object>} API response data
   */
  async cachedRequest(endpoint, ttl = 300000) {
    const now = Date.now();
    
    // Check cache
    if (this.cache.has(endpoint)) {
      const expiry = this.cacheExpiry.get(endpoint);
      if (now < expiry) {
        console.log(`Cache hit: ${endpoint}`);
        return this.cache.get(endpoint);
      }
    }

    // Fetch and cache
    console.log(`Cache miss: ${endpoint}`);
    const data = await this.request(endpoint);
    this.cache.set(endpoint, data);
    this.cacheExpiry.set(endpoint, now + ttl);
    
    return data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // ==================== Member Endpoints ====================

  /**
   * Get current member information
   */
  async getMemberInfo() {
    return this.request('member/info');
  }

  /**
   * Get member profile with licenses and ratings
   */
  async getMemberProfile() {
    return this.request('member/profile');
  }

  /**
   * Get recent races for a member
   * @param {number} custId - Customer ID (optional, defaults to authenticated user)
   */
  async getRecentRaces(custId = null) {
    const query = custId ? `?cust_id=${custId}` : '';
    return this.request(`stats/member_recent_races${query}`);
  }

  /**
   * Get member career summary
   * @param {number} custId - Customer ID
   */
  async getMemberSummary(custId = null) {
    const query = custId ? `?cust_id=${custId}` : '';
    return this.request(`stats/member_summary${query}`);
  }

  /**
   * Get member yearly statistics
   * @param {number} custId - Customer ID
   */
  async getMemberYearly(custId = null) {
    const query = custId ? `?cust_id=${custId}` : '';
    return this.request(`stats/member_yearly${query}`);
  }

  // ==================== Car Endpoints ====================

  /**
   * Get information about a specific car
   * @param {number} carId - Car ID
   */
  async getCarInfo(carId) {
    return this.cachedRequest(`car/get?car_id=${carId}`, 3600000); // 1 hour cache
  }

  /**
   * Get all cars
   */
  async getAllCars() {
    return this.cachedRequest('car/get', 3600000);
  }

  /**
   * Get car assets (images, logos)
   * @param {number} carId - Car ID
   */
  async getCarAssets(carId) {
    return this.cachedRequest(`car/assets?car_id=${carId}`, 3600000);
  }

  // ==================== Track Endpoints ====================

  /**
   * Get information about a specific track
   * @param {number} trackId - Track ID
   */
  async getTrackInfo(trackId) {
    return this.cachedRequest(`track/get?track_id=${trackId}`, 3600000);
  }

  /**
   * Get all tracks
   */
  async getAllTracks() {
    return this.cachedRequest('track/get', 3600000);
  }

  /**
   * Get track assets (images, maps)
   * @param {number} trackId - Track ID
   */
  async getTrackAssets(trackId) {
    return this.cachedRequest(`track/assets?track_id=${trackId}`, 3600000);
  }

  // ==================== Series Endpoints ====================

  /**
   * Get series information
   * @param {number} seriesId - Series ID
   */
  async getSeriesInfo(seriesId) {
    return this.cachedRequest(`series/get?series_id=${seriesId}`, 3600000);
  }

  /**
   * Get series seasons
   * @param {number} seriesId - Series ID
   */
  async getSeriesSeasons(seriesId) {
    return this.request(`series/seasons?series_id=${seriesId}&include_series=true`);
  }

  // ==================== Results Endpoints ====================

  /**
   * Get season results for a member
   * @param {number} seasonId - Season ID
   * @param {number} custId - Customer ID
   */
  async getSeasonResults(seasonId, custId = null) {
    const query = custId ? `&cust_id=${custId}` : '';
    return this.request(`results/season_results?season_id=${seasonId}${query}`);
  }

  /**
   * Get detailed event results
   * @param {number} subsessionId - Subsession ID
   */
  async getEventResults(subsessionId) {
    return this.request(`results/event_results?subsession_id=${subsessionId}`);
  }

  /**
   * Get lap-by-lap data
   * @param {number} subsessionId - Subsession ID
   * @param {number} custId - Customer ID
   */
  async getLapData(subsessionId, custId = null) {
    const query = custId ? `&cust_id=${custId}` : '';
    return this.request(`results/lap_data?subsession_id=${subsessionId}${query}`);
  }

  // ==================== Helper Methods ====================

  /**
   * Make HTTPS GET request
   * @param {string} url - Request URL
   * @param {string} token - Bearer token
   * @returns {Promise<Object>} Response data
   */
  makeHttpsRequest(url, token) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error(`Failed to parse JSON: ${error.message}`));
            }
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
            error.statusCode = res.statusCode;
            error.retryAfter = res.headers['retry-after'];
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.end();
    });
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Usage Example
 */
async function main() {
  const { iRacingAuthManager } = require('./auth-manager');

  // Initialize auth manager
  const auth = new iRacingAuthManager({
    clientId: 'your-client-id'
  });

  // Authenticate
  await auth.authenticate(
    'your-email@example.com',
    'your-password'
  );

  // Create data client
  const dataClient = new iRacingDataClient(auth);

  try {
    // Get member information
    console.log('\n=== Member Info ===');
    const memberInfo = await dataClient.getMemberInfo();
    console.log('Member:', memberInfo.email);

    // Get member profile
    console.log('\n=== Member Profile ===');
    const profile = await dataClient.getMemberProfile();
    console.log('Display Name:', profile.display_name);
    console.log('Licenses:', profile.licenses);

    // Get recent races
    console.log('\n=== Recent Races ===');
    const recentRaces = await dataClient.getRecentRaces();
    const lastRace = recentRaces.races[0];
    if (lastRace) {
      console.log('Last Race:', lastRace.series_name);
      console.log('Track:', lastRace.track_name);
      console.log('Finish Position:', lastRace.finish_position_in_class);
      console.log('Incidents:', lastRace.incidents);
    }

    // Get car information (with caching)
    console.log('\n=== Car Info (cached) ===');
    const carInfo = await dataClient.getCarInfo(45); // Mazda MX-5
    console.log('Car:', carInfo.car_name);
    console.log('HP:', carInfo.hp);

    // Second call will use cache
    const carInfo2 = await dataClient.getCarInfo(45);
    console.log('Car (from cache):', carInfo2.car_name);

    // Get all tracks
    console.log('\n=== All Tracks ===');
    const tracks = await dataClient.getAllTracks();
    console.log(`Total tracks: ${tracks.length}`);
    console.log('First 3 tracks:', tracks.slice(0, 3).map(t => t.track_name));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Export for use in other modules
module.exports = { iRacingDataClient };

// Run example if this file is executed directly
if (require.main === module) {
  main();
}
