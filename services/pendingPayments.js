/**
 * In-Memory Pending Payments Store
 * Stores payment sessions before Paymob redirects back
 * Redis-ready implementation (swap to Redis in production)
 */

class PendingPaymentsStore {
    constructor() {
        this.payments = new Map(); // Use native JavaScript Map
        this.ttl = 60 * 60 * 1000; // 1 hour in milliseconds
        // In production, replace with Redis
        // this.redis = require('redis');
    }

    /**
     * Create a new pending payment entry
     * @param {string} orderId - Paymob order ID
     * @param {Object} data - { return_success, return_fail, source, plan, user_id, amount, payment_type, billing_period }
     */
    async create(orderId, data) {
        const entry = {
            orderId,
            return_success: data.return_success,
            return_fail: data.return_fail,
            source: data.source,
            plan: data.plan,
            user_id: data.user_id,
            amount: data.amount,
            payment_type: data.payment_type,
            billing_period: data.billing_period || 'monthly',
            created_at: Date.now()
        };

        this.payments.set(orderId, entry);

        // Auto-cleanup after 1 hour
        setTimeout(() => {
            this.payments.delete(orderId);
        }, this.ttl);

        console.log(`[PendingPayments] Created entry for orderId: ${orderId} (source: ${data.source}, billing: ${data.billing_period})`);
    }

    /**
     * Retrieve payment data by Paymob merchant order ID (mid)
     * @param {string} merchantOrderId - Paymob merchant_order_id
     */
    async get(merchantOrderId) {
        const entry = this.payments.get(merchantOrderId);

        if (!entry) {
            console.warn(`[PendingPayments] No entry found for merchantOrderId: ${merchantOrderId}`);
            return null;
        }

        // Check if expired
        if (Date.now() - entry.created_at > this.ttl) {
            this.payments.delete(merchantOrderId);
            console.warn(`[PendingPayments] Entry expired for merchantOrderId: ${merchantOrderId}`);
            return null;
        }

        return entry;
    }

    /**
     * Delete processed payment
     * @param {string} merchantOrderId 
     */
    async delete(merchantOrderId) {
        this.payments.delete(merchantOrderId);
        console.log(`[PendingPayments] Deleted entry for merchantOrderId: ${merchantOrderId}`);
    }

    /**
     * Debug: Get all pending payments count
     */
    getCount() {
        return this.payments.size;
    }
}

module.exports = new PendingPaymentsStore();
