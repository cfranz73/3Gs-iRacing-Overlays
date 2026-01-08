# iRacing Data API Reference

## Overview

The iRacing Data API provides access to member data, session results, car and track information, and more. This document covers all available endpoints and their usage patterns.

## Base URL

```
https://members-ng.iracing.com/data/
```

## Authentication

All API requests require a valid Bearer token in the Authorization header:

```http
GET /data/{endpoint}
Authorization: Bearer {access_token}
```

See [OAuth Flow Documentation](./iracing-oauth-flow.md) for authentication details.

## Core Endpoints

### Member Information

#### Get Member Info
```http
GET /data/member/info
```

Returns current user's basic information.

**Response:**
```json
{
  "cust_id": 123456,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "member_since": "2020-01-15",
  "flags": {
    "has_read_comp_rules": true
  }
}
```

#### Get Member Profile
```http
GET /data/member/profile
```

Returns detailed member profile including licenses, ratings, and stats.

**Response:**
```json
{
  "cust_id": 123456,
  "display_name": "John Doe",
  "licenses": [
    {
      "category_id": 2,
      "category": "Road",
      "license_level": 4,
      "safety_rating": 3.45,
      "cpi": 234.56,
      "irating": 1850
    }
  ],
  "club_id": 42,
  "club_name": "Northeast Region"
}
```

### Member Statistics

#### Get Recent Races
```http
GET /data/stats/member_recent_races?cust_id={customer_id}
```

Returns member's recent race results.

**Parameters:**
- `cust_id` (optional): Customer ID (defaults to authenticated user)

**Response:**
```json
{
  "races": [
    {
      "subsession_id": 987654321,
      "session_id": 456789,
      "series_id": 123,
      "series_name": "Advanced Mazda MX-5 Cup",
      "start_time": "2024-01-15T20:00:00Z",
      "track_id": 234,
      "track_name": "Watkins Glen International",
      "finish_position": 5,
      "finish_position_in_class": 3,
      "incidents": 4,
      "new_irating": 1850,
      "oldi_rating": 1840,
      "new_safety_rating": 3.45,
      "old_safety_rating": 3.42
    }
  ]
}
```

#### Get Member Summary
```http
GET /data/stats/member_summary?cust_id={customer_id}
```

Returns member's career statistics summary.

**Response:**
```json
{
  "cust_id": 123456,
  "stats": [
    {
      "category_id": 2,
      "category": "Road",
      "starts": 342,
      "wins": 23,
      "top5": 89,
      "poles": 15,
      "avg_start_position": 8.5,
      "avg_finish_position": 7.2,
      "laps": 4562,
      "laps_led": 234,
      "avg_incidents": 3.2
    }
  ]
}
```

#### Get Yearly Statistics
```http
GET /data/stats/member_yearly?cust_id={customer_id}
```

Returns member's statistics by year and category.

### Car Data

#### Get Car Information
```http
GET /data/car/get?car_id={car_id}
```

Returns detailed information about a specific car.

**Response:**
```json
{
  "car_id": 45,
  "car_name": "Mazda MX-5 Cup",
  "car_name_abbreviated": "MX-5 Cup",
  "car_types": [
    {
      "car_type": "MX-5 Cup 2016"
    }
  ],
  "hp": 155,
  "weight": 2403,
  "price": 0.00,
  "free_with_subscription": true,
  "sku": 10005,
  "categories": ["Road"]
}
```

#### Get Car Assets
```http
GET /data/car/assets?car_id={car_id}
```

Returns URLs for car images and assets.

**Response:**
```json
{
  "car_id": 45,
  "logo": "https://images-static.iracing.com/car-logos/45.png",
  "small_image": "https://images-static.iracing.com/car-images/45_small.jpg",
  "large_image": "https://images-static.iracing.com/car-images/45_large.jpg"
}
```

#### List All Cars
```http
GET /data/car/get
```

Returns list of all cars in the service.

