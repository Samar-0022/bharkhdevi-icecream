// ================================================
// shopConfig.js — Owner Settings (EASY TO CHANGE)
// BharkhaDevi Ice Cream App
// ================================================

export const SHOP_CONFIG = {

  // ── SHOP INFO ──────────────────────────────────
  shopName:     'BharkhaDevi Ice Cream',
  shopNameGu:   'ભરખાદેવી આઈસ્ક્રીમ',
  ownerName:    'Kuldeep Singh',
  phone:        '+91 XXXXXXXXXX',   // ← CHANGE THIS
  email:        'bharkhadevi@gmail.com',
  address:      'Bardoli, Surat, Gujarat - 394601',
  gstNumber:    '',                  // ← optional

  // ── OWNER WHATSAPP ─────────────────────────────
  // Format: 91XXXXXXXXXX (no + or spaces)
  ownerWhatsApp: '91XXXXXXXXXX',     // ← CHANGE THIS
  ownerUPI:      'bharkhadevi@upi',  // ← CHANGE THIS

  // ── SHOP TIMINGS ───────────────────────────────
  // 24-hour format
  openTime:     '10:00',   // Shop opens at 10 AM
  closeTime:    '22:00',   // Shop closes at 10 PM
  offDays:      [],        // e.g. ['Sunday'] for weekly off

  // ── DELIVERY SETTINGS ──────────────────────────
  deliveryAreas: [
    'Bardoli',
    'Bardoli Taluka',
    'Vyara Road Bardoli',
    'Station Road Bardoli',
  ],
  deliveryPincode: ['394601', '394602', '394620'],

  // Delivery charges (owner can change)
  deliveryCharges: {
    freeAbove:   299,   // Free delivery above ₹299
    under2km:    20,    // ₹20 for under 2km
    under5km:    30,    // ₹30 for 2-5km
    above5km:    50,    // ₹50 for above 5km
    default:     30,    // Default charge if distance unknown
  },

  // Minimum order amount
  minOrderAmount: 99,   // ₹99 minimum order

  // ── OFFERS & DISCOUNTS ─────────────────────────
  offers: {
    firstOrderDiscount:     30,    // 30% off on first order
    firstOrderMaxDiscount:  100,   // Max ₹100 off
    enableFirstOffer:       true,
  },

  // ── SHOP STATUS ────────────────────────────────
  // This will be overridden by Firebase real-time value
  // Change from Firebase Console → Firestore → shopStatus
  manuallyClose:  false,   // true = force close shop
  closedMessage:  'અત્યારે અમે બંધ છીએ. કૃપા કરીને પછી ફરી આવો! 🙏',
  closedMessageEn:'We are closed right now. Please try again later! 🙏',

  // ── PAYMENT METHODS ────────────────────────────
  paymentMethods: {
    cod:  true,    // Cash on Delivery
    upi:  true,    // UPI Payment
    card: false,   // Card (disable for now)
  },

  // ── SECURITY ───────────────────────────────────
  maxLoginAttempts:    5,     // Lock after 5 failed attempts
  sessionTimeout:      86400, // 24 hours in seconds
  requirePhoneVerify:  false, // Phone OTP verification

  // ── APP SETTINGS ───────────────────────────────
  currency:      '₹',
  currencyCode:  'INR',
  language:      'gu',       // 'gu' = Gujarati, 'en' = English
  supportBilingualUI: true,  // Show both Gujarati + English

  // ── SOCIAL ─────────────────────────────────────
  instagram: '',
  facebook:  '',
  website:   '',
};

// ── HELPER: Is shop open right now? ──────────────
export function isShopOpen() {
  if (SHOP_CONFIG.manuallyClose) return false;

  const now    = new Date();
  const day    = now.toLocaleDateString('en-US', { weekday: 'long' });
  const hour   = now.getHours();
  const minute = now.getMinutes();
  const current = hour * 60 + minute;

  // Check off days
  if (SHOP_CONFIG.offDays.includes(day)) return false;

  // Parse open/close times
  const [openH, openM]   = SHOP_CONFIG.openTime.split(':').map(Number);
  const [closeH, closeM] = SHOP_CONFIG.closeTime.split(':').map(Number);
  const openMin  = openH  * 60 + openM;
  const closeMin = closeH * 60 + closeM;

  return current >= openMin && current < closeMin;
}

// ── HELPER: Calculate delivery charge ────────────
export function getDeliveryCharge(orderTotal) {
  const { freeAbove, default: def } = SHOP_CONFIG.deliveryCharges;
  if (orderTotal >= freeAbove) return 0;
  return def;
}

// ── HELPER: Is area deliverable? ─────────────────
export function isDeliverableArea(area = '', pincode = '') {
  const areaLower = area.toLowerCase();
  const areaMatch = SHOP_CONFIG.deliveryAreas.some(
    a => areaLower.includes(a.toLowerCase())
  );
  const pinMatch = pincode
    ? SHOP_CONFIG.deliveryPincode.includes(pincode.trim())
    : false;
  return areaMatch || pinMatch;
}

export default SHOP_CONFIG;