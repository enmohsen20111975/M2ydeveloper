/**
 * API Service for Invist Platform
 * Handles all requests to invist.m2y.net
 */

const axios = require('axios');

class InvistService {
    constructor() {
        this.baseURL = process.env.INVIST_URL || 'https://invist.m2y.net';
        this.timeout = 10000; // 10 seconds
        
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Get platform statistics
     */
    async getStats() {
        try {
            const response = await this.client.get('/api/stats');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Invist Stats Error:', error.message);
            return {
                success: false,
                error: error.message,
                // Fallback data - realistic placeholder values
                data: {
                    portfolios: 890,
                    totalInvestments: 45000000,
                    activeUsers: 4500,
                    avgReturn: '12.5%',
                },
            };
        }
    }

    /**
     * Get market data
     */
    async getMarketData() {
        try {
            const response = await this.client.get('/api/market/summary');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Invist Market Data Error:', error.message);
            return {
                success: false,
                error: error.message,
                data: {},
            };
        }
    }

    /**
     * Get recent trades
     */
    async getRecentTrades(limit = 10) {
        try {
            const response = await this.client.get(`/api/trades/recent?limit=${limit}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Invist Recent Trades Error:', error.message);
            return {
                success: false,
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Get platform features
     */
    async getFeatures() {
        try {
            const response = await this.client.get('/api/features');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Invist Features Error:', error.message);
            return {
                success: false,
                error: error.message,
                data: [],
            };
        }
    }

    /**
     * Check platform health
     */
    async checkHealth() {
        try {
            const response = await this.client.get('/api/health');
            return {
                success: true,
                healthy: true,
                data: response.data,
            };
        } catch (error) {
            try {
                const fallbackResponse = await this.client.get('/');
                return {
                    success: true,
                    healthy: fallbackResponse.status >= 200 && fallbackResponse.status < 400,
                    data: {
                        source: 'root',
                        status: fallbackResponse.status,
                    },
                };
            } catch (fallbackError) {
                console.error('Invist Health Check Error:', fallbackError.message || error.message);
                return {
                    success: false,
                    healthy: false,
                    error: fallbackError.message || error.message,
                };
            }
        }
    }

    /**
     * Get portfolio performance
     */
    async getPerformance(period = '30d') {
        try {
            const response = await this.client.get(`/api/performance?period=${period}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Invist Performance Error:', error.message);
            return {
                success: false,
                error: error.message,
                data: {},
            };
        }
    }
}

module.exports = new InvistService();
