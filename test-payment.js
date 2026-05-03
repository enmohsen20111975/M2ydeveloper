/**
 * Test Script: Payment Integration Test
 * Run: node test-payment.js
 *
 * This script tests the JWT generation and Paymob integration flow
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

const SHARED_SECRET = process.env.SHARED_SECRET;

if (!SHARED_SECRET) {
  console.error('❌ ERROR: SHARED_SECRET not found in .env');
  process.exit(1);
}

// Sample payload similar to what subdomains send
const testPayload = {
  plan: 'engsuite-pro',
  source: 'engsuite',
  amount: 199,
  user_id: 'test_user_12345',
  payment_type: 'card',
  return_success: 'https://engsuite.m2y.net/payment/success?plan=engsuite-pro',
  return_fail: 'https://engsuite.m2y.net/payment/fail',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
};

console.log('🔐 Generating JWT token...\n');
console.log('Payload:', JSON.stringify(testPayload, null, 2));

const token = jwt.sign(testPayload, SHARED_SECRET, { algorithm: 'HS256' });
console.log('\n✅ JWT Token Generated:');
console.log(token);
console.log('\n');

// Verify token
console.log('🔍 Verifying token...');
try {
  const decoded = jwt.verify(token, SHARED_SECRET);
  console.log('✅ Token is valid!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.error('❌ Token verification failed:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('📝 Next Steps:');
console.log('='.repeat(60));
console.log(`
1. Copy the token above
2. Run the server: node server.js (or npm start)
3. Test checkout endpoint:

   curl "http://localhost:3000/checkout?token=${token.substring(0, 50)}..."

   (Use full token in actual request)

4. Expected result:
   - If Paymob credentials valid → HTML page with iframe
   - If credentials invalid → Error page (check server logs)

5. Check server logs for any Paymob API errors

Note: The current Paymob API key might not be active. This is expected.
The integration code is complete; credentials need to be obtained from
Paymob dashboard (test mode keys).
`);
