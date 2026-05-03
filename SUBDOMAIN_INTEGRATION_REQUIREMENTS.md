# 🔗 متطلبات ربط التطبيقات الفرعية بنظام الدفع المركزي

## 📋 ملخص سريع

لديك three applications:
- **m2y.net** (Express.js) ← **Payment Gateway مركزي** (تم بناؤه)
- **engsuite.m2y.net** (Next.js) ← يحتاج تعديل
- **invist.m2y.net** (Next.js) ← يحتاج تعديل

الهدف: عندما يضغط المستخدم "اشتراك" في subdomain، يمر بـ m2y.net للدفع، ثم يعود إلى subdomain.

---

## ✅ ما تم بناؤه في m2y.net

### Files Created:
```
m2y.net/
├── services/
│   ├── paymob.js                    ← Paymob API (Auth → Order → Payment Key)
│   └── pendingPayments.js           ← In-memory store (قابل للترقية لـ Redis)
├── middleware/
│   └── jwt.js                       ← JWT verification
├── routes/
│   ├── checkout.js                  ← GET /checkout
│   └── payment.js                   ← GET /payment/result + 4 webhooks
├── views/
│   └── checkout.ejs                 ← صفحة الدفع مع iframe
├── .env                             ← Paymob keys + SHARED_SECRET
└── server.js                        ← تم تحديثه
```

### Endpoints المتاحة في m2y.net:

| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/checkout?token=JWT` | GET | يقبل JWT من subdomain، ينشئ payment في Paymob، يعرض iframe |
| `/payment/result?success=true&mid=XXX` | GET | Paymob يرجع在这里، يوجه المستخدم لـ return_success/return_fail |
| `/api/paymob_card/processed` | POST | Webhook: إشعار أولي للكارت |
| `/api/paymob_card/response` | POST | Webhook: إشعار نهائي للكارت (مع HMAC verify) |
| `/api/paymob_poket/processed` | POST | Webhook: إشعار أولي للمحفظة |
| `/api/paymob_poket/response` | POST | Webhook: إشعار نهائي للمحفظة (مع HMAC verify) |

---

## 🔐 SHARED_SECRET (الأهم)

هذه القيمة **يجب أن تكون نفسها** في الـ 3 تطبيقات:

```
K4l3m3tL1c2h4a5n6g7e8f9i0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2
```

📌 **يجب إضافتها إلى `.env.local` في كل من engsuite.m2y.net و invist.m2y.net**

---

## 📦 متطلبات engsuite.m2y.net

### 1. Install JSONWebToken
```bash
npm install jsonwebtoken
```

### 2. Create `lib/plans.js`
```javascript
/**
 * EngiSuite Subscription Plans
 * Prices in EGP
 */
export const PLANS = {
  'engsuite-basic': {
    id: 'engsuite-basic',
    name: 'الأساسي',
    description: 'For small teams getting started',
    price: 99,
    currency: 'EGP',
    features: [
      'Up to 5 users',
      'Basic support',
      '10 projects',
      '1GB storage'
    ]
  },
  'engsuite-pro': {
    id: 'engsuite-pro',
    name: 'الاحترافي',
    description: 'For growing teams',
    price: 199,
    currency: 'EGP',
    features: [
      'Up to 20 users',
      'Priority support',
      'Unlimited projects',
      '10GB storage',
      'Advanced analytics'
    ]
  },
  'engsuite-enterprise': {
    id: 'engsuite-enterprise',
    name: 'المؤسسي',
    description: 'For large organizations',
    price: 399,
    currency: 'EGP',
    features: [
      'Unlimited users',
      '24/7 dedicated support',
      'Unlimited everything',
      'Custom integrations',
      'Dedicated account manager'
    ]
  }
};

/**
 * Get plan by ID
 */
export function getPlan(planId) {
  return PLANS[planId];
}

/**
 * Get all plans
 */
