# Overlay Development Guide

## Overview

This guide provides best practices, patterns, and examples for building iRacing overlays that integrate with the iRacing Data API.

## Architecture Overview

### Typical Overlay Architecture

```
┌─────────────────────────────────────────┐
│         UI Layer (HTML/CSS/JS)          │
│  ┌─────────────────────────────────┐   │
│  │   Overlay Components            │   │
│  │   - Position Display            │   │
│  │   - Timing Information          │   │
│  │   - Race Stats                  │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Data Management Layer              │
│  ┌─────────────────────────────────┐   │
│  │   Data Manager                  │   │
│  │   - API Client                  │   │
│  │   - Cache Management            │   │
│  │   - State Management            │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Authentication Layer               │
│  ┌─────────────────────────────────┐   │
│  │   Auth Manager                  │   │
│  │   - OAuth Flow                  │   │
│  │   - Token Management            │   │
│  │   - Secure Storage              │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         iRacing API Services            │
│  - Authentication Server                │
│  - Data API                             │
│  - Telemetry (if applicable)            │
└─────────────────────────────────────────┘
```

## Project Structure

### Recommended Directory Structure

```
iracing-overlay/
├── src/
│   ├── auth/
│   │   ├── AuthManager.js         # OAuth implementation
│   │   └── TokenStorage.js        # Secure token storage
│   ├── api/
│   │   ├── DataManager.js         # API client
│   │   └── Cache.js               # Data caching
│   ├── components/
│   │   ├── PositionDisplay.js     # Position overlay
│   │   ├── TimingDisplay.js       # Timing information
│   │   ├── StatsDisplay.js        # Statistics
│   │   └── Settings.js            # Configuration UI
│   ├── utils/
│   │   ├── formatters.js          # Data formatting utilities
│   │   └── calculations.js        # Race calculations
│   ├── styles/
│   │   ├── main.css               # Main styles
│   │   └── themes/                # Theme files
│   ├── config/
│   │   └── default.json           # Default configuration
│   └── main.js                    # Application entry point
├── public/
│   ├── index.html                 # Main HTML
│   └── assets/                    # Images, fonts, etc.
├── tests/
│   ├── unit/                      # Unit tests
│   └── integration/               # Integration tests
├── package.json
├── .env.example                   # Environment template
└── README.md
```

## Development Patterns

### 1. Component-Based Architecture

```javascript
class OverlayComponent {
  constructor(container, dataManager) {
    this.container = container;
    this.dataManager = dataManager;
    this.updateInterval = null;
    this.isRunning = false;
  }

  async initialize() {
    this.render();
    await this.loadInitialData();
  }

  render() {
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  getTemplate() {
    return `<div class="overlay-component"></div>`;
  }

  attachEventListeners() {
    // Attach DOM event listeners
  }

  async loadInitialData() {
    // Load initial data from API
  }

  start(interval = 1000) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateInterval = setInterval(() => this.update(), interval);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
  }

  async update() {
    try {
      const data = await this.fetchData();
      this.updateDisplay(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async fetchData() {
    // Override in subclass
    throw new Error('fetchData must be implemented');
  }

  updateDisplay(data) {
    // Override in subclass
    throw new Error('updateDisplay must be implemented');
  }

  handleError(error) {
    console.error(`Error in ${this.constructor.name}:`, error);
    this.displayErrorMessage(error.message);
  }

  displayErrorMessage(message) {
    // Display error to user
  }

  destroy() {
    this.stop();
    this.container.innerHTML = '';
  }
}
```

### 2. Position Display Component Example