### Track Data

#### Get Track Information
```http
GET /data/track/get?track_id={track_id}
```

Returns detailed information about a specific track.

**Response:**
```json
{
  "track_id": 234,
  "track_name": "Watkins Glen International",
  "config_name": "Boot - Cup",
  "track_types": [
    {
      "track_type": "Road Course"
    }
  ],
  "corners_per_lap": 11,
  "category_id": 2,
  "category": "Road",
  "grid_stalls": 43,
  "location": "Watkins Glen, NY",
  "price": 14.95,
  "sku": 20001,
  "track_config_length": 3.4
}
```

#### Get Track Assets
```http
GET /data/track/assets?track_id={track_id}
```

Returns URLs for track images and maps.

**Response:**
```json
{
  "track_id": 234,
  "logo": "https://images-static.iracing.com/tracks/234_logo.png",
  "map": "https://images-static.iracing.com/tracks/234_map.svg",
  "config_map": "https://images-static.iracing.com/tracks/234_config_map.svg"
}
```

#### List All Tracks
```http
GET /data/track/get
```

Returns list of all tracks in the service.

### Series Data

#### Get Series Information
```http
GET /data/series/get?series_id={series_id}
```

Returns information about a specific series.

**Response:**
```json
{
  "series_id": 123,
  "series_name": "Advanced Mazda MX-5 Cup",
  "series_short_name": "AMMC",
  "category_id": 2,
  "category": "Road",
  "min_license_level": 4,
  "max_license_level": 6,
  "eligible_car_classes": [45],
  "official": true,
  "fixed_setup": false
}
```

#### Get Series Seasons
```http
GET /data/series/seasons?series_id={series_id}&include_series=true
```

Returns season information for a series.

**Parameters:**
- `series_id`: The series ID
- `include_series`: Include series details (optional)

**Response:**
```json
{
  "series_id": 123,
  "seasons": [
    {
      "season_id": 3456,
      "season_name": "2024 Season 1",
      "season_year": 2024,
      "season_quarter": 1,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-03-31T23:59:59Z",
      "active": true,
      "car_classes": [
        {
          "car_class_id": 45,
          "cars": [
            {
              "car_id": 45,
              "car_name": "Mazda MX-5 Cup"
            }
          ]
        }
      ],
      "schedules": [
        {
          "race_week_num": 1,
          "track_id": 234,
          "track_name": "Watkins Glen International"
        }
      ]
    }
  ]
}
```

### Results Data

#### Get Season Results
```http
GET /data/results/season_results?season_id={season_id}&cust_id={customer_id}
```

Returns member's results for a specific season.

**Response:**
```json
{
  "season_id": 3456,
  "cust_id": 123456,
  "results": [
    {
      "subsession_id": 987654321,
      "session_start_time": "2024-01-15T20:00:00Z",
      "track_id": 234,
      "finish_position": 5,
      "finish_position_in_class": 3,
      "starting_position": 8,
      "car_id": 45,
      "incidents": 4,
      "champpoints": 78,
      "strength_of_field": 2340,
      "laps_complete": 15,
      "laps_lead": 0
    }
  ]
}
```

#### Get Event Results
```http
GET /data/results/event_results?subsession_id={subsession_id}
```

Returns detailed results for a specific event/subsession.

**Response:**
```json
{
  "subsession_id": 987654321,
  "session_results": [
    {
      "simsession_number": 0,
      "simsession_name": "RACE",
      "results": [
        {
          "cust_id": 123456,
          "display_name": "John Doe",
          "finish_position": 5,
          "finish_position_in_class": 3,
          "car_id": 45,
          "car_class_id": 45,
          "starting_position": 8,
          "incidents": 4,
          "reason_out": "",
          "laps_complete": 15,
          "average_lap": 125432,
          "best_lap_num": 8,
          "best_lap_time": 123456,
          "best_qual_lap_time": 122876
        }
      ]
    }
  ],
  "track": {
    "track_id": 234,
    "track_name": "Watkins Glen International"
  },
  "weather": {
    "temp_units": 0,
    "track_temp": 82,
    "air_temp": 78
  }
}
```

