# GitHub Copilot Instructions for 3Gs iRacing Overlays

## Project Overview

This repository contains overlay applications for iRacing simulation, integrating with iRacing's official Data API for real-time telemetry and session data.

## iRacing Data API Architecture

### Authentication Flow (OAuth 2.0)

The iRacing Data API uses OAuth 2.0 with the Resource Owner Password Credentials flow (also called "password_limited" flow).

**Key Endpoints:**
- **Client Registration**: Not required - use provided client credentials
- **Token Endpoint**: `https://id.iracing.com/auth/token`
- **Data API Base**: `https://members-ng.iracing.com/data/`

**Authentication Pattern:**
```javascript
// Token Request
POST https://id.iracing.com/auth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&username={email}&password={password}&client_id={client_id}
```

**Token Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 7200,
  "refresh_token": "..."
}
```

**Using Access Token:**
```javascript
GET https://members-ng.iracing.com/data/{endpoint}
Authorization: Bearer {access_token}
```

### OAuth Implementation Requirements

1. **Token Management:**
   - Store access tokens securely (never in source code)
   - Implement token refresh before expiration
   - Handle 401 responses by refreshing token
   - Use refresh tokens to avoid re-authentication

2. **Security Best Practices:**
   - Use environment variables for credentials
   - Implement secure storage (OS keychain/credential manager)
   - Never log or expose tokens
   - Clear tokens on logout

3. **Error Handling:**
   - Handle network errors gracefully
   - Implement exponential backoff for rate limits
   - Provide user feedback for auth failures
   - Validate token before API calls

## iRacing Data API Endpoints

### Core Endpoints

**Driver Stats:**
```
GET /data/stats/member_recent_races
GET /data/stats/member_summary
GET /data/stats/member_yearly
```

**Live Session Data:**
```
GET /data/results/season_results
GET /data/results/event_results
GET /data/series/seasons
```

**Car & Track Data:**
```
GET /data/car/get
GET /data/track/get
GET /data/car/assets
```

**Current Session:**
```
GET /data/member/info
GET /data/member/profile
```

### Data API Workflow

1. **Initialize Authentication:**
   - Check for stored tokens
   - If expired/missing, authenticate with credentials
   - Store tokens securely

2. **Fetch Session Data:**
   - Make authenticated request to desired endpoint
   - Parse JSON response
   - Handle pagination if needed

3. **Update Overlay:**
   - Process received data
   - Update UI elements
   - Schedule next update (respect rate limits)

4. **Error Recovery:**
   - On 401: Refresh token and retry
   - On 429: Implement backoff
   - On 5xx: Retry with exponential backoff

## Overlay Development Patterns

### Data Refresh Strategy

```javascript
class DataManager {
  constructor(authToken) {
    this.token = authToken;
    this.cache = new Map();
    this.refreshIntervals = {
      session: 1000,      // 1 second for live data
      stats: 60000,       // 1 minute for stats
      static: 300000      // 5 minutes for static data
    };
  }

  async fetchWithCache(endpoint, cacheTime) {
    const cached = this.cache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }

