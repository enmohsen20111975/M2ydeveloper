/**
 * API Routes for Subdomain Integration
 * Connects to EngiSuite and Invist platforms
 */

const express = require('express');
const router = express.Router();
const engisuiteService = require('../services/engisuiteService');
const invistService = require('../services/invistService');

// ================================
// EngiSuite Routes
// ================================

/**
 * GET /api/engisuite/stats
 * Get EngiSuite platform statistics
 */
router.get('/engisuite/stats', async (req, res) => {
    try {
        const stats = await engisuiteService.getStats();
        res.json(stats);
    } catch (error) {
        console.error('EngiSuite stats endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch EngiSuite statistics',
            error: error.message,
        });
    }
});

/**
 * GET /api/engisuite/projects
 * Get recent EngiSuite projects
 */
router.get('/engisuite/projects', async (req, res) => {
    try {
        const limit = req.query.limit || 5;
        const projects = await engisuiteService.getRecentProjects(limit);
        res.json(projects);
    } catch (error) {
        console.error('EngiSuite projects endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch EngiSuite projects',
            error: error.message,
        });
    }
});

/**
 * GET /api/engisuite/features
 * Get EngiSuite features
 */
router.get('/engisuite/features', async (req, res) => {
    try {
        const features = await engisuiteService.getFeatures();
        res.json(features);
    } catch (error) {
        console.error('EngiSuite features endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch EngiSuite features',
            error: error.message,
        });
    }
});

/**
 * GET /api/engisuite/health
 * Check EngiSuite platform health
 */
router.get('/engisuite/health', async (req, res) => {
    try {
        const health = await engisuiteService.checkHealth();
        res.json(health);
    } catch (error) {
        console.error('EngiSuite health endpoint error:', error);
        res.status(500).json({
            success: false,
            healthy: false,
            message: 'Failed to check EngiSuite health',
            error: error.message,
        });
    }
});

// ================================
// Invist Routes
// ================================

/**
 * GET /api/invist/stats
 * Get Invist platform statistics
 */
router.get('/invist/stats', async (req, res) => {
    try {
        const stats = await invistService.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Invist stats endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Invist statistics',
            error: error.message,
        });
    }
});

/**
 * GET /api/invist/market
 * Get market data from Invist
 */
router.get('/invist/market', async (req, res) => {
    try {
        const marketData = await invistService.getMarketData();
        res.json(marketData);
    } catch (error) {
        console.error('Invist market endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch market data',
            error: error.message,
        });
    }
});

/**
 * GET /api/invist/trades
 * Get recent trades from Invist
 */
router.get('/invist/trades', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const trades = await invistService.getRecentTrades(limit);
        res.json(trades);
    } catch (error) {
        console.error('Invist trades endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent trades',
            error: error.message,
        });
    }
});

/**
 * GET /api/invist/performance
 * Get portfolio performance data
 */
router.get('/invist/performance', async (req, res) => {
    try {
        const period = req.query.period || '30d';
        const performance = await invistService.getPerformance(period);
        res.json(performance);
    } catch (error) {
        console.error('Invist performance endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance data',
            error: error.message,
        });
    }
});

/**
 * GET /api/invist/health
 * Check Invist platform health
 */
router.get('/invist/health', async (req, res) => {
    try {
        const health = await invistService.checkHealth();
        res.json(health);
    } catch (error) {
        console.error('Invist health endpoint error:', error);
        res.status(500).json({
            success: false,
            healthy: false,
            message: 'Failed to check Invist health',
            error: error.message,
        });
    }
});

// ================================
// Combined Routes
// ================================

/**
 * GET /api/platforms/status
 * Get status of both platforms
 */
router.get('/platforms/status', async (req, res) => {
    try {
        const [engisuiteHealth, invistHealth] = await Promise.all([
            engisuiteService.checkHealth(),
            invistService.checkHealth(),
        ]);

        res.json({
            success: true,
            platforms: {
                engisuite: {
                    name: 'EngiSuite',
                    status: engisuiteHealth.healthy ? 'online' : 'offline',
                    url: process.env.ENGISUITE_URL,
                    ...engisuiteHealth,
                },
                invist: {
                    name: 'Invist',
                    status: invistHealth.healthy ? 'online' : 'offline',
                    url: process.env.INVIST_URL,
                    ...invistHealth,
                },
            },
        });
    } catch (error) {
        console.error('Platform status endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform status',
            error: error.message,
        });
    }
});

/**
 * GET /api/platforms/stats
 * Get combined statistics from both platforms
 */
router.get('/platforms/stats', async (req, res) => {
    try {
        const [engisuiteStats, invistStats] = await Promise.all([
            engisuiteService.getStats(),
            invistService.getStats(),
        ]);

        res.json({
            success: true,
            data: {
                engisuite: engisuiteStats.data,
                invist: invistStats.data,
            },
        });
    } catch (error) {
        console.error('Platform stats endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform statistics',
            error: error.message,
        });
    }
});

module.exports = router;