export function getAllPlans() {
  return Object.values(PLANS);
}
```

### 3. Create `lib/payment.js` (JWT Generator)
```javascript
import jwt from 'jsonwebtoken';
import { getPlan } from './plans';

const SHARED_SECRET = process.env.SHARED_SECRET;

if (!SHARED_SECRET) {
  throw new Error('SHARED_SECRET is required in .env.local');
}

/**
 * Generate payment token for Paymob via m2y.net
 * @param {Object} params
 * @param {string} params.plan - Plan ID (e.g., 'engsuite-basic')
 * @param {string} params.user_id - User identifier
 * @param {string} params.payment_type - 'card' or 'wallet'
 * @returns {string} JWT token
 */
export function generatePaymentToken({ plan, user_id, payment_type }) {
  const planData = getPlan(plan);

  if (!planData) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const payload = {
    plan: planData.id,           // Plan identifier
    source: 'engsuite',          // App identifier (IMPORTANT)
    amount: planData.price,      // Amount in EGP
    currency: planData.currency,
    user_id,                     // Your user ID
    payment_type,                // 'card' or 'wallet'
    return_success: `https://engsuite.m2y.net/payment/success?plan=${planData.id}`,
    return_fail: `https://engsuite.m2y.net/payment/fail`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes expiry
  };

  return jwt.sign(payload, SHARED_SECRET, { algorithm: 'HS256' });
}

/**
 * Verify payment token (optional, for debugging)
 */
export function verifyPaymentToken(token) {
  try {
    return jwt.verify(token, SHARED_SECRET);
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

### 4. Create API Route: `pages/api/subscribe/[plan].js`
```javascript
import { generatePaymentToken } from '../../../lib/payment';
import { getPlan } from '../../../lib/plans';

export default function handler(req, res) {
  const { plan } = req.query;  // URL param: /api/subscribe/engsuite-pro
  const { type } = req.query;  // Query param: ?type=card or ?type=wallet

  // Validate plan exists
  const planData = getPlan(plan);
  if (!planData) {
    return res.status(404).json({
      success: false,
      error: 'Invalid subscription plan',
      plan
    });
  }

  // Validate payment type
  if (!['card', 'wallet'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payment type. Use "card" or "wallet"',
      type
    });
  }

  // Get user ID from your session/auth system
  // Adjust based on your authentication method
  const user_id = req.session?.user?.id || req.session?.userId || 'guest_' + Date.now();

  try {
    // Generate JWT token
    const token = generatePaymentToken({
      plan,
      user_id,
      payment_type: type
    });

    // Redirect to m2y.net checkout
    const checkoutUrl = `https://m2y.net/checkout?token=${token}`;
    res.redirect(302, checkoutUrl);

  } catch (error) {
    console.error('Payment token generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize payment',
      message: error.message
    });
  }
}

// Optional: GET method for testing
export async function getServerSideProps(context) {
  // Not needed for this route
}
```

### 5. Create `pages/payment/success.js`
```javascript
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const router = useRouter();
  const { plan, mid } = router.query;
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    // Call your backend to activate subscription
    // This is where you update the user's subscription in your database
    async function activateSubscription() {
      try {
        const response = await fetch('/api/subscription/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan,
            transaction_id: mid,
            // You might also want to verify with m2y.net webhook data
          })
        });

        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Subscription activation error:', error);
        setStatus('error');
      }
    }

    if (plan) {
      activateSubscription();
    }
  }, [plan, mid]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تفعيل اشتراكك...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            تم الاشتراك بنجاح!
          </h1>
          <p className="text-gray-600 mb-6">
            مرحباً بك في <strong>{plan}</strong>.
            تم تفعيل اشتراكك بنجاح.
          </p>
          <div className="space-y-3">
            <a
              href="/dashboard"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              اذهب إلى لوحة التحكم
            </a>
            <a
              href="/pricing"
              className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              عرض الخطط الأخرى
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          حدث خطأ
        </h1>
        <p className="text-gray-600 mb-6">
          لم نتمكن من تفعيل اشتراكك. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            حاول مرة أخرى
          </button>
          <a
            href="/contact"
            className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            تواصل مع الدعم
          </a>
        </div>
      </div>
    </div>
  );
}