```javascript
class PositionDisplay extends OverlayComponent {
  getTemplate() {
    return `
      <div class="position-display">
        <div class="position-number">--</div>
        <div class="position-label">Position</div>
        <div class="class-position">
          <span class="class-pos">--</span>
          <span class="class-label">in Class</span>
        </div>
        <div class="position-change">
          <span class="change-indicator"></span>
        </div>
      </div>
    `;
  }

  async fetchData() {
    // Get current session data
    const memberInfo = await this.dataManager.getMemberInfo();
    const recentRaces = await this.dataManager.getRecentRaces();
    
    if (recentRaces.races.length > 0) {
      const lastRace = recentRaces.races[0];
      return {
        position: lastRace.finish_position,
        classPosition: lastRace.finish_position_in_class,
        startPosition: lastRace.starting_position,
        change: lastRace.starting_position - lastRace.finish_position
      };
    }
    
    return null;
  }

  updateDisplay(data) {
    if (!data) return;

    const posNum = this.container.querySelector('.position-number');
    const classPos = this.container.querySelector('.class-pos');
    const changeInd = this.container.querySelector('.change-indicator');

    posNum.textContent = data.position;
    classPos.textContent = data.classPosition;

    if (data.change > 0) {
      changeInd.textContent = `+${data.change}`;
      changeInd.className = 'change-indicator positive';
    } else if (data.change < 0) {
      changeInd.textContent = data.change;
      changeInd.className = 'change-indicator negative';
    } else {
      changeInd.textContent = '';
      changeInd.className = 'change-indicator';
    }
  }
}
```

### 3. Timing Display Component

```javascript
class TimingDisplay extends OverlayComponent {
  constructor(container, dataManager) {
    super(container, dataManager);
    this.previousLapTime = null;
  }

  getTemplate() {
    return `
      <div class="timing-display">
        <div class="current-lap">
          <div class="label">Current Lap</div>
          <div class="value" id="current-lap">--:--.---</div>
        </div>
        <div class="last-lap">
          <div class="label">Last Lap</div>
          <div class="value" id="last-lap">--:--.---</div>
        </div>
        <div class="best-lap">
          <div class="label">Best Lap</div>
          <div class="value" id="best-lap">--:--.---</div>
        </div>
        <div class="delta">
          <div class="label">Delta</div>
          <div class="value" id="delta">+-.---</div>
        </div>
      </div>
    `;
  }

  async fetchData() {
    const recentRaces = await this.dataManager.getRecentRaces();
    
    if (recentRaces.races.length > 0) {
      const lastRace = recentRaces.races[0];
      const lapData = await this.dataManager.getLapData(
        lastRace.subsession_id,
        null
      );

      return {
        laps: lapData.laps,
        bestLapTime: lastRace.best_lap_time
      };
    }

    return null;
  }

  updateDisplay(data) {
    if (!data || !data.laps || data.laps.length === 0) return;

    const laps = data.laps;
    const lastLap = laps[laps.length - 1];
    
    this.updateElement('last-lap', this.formatLapTime(lastLap.lap_time));
    this.updateElement('best-lap', this.formatLapTime(data.bestLapTime));

    if (this.previousLapTime) {
      const delta = lastLap.lap_time - this.previousLapTime;
      this.updateDelta(delta);
    }

    this.previousLapTime = lastLap.lap_time;
  }

  updateElement(id, value) {
    const element = this.container.querySelector(`#${id}`);
    if (element) element.textContent = value;
  }

  updateDelta(deltaMs) {
    const element = this.container.querySelector('#delta');
    if (!element) return;

    const deltaSeconds = deltaMs / 1000;
    const formatted = deltaSeconds >= 0 ? 
      `+${deltaSeconds.toFixed(3)}` : 
      deltaSeconds.toFixed(3);

    element.textContent = formatted;
    element.className = deltaSeconds >= 0 ? 
      'value delta-positive' : 
      'value delta-negative';
  }

  formatLapTime(milliseconds) {
    if (!milliseconds) return '--:--.---';
    
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(3);
    
    return `${minutes}:${seconds.padStart(6, '0')}`;
  }
}
```

### 4. State Management Pattern

```javascript
class StateManager {
  constructor() {
    this.state = {};
    this.listeners = new Map();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    if (oldValue !== value) {
      this.notify(key, value, oldValue);
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  notify(key, newValue, oldValue) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      });
    }
  }

  reset() {
    this.state = {};
    this.listeners.clear();
  }
}

// Usage
const state = new StateManager();

// Subscribe to changes
const unsubscribe = state.subscribe('position', (newPos, oldPos) => {
  console.log(`Position changed from ${oldPos} to ${newPos}`);
  updatePositionDisplay(newPos);
});

