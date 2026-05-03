# Subdomain Integration Guide

This document explains how the M2Y.net landing page integrates with the EngiSuite and Invist subdomains.

## 🔗 Architecture Overview

```
┌─────────────────────────────────────────────┐
│           M2Y.net Landing Page              │
│              (Node.js/Express)              │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
┌───────────────┐    ┌───────────────┐
│   EngiSuite   │    │    Invist     │
│  Subdomain    │    │   Subdomain   │
│ engisuite.m2y │    │  invist.m2y   │
│     .net      │    │     .net      │
└───────────────┘    └───────────────┘
```

## 📡 API Integration

### Services Layer

The integration uses a service-based architecture:

#### **1. EngiSuite Service** (`services/engisuiteService.js`)
Handles all API calls to `engisuite.m2y.net`:

**Available Methods:**
- `getStats()` - Fetch platform statistics
- `getRecentProjects(limit)` - Get recent engineering projects
- `getFeatures()` - Fetch platform features
- `checkHealth()` - Health check endpoint
- `subscribe(email)` - Newsletter subscription

**Example Request:**
```javascript
const engisuiteService = require('./services/engisuiteService');
const stats = await engisuiteService.getStats();
```

#### **2. Invist Service** (`services/invistService.js`)
Handles all API calls to `invist.m2y.net`:

**Available Methods:**
- `getStats()` - Fetch platform statistics
- `getMarketData()` - Get market summary
- `getRecentTrades(limit)` - Fetch recent trades
- `getFeatures()` - Platform features
- `checkHealth()` - Health check
- `getPerformance(period)` - Portfolio performance

**Example Request:**
```javascript
const invistService = require('./services/invistService');
const marketData = await invistService.getMarketData();
```

### API Routes (`routes/api.js`)

All subdomain integration endpoints are prefixed with `/api/`:

#### **EngiSuite Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/engisuite/stats` | GET | Platform statistics |
| `/api/engisuite/projects` | GET | Recent projects (query: `?limit=5`) |
| `/api/engisuite/features` | GET | Platform features |
| `/api/engisuite/health` | GET | Health check |

#### **Invist Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/invist/stats` | GET | Platform statistics |
| `/api/invist/market` | GET | Market data summary |
| `/api/invist/trades` | GET | Recent trades (query: `?limit=10`) |
| `/api/invist/performance` | GET | Performance data (query: `?period=30d`) |
| `/api/invist/health` | GET | Health check |

#### **Combined Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/platforms/status` | GET | Status of both platforms |
| `/api/platforms/stats` | GET | Combined statistics |

### Frontend Integration (`public/js/platform-data.js`)

The frontend automatically fetches and displays data from both subdomains:

**Features:**
- Real-time platform status indicators (Online/Offline)
- Dynamic statistics display on platform cards
- Auto-refresh every 60 seconds (status) and 5 minutes (stats)
- Graceful error handling with fallback data

**Methods:**
- `fetchPlatformStatus()` - Get real-time status
- `fetchPlatformStats()` - Fetch combined statistics
- `fetchEngiSuiteData()` - EngiSuite-specific data
- `fetchInvistData()` - Invist-specific data

## 🔧 Configuration

### Environment Variables

Set these in your `.env` file:

```env
# Subdomain URLs
ENGISUITE_URL=https://engisuite.m2y.net
INVIST_URL=https://invist.m2y.net
```

For local development with subdomains running locally:
```env
ENGISUITE_URL=http://localhost:5001
INVIST_URL=http://localhost:5002
```

### Timeout Settings

Default API timeout is **10 seconds**. Modify in service files:

```javascript
this.client = axios.create({
    baseURL: this.baseURL,
    timeout: 10000, // Change this value
    // ...
});
```

## 📊 Data Flow

### 1. Page Load
```
User visits m2y.net
    ↓
index.ejs renders
    ↓
platform-data.js initializes
    ↓
Fetches data from both subdomains
    ↓
Updates UI with real-time data
```

### 2. Auto-Refresh
```
Every 60 seconds: Platform Status
Every 5 minutes: Statistics Update
```

### 3. Error Handling
```
API Request → Timeout/Error → Fallback Data → Log Error → Continue
```

## 🎨 UI Components

### Status Badge
Shows online/offline status for each platform:

```html
<div class="status-badge online">
    <i class="fas fa-circle"></i> Online
</div>
```

**Styles:**
- `.status-badge.online` - Green with pulsing indicator
- `.status-badge.offline` - Red indicator

### Stats Display
Dynamic statistics shown on platform cards:

