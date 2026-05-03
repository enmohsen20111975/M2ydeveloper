/**
 * Platform Data Module
 * Fetches and displays real-time data from EngiSuite and Invist platforms
 */

const PlatformData = {
    init() {
        this.fetchPlatformStatus();
        this.fetchPlatformStats();
        this.setupAutoRefresh();
    },

    /**
     * Fetch platform status and display indicators
     */
    async fetchPlatformStatus() {
        try {
            const response = await fetch('/api/platforms/status');
            const data = await response.json();
            
            if (data.success) {
                this.updatePlatformStatus(data.platforms);
            }
        } catch (error) {
            console.error('Failed to fetch platform status:', error);
        }
    },

    /**
     * Update platform status indicators in UI
     */
    updatePlatformStatus(platforms) {
        // Add status indicators to platform cards
        const engisuiteCard = document.querySelector('.platform-card:nth-child(1)');
        const invistCard = document.querySelector('.platform-card:nth-child(2)');
        
        if (engisuiteCard && platforms.engisuite) {
            this.addStatusBadge(engisuiteCard, platforms.engisuite.status);
        }
        
        if (invistCard && platforms.invist) {
            this.addStatusBadge(invistCard, platforms.invist.status);
        }
    },

    /**
     * Add status badge to platform card
     */
    addStatusBadge(card, status) {
        const header = card.querySelector('.platform-header');
        if (!header) return;
        
        // Check if badge already exists
        let badge = header.querySelector('.status-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'status-badge';
            header.appendChild(badge);
        }
        
        const currentLanguage = localStorage.getItem('language') || document.documentElement.getAttribute('lang') || 'en';
        const translations = window.translations?.[currentLanguage] || {};
        const label = status === 'online'
            ? (translations.platform_status_online || 'Online')
            : (translations.platform_status_offline || 'Offline');

        badge.className = `status-badge ${status}`;
        badge.innerHTML = `<i class="fas fa-circle"></i> ${label}`;
    },

    /**
     * Fetch combined statistics from both platforms
     */
    async fetchPlatformStats() {
        try {
            const response = await fetch('/api/platforms/stats');
            const data = await response.json();
            
            if (data.success) {
                this.updatePlatformStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch platform stats:', error);
        }
    },

    /**
     * Update platform statistics in UI
     */
    updatePlatformStats(stats) {
        // Update EngiSuite stats
        if (stats.engisuite) {
            this.updateEngiSuiteStats(stats.engisuite);
        }
        
        // Update Invist stats
        if (stats.invist) {
            this.updateInvistStats(stats.invist);
        }
    },

    /**
     * Update EngiSuite specific stats
     */
    updateEngiSuiteStats(stats) {
        // You can add dynamic stat displays to the EngiSuite card
        console.log('EngiSuite Stats:', stats);
        
        // Example: Add stats to platform card
        const engisuiteCard = document.querySelector('.platform-card:nth-child(1)');
        if (engisuiteCard && stats.activeProjects !== undefined) {
            this.addStatDisplay(engisuiteCard, {
                projects: stats.activeProjects || 0,
                users: stats.totalUsers || 0,
                uptime: stats.uptime || '99.9%',
            });
        }
    },

    /**
     * Update Invist specific stats
     */
    updateInvistStats(stats) {
        console.log('Invist Stats:', stats);
        
        // Example: Add stats to platform card
        const invistCard = document.querySelector('.platform-card:nth-child(2)');
        if (invistCard && stats.portfolios !== undefined) {
            this.addStatDisplay(invistCard, {
                portfolios: stats.portfolios || 0,
                users: stats.activeUsers || 0,
                avgReturn: stats.avgReturn || '0%',
            });
        }
    },

    /**
     * Add stat display to platform card
     */
    addStatDisplay(card, stats) {
        const content = card.querySelector('.platform-content');
        if (!content) return;
        
        // Check if stats display already exists
        let statsDisplay = content.querySelector('.platform-stats-display');
        if (!statsDisplay) {
            statsDisplay = document.createElement('div');
            statsDisplay.className = 'platform-stats-display';
            
            // Insert before platform-cta
            const cta = content.querySelector('.platform-cta');
            if (cta) {
                content.insertBefore(statsDisplay, cta);
            } else {
                content.appendChild(statsDisplay);
            }
        }
        
        // Build stats HTML
        const statsHTML = Object.entries(stats).map(([key, value]) => `
            <div class="stat-item-small">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${this.formatStatLabel(key)}</div>
            </div>
        `).join('');
        
        statsDisplay.innerHTML = `<div class="stats-grid">${statsHTML}</div>`;
    },

    /**
     * Format stat label for display
     */
    formatStatLabel(key) {
        const currentLanguage = localStorage.getItem('language') || document.documentElement.getAttribute('lang') || 'en';
        const translations = window.translations?.[currentLanguage] || {};

        const labels = {
            projects: translations.stats_active_projects || 'Active Projects',
            users: translations.stats_total_users || 'Users',
            uptime: translations.stats_uptime || 'Uptime',
            portfolios: translations.stats_portfolios || 'Portfolios',
            avgReturn: translations.stats_avg_return || 'Avg. Return',
        };
        return labels[key] || key;
    },

    /**
     * Setup auto-refresh for platform data
     */
    setupAutoRefresh() {
        // Refresh platform status every 60 seconds
        setInterval(() => {
            this.fetchPlatformStatus();
        }, 60000);

        // Refresh stats every 5 minutes
        setInterval(() => {
            this.fetchPlatformStats();
        }, 300000);
    },

    /**
     * Fetch EngiSuite specific data
     */
    async fetchEngiSuiteData() {
        try {
            const [stats, projects, features] = await Promise.all([
                fetch('/api/engisuite/stats').then(r => r.json()),
                fetch('/api/engisuite/projects?limit=3').then(r => r.json()),
                fetch('/api/engisuite/features').then(r => r.json()),
            ]);

            return { stats, projects, features };
        } catch (error) {
            console.error('Failed to fetch EngiSuite data:', error);
            return null;
        }
    },

    /**
     * Fetch Invist specific data
     */
    async fetchInvistData() {
        try {
            const [stats, market, performance] = await Promise.all([
                fetch('/api/invist/stats').then(r => r.json()),
                fetch('/api/invist/market').then(r => r.json()),
                fetch('/api/invist/performance').then(r => r.json()),
            ]);

            return { stats, market, performance };
        } catch (error) {
            console.error('Failed to fetch Invist data:', error);
            return null;
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PlatformData.init());
} else {
    PlatformData.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlatformData;
}