// Update state
state.set('position', 5);

// Later, unsubscribe
unsubscribe();
```

### 5. Data Synchronization Pattern

```javascript
class DataSynchronizer {
  constructor(dataManager, stateManager) {
    this.dataManager = dataManager;
    this.stateManager = stateManager;
    this.syncInterval = null;
    this.syncTasks = new Map();
  }

  registerTask(name, fetchFunction, interval) {
    this.syncTasks.set(name, {
      fetch: fetchFunction,
      interval: interval,
      lastRun: 0
    });
  }

  start() {
    if (this.syncInterval) return;

    // Run immediately
    this.syncAll();

    // Then run at fixed interval
    this.syncInterval = setInterval(() => this.syncAll(), 1000);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncAll() {
    const now = Date.now();

    for (const [name, task] of this.syncTasks) {
      if (now - task.lastRun >= task.interval) {
        try {
          const data = await task.fetch();
          this.stateManager.set(name, data);
          task.lastRun = now;
        } catch (error) {
          console.error(`Error syncing ${name}:`, error);
        }
      }
    }
  }
}

// Usage
const sync = new DataSynchronizer(dataManager, stateManager);

// Register sync tasks with different intervals
sync.registerTask('memberInfo', 
  () => dataManager.getMemberInfo(), 
  60000  // 1 minute
);

sync.registerTask('recentRaces', 
  () => dataManager.getRecentRaces(), 
  5000   // 5 seconds
);

sync.registerTask('currentSession',
  () => dataManager.getCurrentSession(),
  1000   // 1 second
);

sync.start();
```

## Styling Best Practices

### 1. CSS Variables for Theming

```css
:root {
  /* Colors */
  --color-primary: #1e90ff;
  --color-success: #00ff00;
  --color-warning: #ffa500;
  --color-danger: #ff4444;
  --color-background: #000000;
  --color-text: #ffffff;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family: 'Roboto', sans-serif;
  --font-size-sm: 12px;
  --font-size-md: 16px;
  --font-size-lg: 24px;
  --font-size-xl: 36px;
  
  /* Borders */
  --border-radius: 4px;
  --border-width: 2px;
  
  /* Transitions */
  --transition-fast: 0.15s;
  --transition-normal: 0.3s;
  --transition-slow: 0.5s;
}

/* Dark theme */
.theme-dark {
  --color-background: #000000;
  --color-text: #ffffff;
}

/* Light theme */
.theme-light {
  --color-background: #ffffff;
  --color-text: #000000;
}
```

### 2. Responsive Overlay Design

```css
.overlay-container {
  display: grid;
  grid-template-areas:
    "position timing"
    "stats stats";
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.position-display {
  grid-area: position;
}

.timing-display {
  grid-area: timing;
}

.stats-display {
  grid-area: stats;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .overlay-container {
    grid-template-areas:
      "position"
      "timing"
      "stats";
    grid-template-columns: 1fr;
  }
}
```

### 3. Animation for Data Updates

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.position-number {
  transition: all var(--transition-fast) ease;
}

.position-number.updated {
  animation: pulse var(--transition-fast);
}

.change-indicator.positive {
  color: var(--color-success);
  animation: slideIn var(--transition-normal);
}

.change-indicator.negative {
  color: var(--color-danger);
  animation: slideIn var(--transition-normal);
}
```

## Configuration Management

### Configuration File Structure

```javascript
// config/default.json
{
  "api": {
    "baseUrl": "https://members-ng.iracing.com/data",
    "tokenUrl": "https://id.iracing.com/auth/token",
    "clientId": "your-client-id"
  },
  "overlay": {
    "refreshInterval": 1000,
    "cacheExpiry": {
      "static": 3600000,
      "dynamic": 5000,
      "realtime": 1000
    },
    "display": {
      "showPosition": true,
      "showTiming": true,
      "showStats": true,
      "theme": "dark"
    }
  },
  "features": {
    "autoRefresh": true,
    "soundAlerts": false,
    "notifications": true
  }
}
```

### Configuration Manager

```javascript
class ConfigManager {
  constructor(defaultConfig) {
    this.config = { ...defaultConfig };
    this.loadUserConfig();
  }

  loadUserConfig() {
    const stored = localStorage.getItem('overlay_config');
    if (stored) {
      try {
        const userConfig = JSON.parse(stored);
        this.config = this.deepMerge(this.config, userConfig);
      } catch (error) {
        console.error('Error loading user config:', error);
      }
    }
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!(key in obj)) obj[key] = {};
      return obj[key];
    }, this.config);
    
    target[lastKey] = value;
    this.saveUserConfig();
  }

  saveUserConfig() {
    try {
      localStorage.setItem('overlay_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving user config:', error);
    }
  }

  deepMerge(target, source) {
    const output = { ...target };
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        output[key] = this.deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }

  reset() {
    localStorage.removeItem('overlay_config');
    this.loadUserConfig();
  }
}
```

## Testing Strategies

### Unit Test Example

```javascript
// tests/unit/formatters.test.js
import { formatLapTime, formatPosition, formatDelta } from '../../src/utils/formatters';

describe('Formatters', () => {
  describe('formatLapTime', () => {
    it('should format milliseconds to MM:SS.sss', () => {
      expect(formatLapTime(125432)).toBe('2:05.432');
      expect(formatLapTime(61234)).toBe('1:01.234');
    });

    it('should handle zero and null', () => {
      expect(formatLapTime(0)).toBe('0:00.000');
      expect(formatLapTime(null)).toBe('--:--.---');
    });
  });

  describe('formatPosition', () => {
    it('should format position with ordinal suffix', () => {
      expect(formatPosition(1)).toBe('1st');
      expect(formatPosition(2)).toBe('2nd');
      expect(formatPosition(3)).toBe('3rd');
      expect(formatPosition(4)).toBe('4th');
    });
  });

  describe('formatDelta', () => {
    it('should format positive delta with plus sign', () => {
      expect(formatDelta(1234)).toBe('+1.234');
    });

    it('should format negative delta', () => {
      expect(formatDelta(-1234)).toBe('-1.234');
    });
  });
});
```

### Integration Test Example

```javascript
// tests/integration/api.test.js
import { iRacingDataManager } from '../../src/api/DataManager';
import { iRacingAuth } from '../../src/auth/AuthManager';

describe('iRacing Data Manager', () => {
  let auth, dataManager;

  beforeAll(async () => {
    auth = new iRacingAuth(process.env.IRACING_CLIENT_ID);
    await auth.authenticate(
      process.env.IRACING_EMAIL,
      process.env.IRACING_PASSWORD
    );
    dataManager = new iRacingDataManager(auth);
  });

  it('should fetch member info', async () => {
    const memberInfo = await dataManager.getMemberInfo();
    expect(memberInfo).toHaveProperty('cust_id');
    expect(memberInfo).toHaveProperty('email');
  });

  it('should fetch recent races', async () => {
    const recentRaces = await dataManager.getRecentRaces();
    expect(recentRaces).toHaveProperty('races');
    expect(Array.isArray(recentRaces.races)).toBe(true);
  });

  it('should cache static data', async () => {
    const carInfo1 = await dataManager.getCarInfo(45);
    const carInfo2 = await dataManager.getCarInfo(45);
    
    expect(carInfo1).toEqual(carInfo2);
    // Second call should be from cache (you can verify with spy)
  });
});
```

## Performance Optimization

### 1. Debouncing Updates

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const debouncedUpdate = debounce((data) => {
  updateDisplay(data);
}, 250);
```

### 2. Request Batching

```javascript
class BatchedRequestManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.queue = [];
    this.batchTimeout = null;
    this.batchDelay = 100; // ms
  }

