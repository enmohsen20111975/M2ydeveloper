require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.PAYMOB_API_KEY;
console.log('Using API key:', apiKey.substring(0, 20) + '...' + apiKey.substring(apiKey.length - 20));
console.log('API key length:', apiKey.length);

// Check if it looks like a JWT (has two dots)
const parts = apiKey.split('.');
console.log('Number of parts:', parts.length);
if (parts.length === 3) {
  console('This looks like a JWT token, not a raw API key');
  
  // Try to decode it
  try {
    const decoded = require('jsonwebtoken').decode(apiKey, {complete: true});
    console.log('Decoded JWT:', JSON.stringify(decoded, null, 2));
  } catch (e) {
    console.log('Error decoding JWT:', e.message);
  }
}

const baseUrl = 'https://accept.paymob.com/api';

async function testAuth() {
    try {
        console.log('Attempting to authenticate with Paymob...');
        const response = await axios.post(`${baseUrl}/auth/tokens`, {
            api_key: apiKey
        });
        
        console.log('Authentication successful!');
        console.log('Response:', response.data);
        return response.data.token;
    } catch (error) {
        console.error('Authentication failed:');
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        throw error;
    }
}

testAuth().catch(console.error);