// Optional: Server-side verification
export async function getServerSideProps(context) {
  const { plan, mid } = context.query;

  // You can verify payment here by calling m2y.net API or waiting for webhook
  // For simplicity, we show success page and rely on webhook for activation
  // Better: Check DB if subscription is active

  return {
    props: {
      plan: plan || null,
      transactionId: mid || null
    }
  };
}
```

### 6. Create `pages/payment/fail.js`
```javascript
import { useRouter } from 'next/router';

export default function PaymentFail() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          فشل الدفع
        </h1>
        <p className="text-gray-600 mb-6">
          عذراً، لم نتمكن من معالجة دفعتك. يرجى المحاولة مرة أخرى أو استخدام طريقة دفع أخرى.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            حاول مرة أخرى
          </button>
          <a
            href="/pricing"
            className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            اختيار خطة أخرى
          </a>
          <a
            href="/contact"
            className="block w-full text-blue-600 py-2 hover:underline"
          >
            تواصل مع الدعم
          </a>
        </div>
      </div>
    </div>
  );
}
```

### 7. Update Pricing Page (`pages/pricing.js` or similar)

Find where you display plans and update buttons:

```javascript
import { getAllPlans } from '../lib/plans';

export default function PricingPage() {
  const plans = getAllPlans();

  return (
    <div className="pricing-page">
      <h1>اختر خطتك</h1>
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.name}</h3>
            <p className="price">{plan.price} EGP</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>

            {/* Buttons for Card and Wallet */}
            <div className="plan-buttons">
              <a
                href={`/api/subscribe/${plan.id}?type=card`}
                className="btn btn-primary"
              >
                اشترك بالكارت 💳
              </a>
              <a
                href={`/api/subscribe/${plan.id}?type=wallet`}
                className="btn btn-secondary"
              >
                اشترك بالمحفظة 👛
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 8. Add `SHARED_SECRET` to `.env.local`
```env
# Shared secret for JWT signing (must match m2y.net)
SHARED_SECRET=K4l3m3tL1c2h4a5n6g7e8f9i0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2

# Optional: Main domain reference
MAIN_DOMAIN=https://m2y.net
```

---

## 📦 متطلبات invist.m2y.net

### نفس الخطوات أعلاه، لكن مع الاختلافات:

#### 1. `lib/plans.js` - 4 خطط:
```javascript
export const PLANS = {
  'invist-basic': {
    id: 'invist-basic',
    name: 'المقدمة',
    description: 'Start investing with small capital',
    price: 299,
    currency: 'EGP',
    features: ['Basic portfolio', 'Market overview', 'Email support']
  },
  'invist-pro': {
    id: 'invist-pro',
    name: 'الاحترافية',
    description: 'Advanced tools for active traders',
    price: 149,
    currency: 'EGP',
    features: ['Advanced charts', 'Real-time alerts', 'Priority support', 'API access']
  },
  'invist-enterprise': {
    id: 'invist-enterprise',
    name: 'مؤسسي',
    description: 'Full suite for institutions',
    price: 499,
    currency: 'EGP',
    features: ['Multi-user', 'Custom analytics', 'Dedicated support', 'SLA guarantee']
  },
  'invist-ultimate': {
    id: 'invist-ultimate',
    name: 'الأفضل',
    description: 'All features unlocked',
    price: 999,
    currency: 'EGP',
    features: ['Everything in Enterprise', 'AI predictions', 'Custom integration', '24/7 phone support']
  }
};
```

#### 2. `lib/payment.js` - تغيير `source`:
```javascript
const payload = {
  plan: planData.id,
  source: 'invist', // ← CHANGE THIS
  amount: planData.price,
  // ...
  return_success: `https://invist.m2y.net/payment/success?plan=${planData.id}`,
  return_fail: `https://invist.m2y.net/payment/fail`,
  // ...
};
```

#### 3. `pages/payment/success.js` & `fail.js`
نفس structure، لكن في domaine invist.m2y.net

#### 4. `.env.local`
نفس `SHARED_SECRET`

---

## 🔄 الـ Flow بالتفصيل

```
[User on engsuite.m2y.net/pricing]
    ↓
