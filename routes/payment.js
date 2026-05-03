/**
 * Payment Result & Webhook Routes
 * Handles Paymob callbacks and redirects
 */

const express = require('express');
const router = express.Router();
const paymobService = require('../services/paymob');
const pendingPayments = require('../services/pendingPayments');

/**
 * GET /payment/result
 * Paymob redirects user here after payment attempt
 * Query params: ?success=true&mid=ORDER_ID
 */
router.get('/payment/result', async (req, res) => {
    const { success, mid } = req.query;

    console.log(`[PaymentResult] Received: success=${success}, mid=${mid}`);

    if (!mid) {
        return res.status(400).render('error', {
            title: 'Invalid Request',
            message: 'Missing payment reference ID',
            error: null
        });
    }

    try {
        // Retrieve pending payment data
        const paymentData = await pendingPayments.get(mid);

        if (!paymentData) {
            console.warn(`[PaymentResult] No pending payment found for mid: ${mid}`);
            return res.status(404).render('error', {
                title: 'Payment Not Found',
                message: 'Payment session expired or invalid. Please try again.',
                error: null
            });
        }

        // Determine redirect URL
        let redirectUrl = success === 'true' || success === true
            ? paymentData.return_success
            : paymentData.return_fail;

        // Append billing_period as query param if available
        if (paymentData.billing_period) {
            const separator = redirectUrl.includes('?') ? '&' : '?';
            redirectUrl = `${redirectUrl}${separator}billing_period=${paymentData.billing_period}`;
        }

        // Cleanup: delete pending payment
        await pendingPayments.delete(mid);

        console.log(`[PaymentResult] Redirecting to: ${redirectUrl} (success=${success})`);

        // Redirect to subdomain
        res.redirect(302, redirectUrl);

    } catch (error) {
        console.error('[PaymentResult] Error:', error.message);
        res.status(500).render('error', {
            title: 'Payment Error',
            message: 'An error occurred processing your payment. Please try again.',
            error: { message: error.message }
        });
    }
});

/**
 * POST /api/paymob_card/processed
 * Paymob immediate notification when transaction is being processed
 */
router.post('/api/paymob_card/processed', async (req, res) => {
    console.log('[Webhook] Card processed notification received:', req.body);
    res.status(200).json({ received: true });
});

/**
 * POST /api/paymob_card/response
 * Paymob final response webhook (with HMAC verification)
 */
router.post('/api/paymob_card/response', async (req, res) => {
    try {
        // Verify HMAC signature
        const isValid = paymobService.verifyWebhookHMAC(req);
        if (!isValid) {
            console.error('[Webhook] Invalid HMAC signature for card response');
            return res.status(403).json({ error: 'Invalid signature' });
        }

        const { obj } = req.body; // Paymob sends { obj: { ... } }
        console.log('[Webhook] Card response received:', JSON.stringify(obj).substring(0, 200));

        // Process the payment confirmation
        // TODO: Update subscription status in database
        // The subdomain will handle this in their success page
        // But we can also trigger API calls to subdomain if needed

        res.status(200).json({ received: true, processed: false });
    } catch (error) {
        console.error('[Webhook] Card response error:', error.message);
        res.status(500).json({ error: 'Processing failed' });
    }
});

/**
 * POST /api/paymob_poket/processed
 * Wallet processed notification
 */
router.post('/api/paymob_poket/processed', async (req, res) => {
    console.log('[Webhook] Wallet processed notification received:', req.body);
    res.status(200).json({ received: true });
});

/**
 * POST /api/paymob_poket/response
 * Wallet final response webhook (with HMAC verification)
 */
router.post('/api/paymob_poket/response', async (req, res) => {
    try {
        // Verify HMAC signature
        const isValid = paymobService.verifyWebhookHMAC(req);
        if (!isValid) {
            console.error('[Webhook] Invalid HMAC signature for wallet response');
            return res.status(403).json({ error: 'Invalid signature' });
        }

        const { obj } = req.body;
        console.log('[Webhook] Wallet response received:', JSON.stringify(obj).substring(0, 200));

        // Process the payment confirmation
        res.status(200).json({ received: true, processed: false });
    } catch (error) {
        console.error('[Webhook] Wallet response error:', error.message);
        res.status(500).json({ error: 'Processing failed' });
    }
});

module.exports = router;
