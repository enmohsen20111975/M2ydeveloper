# 📋 ملاحظات Rapid Integration - للتطبيقات الفرعية

## 🎯 المطلوب من كل تطبيق فرعي (engsuite.m2y.net & invist.m2y.net)

### 1. Install Dependency
```bash
npm install jsonwebtoken
```

### 2. Add to `.env.local`
```env
SHARED_SECRET=K4l3m3tL1c2h4a5n6g7e8f9i0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2
```

**⚠️这些 القيمة يجب أن تكون مطابقة تماماً في m2y.net**

---

## 📁 الملفات المطلوبة (3 ملفات لكل تطبيق)

### File 1: `lib/plans.js`

**في engsuite.m2y.net:**
```javascript
export const PLANS = {
  'engsuite-basic': { id: 'engsuite-basic', name: 'الأساسي', price: 99 },
  'engsuite-pro':    { id: 'engsuite-pro', name: 'الاحترافي', price: 199 },
  'engsuite-enterprise': { id: 'engsuite-enterprise', name: 'المؤسسي', price: 399 }
};

export function getPlan(id) { return PLANS[id]; }
export function getAllPlans() { return Object.values(PLANS); }
```

**في invist.m2y.net:**
```javascript
export const PLANS = {
  'invist-basic':    { id: 'invist-basic', name: 'المقدمة', price: 299 },
  'invist-pro':      { id: 'invist-pro', name: 'الاحترافية', price: 149 },
  'invist-enterprise': { id: 'invist-enterprise', name: 'مؤسسي', price: 499 },
  'invist-ultimate': { id: 'invist-ultimate', name: 'الأفضل', price: 999 }
};
```

---

### File 2: `lib/payment.js`

**engkSuite (engsuite.m2y.net):**
```javascript
import jwt from 'jsonwebtoken';
import { getPlan } from './plans';

const SHARED_SECRET = process.env.SHARED_SECRET;

export function generatePaymentToken({ plan, user_id, payment_type }) {
  const planData = getPlan(plan);
  const payload = {
    plan: planData.id,
    source: 'engsuite', // ← هام
    amount: planData.price,
    user_id,
    payment_type,
    return_success: `https://engsuite.m2y.net/payment/success?plan=${planData.id}`,
    return_fail: `https://engsuite.m2y.net/payment/fail`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 1800
  };
  return jwt.sign(payload, SHARED_SECRET, { algorithm: 'HS256' });
}
```

**invist (invist.m2y.net):**
```javascript
// نفس الكود لكن غير source و URLs:
const payload = {
  plan: planData.id,
  source: 'invist', // ← CHANGE
  amount: planData.price,
  // ...
  return_success: `https://invist.m2y.net/payment/success?plan=${planData.id}`,
  return_fail: `https://invist.m2y.net/payment/fail`,
};
```

---

### File 3: `pages/api/subscribe/[plan].js`

```javascript
import { generatePaymentToken } from '../../../lib/payment';
import { getPlan } from '../../../lib/plans';

export default function handler(req, res) {
  const { plan } = req.query;   // من URL: /api/subscribe/engsuite-pro
  const { type } = req.query;   // ?type=card أو ?type=wallet

  const planData = getPlan(plan);
  if (!planData) {
    return res.status(404).json({ error: 'Invalid plan' });
  }

  if (!['card', 'wallet'].includes(type)) {
    return res.status(400).json({ error: 'Invalid payment type' });
  }

  // Get user ID from your session
  const user_id = req.session?.user?.id || 'guest_' + Date.now();

  try {
    const token = generatePaymentToken({ plan, user_id, payment_type: type });
    res.redirect(302, `https://m2y.net/checkout?token=${token}`);
  } catch (error) {
    res.status(500).json({ error: 'Payment initiation failed' });
  }
}
```

---

## 🎨 الصفحات الإضافية

### `pages/payment/success.js`
```javascript
export default function SuccessPage({ query }) {
  const { plan } = query;

  // TODO:activate subscription in your database here
  // Example: call your API to mark user as premium

  return (
    <div>
      <h1>✅ تم الاشتراك بنجاح!</h1>
      <p>اشتراكك في <strong>{plan}</strong> مفعل الآن.</p>
      <a href="/dashboard">الذهاب للوحة التحكم</a>
    </div>
  );
}
```

### `pages/payment/fail.js`
```javascript
export default function FailPage() {
  return (
    <div>
      <h1>❌ فشل الدفع</h1>
      <p>لم نتمكن من معالجة الدفع. حاول مرة أخرى.</p>
      <button onClick={() => window.history.back()}>حاول مرة أخرى</button>
    </div>
  );
}
```

---

## 🔄 تحديث صفحة Pricing

في صفحة عرض الخطط (مثال):

```javascript
// Instead of direct payment button:
<button onClick={() => payNow(plan.id)}>ادفع الآن</button>

// Change to:
<a href={`/api/subscribe/${plan.id}?type=card`} className="btn">
  اشترك بالكارت 💳
</a>
<a href={`/api/subscribe/${plan.id}?type=wallet`} className="btn">
  اشترك بالمحفظة 👛
</a>
```

---

## 🧪 Quick Test

بعد تنفيذ التعديلات:

```bash
# 1. Test subscribe endpoint
curl -v https://engsuite.m2y.net/api/subscribe/engsuite-pro?type=card

# Expected: 302 redirect to https://m2y.net/checkout?token=...

# 2. Copy that URL and open in browser
# Should see Paymob payment page iframe

# 3. In test mode, Paymob shows test card numbers
# Use test card: 4242 4242 4242 4242
# Any future expiry, any CVV
```

---

## 📊 Comparison Table

| العنصر | engsuite.m2y.net | invist.m2y.net |
|--------|-----------------|---------------|
| Number of plans | 3 | 4 |
| source في JWT | `'engsuite'` | `'invist'` |
| return URLs | `engsuite.m2y.net/payment/...` | `invist.m2y.net/payment/...` |
| Plan IDs prefix | `engsuite-` | `invist-` |
| prices | 99, 199, 399 | 299, 149, 499, 999 |

---

## 🚨 Common Issues

### 1. Token invalid error
- Cause: SHARED_SECRET mismatch
- Fix: Ensure `.env.local` has exact same secret as m2y.net

### 2. 404 on /api/subscribe/[plan]
- Cause: File not in `pages/api/subscribe/` (dynamic route)
- Fix: Filename must be `[plan].js` inside `subscribe` folder

### 3. Redirect to m2y.net fails
- Cause: Missing `res.redirect(302, url)`
- Fix: Must use 302 redirect, not 301

### 4. Payment page shows error
- Cause: Paymob credentials not active
- Fix: Get valid test keys from Paymob dashboard

### 5. Success page shows but subscription not activated
- Cause: DB activation code not implemented
- Fix: Add your business logic in `success.js` to mark user as subscribed

---

## 📞 Support

اكتب لي إذا واجهت أي مشكلة في التنفيذ. الملفات جاهزة، فقط copy/paste مع تعديل:
- `source` value
- `return_success` URL
- `plans` data

**الوقت المقدر للتطبيق: 30-60 دقيقة لكل تطبيق**