    const data = await this.fetch(endpoint);
    this.cache.set(endpoint, { data, timestamp: Date.now() });
    return data;
  }

  async fetch(endpoint) {
    const response = await fetch(`https://members-ng.iracing.com/data/${endpoint}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    if (response.status === 401) {
      await this.refreshToken();
      return this.fetch(endpoint); // Retry
    }

    return response.json();
  }
}
```

### Overlay UI Update Pattern

```javascript
class OverlayRenderer {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.updateInterval = null;
  }

  start() {
    this.updateInterval = setInterval(() => this.update(), 1000);
  }

  async update() {
    try {
      const sessionData = await this.dataManager.fetchWithCache(
        'results/season_results',
        this.dataManager.refreshIntervals.session
      );
      
      this.render(sessionData);
    } catch (error) {
      this.handleError(error);
    }
  }

  render(data) {
    // Update DOM elements with new data
    document.getElementById('position').textContent = data.position;
    document.getElementById('lap').textContent = data.lap;
    // ... more updates
  }
}
```

### WebSocket Pattern for Real-Time Data

For real-time telemetry, consider WebSocket connection:

```javascript
class TelemetryConnection {
  constructor(authToken) {
    this.token = authToken;
    this.ws = null;
    this.reconnectDelay = 1000;
  }

  connect() {
    this.ws = new WebSocket('wss://telemetry.iracing.com/live');
    
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        type: 'auth',
        token: this.token
      }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleTelemetry(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), this.reconnectDelay);
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    };
  }

  handleTelemetry(data) {
    // Process real-time telemetry data
  }
}
```

## Technology Stack Recommendations

### Frontend
- **HTML5/CSS3**: Modern overlay UI
- **JavaScript/TypeScript**: Type-safe development
- **Electron**: Desktop overlay application
- **WebSocket**: Real-time data streaming

### State Management
- **RxJS**: Reactive data streams
- **Redux/Zustand**: Global state management
- **LocalStorage/IndexedDB**: Client-side caching

### Build Tools
- **Webpack/Vite**: Module bundling
- **Babel**: JavaScript transpilation
- **ESLint/Prettier**: Code quality

## Common Overlay Features

### 1. Relative Times Display
```javascript
function formatRelativeTime(milliseconds) {
  const seconds = milliseconds / 1000;
  if (seconds < 1) return `+${milliseconds}ms`;
  return `+${seconds.toFixed(3)}s`;
}
```

### 2. Position Tracking
```javascript
function calculatePositionChange(currentPos, startPos) {
  const change = startPos - currentPos;
  return {
    value: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
  };
}
```

### 3. Lap Time Comparison
```javascript
function compareLapTimes(current, personal, session) {
  return {
    toPB: current - personal,
    toSessionBest: current - session,
    isPersonalBest: current < personal,
    isSessionBest: current < session
  };
}
```

### 4. Fuel Calculation
```javascript
function calculateFuelNeeded(lapsRemaining, fuelPerLap, currentFuel) {
  const needed = lapsRemaining * fuelPerLap;
  const toAdd = Math.max(0, needed - currentFuel);
  return {
    needed,
    toAdd,
    lapsRemaining: Math.floor(currentFuel / fuelPerLap)
  };
}
```

## Environment Configuration

Create `.env` file for configuration (never commit):

```bash
# iRacing Credentials
IRACING_EMAIL=your-email@example.com
IRACING_PASSWORD=your-password

# OAuth Client (if custom app)
IRACING_CLIENT_ID=your-client-id
IRACING_CLIENT_SECRET=your-client-secret

# Application Settings
OVERLAY_REFRESH_RATE=1000
API_CACHE_TIME=5000
```

## Testing Strategy

### Unit Tests
- Test data parsing functions
- Test calculation utilities
- Test API client methods

### Integration Tests
- Test OAuth flow
- Test API endpoint responses
- Test token refresh logic

### E2E Tests
- Test complete overlay workflow
- Test error scenarios
- Test network failure recovery

## Performance Optimization

1. **Caching**: Cache static data (tracks, cars)
2. **Throttling**: Limit API calls to respect rate limits
3. **Debouncing**: Debounce UI updates
4. **Web Workers**: Offload data processing
5. **Lazy Loading**: Load data on demand

## Debugging Tips

1. **Network Inspector**: Monitor API calls
2. **Token Validation**: Check token expiration
3. **Error Logging**: Log all API errors
4. **Rate Limit Monitoring**: Track API usage
5. **State Inspection**: Use Redux DevTools

## Resources

- **iRacing API Documentation**: Check official iRacing member forums
- **OAuth 2.0 Spec**: https://oauth.net/2/
- **Overlay Examples**: Check community GitHub repositories
- **iRacing SDK**: For local telemetry data access

## Code Style Guidelines

- Use async/await for asynchronous operations
- Implement proper error handling with try/catch
- Use TypeScript for type safety
- Comment complex logic
- Use meaningful variable names
- Keep functions small and focused
- Implement proper logging

## Security Checklist

- [ ] Never commit credentials
- [ ] Use environment variables
- [ ] Implement secure token storage
- [ ] Validate all API responses
- [ ] Sanitize user inputs
- [ ] Use HTTPS for all API calls
- [ ] Implement CSRF protection
- [ ] Handle PII data carefully

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Authenticate with iRacing API
5. Start development server
6. Open overlay in browser/Electron

## Common Issues and Solutions

**Issue**: 401 Unauthorized
- **Solution**: Check token expiration, refresh if needed

**Issue**: CORS errors
- **Solution**: Use proxy server or Electron for API calls

**Issue**: Rate limiting
- **Solution**: Implement request throttling and caching

**Issue**: Stale data
- **Solution**: Adjust refresh intervals, clear cache

**Issue**: Connection drops
- **Solution**: Implement reconnection logic with backoff

---

When working on this project, always consider:
- API rate limits and caching strategies
- Token lifecycle management
- Error handling and recovery
- User experience during network issues
- Performance optimization for real-time updates
