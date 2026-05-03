# 🔄 Data Flow Architecture - M2Y.net Landing Page

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│                   http://localhost:3000                      │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ↓
        ┌───────────────────────────────┐
        │   M2Y.net Landing Page Server │
        │      (Node.js + Express)      │
        │         Port: 3000            │
        └───────────┬───────────────────┘
                    │
        ┏━━━━━━━━━━━┻━━━━━━━━━━━┓
        ↓                        ↓
┌──────────────────┐    ┌──────────────────┐
│  EngiSuite API   │    │    Invist API    │
│  Service Layer   │    │   Service Layer  │
│   (Axios HTTP)   │    │   (Axios HTTP)   │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ↓                       ↓
┌──────────────────┐    ┌──────────────────┐
│  EngiSuite.m2y   │    │   Invist.m2y     │
│      .net        │    │      .net        │
│  (Node.js API)   │    │ (Full Stack API) │
└──────────────────┘    └──────────────────┘
```

---

## Request Flow Examples

### 1. User Visits Landing Page

```
1. Browser requests: http://localhost:3000
                ↓
2. Server renders index.ejs with platform URLs
                ↓
3. Page loads with static content
                ↓
4. platform-data.js initializes
                ↓
5. Parallel API calls to both subdomains:
   ├─ GET /api/engisuite/stats
   └─ GET /api/invist/stats
                ↓
6. Services make HTTP requests:
   ├─ engisuiteService → https://engisuite.m2y.net/api/stats
   └─ invistService → https://invist.m2y.net/api/stats
                ↓
7. Responses received (or timeout/error)
                ↓
8. Data rendered in UI with status badges
                ↓
9. Auto-refresh timers set:
   ├─ Status check every 60 seconds
   └─ Stats refresh every 5 minutes
```

### 2. Contact Form Submission

```
1. User fills form and clicks "Send"
                ↓
2. JavaScript validates inputs
                ↓
3. POST /api/contact with form data
                ↓
4. Server validates and rate-limits
                ↓
5. Email sent (if configured)
                ↓
6. Success response returned
                ↓
7. Form shows success message
```

### 3. Platform Status Check

```
1. Auto-refresh timer triggers (every 60s)
                ↓
2. GET /api/platforms/status
                ↓
3. Server makes parallel requests:
   ├─ engisuiteService.checkHealth()
   └─ invistService.checkHealth()
                ↓
4. Each service calls subdomain /api/health
                ↓
5. Responses aggregated
                ↓
6. JSON response sent to browser
                ↓
7. Status badges updated:
   ├─ Green + pulse = Online
   └─ Red = Offline
```

---

## API Endpoint Mapping

### Landing Page → EngiSuite

| Landing Page Endpoint | EngiSuite Subdomain | Data Returned |
|----------------------|---------------------|---------------|
| `GET /api/engisuite/stats` | `GET /api/stats` | Platform statistics |
| `GET /api/engisuite/projects` | `GET /api/projects/recent` | Recent projects |
| `GET /api/engisuite/features` | `GET /api/features` | Feature list |
| `GET /api/engisuite/health` | `GET /api/health` | Health status |

### Landing Page → Invist

| Landing Page Endpoint | Invist Subdomain | Data Returned |
|----------------------|------------------|---------------|
| `GET /api/invist/stats` | `GET /api/stats` | Platform statistics |
| `GET /api/invist/market` | `GET /api/market/summary` | Market data |
| `GET /api/invist/trades` | `GET /api/trades/recent` | Recent trades |
| `GET /api/invist/performance` | `GET /api/performance` | Performance metrics |
| `GET /api/invist/health` | `GET /api/health` | Health status |

---

## Error Handling Flow

### When Subdomain is Offline

```
1. Browser requests platform data
                ↓
2. Server attempts to connect to subdomain
                ↓
3. Request times out (10 seconds)
                ↓
4. Service catches error
                ↓
5. Returns fallback data structure:
   {
     success: false,
     error: "Connection timeout",
     data: { /* default values */ }
   }
                ↓
6. Frontend receives response
                ↓
7. Shows offline badge
                ↓
8. Displays fallback data
                ↓
9. Logs error to console
                ↓
