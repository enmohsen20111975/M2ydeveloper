require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.PAYMOB_API_KEY;
console.log('API Key from env:', apiKey);

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