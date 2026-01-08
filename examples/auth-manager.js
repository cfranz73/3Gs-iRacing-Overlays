/**
 * Complete iRacing Authentication Manager Example
 * 
 * This example demonstrates a full implementation of OAuth authentication
 * for iRacing API access, including token management and secure storage.
 */

const https = require('https');
const { URLSearchParams } = require('url');

/**
 * iRacing Authentication Manager
 * Handles OAuth 2.0 authentication flow with token refresh
 */
class iRacingAuthManager {
  constructor(config = {}) {
    this.clientId = config.clientId || process.env.IRACING_CLIENT_ID;
    this.tokenEndpoint = 'https://id.iracing.com/auth/token';
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.refreshBuffer = 300000; // Refresh 5 minutes before expiry
  }

  /**
   * Authenticate with username and password
   * @param {string} email - iRacing account email
   * @param {string} password - iRacing account password
   * @returns {Promise<Object>} Token response
   */
  async authenticate(email, password) {
    const params = new URLSearchParams({
      grant_type: 'password',
      username: email,
      password: password,
      client_id: this.clientId
    });

    try {
      const response = await this.makeRequest(this.tokenEndpoint, params.toString());
      this.storeTokens(response);
      console.log('Authentication successful');
      return response;
    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * Refresh the access token using refresh token
   * @returns {Promise<Object>} New token response
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available. Please authenticate first.');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId
    });

    try {
      const response = await this.makeRequest(this.tokenEndpoint, params.toString());
      this.storeTokens(response);
      console.log('Token refreshed successfully');
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error.message);
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   * @returns {Promise<string>} Valid access token
   */
  async getValidToken() {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please call authenticate() first.');
    }

    if (this.needsRefresh()) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  /**
   * Check if token needs to be refreshed
   * @returns {boolean} True if token needs refresh
   */
  needsRefresh() {
    if (!this.tokenExpiry) return true;
    return Date.now() >= (this.tokenExpiry - this.refreshBuffer);
  }

  /**
   * Store tokens and calculate expiry time
   * @param {Object} tokenData - Token response from API
   */
  storeTokens(tokenData) {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    // Calculate expiry time with buffer
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
  }

  /**
   * Clear all stored tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if currently authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return this.accessToken !== null;
  }

  /**
   * Make HTTPS POST request
   * @param {string} url - Request URL
   * @param {string} body - Request body
   * @returns {Promise<Object>} Response data
   */
  makeRequest(url, body) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.error_description || parsed.error || 'Unknown error'}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.write(body);
      req.end();
    });
  }

  /**
   * Get token information
   * @returns {Object} Current token status
   */
  getTokenInfo() {
    return {
      isAuthenticated: this.isAuthenticated(),
      needsRefresh: this.needsRefresh(),
      expiresIn: this.tokenExpiry ? Math.max(0, this.tokenExpiry - Date.now()) : 0,
      hasRefreshToken: this.refreshToken !== null
    };
  }
}

/**
 * Usage Example
 */
async function main() {
  // Initialize auth manager
  const auth = new iRacingAuthManager({
    clientId: 'your-client-id'
  });

  try {
    // Authenticate
    await auth.authenticate(
      'your-email@example.com',
      'your-password'
    );

    console.log('Token info:', auth.getTokenInfo());

    // Get valid token (will auto-refresh if needed)
    const token = await auth.getValidToken();
    console.log('Access token obtained');

    // Use token for API calls
    // ... make API requests ...

    // Later, when making another API call
    const validToken = await auth.getValidToken();
    console.log('Using token:', validToken.substring(0, 20) + '...');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Export for use in other modules
module.exports = { iRacingAuthManager };

// Run example if this file is executed directly
if (require.main === module) {
  main();
}