Clicks: "اشترك بالكارت" على خطة Pro
    ↓
GET /api/subscribe/engsuite-pro?type=card
    ↓
Next.js:
  - يقرأ الخطة من URL
  - يبحث Plan data من PLANS[plan]
  - يبني JWT payload:
    {
      plan: 'engsuite-pro',
      source: 'engsuite',
      amount: 199,
      user_id: '123',
      payment_type: 'card',
      return_success: 'https://engsuite.m2y.net/payment/success?plan=engsuite-pro',
      return_fail: 'https://engsuite.m2y.net/payment/fail'
    }
  - يوقع JWT بـ SHARED_SECRET
    ↓
 Redirect 302: https://m2y.net/checkout?token=eyJ...
    ↓
m2y.net/checkout:
  - يستقبل token
  -does jwt.verify(token, SHARED_SECRET)
  - يقرأ: {plan, source, amount, user_id, payment_type, return_success, return_fail}
  - ي呼叫 Paymob API:
      1. POST /auth/tokens ← يحصل على auth_token
      2. POST /ecommerce/orders ← ينشئ order
      3. POST /acceptance/payment_keys ← يحصل على payment_key
  - يحفظ في pendingPayments Map:
      key: orderId
      value: { return_success, return_fail, source, plan, user_id }
  - يرجع صفحة HTML فيها iframe:
      src="https://accept.paymob.com/api/acceptance/iframes/1039291?payment_token=xyz"
    ↓
[User sees Paymob payment page inside iframe]
    ↓
User enters card details and pays
    ↓
Paymob processes payment
    ↓
Paymob redirects to:
  https://m2y.net/payment/result?success=true&mid=ORDER_ID_FROM_PAYMOB
    ↓
m2y.net/payment/result:
  - يقرأ mid (merchant_order_id)
  - يبحث في pendingPayments باستخدام mid
  - لو success=true → redirect 302 لـ return_success
  - لو success=false → redirect 302 لـ return_fail
    ↓
[User arrives at subdomain]
https://engsuite.m2y.net/payment/success?plan=engsuite-pro&mid=...
    ↓
engsuite.m2y.net/payment/success:
  - يقرأ query params
  - **يفعل الاشتراك في قاعدة البيانات المحلية** (يعدّ المستخدم Premium)
  - يعرض "تم الاشتراك بنجاح"
```

---

## 🔐 نظام الأمان

### 1. JWT Signature
- كل الـ tokens تُوقع بـ `SHARED_SECRET` (64 char)
- m2y.net Alone يفك التشفير، الآخرين ما يقدرش

### 2. HMAC Verification (Webhooks)
- Paymob ترسل HMAC signature في header
- m2y.net يتحقق منها قبل معالجة الدفع

### 3. Token Expiry
- JWT تنتهي بعد 30 دقيقة (`exp: now + 1800`)
- لو المستخدم تأخر، الـ token يصبح invalid

### 4. Pending Payments TTL
- البيانات في الذاكرة (أو Redis) تحذف بعد ساعة
- ما ينفعش يعاد استخدام قديم

### 5. HTTPS Only
- كل الروابط必须是 HTTPS
- Paymob requires HTTPS callback URLs

---

## 🧪 كيفية الاختبار

### 1. Test m2y.net endpoints:

**A. Health check:**
```bash
curl http://localhost:3000/api/health
```

**B. Invalid token test:**
```bash
curl http://localhost:3000/checkout?token=invalid_token
# Expected: {"success":false,"error":"Invalid or expired token"}
```

**C. Valid JWT test (generate first):**
```bash
# Generate JWT
node -e "
const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({
  plan: 'engsuite-pro',
  source: 'engsuite',
  amount: 199,
  user_id: 'test123',
  payment_type: 'card',
  return_success: 'https://engsuite.m2y.net/payment/success?plan=engsuite-pro',
  return_fail: 'https://engsuite.m2y.net/payment/fail',
  exp: Math.floor(Date.now()/1000) + 1800
}, process.env.SHARED_SECRET);
console.log(token);
"