  request(endpoint) {
    return new Promise((resolve, reject) => {
      this.queue.push({ endpoint, resolve, reject });
      
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      this.batchTimeout = setTimeout(() => this.processBatch(), this.batchDelay);
    });
  }

  async processBatch() {
    const batch = [...this.queue];
    this.queue = [];

    const uniqueEndpoints = [...new Set(batch.map(r => r.endpoint))];
    const results = new Map();

    // Fetch all unique endpoints in parallel
    await Promise.all(
      uniqueEndpoints.map(async (endpoint) => {
        try {
          const data = await this.dataManager.request(endpoint);
          results.set(endpoint, { success: true, data });
        } catch (error) {
          results.set(endpoint, { success: false, error });
        }
      })
    );

    // Resolve all promises
    batch.forEach(({ endpoint, resolve, reject }) => {
      const result = results.get(endpoint);
      if (result.success) {
        resolve(result.data);
      } else {
        reject(result.error);
      }
    });
  }
}
```

### 3. Virtual Scrolling for Large Lists

```javascript
class VirtualList {
  constructor(container, items, renderItem, itemHeight) {
    this.container = container;
    this.items = items;
    this.renderItem = renderItem;
    this.itemHeight = itemHeight;
    this.visibleStart = 0;
    this.visibleEnd = 0;
    
    this.init();
  }

