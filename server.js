/**
 * M2Y.net Landing Page - Express Server
 * Main application entry point
 */

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Import API routes
const apiRoutes = require('./routes/api');
const checkoutRoutes = require('./routes/checkout');
const paymentRoutes = require('./routes/payment');

// ================================
// Configuration
// ================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ================================
// Security Middleware
// ================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://pagead2.googlesyndication.com",
                "https://googleads.g.doubleclick.net",
            ],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: [
                "'self'",
                "https://pagead2.googlesyndication.com",
                "https://googleads.g.doubleclick.net",
            ],
            frameSrc: [
                "'self'",
                "https://googleads.g.doubleclick.net",
                "https://tpc.googlesyndication.com",
                "https://accept.paymob.com", // Paymob iframe
            ],
        },
    },
}));

// ================================
// Rate Limiting
// ================================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 contact form submissions per hour
    message: 'Too many contact form submissions, please try again later.',
});

app.use('/api/', limiter);

// ================================
// General Middleware
// ================================
app.use(compression()); // Compress all responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging

// ================================
// View Engine Setup
// ================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================================
// Static Files
// ================================
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
}));

// ================================
// Routes
// ================================

// API Routes - Subdomain integration stats
app.use('/api', apiRoutes);

// Payment Routes - Checkout & Callbacks
app.use('/', checkoutRoutes);
app.use('/payment', paymentRoutes);

// Home page
app.get('/', (req, res) => {
    res.render('index', {
        title: 'M2Y.net - Engineering & Investment Solutions',
        description: 'Discover M2Y.net\'s comprehensive platform featuring EngiSuite for engineering excellence and Invist for smart investment management.',
        year: 2024,
        engisuite_url: process.env.ENGISUITE_URL || 'https://engisuite.m2y.net',
        invist_url: process.env.INVIST_URL || 'https://invist.m2y.net',
    });
});

// API: Contact form submission
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, email, platform, message } = req.body;

        // Basic validation
        if (!name || !email || !platform || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.',
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.',
            });
        }

        // TODO: Implement email sending logic with nodemailer
        // For now, just log the submission
        console.log('Contact Form Submission:', {
            name,
            email,
            platform,
            message,
            timestamp: new Date().toISOString(),
        });

        res.status(200).json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you soon.',
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again later.',
        });
    }
});

// API: Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        year: 2024,
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).render('error', {
        title: 'Error',
        message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
        error: NODE_ENV === 'development' ? err : {},
        year: 2024,
    });
});

// ================================
// Server Start
// ================================
let server;
if (NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log(`🚀 M2Y.net Landing Page Server`);
        console.log('='.repeat(50));
        console.log(`📍 Environment: ${NODE_ENV}`);
        console.log(`🌐 Server running on: http://localhost:${PORT}`);
        console.log(`📅 Started at: ${new Date().toLocaleString()}`);
        console.log('='.repeat(50));
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    if (server) {
        server.close(() => {
            console.log('HTTP server closed');
        });
    }
});

module.exports = app;
