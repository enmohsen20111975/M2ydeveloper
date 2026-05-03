/**
 * API Service for EngiSuite Platform
 * Handles all requests to engisuite.m2y.net
 */

const axios = require('axios');

class EngiSuiteService {
    constructor() {
        this.baseURL = process.env.ENGISUITE_URL || 'https://engisuite.m2y.net';
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
            console.error('EngiSuite Stats Error:', error.message);
            return {
                success: false,
                error: error.message,
                // Fallback data - realistic placeholder values
                data: {
                    activeProjects: 150,
                    totalUsers: 5500,
                    completedTasks: 5400,
                    uptime: '99.9%',
                },
            };
        }
    }

    /**
     * Get recent projects
     */
    async getRecentProjects(limit = 5) {
        try {
            const response = await this.client.get(`/api/projects/recent?limit=${limit}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('EngiSuite Projects Error:', error.message);
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
            console.error('EngiSuite Features Error:', error.message);
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
                console.error('EngiSuite Health Check Error:', fallbackError.message || error.message);
                return {
                    success: false,
                    healthy: false,
                    error: fallbackError.message || error.message,
                };
            }
        }
    }

    /**
     * Subscribe to newsletter
     */
    async subscribe(email) {
        try {
            const response = await this.client.post('/api/subscribe', { email });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('EngiSuite Subscribe Error:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

module.exports = new EngiSuiteService();