# Test checkout
curl "http://localhost:3000/checkout?token=THE_TOKEN"
# Expected: HTML page with Paymob iframe (or error if Paymob credentials invalid)
```

**D. Payment result callback test:**
```bash
# Simulate Paymob redirect (need a valid mid from pendingPayments store)
curl "http://localhost:3000/payment/result?success=true&mid=ORDER_ID"
```

### 2. Test subdomain integration:

After implementing changes in engsuite.m2y.net:

**A. Test subscribe API:**
```bash
curl -v https://engsuite.m2y.net/api/subscribe/engsuite-pro?type=card
# Expected: 302 Redirect to https://m2y.net/checkout?token=...
```

**B. Check that redirect goes to m2y.net:**
```bash
# Should see Location header: https://m2y.net/checkout?token=...
```

**C. Complete flow test:**
1. Open browser → https://engsuite.m2y.net/pricing
2. Click "اشترك بالكارت" على أي خطة
3. Should redirect to m2y.net/checkout
4. Should see Paymob iframe (or error if credentials invalid)
5. After payment (test mode), Paymob redirects back to engsuite.m2y.net/payment/success

---

## ⚠️ ملاحظات مهمة

### Paymob Credentials في `.env`:
```env
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5...
PAYMOB_SECRET_KEY=egy_sk_test_...
PAYMOB_HMAC=81A2D18FD716B0FD0C5A3B92291191DE
CARD_INTEGRATION_ID=5647451
WALLET_INTEGRATION_ID=5647463
IFRAME_ID=1039291
```

**⚠️These credentials look valid but might need activation:**
- Ensure your Paymob account is active
- The integration IDs must be for **test mode** when testing
- In production, you'll get live keys from Paymob dashboard

### Switching to Production:
When going live:
1. Get production API keys from Paymob
2. Update `.env` in m2y.net
3. Ensure all URLs are HTTPS
4. Replace in-memory store with Redis
5. Set `NODE_ENV=production`

### Redis Integration (Production):
Replace `services/pendingPayments.js` with Redis:

```javascript
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

