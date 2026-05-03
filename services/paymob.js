/**
 * Paymob Payment Gateway Service
 * Handles authentication, order creation, and payment key generation
 */

const axios = require('axios');

class PaymobService {
    constructor() {
        this.apiKey = process.env.PAYMOB_API_KEY;
        this.secretKey = process.env.PAYMOB_SECRET_KEY;
        this.integrationIdCard = process.env.CARD_INTEGRATION_ID;
        this.integrationIdWallet = process.env.WALLET_INTEGRATION_ID;
        this.iframeId = process.env.IFRAME_ID;
        this.baseUrl = 'https://accept.paymob.com/api';

        this.authToken = null;
        this.authTokenExpiry = null;
    }

    /**
     * Step 1: Get authentication token from Paymob
     */
    async getAuthToken() {
        if (this.authToken && this.authTokenExpiry && Date.now() < this.authTokenExpiry) {
            return this.authToken;
        }

        try {
            console.log(`[PaymobService] Attempting to authenticate with API key: ${this.apiKey.substring(0, 10)}...`);
            const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
                api_key: this.apiKey
            });

            this.authToken = response.data.token;
            this.authTokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days cache

            console.log('[PaymobService] Authentication successful');
            return this.authToken;
        } catch (error) {
            console.error('[PaymobService] Paymob Auth Error:', error.response?.data || error.message);
            console.error('[PaymobService] API Key used:', this.apiKey.substring(0, 10) + '...' + this.apiKey.substring(this.apiKey.length - 10));
            console.error('[PaymobService] API Key length:', this.apiKey.length);
            throw new Error('Failed to authenticate with Paymob: ' + (error.response?.data?.detail || error.message));
        }
    }

    /**
     * Step 2: Create order in Paymob
     */
    async createOrder(token, { amountCents, currency = 'EGP', items = [] }) {
        try {
            const orderData = {
                auth_token: token,
                delivery_needed: false,
                amount_cents: amountCents,
                currency: currency,
                items: items.length > 0 ? items : [
                    {
                        name: 'Subscription Plan',
                        amount_cents: amountCents,
                        quantity: 1,
                        sku: 'subscription'
                    }
                ]
            };

            const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, orderData);
            return response.data;
        } catch (error) {
            console.error('Paymob Order Creation Error:', error.response?.data || error.message);
            throw new Error('Failed to create order with Paymob');
        }
    }

    /**
     * Step 3: Get payment key for integration
     */
    async getPaymentKey(token, integrationId, orderId, amountCents, currency = 'EGP') {
        try {
            const paymentKeyData = {
                auth_token: token,
                amount_cents: amountCents,
                currency: currency,
                order_id: orderId,
                integration_id: parseInt(integrationId),
                expiration: 3600,
                billing_data: {
                    apartment: "NA",
                    email: "m2y@example.com",
                    floor: "NA",
                    first_name: "Customer",
                    street: "NA",
                    building: "NA",
                    phone_number: "+201234567890",
                    shipping_method: "NA",
                    last_name: "User",
                    city: "Cairo",
                    country: "EG",
                    state: "Cairo",
                    postal_code: "12345",
                    vat: 0
                }
            };

            const response = await axios.post(`${this.baseUrl}/acceptance/payment_keys`, paymentKeyData);
            return response.data;
        } catch (error) {
            console.error('Paymob Payment Key Error:', error.response?.data || error.message);
            throw new Error('Failed to get payment key from Paymob');
        }
    }

    /**
     * Complete 3-step payment initiation
     * @param {Object} params - { amount, plan, source, user_id, payment_type, billing_period }
     */
    async initiatePayment({ amount, plan, source, user_id, payment_type, billing_period = 'monthly' }) {
        const amountCents = Math.round(parseFloat(amount) * 100);
        const integrationId = payment_type === 'card' ? this.integrationIdCard : this.integrationIdWallet;

        // Step 1: Authenticate
        const authToken = await this.getAuthToken();

        // Step 2: Create Order
        const order = await this.createOrder(authToken, {
            amountCents,
            currency: 'EGP',
            items: [
                {
                    name: `${source} - ${plan}`,
                    amount_cents: amountCents,
                    quantity: 1,
                    sku: `${source}-${plan}-${billing_period}`
                }
            ]
        });

        // Step 3: Get Payment Key
        const paymentKeyResponse = await this.getPaymentKey(
            authToken,
            integrationId,
            order.id,
            amountCents,
            'EGP'
        );

        return {
            paymentKey: paymentKeyResponse.payment_key,
            orderId: order.id,
            integrationId,
            amount,
            plan,
            source,
            user_id: user_id,
            payment_type,
            billing_period
        };
    }

    /**
     * Verify webhook HMAC signature
     */
    verifyWebhookHMAC(req) {
        const hmac = req.headers['hmac'];
        if (!hmac) {
            return false;
        }

        const payload = JSON.stringify(req.body);
        const expectedHmac = this.generateHMAC(payload, process.env.PAYMOB_HMAC);
        return hmac === expectedHmac;
    }

    /**
     * Generate HMAC signature
     */
    generateHMAC(data, secret) {
        const crypto = require('crypto');
        return crypto.createHmac('sha256', secret).update(data).digest('hex');
    }
}

module.exports = new PaymobService();
