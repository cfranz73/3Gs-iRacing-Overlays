# iRacing OAuth Authentication Flow

## Overview

iRacing uses OAuth 2.0 for API authentication. The primary flow supported is the **Resource Owner Password Credentials Grant** (also referred to as "password_limited" flow). This document provides comprehensive details on implementing authentication for overlay applications.

## Authentication Endpoints

### Token Endpoint
```
POST https://id.iracing.com/auth/token
Content-Type: application/x-www-form-urlencoded
```

## OAuth Flow Types

### 1. Password Credentials Flow (Recommended for Overlays)

This is the most common flow for overlay applications as they run on the user's local machine.

**Step 1: Request Access Token**

```http
POST https://id.iracing.com/auth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&username={email}&password={password}&client_id={client_id}
```

**Parameters:**
- `grant_type`: Must be "password"
- `username`: User's iRacing email address
- `password`: User's iRacing password
- `client_id`: Your application's client ID (use default or register your own)

**Step 2: Receive Token Response**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 7200,
  "refresh_token": "def50200a1b2c3d4e5f6..."
}
```

**Token Properties:**
- `access_token`: JWT token for API authorization
- `token_type`: Always "Bearer"
- `expires_in`: Token lifetime in seconds (typically 2 hours)
- `refresh_token`: Token for refreshing access without re-authentication

**Step 3: Use Access Token**

```http
GET https://members-ng.iracing.com/data/member/info
Authorization: Bearer {access_token}
```

### 2. Refresh Token Flow

When the access token expires, use the refresh token to get a new one without requiring the user to log in again.

**Request:**

```http
POST https://id.iracing.com/auth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token={refresh_token}&client_id={client_id}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 7200,
  "refresh_token": "def50200a1b2c3d4e5f6..."
}
```

## Implementation Examples

### JavaScript/Node.js Implementation

```javascript
class iRacingAuth {
  constructor(clientId) {
    this.clientId = clientId;
    this.tokenEndpoint = 'https://id.iracing.com/auth/token';
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate with username and password
   */
  async authenticate(email, password) {
    const params = new URLSearchParams({
      grant_type: 'password',
      username: email,
      password: password,
      client_id: this.clientId
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Authentication failed: ${error}`);
    }

    const data = await response.json();
    this.storeTokens(data);
    return data;
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      // If refresh fails, need to re-authenticate
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.storeTokens(data);
    return data;
  }

  /**
   * Store tokens and calculate expiry
   */
  storeTokens(tokenData) {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    // Calculate expiry with 5-minute buffer
    this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh() {
    return !this.accessToken || Date.now() >= this.tokenExpiry;
  }

  /**
   * Get valid access token, refreshing if needed
   */
  async getValidToken() {
    if (this.needsRefresh()) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }
}

// Usage Example
const auth = new iRacingAuth('your-client-id');

try {
  await auth.authenticate('user@example.com', 'password');
  console.log('Authentication successful');

  // Later, when making API calls
  const token = await auth.getValidToken();
  // Use token for API requests
} catch (error) {
  console.error('Authentication error:', error);
}
```

### TypeScript Implementation with Type Safety

```typescript
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface AuthConfig {
  clientId: string;
  tokenEndpoint?: string;
}

class iRacingAuthManager {
  private clientId: string;
  private tokenEndpoint: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: AuthConfig) {
    this.clientId = config.clientId;
    this.tokenEndpoint = config.tokenEndpoint || 'https://id.iracing.com/auth/token';
  }

  async authenticate(email: string, password: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'password',
      username: email,
      password: password,
      client_id: this.clientId
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data: TokenResponse = await response.json();
    this.storeTokens(data);
    return data;
  }

  async refreshAccessToken(): Promise<TokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data: TokenResponse = await response.json();
    this.storeTokens(data);
    return data;
  }

  private storeTokens(tokenData: TokenResponse): void {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;
  }

  needsRefresh(): boolean {
    return !this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }

  async getValidToken(): Promise<string> {
    if (this.needsRefresh()) {
      await this.refreshAccessToken();
    }
    if (!this.accessToken) {
      throw new Error('No valid token available');
    }
    return this.accessToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}
```

## Token Storage Strategies

### 1. In-Memory Storage (Simple, Not Persistent)

```javascript
class InMemoryTokenStorage {
  constructor() {
    this.tokens = {};
  }

  save(tokens) {
    this.tokens = tokens;
  }

  load() {
    return this.tokens;
  }

  clear() {
    this.tokens = {};
  }
}
```

### 2. LocalStorage (Browser, Persistent)

```javascript
class LocalStorageTokenStorage {
  constructor(storageKey = 'iracing_tokens') {
    this.storageKey = storageKey;
  }

  save(tokens) {
    localStorage.setItem(this.storageKey, JSON.stringify(tokens));
  }

  load() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}
```

### 3. Secure Storage (Electron, Highly Secure)

```javascript
const keytar = require('keytar');

class SecureTokenStorage {
  constructor(service = 'iracing-overlay', account = 'default') {
    this.service = service;
    this.account = account;
  }

  async save(tokens) {
    await keytar.setPassword(
      this.service,
      this.account,
      JSON.stringify(tokens)
    );
  }

  async load() {
    const data = await keytar.getPassword(this.service, this.account);
    return data ? JSON.parse(data) : null;
  }

  async clear() {
    await keytar.deletePassword(this.service, this.account);
  }
}
```

## Error Handling

### Common Error Responses

**Invalid Credentials (400):**
```json
{
  "error": "invalid_grant",
  "error_description": "The user credentials were incorrect."
}
```

**Invalid Client (401):**
```json
{
  "error": "invalid_client",
  "error_description": "Client authentication failed"
}
```

**Rate Limit (429):**
```json
{
  "error": "too_many_requests",
  "error_description": "Rate limit exceeded"
}
```

### Error Handling Pattern

```javascript
async function handleAuthRequest(requestFn) {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('Invalid credentials');
        case 401:
          throw new Error('Authentication failed');
        case 429:
          throw new Error('Rate limit exceeded. Please wait.');
        case 500:
        case 502:
        case 503:
          throw new Error('iRacing service unavailable');
        default:
          throw new Error(`Authentication error: ${error.message}`);
      }
    }
    throw error;
  }
}
```

## Security Best Practices

### 1. Never Store Passwords
```javascript
// ❌ Bad: Storing password
const credentials = {
  email: 'user@example.com',
  password: 'mypassword'  // Never do this!
};

// ✅ Good: Only store tokens
const tokens = {
  access_token: '...',
  refresh_token: '...'
};
```

### 2. Use Environment Variables for Client Credentials
```javascript
// .env file
IRACING_CLIENT_ID=your_client_id
IRACING_CLIENT_SECRET=your_client_secret

// In code
const clientId = process.env.IRACING_CLIENT_ID;
```

### 3. Implement Token Encryption
```javascript
const crypto = require('crypto');

function encryptToken(token, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptToken(encryptedToken, key) {
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 4. Clear Tokens on Logout
```javascript
function logout() {
  // Clear tokens from memory
  auth.clearTokens();
  
  // Clear from storage
  storage.clear();
  
  // Clear any cached data
  cache.clear();
  
  // Redirect to login
  redirectToLogin();
}
```

## Testing Authentication

### Unit Test Example

```javascript
describe('iRacingAuth', () => {
  let auth;

  beforeEach(() => {
    auth = new iRacingAuth('test-client-id');
  });

  it('should authenticate with valid credentials', async () => {
    const mockResponse = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 7200,
      token_type: 'Bearer'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await auth.authenticate('test@example.com', 'password');
    expect(result.access_token).toBe('mock-token');
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('should refresh expired tokens', async () => {
    auth.accessToken = 'old-token';
    auth.refreshToken = 'refresh-token';
    auth.tokenExpiry = Date.now() - 1000; // Expired

    const mockResponse = {
      access_token: 'new-token',
      refresh_token: 'new-refresh',
      expires_in: 7200,
      token_type: 'Bearer'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const token = await auth.getValidToken();
    expect(token).toBe('new-token');
  });
});
```

## Rate Limiting

iRacing APIs have rate limits. Implement throttling:

```javascript
class RateLimiter {
  constructor(maxRequests = 100, perSeconds = 60) {
    this.maxRequests = maxRequests;
    this.perSeconds = perSeconds;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.perSeconds * 1000
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = (oldestRequest + this.perSeconds * 1000) - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.throttle();
    }

    this.requests.push(now);
  }
}

// Usage
const rateLimiter = new RateLimiter();
await rateLimiter.throttle();
// Make API request
```

## Complete Authentication Flow Diagram

```
┌─────────────┐
│   User      │
│  Overlay    │
└──────┬──────┘
       │
       │ 1. Enter Credentials
       ▼
┌─────────────────────┐
│  Authentication     │
│    Manager          │
└──────┬──────────────┘
       │
       │ 2. POST /auth/token
       ▼
┌─────────────────────┐
│   iRacing Auth      │
│     Server          │
└──────┬──────────────┘
       │
       │ 3. Return Tokens
       ▼
┌─────────────────────┐
│  Token Storage      │
│   (Secure)          │
└──────┬──────────────┘
       │
       │ 4. Use Token
       ▼
┌─────────────────────┐
│   Data API          │
│    Requests         │
└──────┬──────────────┘
       │
       │ 5. On 401
       ▼
┌─────────────────────┐
│  Refresh Token      │
│    Flow             │
└─────────────────────┘
```

## Troubleshooting

### Issue: "Invalid Grant" Error
- **Cause**: Wrong credentials or expired refresh token
- **Solution**: Re-authenticate with username/password

### Issue: "Invalid Client" Error
- **Cause**: Wrong or missing client_id
- **Solution**: Verify client_id configuration

### Issue: Token Expires Too Quickly
- **Cause**: Not implementing refresh flow
- **Solution**: Use refresh tokens before expiry

### Issue: CORS Errors in Browser
- **Cause**: Browser security restrictions
- **Solution**: Use proxy server or Electron app

## Next Steps

After implementing authentication:
1. Read [iRacing Data API Documentation](./iracing-data-api.md)
2. Review [Overlay Development Guide](./overlay-development-guide.md)
3. Check [Example Implementations](../examples/)