// Use: await client.setEx(orderId, 3600, JSON.stringify(data))
// Use: await client.get(orderId)
// Use: await client.del(orderId)
```

---

## 📁 Structure للـ Files الجديدة

### m2y.net:
```
m2y.net/
├── services/
│   ├── paymob.js ✓
│   └── pendingPayments.js ✓
├── middleware/
│   └── jwt.js ✓
├── routes/
│   ├── checkout.js ✓
│   └── payment.js ✓
├── views/
│   └── checkout.ejs ✓
├── .env ✓
└── server.js ✓ (modified)
```

### engsuite.m2y.net:
```
engsuite.m2y.net/
├── lib/
│   ├── plans.js ✏️ (create)
│   └── payment.js ✏️ (create)
├── pages/
│   ├── api/
│   │   └── subscribe/
│   │       └── [plan].js ✏️ (create)
│   ├── payment/
│   │   ├── success.js ✏️ (create)
│   │   └── fail.js ✏️ (create)
│   └── pricing.js ✏️ (update buttons)
├── .env.local ✏️ (add SHARED_SECRET)
└── package.json (add jsonwebtoken)
```

### invist.m2y.net:
```
invist.m2y.net/
├── lib/
│   ├── plans.js (4 plans) ✏️
│   └── payment.js (source='invist') ✏️
├── pages/
│   ├── api/subscribe/[plan].js ✏️
│   ├── payment/success.js ✏️
│   └── payment/fail.js ✏️
├── .env.local (add SHARED_SECRET)
└── package.json (add jsonwebtoken)
```

---

## ❓ الأسئلة الشائعة (FAQ)

### Q: لماذا نستخدم JWT؟
**A:** لأن m2y.net يحتاج يعرف: الخطة، السعر، المستخدم، وروابط العودة، بدون الحاجة لقاعدة بيانات مشتركة. الـ JWT ي signed بـ secret مشترك، فم2y.net يتأكد من صحته.

### Q: أين تخزن بيانات الاشتراك؟
**A:** كل subdomain يخزن اشتراكاته في **قاعدة بياناته الخاصة**. m2y.net فقط يعمل كـ payment gateway، مش مسؤول عن إدارة الاشتراكات.

### Q: ماذا يحدث لو فشل الدفع؟
**A:** Paymob يرجع `success=false` لـ m2y.net، الذي يعيد المستخدم لـ `return_fail` في subdomain. Subdomain يعرض رسالة خطأ.

### Q: كيف نعرف أن الدفع ناجح حقاً؟
**A:** بطريقتين:
1. **User flow:** المستخدم يرجع لـ `/payment/success` → تفعيل الاشتراك
2. **Webhook:** Paymob يرسل إشعار إلى m2y.net → يمكن لـ m2y.net إخبار subdomain عبر API call (اختياري)

الأفضل: اعتمد على الـ webhook كـ source of truth، وsuccess page كـ backup.

### Q: هل يمكن للمستخدم تجاوز الدفع؟
**A:** لا، لأن الـ token مُوقع بـ secret ومدة محدودة. لو حاول يعدل الـ plan في URL، الـ token يكون invalid.

### Q: ماذا لو انتهت مدة token (30 دقيقة)؟
**A:** subdomain يجب يرفض الطلب ويطلب من المستخدم يعيد Selecting plan.

### Q: كيف نتعامل مع refunds أو cancellations؟
**A:** Paymob webhooks ترسل إشعارات. يمكن إضافة endpoints في m2y.netで受信 وإرسال إشعارات للـ subdomains.

---

## 🚀 Checklist النهائية

### في m2y.net:
- [x] Paymob service (3 steps)
- [x] JWT middleware
- [x] /checkout endpoint
- [x] /payment/result endpoint
- [x] 4 webhook endpoints
- [x] In-memory pending payments store
- [x] Checkout view with iframe
- [x] Environment variables configured
- [ ] (Production) Redis instead of memory
- [ ] (Production) HTTPS enforced
- [ ] (Production) Webhook HMAC verification fully tested

### في engsuite.m2y.net:
- [ ] Install jsonwebtoken
- [ ] Add SHARED_SECRET to .env.local
- [ ] Create lib/plans.js (3 plans)
- [ ] Create lib/payment.js (JWT generator)
- [ ] Create pages/api/subscribe/[plan].js
- [ ] Create pages/payment/success.js
- [ ] Create pages/payment/fail.js
- [ ] Update pricing page buttons
- [ ] Test end-to-end flow
- [ ] Implement subscription activation in DB

### في invist.m2y.net:
- [ ] Install jsonwebtoken
- [ ] Add SHARED_SECRET to .env.local
- [ ] Create lib/plans.js (4 plans)
- [ ] Create lib/payment.js (source='invist')
- [ ] Create pages/api/subscribe/[plan].js
- [ ] Create pages/payment/success.js
- [ ] Create pages/payment/fail.js
- [ ] Update pricing page buttons
- [ ] Test end-to-end flow
- [ ] Implement subscription activation in DB

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من `SHARED_SECRET` متطابق في الـ 3 تطبيقات
2. تأكد من استخدام HTTPS
3. تأكد من Paymob account مُفعل و integration IDs صحيحة
4. راجع الـ logs في m2y.net للـ error messages
5. تأكد أن الـ webhook URLs في Paymob dashboard صحيحة

---

**تاريخ الإنشاء:** 2026-05-01  
**الحالة:** m2y.net جاهز، ينتظر تعديل الـ subdomains
