/**
 * Checkout Route
 * GET /checkout?token=JWT
 * Renders Paymob iframe payment page
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/jwt');
const paymobService = require('../services/paymob');
const pendingPayments = require('../services/pendingPayments');

/**
 * GET /checkout
 * Initiates payment and renders iframe page
 */
router.get('/checkout', authMiddleware, async (req, res) => {
    try {
        const { plan, source, user_id, payment_type, return_success, return_fail, billing_period } = req.paymentData;

        console.log(`[Checkout] Initiating payment for source=${source}, plan=${plan}, user=${user_id}, billing=${billing_period}`);
        console.log('[Checkout] Environment variables:', {
            IFRAME_ID: process.env.IFRAME_ID ? 'SET' : 'NOT SET',
            CARD_INTEGRATION_ID: process.env.CARD_INTEGRATION_ID ? 'SET' : 'NOT SET',
            PAYMOB_API_KEY: process.env.PAYMOB_API_KEY ? 'SET' : 'NOT SET',
            PAYMOB_SECRET_KEY: process.env.PAYMOB_SECRET_KEY ? 'SET' : 'NOT SET'
        });

        // Step 1: Initiate payment with Paymob (get payment key)
        console.log('[Checkout] Calling paymobService.initiatePayment...');
        const paymentResponse = await paymobService.initiatePayment({
            amount: req.paymentData.amount || getPlanAmount(plan), // fallback if amount not in token
            plan,
            source,
            user_id,
            payment_type,
            billing_period: billing_period || 'monthly',
        });

        console.log('[Checkout] Payment response received:', {
            paymentKey: paymentResponse.paymentKey ? 'PRESENT' : 'MISSING',
            orderId: paymentResponse.orderId,
            amount: paymentResponse.amount
        });

        // Step 2: Save pending payment for result callback
        console.log('[Checkout] Creating pending payment entry...');
        await pendingPayments.create(paymentResponse.orderId, {
            return_success,
            return_fail,
            source,
            plan,
            user_id,
            amount: paymentResponse.amount,
            payment_type,
            billing_period: billing_period || 'monthly',
            paymobOrderId: paymentResponse.orderId
        });

        // Step 3: Build iframe URL
        console.log('[Checkout] Building iframe URL...');
        const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.IFRAME_ID}?payment_token=${paymentResponse.paymentKey}`;
        console.log('[Checkout] Iframe URL:', iframeUrl);

        // Step 4: Render payment page with iframe
        console.log('[Checkout] Rendering checkout page...');
        res.render('checkout', {
            title: 'Payment Gateway - M2Y.net',
            iframeUrl,
            plan,
            source,
            amount: paymentResponse.amount,
            currency: 'EGP'
        });

    } catch (error) {
        console.error('[Checkout] Error:', error);
        console.error('[Checkout] Error stack:', error.stack);
        res.status(500).render('error', {
            title: 'Payment Error',
            message: 'Failed to initialize payment. Please try again.',
            error: { message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }
        });
    }
});

/**
 * Helper: Get plan amount from local mapping (fallback)
 * In production, amount should come from JWT
 */
function getPlanAmount(plan) {
    const planPrices = {
        'engsuite-basic': 99,
        'engsuite-pro': 199,
        'engsuite-enterprise': 399,
        'invist-basic': 299,
        'invist-pro': 149,
        // Add other plans
    };
    return planPrices[plan] || 100;
}

module.exports = router;
