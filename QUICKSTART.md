# 🚀 Quick Start Guide - M2Y.net Landing Page with Subdomain Integration

## 📋 Prerequisites Checklist

- [x] Node.js v16+ installed
- [x] npm v8+ installed
- [ ] EngiSuite subdomain running (optional for testing)
- [ ] Invist subdomain running (optional for testing)

## ⚡ Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- Express.js (web server)
- EJS (templating)
- Axios (HTTP client for subdomain API calls)
- Helmet (security)
- Compression (performance)
- Rate limiting
- Other essential packages

### Step 2: Configure Environment

The `.env` file is already created with default settings:

```env
NODE_ENV=development
PORT=3000
ENGISUITE_URL=https://engisuite.m2y.net
INVIST_URL=https://invist.m2y.net
```

**For local development with local subdomains:**
```env
ENGISUITE_URL=http://localhost:5001
INVIST_URL=http://localhost:5002
```

### Step 3: Test Subdomain Connectivity (Optional)

```bash
node test-integration.js
```

This will test connections to both subdomains and show you:
- ✅ If subdomains are online
- 📊 Sample data from each platform
- ⚠️  Any connection issues

**Note:** It's OK if tests show warnings. The landing page will use fallback data if subdomains are not yet deployed.

### Step 4: Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Step 5: Open in Browser

Navigate to: **http://localhost:3000**

---

## 🎯 What's Been Integrated

### ✅ Subdomain API Integration

The landing page now connects to both subdomains in real-time:

#### **EngiSuite Integration** (`engisuite.m2y.net`)
- Real-time platform statistics
- Recent project listings
- Platform feature data
- Health status monitoring
- Auto-refresh every 5 minutes

#### **Invist Integration** (`invist.m2y.net`)
- Live market data
- Portfolio performance metrics
- Recent trades information
- Investment statistics
- Real-time health checks

### 📡 Available API Endpoints

Your landing page now has these endpoints:

```
GET /api/platforms/status       - Both platforms status
GET /api/platforms/stats        - Combined statistics

GET /api/engisuite/stats        - EngiSuite statistics
GET /api/engisuite/projects     - Recent projects
GET /api/engisuite/features     - Platform features
GET /api/engisuite/health       - Health check

GET /api/invist/stats          - Invist statistics
GET /api/invist/market         - Market data
GET /api/invist/trades         - Recent trades
GET /api/invist/performance    - Performance data
GET /api/invist/health         - Health check
```

### 🎨 UI Features

1. **Status Badges**
   - Green "Online" badge when subdomain is accessible
   - Red "Offline" badge when subdomain is down
   - Pulsing animation on online status

2. **Dynamic Stats**
   - Real-time statistics displayed on platform cards
   - Auto-updates without page refresh
   - Graceful fallback if data unavailable

3. **Auto-Refresh**
   - Platform status: Every 60 seconds
   - Statistics: Every 5 minutes

---

## 🔧 Testing the Integration

### Test Individual Subdomain APIs

```bash
# Test EngiSuite
curl http://localhost:3000/api/engisuite/stats

# Test Invist
curl http://localhost:3000/api/invist/stats

# Test combined status
curl http://localhost:3000/api/platforms/status
```

### Monitor Real-time Updates

1. Open browser DevTools (F12)
2. Go to Console tab
3. Watch for logs showing:
   - Platform status checks
   - Data fetches
   - Any errors or warnings

---

## 📁 Project Structure (Updated)

```
m2y.net landingpage/
├── services/                  # NEW: API integration services
│   ├── engisuiteService.js   # EngiSuite API client
│   └── invistService.js      # Invist API client
├── routes/                    # NEW: API routes
│   └── api.js                # Subdomain integration endpoints
├── public/
│   ├── css/
│   │   ├── styles.css
│   │   └── platform-integration.css  # NEW: Status badges & stats
│   └── js/
│       ├── main.js
│       └── platform-data.js  # NEW: Real-time data fetching
├── views/
│   └── ... (EJS templates)
├── server.js                 # Main server (updated with API routes)
├── test-integration.js       # NEW: Test subdomain connectivity
├── INTEGRATION.md            # NEW: Detailed integration docs
└── README.md                 # Updated with integration info
```

---

## 🎬 Next Steps

### If Subdomains Are Already Running

1. Update `.env` with correct URLs
2. Run `node test-integration.js` to verify connectivity
3. Start the server: `npm start`
4. Visit http://localhost:3000
5. Check that status badges show "Online" in green

### If Subdomains Are NOT Yet Running

1. The landing page will work perfectly with fallback data
2. Status badges will show "Offline"
3. When you deploy subdomains, data will automatically connect
4. No code changes needed!

### Required API Endpoints in Your Subdomains

For full integration, your subdomains should have these endpoints:

**EngiSuite** (`engisuite.m2y.net`):
```
GET /api/stats          - Platform statistics
GET /api/projects/recent - Recent projects
GET /api/features       - Features list
GET /api/health         - Health check
```

**Invist** (`invist.m2y.net`):
```
GET /api/stats          - Platform statistics
GET /api/market/summary - Market data
GET /api/trades/recent  - Recent trades
GET /api/performance    - Performance metrics
GET /api/health         - Health check
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to subdomain"
**Solution:** 
- Check if subdomain is running
- Verify URL in `.env` file
- Check network/firewall settings

### Issue: "CORS error in browser"
**Solution:**
Add CORS headers to your subdomain:
```javascript
// In subdomain server
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

### Issue: "Data not updating"
**Solution:**
- Clear browser cache
- Check browser console for errors
- Verify API endpoints return correct JSON format

---

## 📊 Example API Response Formats

Your subdomains should return data in these formats:

### EngiSuite Stats
```json
{
  "activeProjects": 150,
  "totalUsers": 1250,
  "completedTasks": 5400,
  "uptime": "99.9%"
}
```

### Invist Stats
```json
{
  "portfolios": 890,
  "totalInvestments": 45000000,
  "activeUsers": 2100,
  "avgReturn": "12.5%"
}
```

---

## 🎓 Learn More

- **Full Integration Documentation:** See `INTEGRATION.md`
- **Main README:** See `README.md`
- **API Documentation:** See comments in `routes/api.js`

---

## ✅ Ready to Deploy?

Your landing page is now ready for production! See README.md for deployment instructions.

**Key Points:**
- ✅ SEO optimized with meta tags and structured data
- ✅ Real-time integration with both subdomains
- ✅ Responsive design for all devices
- ✅ Security hardened with Helmet and rate limiting
- ✅ Performance optimized with compression
- ✅ Graceful error handling and fallbacks
- ✅ Auto-refresh for real-time updates

---

**Questions?** Check `INTEGRATION.md` for detailed docs or contact the development team.

**Happy Coding! 🚀**
