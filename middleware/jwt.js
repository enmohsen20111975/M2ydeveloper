/**
 * JWT Middleware
 * Verifies JWT tokens using SHARED_SECRET
 */

const jwt = require('jsonwebtoken');

const SHARED_SECRET = process.env.SHARED_SECRET;

if (!SHARED_SECRET) {
    console.error('ERROR: SHARED_SECRET is not defined in environment variables');
    throw new Error('SHARED_SECRET is required');
}

/**
 * Verify JWT token from subdomain
 * @param {string} token - JWT token
 * @returns {Object} decoded payload
 */
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, SHARED_SECRET, { algorithms: ['HS256'] });
        return { valid: true, payload: decoded };
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return { valid: false, error: error.message };
    }
}

/**
 * Express middleware to verify JWT
 */
function authMiddleware(req, res, next) {
    const token = req.query.token || req.headers['x-payment-token'];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Missing payment token'
        });
    }

    const result = verifyToken(token);

    if (!result.valid) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }

    req.paymentData = result.payload;
    next();
}

module.exports = {
    verifyToken,
    authMiddleware
};
