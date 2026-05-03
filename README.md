# M2Y.net Landing Page

<div align="center">

![M2Y.net](https://img.shields.io/badge/M2Y.net-Landing%20Page-6366f1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, SEO-optimized landing page for M2Y.net's Engineering & Investment platforms**

[Live Demo](#) • [EngiSuite](https://engisuite.m2y.net) • [Invist](https://invist.m2y.net)

</div>

---

## 🚀 Overview

M2Y.net is a comprehensive platform featuring two powerful subdomains:
- **EngiSuite** (`engisuite.m2y.net`) - Engineering Excellence Platform for project management and collaboration
- **Invist** (`invist.m2y.net`) - Smart Investment Management Platform for portfolio management

This landing page serves as the main gateway, providing a modern, engaging, and performant experience to showcase both platforms.

## ✨ Features

### 🎨 **Modern Design**
- Beautiful gradient backgrounds with animated shapes
- Smooth scroll animations and transitions
- Fully responsive design (mobile, tablet, desktop)
- Theme switching (Light/Dark mode) with persistent preferences
- Multi-language support (English, Arabic, French)
- RTL (Right-to-Left) support for Arabic
- Dark footer with elegant typography
- Professional color scheme with purple/blue gradients

### ⚡ **Performance Optimized**
- Server-side rendering with EJS templates
- Gzip compression enabled
- Lazy loading for images
- Optimized asset delivery
- Performance monitoring built-in

### 🔒 **Security First**
- Helmet.js for security headers
- Rate limiting on API endpoints
- CSRF protection ready
- Environment variable configuration
- Input validation and sanitization

### 📈 **SEO Optimized**
- Semantic HTML5 structure
- Complete meta tags (Open Graph, Twitter Cards)
- Schema.org structured data
- Canonical URLs
- XML sitemap ready
- Fast loading times

### 📧 **Contact Form**
- AJAX form submission
- Rate limiting (5 submissions/hour)
- Email validation
- Success/error notifications
- Easy integration with email services

### 🎯 **User Experience**
- Animated statistics counter
- Smooth scroll navigation
- Back-to-top button
- Mobile-friendly hamburger menu
- Interactive hover effects
- Accessible (ARIA labels)

## 🛠️ Technology Stack

- **Backend:** Node.js + Express.js
- **Template Engine:** EJS
- **Styling:** Custom CSS3 with animations
- **JavaScript:** Vanilla ES6+ (modular architecture)
- **Security:** Helmet, express-rate-limit
- **Performance:** Compression, Morgan logging

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)

## 🚦 Quick Start

### 1. Clone or Navigate to the Project

```bash
cd "d:\My WebStie Applications\Mywebsite applications final\m2y.net landingpage"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000

# Platform URLs
ENGISUITE_URL=https://engisuite.m2y.net
INVIST_URL=https://invist.m2y.net

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=info@m2y.net
```

### 4. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 5. Open in Browser

Navigate to: **http://localhost:3000**

## 📁 Project Structure

```
m2y.net landingpage/
├── public/                    # Static assets
│   ├── css/
│   │   ├── styles.css        # Main stylesheet
│   │   └── form-message.css  # Form notification styles
│   └── js/
│       └── main.js           # Client-side JavaScript
├── views/                     # EJS templates
│   ├── partials/             # Reusable components
│   │   ├── navbar.ejs
│   │   ├── hero.ejs
│   │   ├── about.ejs
│   │   ├── platforms.ejs
│   │   ├── features.ejs
│   │   ├── cta.ejs
│   │   ├── contact.ejs
│   │   └── footer.ejs
│   ├── index.ejs             # Main landing page
│   ├── 404.ejs               # 404 error page
│   └── error.ejs             # General error page
├── server.js                  # Express server configuration
├── package.json              # Project dependencies
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🎨 Customization Guide

### Changing Colors

Edit the CSS variables in `public/css/styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    --secondary-color: #10b981;
    /* ... other colors */
}
```

### Updating Content

1. **Hero Section:** Edit `views/partials/hero.ejs`
2. **Platform Details:** Edit `views/partials/platforms.ejs`
3. **Features:** Edit `views/partials/features.ejs`
4. **Contact Info:** Edit `views/partials/contact.ejs`

### Adding New Sections

1. Create a new partial in `views/partials/`
2. Include it in `views/index.ejs`:
   ```ejs
   <%- include('partials/your-section') %>
   ```

## 📧 Setting Up Email (Contact Form)

### Using Gmail

1. Enable 2-factor authentication in your Gmail account
2. Generate an App Password (Security → App passwords)
3. Update your `.env` file:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-digit-app-password
   CONTACT_EMAIL=info@m2y.net
   ```

### Uncomment Email Code in `server.js`

Find the contact form handler and uncomment the nodemailer section.

## 🚀 Deployment

### Deploying to Production

1. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   PORT=80
   ```

2. **Build and Optimize:**
   ```bash
   npm install --production
   ```

3. **Use Process Manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "m2y-landing"
   pm2 startup
   pm2 save
   ```

### Deployment Platforms

#### **Heroku**
```bash
heroku create m2y-landing-page
git push heroku main
```

#### **DigitalOcean/VPS**
```bash
# Upload files via SFTP or Git
# Install Node.js and npm
npm install --production
pm2 start server.js
```

#### **Vercel/Netlify**
These platforms can host the static version. For full Express functionality, use platforms that support Node.js.

## 🔧 API Endpoints

### `GET /`
Main landing page

### `POST /api/contact`
Submit contact form
- **Rate Limit:** 5 requests/hour per IP
- **Body:** `{ name, email, platform, message }`
- **Response:** `{ success: boolean, message: string }`

### `GET /api/health`
Health check endpoint
- **Response:** `{ success: true, timestamp, uptime, environment }`

## 🧪 Testing

### Manual Testing Checklist

- [ ] All navigation links work
- [ ] Forms submit successfully
- [ ] Mobile menu opens/closes
- [ ] Animations play smoothly
- [ ] Images load properly
- [ ] Contact form validates inputs
- [ ] Error pages display correctly
- [ ] Back-to-top button appears on scroll

### Performance Testing

Use Lighthouse in Chrome DevTools:
```bash
# Aim for these scores:
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 100
```

## 📊 Analytics Integration

Add Google Analytics to `views/index.ejs`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000
```

### Dependencies Installation Issues
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### CSS Not Loading
- Check file paths in `views/index.ejs`
- Ensure `public` folder is properly served
- Clear browser cache

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- **M2ydevelopers** - Development Team
- **Contact:** +20 128 764 4099, +2 887 991 6040

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

- **Email:** info@m2y.net
- **Phone:** +20 128 764 4099, +2 887 991 6040
- **Developer:** M2ydevelopers
- **Website:** https://m2y.net
- **EngiSuite:** https://engisuite.m2y.net (5,500+ users)
- **Invist:** https://invist.m2y.net (4,500+ users)

## 🎯 Roadmap

- [ ] Add multi-language support (i18n)
- [ ] Integrate blog section
- [ ] Add testimonials slider
- [ ] Create pricing page
- [ ] Add video background option
- [ ] Implement dark mode toggle
- [ ] Add newsletter subscription
- [ ] Create admin dashboard

---

<div align="center">

**Built with ❤️ by M2Y.net Team**

⭐️ Star this repository if you found it helpful!

</div>
#   m 2 y _ h o m e  
 