#### Get Lap Data
```http
GET /data/results/lap_data?subsession_id={subsession_id}&cust_id={customer_id}
```

Returns lap-by-lap data for a member in a specific session.

**Response:**
```json
{
  "subsession_id": 987654321,
  "cust_id": 123456,
  "laps": [
    {
      "lap_number": 1,
      "lap_time": 125432,
      "lap_position": 8,
      "incidents": 0
    },
    {
      "lap_number": 2,
      "lap_time": 124567,
      "lap_position": 7,
      "incidents": 2
    }
  ]
}
```

### League Data

#### Get League Information
```http
GET /data/league/get?league_id={league_id}
```

Returns information about a specific league.

#### Get League Seasons
```http
GET /data/league/seasons?league_id={league_id}
```

Returns seasons for a league.

#### Get League Results
```http
GET /data/league/season_results?league_id={league_id}&season_id={season_id}
```

Returns results for a league season.

### Time Attack Data

#### Get Time Attack Results
```http
GET /data/time_attack/member_season_results?ta_comp_season_id={season_id}
```

Returns member's time attack season results.

### Lookup Data

#### Get Countries
```http
GET /data/lookup/countries
```

Returns list of countries with codes.

#### Get Licenses
```http
GET /data/lookup/licenses
```

Returns license level definitions.

#### Get Club History
```http
GET /data/lookup/club_history?season_id={season_id}
```

Returns club participation history.

## Data Workflow Patterns

### 1. Fetching Current Member Data

```javascript
async function getCurrentMemberData(auth) {
  const token = await auth.getValidToken();
  
  // Get basic member info
  const memberInfo = await fetch('https://members-ng.iracing.com/data/member/info', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  // Get detailed profile
  const memberProfile = await fetch('https://members-ng.iracing.com/data/member/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  return { info: memberInfo, profile: memberProfile };
}
```

### 2. Building a Race History Display

```javascript
async function getRaceHistory(auth, custId, limit = 10) {
  const token = await auth.getValidToken();
  
  const response = await fetch(
    `https://members-ng.iracing.com/data/stats/member_recent_races?cust_id=${custId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  const data = await response.json();
  return data.races.slice(0, limit);
}

// Usage in overlay
async function updateRaceHistory() {
  const races = await getRaceHistory(auth, null, 5);
  
  const html = races.map(race => `
    <div class="race-entry">
      <div class="series">${race.series_name}</div>
      <div class="track">${race.track_name}</div>
      <div class="position">P${race.finish_position_in_class}</div>
      <div class="incidents">${race.incidents}x</div>
      <div class="ir-change">${race.new_irating - race.old_irating > 0 ? '+' : ''}${race.new_irating - race.old_irating}</div>
    </div>
  `).join('');
  
  document.getElementById('race-history').innerHTML = html;
}
```

### 3. Caching Strategy for Static Data

```javascript
class iRacingDataCache {
  constructor(auth) {
    this.auth = auth;
    this.cache = new Map();
    this.cacheExpiry = new Map();
  }

