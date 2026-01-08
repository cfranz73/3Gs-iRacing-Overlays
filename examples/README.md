# Example: Basic iRacing Overlay

This directory contains example code demonstrating how to build iRacing overlays using the Data API.

## Files

### `auth-manager.js`
Complete OAuth authentication implementation with token management, refresh logic, and secure storage patterns.

**Features:**
- Password credentials flow
- Automatic token refresh
- Token expiry tracking
- Error handling

**Usage:**
```javascript
const { iRacingAuthManager } = require('./auth-manager');

const auth = new iRacingAuthManager({
  clientId: 'your-client-id'
});

await auth.authenticate('email@example.com', 'password');
const token = await auth.getValidToken();
```

### `data-client.js`
Full-featured API client for accessing iRacing Data API endpoints.

**Features:**
- All major API endpoints
- Response caching
- Automatic retry logic
- Rate limit handling
- Error recovery

**Usage:**
```javascript
const { iRacingDataClient } = require('./data-client');

const client = new iRacingDataClient(auth);
const memberInfo = await client.getMemberInfo();
const recentRaces = await client.getRecentRaces();
```

### `simple-overlay.html`
Complete HTML overlay demonstration with live data display.

**Features:**
- Position tracking
- Timing information
- Session statistics
- Driver information
- Responsive design
- Real-time updates

**To Run:**
Open `simple-overlay.html` in a web browser. For production use, integrate with Electron or use as OBS Browser Source.

## Quick Start

### 1. Set Up Authentication

```javascript
// Create auth manager
const auth = new iRacingAuthManager({
  clientId: process.env.IRACING_CLIENT_ID
});

// Authenticate
await auth.authenticate(
  process.env.IRACING_EMAIL,
  process.env.IRACING_PASSWORD
);
```

### 2. Create Data Client

```javascript
// Create data client
const dataClient = new iRacingDataClient(auth);

// Fetch data
const profile = await dataClient.getMemberProfile();
const races = await dataClient.getRecentRaces();
```

### 3. Build Overlay UI

```javascript
// Update overlay with fetched data
function updateOverlay(data) {
  document.getElementById('position').textContent = data.position;
  document.getElementById('lap-time').textContent = formatLapTime(data.lapTime);
  // ... more updates
}

// Start update loop
setInterval(async () => {
  const data = await fetchCurrentData();
  updateOverlay(data);
}, 1000);
```

## Environment Variables

Create a `.env` file with your credentials:

```bash
IRACING_CLIENT_ID=your-client-id
IRACING_EMAIL=your-email@example.com
IRACING_PASSWORD=your-password
```

**Never commit credentials to source control!**

## Running the Examples

### Node.js Examples

```bash
# Install dependencies (if needed)
npm install

# Run auth manager example
node examples/auth-manager.js

# Run data client example
node examples/data-client.js
```

### HTML Overlay

```bash
# Open in browser
open examples/simple-overlay.html

# Or serve with local server
npx http-server examples/
```

## Integration Patterns

### Electron App

```javascript
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('examples/simple-overlay.html');
}

app.whenReady().then(createWindow);
```

### OBS Browser Source

1. Add Browser Source in OBS
2. Set URL to local file or hosted overlay
3. Set width/height as needed
4. Enable "Shutdown source when not visible" for performance

### Stream Deck Integration

```javascript
// Create Stream Deck action to toggle overlay visibility
const overlay = require('./overlay-controller');

streamDeck.on('keyDown', (event) => {
  if (event.action === 'toggle-overlay') {
    overlay.toggle();
  }
});
```

## Customization

### Changing Update Intervals

```javascript
// In simple-overlay.html, modify:
const UPDATE_INTERVAL = 1000; // milliseconds

// Start with custom interval
setInterval(() => update(), UPDATE_INTERVAL);
```

### Styling

All styling is in the `<style>` section of `simple-overlay.html`. CSS variables make theming easy:

```css
:root {
  --color-primary: #1e90ff;     /* Change primary color */
  --color-background: #000000;   /* Change background */
  --font-size-lg: 24px;         /* Change font sizes */
}
```

### Adding New Data Points

1. Fetch the data in `getMockData()` or from API
2. Add HTML element in template
3. Update element in `update()` method

Example:
```javascript
// Add to getMockData()
fuelLevel: 15.5,

// Add to HTML
<div class="data-value" id="fuel">--</div>

// Add to update()
this.updateElement('fuel', data.fuelLevel.toFixed(1) + 'L');
```

## Best Practices

1. **Cache Static Data**: Cars, tracks, series info
2. **Throttle API Calls**: Don't exceed rate limits
3. **Handle Errors**: Network issues are common
4. **Secure Credentials**: Never hardcode or commit
5. **Test Offline**: Implement graceful degradation
6. **Monitor Performance**: Profile update loops
7. **Version Control**: Track changes systematically

## Troubleshooting

### Authentication Fails
- Check credentials in `.env`
- Verify client_id is correct
- Check for typos in email/password

### No Data Updates
- Verify authentication succeeded
- Check browser console for errors
- Confirm API endpoints are correct
- Check rate limiting

### CORS Errors
- Use Electron app instead of browser
- Or set up proxy server
- API doesn't support browser CORS

### Performance Issues
- Increase update intervals
- Implement data caching
- Reduce DOM updates
- Use virtual scrolling for lists

## Next Steps

1. Review [OAuth Documentation](../docs/iracing-oauth-flow.md)
2. Read [API Reference](../docs/api-reference.md)
3. Check [Development Guide](../docs/overlay-development-guide.md)
4. Explore community overlays on GitHub
5. Join iRacing developer forums

## Contributing

Found a bug or have an improvement? Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

See LICENSE file in repository root.

## Support

- GitHub Issues: Report bugs or request features
- iRacing Forums: Community discussions
- Documentation: See `/docs` directory