10. Normal operation continues
```

---

## Data Update Cycle

```
┌─────────────────────────────────────────┐
│         Page Load (t=0)                 │
│  - Fetch initial stats                  │
│  - Display default/fallback data        │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         After 60 seconds (t=60s)        │
│  - Check platform status                │
│  - Update status badges                 │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         After 5 minutes (t=300s)        │
│  - Refresh statistics                   │
│  - Update displayed numbers             │
│  - Animate counter if needed            │
└─────────────┬───────────────────────────┘
              ↓
              ┌──────────────┐
              │ Repeat Cycle │
              └──────────────┘
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Browser)                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   main.js    │  │platform-data │  │  Contact     │      │
│  │              │  │    .js       │  │   Form       │      │
│  │ - Navigation │  │ - API calls  │  │ - Validation │      │
│  │ - Animations │  │ - Auto-refresh│ │ - Submission │      │
│  │ - Counters   │  │ - UI updates │  │ - Messages   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Express Server │
                    │   (server.js)   │
                    └───────┬─────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
      ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
      │   EJS     │  │   API     │  │  Static   │
      │ Templates │  │  Routes   │  │  Assets   │
      │           │  │           │  │           │
      │ - index   │  │ - api.js  │  │ - CSS     │
      │ - 404     │  │           │  │ - JS      │
      │ - error   │  │           │  │ - Images  │
      └───────────┘  └─────┬─────┘  └───────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
      ┌─────▼──────┐              ┌──────▼──────┐
      │ EngiSuite  │              │   Invist    │
      │  Service   │              │   Service   │
      │            │              │             │
      │ - Axios    │              │ - Axios     │
      │ - Timeout  │              │ - Timeout   │
      │ - Fallback │              │ - Fallback  │
      └─────┬──────┘              └──────┬──────┘
            │                            │
            └────────────┬───────────────┘
                         │
              ┌──────────▼──────────┐
              │   Subdomain APIs    │
              │                     │
              │ engisuite.m2y.net   │
              │ invist.m2y.net      │
              └─────────────────────┘
```

---

## File Dependencies

```
server.js
  ├─→ requires: express, helmet, compression, dotenv
  ├─→ imports: routes/api.js
  ├─→ serves: public/* (static)
  └─→ renders: views/*.ejs

routes/api.js
  ├─→ requires: express
  ├─→ imports: services/engisuiteService.js
  └─→ imports: services/invistService.js

services/engisuiteService.js
  ├─→ requires: axios
  └─→ connects: ENGISUITE_URL (.env)

services/invistService.js
  ├─→ requires: axios
  └─→ connects: INVIST_URL (.env)

views/index.ejs
  ├─→ includes: partials/navbar.ejs
  ├─→ includes: partials/hero.ejs
  ├─→ includes: partials/about.ejs
  ├─→ includes: partials/platforms.ejs
  ├─→ includes: partials/features.ejs
  ├─→ includes: partials/cta.ejs
  ├─→ includes: partials/contact.ejs
  ├─→ includes: partials/footer.ejs
  ├─→ loads: /css/styles.css
  ├─→ loads: /css/platform-integration.css
  ├─→ loads: /js/main.js
  └─→ loads: /js/platform-data.js

public/js/platform-data.js
  ├─→ fetches: /api/platforms/status
  ├─→ fetches: /api/platforms/stats
  ├─→ fetches: /api/engisuite/*
  └─→ fetches: /api/invist/*
```

---

## Security Layer Flow

```
┌──────────────────────────────────────────────────────┐
│              Incoming Request                        │
└──────────────────┬───────────────────────────────────┘
                   ↓
          ┌────────────────┐
          │  Helmet.js     │ → Add security headers
          │  Middleware    │    (CSP, XSS protection)
          └────────┬───────┘
                   ↓
          ┌────────────────┐
          │ Rate Limiter   │ → Check request limit
          │  Middleware    │    (100/15min or 5/hour)
          └────────┬───────┘
                   ↓
          ┌────────────────┐
          │ Body Parser    │ → Parse JSON/form data
          │  Middleware    │    
          └────────┬───────┘
                   ↓
          ┌────────────────┐
          │ Route Handler  │ → Process request
          │                │    
          └────────┬───────┘
                   ↓
          ┌────────────────┐
          │ Compression    │ → Compress response
          │  Middleware    │    
          └────────┬───────┘
                   ↓
          ┌────────────────┐
          │   Response     │ → Send to client
          └────────────────┘
```

---

## Production Deployment Flow

```
Development (localhost:3000)
          ↓
    Git Repository
          ↓
    CI/CD Pipeline
          ↓
   ┌──────────────┐
   │   Build      │ → npm install
   │   Process    │   npm audit
   │              │   npm test (optional)
   └──────┬───────┘
          ↓
   ┌──────────────┐
   │   Deploy     │ → Upload to server
   │   Stage      │   Set environment vars
   │              │   Start with PM2
   └──────┬───────┘
          ↓
   Production Server
   ├─ m2y.net (Port 80/443)
   ├─ SSL Certificate
   ├─ PM2 Process Manager
   ├─ Nginx Reverse Proxy (optional)
   └─ Connected to:
      ├─ engisuite.m2y.net
      └─ invist.m2y.net
```

---

## Key Takeaways

1. **Modular Architecture**: Services, routes, and views are separated
2. **Fault Tolerant**: Graceful degradation if subdomains are offline
3. **Performance Optimized**: Caching, compression, lazy loading
4. **Security First**: Helmet, rate limiting, validation
5. **Real-time Updates**: Auto-refresh without page reload
6. **Developer Friendly**: Well documented and easy to extend

---

**This architecture ensures:**
- ✅ Reliability (works even if subdomains are down)
- ✅ Performance (optimized requests and caching)
- ✅ Security (multiple layers of protection)
- ✅ Maintainability (clean, modular code)
- ✅ Scalability (easy to add more subdomains/features)