  async getCachedData(endpoint, ttl = 300000) {
    const now = Date.now();
    
    if (this.cache.has(endpoint)) {
      const expiry = this.cacheExpiry.get(endpoint);
      if (now < expiry) {
        return this.cache.get(endpoint);
      }
    }

    const token = await this.auth.getValidToken();
    const response = await fetch(
      `https://members-ng.iracing.com/data/${endpoint}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    const data = await response.json();
    this.cache.set(endpoint, data);
    this.cacheExpiry.set(endpoint, now + ttl);
    
    return data;
  }

  async getCarInfo(carId) {
    return this.getCachedData(`car/get?car_id=${carId}`, 3600000); // 1 hour
  }

  async getTrackInfo(trackId) {
    return this.getCachedData(`track/get?track_id=${trackId}`, 3600000);
  }

  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}
```

### 4. Building a Season Schedule Display

```javascript
async function getSeasonSchedule(auth, seriesId) {
  const token = await auth.getValidToken();
  
  const response = await fetch(
    `https://members-ng.iracing.com/data/series/seasons?series_id=${seriesId}&include_series=true`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  const data = await response.json();
  const currentSeason = data.seasons.find(s => s.active);
  
  if (!currentSeason) return null;
  
  return {
    seasonName: currentSeason.season_name,
    schedule: currentSeason.schedules.map(week => ({
      week: week.race_week_num,
      track: week.track_name
    }))
  };
}
```

### 5. Error Handling with Retry Logic

```javascript
async function fetchWithRetry(url, token, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        // Token expired, should be handled by auth manager
        throw new Error('Unauthorized');
      }

      if (response.status === 429) {
        // Rate limited, wait and retry
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      if (response.status >= 500) {
        // Server error, retry with exponential backoff
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

## Response Codes

- **200 OK**: Request successful
- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable

## Rate Limiting

iRacing implements rate limiting on API requests:
- Typical limit: 100 requests per minute
- Use caching for static data (cars, tracks)
- Implement exponential backoff on 429 responses
- Consider polling intervals based on data freshness needs

## Time Formats

All timestamps are in ISO 8601 format (UTC):
```
2024-01-15T20:00:00Z
```

Lap times and durations are in milliseconds (10,000ths of a second):
```
123456 = 123.456 seconds
```

## Best Practices

1. **Cache Static Data**: Cars, tracks, and series information rarely change
2. **Batch Requests**: Minimize API calls by requesting data efficiently
3. **Handle Errors Gracefully**: Always expect and handle network errors
4. **Respect Rate Limits**: Implement throttling and backoff strategies
5. **Use Pagination**: For large datasets, implement proper pagination
6. **Monitor Token Expiry**: Refresh tokens proactively
7. **Log API Usage**: Track API calls for debugging and optimization

## Example: Complete Data Manager

```javascript
class iRacingDataManager {
  constructor(auth) {
    this.auth = auth;
    this.cache = new iRacingDataCache(auth);
    this.baseUrl = 'https://members-ng.iracing.com/data';
  }

  async request(endpoint) {
    const token = await this.auth.getValidToken();
    return fetchWithRetry(`${this.baseUrl}/${endpoint}`, token);
  }

  // Member methods
  async getMemberInfo() {
    return this.request('member/info');
  }

  async getMemberProfile() {
    return this.request('member/profile');
  }

  async getRecentRaces(custId = null) {
    const query = custId ? `?cust_id=${custId}` : '';
    return this.request(`stats/member_recent_races${query}`);
  }

  // Car methods
  async getCarInfo(carId) {
    return this.cache.getCarInfo(carId);
  }

  async getAllCars() {
    return this.cache.getCachedData('car/get', 3600000);
  }

  // Track methods
  async getTrackInfo(trackId) {
    return this.cache.getTrackInfo(trackId);
  }

  async getAllTracks() {
    return this.cache.getCachedData('track/get', 3600000);
  }

  // Series methods
  async getSeriesSeasons(seriesId) {
    return this.request(`series/seasons?series_id=${seriesId}&include_series=true`);
  }

  // Results methods
  async getEventResults(subsessionId) {
    return this.request(`results/event_results?subsession_id=${subsessionId}`);
  }

  async getLapData(subsessionId, custId) {
    return this.request(`results/lap_data?subsession_id=${subsessionId}&cust_id=${custId}`);
  }
}
```

## Next Steps

- Review [OAuth Authentication](./iracing-oauth-flow.md)
- Check [Overlay Development Guide](./overlay-development-guide.md)
- See [Example Implementations](../examples/)