  init() {
    this.container.style.overflow = 'auto';
    this.container.addEventListener('scroll', () => this.onScroll());
    this.render();
  }

  onScroll() {
    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;
    
    this.visibleStart = Math.floor(scrollTop / this.itemHeight);
    this.visibleEnd = Math.ceil((scrollTop + viewportHeight) / this.itemHeight);
    
    this.render();
  }

  render() {
    const fragment = document.createDocumentFragment();
    
    for (let i = this.visibleStart; i <= this.visibleEnd && i < this.items.length; i++) {
      const element = this.renderItem(this.items[i]);
      element.style.position = 'absolute';
      element.style.top = `${i * this.itemHeight}px`;
      fragment.appendChild(element);
    }

    this.container.innerHTML = '';
    this.container.appendChild(fragment);
    this.container.style.height = `${this.items.length * this.itemHeight}px`;
  }
}
```

## Deployment Considerations

### Electron App Package

```javascript
// main.js (Electron main process)
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  
  // Optional: Open DevTools
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### Build Configuration

```json
{
  "name": "iracing-overlay",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "test": "jest"
  },
  "build": {
    "appId": "com.iracing.overlay",
    "productName": "iRacing Overlay",
    "directories": {
      "output": "dist"
    },
    "files": [
      "**/*",
      "!**/*.md",
      "!tests/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    }
  }
}
```

## Debugging Tips

### 1. Add Comprehensive Logging

```javascript
class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
  }

  log(level, message, ...args) {
    if (this.levels[level] >= this.levels[this.level]) {
      const timestamp = new Date().toISOString();
      console[level](`[${timestamp}] [${level.toUpperCase()}]`, message, ...args);
    }
  }

  debug(message, ...args) { this.log('debug', message, ...args); }
  info(message, ...args) { this.log('info', message, ...args); }
  warn(message, ...args) { this.log('warn', message, ...args); }
  error(message, ...args) { this.log('error', message, ...args); }
}

const logger = new Logger(process.env.LOG_LEVEL || 'info');
```

### 2. API Request Inspector

```javascript
class APIInspector {
  constructor() {
    this.requests = [];
    this.maxRequests = 100;
  }

  logRequest(endpoint, method, duration, status) {
    this.requests.push({
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    });

    if (this.requests.length > this.maxRequests) {
      this.requests.shift();
    }
  }

  getStats() {
    return {
      total: this.requests.length,
      avgDuration: this.requests.reduce((sum, r) => sum + r.duration, 0) / this.requests.length,
      errors: this.requests.filter(r => r.status >= 400).length,
      byEndpoint: this.groupBy(this.requests, 'endpoint')
    };
  }

  groupBy(array, key) {
    return array.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  }

  clear() {
    this.requests = [];
  }
}
```

## Security Considerations

1. **Never store credentials in code or config files**
2. **Use HTTPS for all API communications**
3. **Implement proper token storage (OS keychain)**
4. **Validate all API responses**
5. **Sanitize user inputs**
6. **Keep dependencies updated**
7. **Implement rate limiting**
8. **Log security events**

## Next Steps

- Review [OAuth Authentication](./iracing-oauth-flow.md)
- Check [Data API Reference](./iracing-data-api.md)
- Explore [Example Implementations](../examples/)
- Join iRacing developer community forums