```html
<div class="platform-stats-display">
    <div class="stats-grid">
        <div class="stat-item-small">
            <div class="stat-value">1234</div>
            <div class="stat-label">Active Projects</div>
        </div>
    </div>
</div>
```

## 🔐 Security Considerations

### Rate Limiting
API endpoints have rate limiting:
- General API: 100 requests per 15 minutes per IP
- Contact form: 5 requests per hour per IP

### CORS
If subdomains are on different domains, configure CORS in subdomain applications:

```javascript
// In EngiSuite/Invist server
app.use(cors({
    origin: 'https://m2y.net',
    credentials: true
}));
```

### API Authentication (Optional)
For secure subdomain APIs, add authentication:

```javascript
// In service files
this.client = axios.create({
    baseURL: this.baseURL,
    timeout: this.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`
    },
});
```

## 🧪 Testing Integration

### Test Individual Services

Create a test file `test-integration.js`:

```javascript
const engisuiteService = require('./services/engisuiteService');
const invistService = require('./services/invistService');

async function testIntegration() {
    console.log('Testing EngiSuite...');
    const engiHealth = await engisuiteService.checkHealth();
    console.log('EngiSuite Health:', engiHealth);
    
    console.log('Testing Invist...');
    const invistHealth = await invistService.checkHealth();
    console.log('Invist Health:', invistHealth);
}

testIntegration();
```

Run: `node test-integration.js`

### Test API Endpoints

```bash
# Test platform status
curl http://localhost:3000/api/platforms/status

# Test EngiSuite stats
curl http://localhost:3000/api/engisuite/stats

# Test Invist market data
curl http://localhost:3000/api/invist/market
```

## 📈 Expected API Responses

### EngiSuite Stats Response
```json
{
  "success": true,
  "data": {
    "activeProjects": 150,
    "totalUsers": 1250,
    "completedTasks": 5400,
    "uptime": "99.9%"
  }
}
```

### Invist Stats Response
```json
{
  "success": true,
  "data": {
    "portfolios": 890,
    "totalInvestments": 45000000,
    "activeUsers": 2100,
    "avgReturn": "12.5%"
  }
}
```

### Platform Status Response
```json
{
  "success": true,
  "platforms": {
    "engisuite": {
      "name": "EngiSuite",
      "status": "online",
      "url": "https://engisuite.m2y.net",
      "healthy": true
    },
    "invist": {
      "name": "Invist",
      "status": "online",
      "url": "https://invist.m2y.net",
      "healthy": true
    }
  }
}
```

## 🚨 Troubleshooting

### Subdomain Not Responding

**Issue:** API calls timeout

**Solutions:**
1. Check if subdomain is running
2. Verify URL in `.env` file
3. Check firewall/network settings
4. Increase timeout in service files

### CORS Errors

**Issue:** Browser blocks requests

**Solutions:**
1. Configure CORS headers in subdomain apps
2. Use proxy in development
3. Ensure proper domain configuration

### Data Not Displaying

**Issue:** UI doesn't update

**Solutions:**
1. Check browser console for errors
2. Verify API endpoints return correct data
3. Check if `platform-data.js` is loaded
4. Clear browser cache

## 🔄 Fallback Strategy

When subdomains are unavailable, the landing page:
1. Shows fallback/mock data
2. Displays "offline" status badges
3. Logs errors to console
4. Continues to function normally
5. Retries on next refresh interval

## 📝 Adding New Endpoints

### 1. Add method to service file

```javascript
// services/engisuiteService.js
async getNewData() {
    try {
        const response = await this.client.get('/api/new-endpoint');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

### 2. Create API route

```javascript
// routes/api.js
router.get('/engisuite/new-endpoint', async (req, res) => {
    const data = await engisuiteService.getNewData();
    res.json(data);
});
```

### 3. Use in frontend

```javascript
// public/js/platform-data.js
async fetchNewData() {
    const response = await fetch('/api/engisuite/new-endpoint');
    const data = await response.json();
    // Process and display data
}
```

## 🎯 Best Practices

1. **Always handle errors gracefully** - Provide fallback data
2. **Use appropriate timeouts** - Don't let requests hang
3. **Cache responses** - Reduce API calls where possible
4. **Monitor performance** - Log slow requests
5. **Validate responses** - Check data structure before using
6. **Use environment variables** - Never hardcode URLs
7. **Implement retry logic** - For transient failures
8. **Document API changes** - Keep this guide updated

## 📚 Further Reading

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)
- [API Design Best Practices](https://restfulapi.net/)
- [Error Handling in Node.js](https://nodejs.dev/learn/error-handling-in-nodejs)

---

**Last Updated:** March 10, 2026
