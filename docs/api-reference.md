# iRacing API Reference Guide

## Quick Reference

This document provides a comprehensive reference for all iRacing API endpoints, authentication methods, and data structures.

## Table of Contents

1. [Authentication](#authentication)
2. [Member Endpoints](#member-endpoints)
3. [Statistics Endpoints](#statistics-endpoints)
4. [Car Endpoints](#car-endpoints)
5. [Track Endpoints](#track-endpoints)
6. [Series Endpoints](#series-endpoints)
7. [Results Endpoints](#results-endpoints)
8. [League Endpoints](#league-endpoints)
9. [Lookup Endpoints](#lookup-endpoints)
10. [Data Structures](#data-structures)
11. [Error Codes](#error-codes)

---

## Authentication

### Token Endpoint

**URL:** `https://id.iracing.com/auth/token`

**Method:** POST

**Content-Type:** `application/x-www-form-urlencoded`

### Password Flow (Initial Authentication)

**Request Body:**
```
grant_type=password
username={email}
password={password}
client_id={client_id}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 7200,
  "refresh_token": "def502..."
}
```

### Refresh Token Flow

**Request Body:**
```
grant_type=refresh_token
refresh_token={refresh_token}
client_id={client_id}
```

**Response:** Same as password flow

---

## Member Endpoints

### Get Member Info

**Endpoint:** `/data/member/info`

**Method:** GET

**Authentication:** Required

**Description:** Returns basic information about the authenticated member.

**Response:**
```json
{
  "cust_id": 123456,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "John Doe",
  "member_since": "2020-01-15T00:00:00Z",
  "club_id": 42,
  "club_name": "Northeast Region",
  "flags": {
    "has_read_comp_rules": true,
    "has_read_pp": true
  }
}
```

### Get Member Profile

**Endpoint:** `/data/member/profile`

**Method:** GET

**Authentication:** Required

**Description:** Returns detailed member profile including licenses and ratings.

**Response:**
```json
{
  "cust_id": 123456,
  "display_name": "John Doe",
  "member_since": "2020-01-15T00:00:00Z",
  "club_id": 42,
  "licenses": [
    {
      "category_id": 2,
      "category": "Road",
      "license_level": 4,
      "license_level_name": "Class B",
      "safety_rating": 3.45,
      "cpi": 234.56,
      "irating": 1850,
      "tt_rating": 1650,
      "pro_promotable": false
    }
  ],
  "recent_awards": [],
  "helmet": {
    "pattern": 1,
    "color1": "#FF0000",
    "color2": "#0000FF",
    "color3": "#FFFFFF"
  }
}
```

---

## Statistics Endpoints

### Get Member Recent Races

**Endpoint:** `/data/stats/member_recent_races`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `cust_id` (optional): Customer ID to query (defaults to authenticated user)

**Description:** Returns member's most recent race results (typically last 10 races).

**Response:**
```json
{
  "races": [
    {
      "subsession_id": 987654321,
      "session_id": 456789,
      "series_id": 123,
      "series_name": "Advanced Mazda MX-5 Cup",
      "series_short_name": "AMMC",
      "season_id": 3456,
      "season_name": "2024 Season 1",
      "season_year": 2024,
      "season_quarter": 1,
      "race_week_num": 5,
      "session_start_time": "2024-01-15T20:00:00Z",
      "winner_id": 111111,
      "winner_name": "Jane Smith",
      "winner_license_level": 5,
      "track_id": 234,
      "track_name": "Watkins Glen International",
      "car_id": 45,
      "car_name": "Mazda MX-5 Cup",
      "car_class_id": 45,
      "finish_position": 5,
      "finish_position_in_class": 3,
      "starting_position": 8,
      "starting_position_in_class": 5,
      "incidents": 4,
      "champpoints": 78,
      "strength_of_field": 2340,
      "old_irating": 1840,
      "new_irating": 1850,
      "old_safety_rating": 3.42,
      "new_safety_rating": 3.45,
      "old_cpi": 230.12,
      "new_cpi": 234.56,
      "laps_complete": 15,
      "laps_lead": 0,
      "best_lap_time": 123456,
      "best_lap_num": 8,
      "best_qual_lap_time": 122876
    }
  ]
}
```

### Get Member Summary

**Endpoint:** `/data/stats/member_summary`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `cust_id` (optional): Customer ID

**Description:** Returns career statistics summary for member.

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
      "top25_percent": 178,
      "poles": 15,
      "avg_start_position": 8.5,
      "avg_finish_position": 7.2,
      "avg_field_size": 18.3,
      "laps": 4562,
      "laps_led": 234,
      "avg_incidents": 3.2,
      "avg_points": 82.5,
      "win_percentage": 6.7,
      "top5_percentage": 26.0,
      "laps_led_percentage": 5.1
    }
  ]
}
```

### Get Member Yearly Statistics

**Endpoint:** `/data/stats/member_yearly`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `cust_id` (optional): Customer ID

**Description:** Returns member statistics broken down by year and category.

---

## Car Endpoints

### Get Car Information

**Endpoint:** `/data/car/get`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `car_id` (optional): Specific car ID. Omit to get all cars.

**Description:** Returns information about car(s).

**Single Car Response:**
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
  "ai_enabled": true,
  "created": "2016-03-15T00:00:00Z",
  "first_sale": "2016-03-15T00:00:00Z",
  "forum_url": "https://forums.iracing.com/...",
  "free_with_subscription": true,
  "has_headlights": true,
  "has_multiple_dry_tire_types": false,
  "has_rain_capable": false,
  "hp": 155,
  "weight": 2403,
  "max_power_adjust_pct": 0,
  "min_power_adjust_pct": 0,
  "package_id": 0,
  "patterns": 48,
  "price": 0.00,
  "price_display": "Free with subscription",
  "retired": false,
  "search_filters": "road,mazda,cup",
  "sku": 10005,
  "site_url": "https://www.iracing.com/cars/mazda-mx-5-cup/"
}
```

### Get Car Assets

**Endpoint:** `/data/car/assets`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `car_id` (required): Car ID

**Description:** Returns URLs for car images and assets.

**Response:**
```json
{
  "car_id": 45,
  "logo": "https://images-static.iracing.com/car-logos/45.png",
  "small_image": "https://images-static.iracing.com/car-images/45_small.jpg",
  "large_image": "https://images-static.iracing.com/car-images/45_large.jpg",
  "car_rules": [
    {
      "category_id": 2,
      "text": "This car is free with membership..."
    }
  ],
  "detail_copy": "The Mazda MX-5 Cup is...",
  "detail_screen_shot_images": [
    "https://images-static.iracing.com/..."
  ],
  "detail_techspecs_copy": "Engine: 2.0L...",
  "folder": "mx5cup",
  "gallery_images": ["..."],
  "gallery_prefix": "mx5cup_gallery_"
}
```

---

## Track Endpoints

### Get Track Information

**Endpoint:** `/data/track/get`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `track_id` (optional): Specific track ID. Omit to get all tracks.

**Description:** Returns information about track(s).

**Single Track Response:**
```json
{
  "track_id": 234,
  "track_name": "Watkins Glen International",
  "config_name": "Boot - Cup",
  "track_config_length": 3.4,
  "category_id": 2,
  "category": "Road",
  "ai_enabled": true,
  "award_exempt": false,
  "config_name": "Boot - Cup",
  "corners_per_lap": 11,
  "created": "2008-09-01T00:00:00Z",
  "free_with_subscription": false,
  "fully_lit": true,
  "grid_stalls": 43,
  "has_opt_path": false,
  "has_short_parade_lap": true,
  "has_start_zone": true,
  "has_svg_map": true,
  "is_dirt": false,
  "is_oval": false,
  "is_paved": true,
  "lap_scoring": 0,
  "latitude": 42.337,
  "longitude": -76.927,
  "location": "Watkins Glen, NY",
  "max_cars": 43,
  "night_lighting": true,
  "nominal_lap_time": 123.5,
  "number_pitstalls": 43,
  "price": 14.95,
  "priority": 10,
  "purchasable": true,
  "qualify_laps": 2,
  "restart_on_left": false,
  "retired": false,
  "search_filters": "road,usa,boot",
  "site_url": "https://www.iracing.com/tracks/watkins-glen/",
  "sku": 20001,
  "solo_laps": 4,
  "track_types": [
    {
      "track_type": "Road Course"
    }
  ]
}
```

### Get Track Assets

**Endpoint:** `/data/track/assets`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `track_id` (required): Track ID

**Description:** Returns URLs for track images, maps, and assets.

---

## Series Endpoints

### Get Series Information

**Endpoint:** `/data/series/get`

**Method:** GET

**Authentication:** Required

**Description:** Returns information about all series or a specific series.

### Get Series Seasons

**Endpoint:** `/data/series/seasons`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `series_id` (required): Series ID
- `include_series` (optional): Include series details (true/false)

**Description:** Returns season information including schedules.

**Response:**
```json
{
  "series_id": 123,
  "series_name": "Advanced Mazda MX-5 Cup",
  "seasons": [
    {
      "season_id": 3456,
      "season_name": "2024 Season 1",
      "series_id": 123,
      "season_year": 2024,
      "season_quarter": 1,
      "license_group": 4,
      "fixed_setup": false,
      "official": true,
      "driver_change_rule": 0,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-03-31T23:59:59Z",
      "active": true,
      "car_classes": [
        {
          "car_class_id": 45,
          "name": "Mazda MX-5 Cup",
          "short_name": "MX-5 Cup",
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
          "season_id": 3456,
          "race_week_num": 1,
          "series_id": 123,
          "session_type_id": 6,
          "start_date": "2024-01-01T00:00:00Z",
          "track": {
            "track_id": 234,
            "track_name": "Watkins Glen International",
            "config_name": "Boot - Cup"
          }
        }
      ]
    }
  ]
}
```

---

## Results Endpoints

### Get Season Results

**Endpoint:** `/data/results/season_results`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `season_id` (required): Season ID
- `cust_id` (optional): Customer ID
- `race_week_num` (optional): Specific race week

**Description:** Returns results for a member in a specific season.

### Get Event Results

**Endpoint:** `/data/results/event_results`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `subsession_id` (required): Subsession ID

**Description:** Returns detailed results for a specific event.

### Get Lap Data

**Endpoint:** `/data/results/lap_data`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `subsession_id` (required): Subsession ID
- `simsession_number` (optional): Session number
- `cust_id` (optional): Customer ID

**Description:** Returns lap-by-lap data for a session.

---

## League Endpoints

### Get League

**Endpoint:** `/data/league/get`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `league_id` (required): League ID

**Description:** Returns league information.

### Get League Seasons

**Endpoint:** `/data/league/seasons`

**Method:** GET

**Authentication:** Required

**Parameters:**
- `league_id` (required): League ID
- `retired` (optional): Include retired seasons

---

## Lookup Endpoints

### Get Countries

**Endpoint:** `/data/lookup/countries`

**Method:** GET

**Authentication:** Required

**Description:** Returns list of countries with codes.

### Get Licenses

**Endpoint:** `/data/lookup/licenses`

**Method:** GET

**Authentication:** Required

**Description:** Returns license level definitions.

### Get Event Types

**Endpoint:** `/data/lookup/event_types`

**Method:** GET

**Authentication:** Required

**Description:** Returns event type definitions.

---

## Data Structures

### Time Values

All time values in iRacing API are in **10,000ths of a second** (milliseconds * 10):

- **123456** = 123.456 seconds = 2:03.456

To convert to seconds: `milliseconds / 1000`

To convert to minutes:seconds: 
```javascript
const totalSeconds = milliseconds / 1000;
const minutes = Math.floor(totalSeconds / 60);
const seconds = (totalSeconds % 60).toFixed(3);
```

### Dates

All dates are in ISO 8601 format (UTC):
- `2024-01-15T20:00:00Z`

### License Levels

| ID | Name | Display |
|----|------|---------|
| 1  | Rookie | R |
| 2  | Class D | D |
| 3  | Class C | C |
| 4  | Class B | B |
| 5  | Class A | A |
| 6  | Pro | P |
| 7  | Pro/WC | P/WC |

### Category IDs

| ID | Name | Description |
|----|------|-------------|
| 1  | Oval | Oval racing |
| 2  | Road | Road racing |
| 3  | Dirt Oval | Dirt oval racing |
| 4  | Dirt Road | Dirt road racing |

---

## Error Codes

### HTTP Status Codes

- **200 OK**: Request successful
- **400 Bad Request**: Invalid parameters or request format
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Access denied (valid token, but no permission)
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **502 Bad Gateway**: Gateway error
- **503 Service Unavailable**: Service temporarily unavailable

### OAuth Error Responses

**Invalid Credentials:**
```json
{
  "error": "invalid_grant",
  "error_description": "The user credentials were incorrect."
}
```

**Invalid Client:**
```json
{
  "error": "invalid_client",
  "error_description": "Client authentication failed"
}
```

**Invalid Token:**
```json
{
  "error": "invalid_token",
  "error_description": "The access token provided is invalid"
}
```

---

## Rate Limiting

- **Typical Limit**: 100 requests per minute per user
- **Header**: `X-RateLimit-Remaining` (when available)
- **Retry-After**: Provided in 429 responses

**Best Practices:**
1. Cache static data (cars, tracks)
2. Implement exponential backoff on errors
3. Respect Retry-After headers
4. Use appropriate refresh intervals for different data types

---

## Usage Tips

1. **Authentication**: Always check token expiry before requests
2. **Caching**: Cache car/track data for at least 1 hour
3. **Error Handling**: Implement retry logic for 5xx errors
4. **Rate Limits**: Monitor usage and implement throttling
5. **Data Freshness**: Different endpoints have different update frequencies
6. **Pagination**: Not all endpoints support pagination
7. **Field Filtering**: Most endpoints return full objects

---

## Additional Resources

- Main documentation: See `.github/copilot-instructions.md`
- OAuth guide: See `docs/iracing-oauth-flow.md`
- Data API guide: See `docs/iracing-data-api.md`
- Development guide: See `docs/overlay-development-guide.md`
- Code examples: See `examples/` directory
