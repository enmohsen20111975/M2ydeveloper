/**
 * Test Integration Script
 * Tests connectivity to EngiSuite and Invist subdomains
 */

require('dotenv').config();
const engisuiteService = require('./services/engisuiteService');
const invistService = require('./services/invistService');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEngiSuite() {
    log('\n========================================', 'cyan');
    log('Testing EngiSuite Integration', 'cyan');
    log('========================================', 'cyan');
    
    try {
        // Test health check
        log('\n🔍 Testing Health Check...', 'yellow');
        const health = await engisuiteService.checkHealth();
        if (health.healthy) {
            log('✅ EngiSuite is online and healthy', 'green');
        } else {
            log('⚠️  EngiSuite health check failed', 'red');
        }
        
        // Test stats
        log('\n📊 Testing Statistics Endpoint...', 'yellow');
        const stats = await engisuiteService.getStats();
        if (stats.success) {
            log('✅ Stats retrieved successfully', 'green');
            console.log('   Data:', stats.data);
        } else {
            log('⚠️  Stats retrieval failed (using fallback)', 'yellow');
        }
        
        // Test projects
        log('\n📁 Testing Projects Endpoint...', 'yellow');
        const projects = await engisuiteService.getRecentProjects(3);
        if (projects.success) {
            log('✅ Projects retrieved successfully', 'green');
            console.log('   Projects count:', projects.data.length || 0);
        } else {
            log('⚠️  Projects retrieval failed', 'yellow');
        }
        
    } catch (error) {
        log(`\n❌ EngiSuite test failed: ${error.message}`, 'red');
    }
}

async function testInvist() {
    log('\n========================================', 'cyan');
    log('Testing Invist Integration', 'cyan');
    log('========================================', 'cyan');
    
    try {
        // Test health check
        log('\n🔍 Testing Health Check...', 'yellow');
        const health = await invistService.checkHealth();
        if (health.healthy) {
            log('✅ Invist is online and healthy', 'green');
        } else {
            log('⚠️  Invist health check failed', 'red');
        }
        
        // Test stats
        log('\n📊 Testing Statistics Endpoint...', 'yellow');
        const stats = await invistService.getStats();
        if (stats.success) {
            log('✅ Stats retrieved successfully', 'green');
            console.log('   Data:', stats.data);
        } else {
            log('⚠️  Stats retrieval failed (using fallback)', 'yellow');
        }
        
        // Test market data
        log('\n💹 Testing Market Data Endpoint...', 'yellow');
        const market = await invistService.getMarketData();
        if (market.success) {
            log('✅ Market data retrieved successfully', 'green');
        } else {
            log('⚠️  Market data retrieval failed', 'yellow');
        }
        
        // Test performance
        log('\n📈 Testing Performance Endpoint...', 'yellow');
        const performance = await invistService.getPerformance('30d');
        if (performance.success) {
            log('✅ Performance data retrieved successfully', 'green');
        } else {
            log('⚠️  Performance data retrieval failed', 'yellow');
        }
        
    } catch (error) {
        log(`\n❌ Invist test failed: ${error.message}`, 'red');
    }
}

async function runTests() {
    log('\n🚀 Starting Subdomain Integration Tests...', 'cyan');
    log(`\n📍 EngiSuite URL: ${process.env.ENGISUITE_URL || 'Not configured'}`, 'cyan');
    log(`📍 Invist URL: ${process.env.INVIST_URL || 'Not configured'}`, 'cyan');
    
    await testEngiSuite();
    await testInvist();
    
    log('\n========================================', 'cyan');
    log('✨ Tests Complete!', 'green');
    log('========================================\n', 'cyan');
    
    log('📝 Note: If subdomains are not yet deployed, you will see fallback data.', 'yellow');
    log('   This is expected behavior and the landing page will work correctly.\n', 'yellow');
}

// Run tests
runTests().catch(error => {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
});
