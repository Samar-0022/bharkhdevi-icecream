// ================================================
// twilio.js — WhatsApp + SMS Notifications
// BharkhaDevi Ice Cream App
// ================================================

// ── TWILIO CREDENTIALS ───────────────────────────
// ⚠️  IMPORTANT: Move these to a backend/.env in production!
const TWILIO_ACCOUNT_SID  = 'ACcb936bed600e5035cf8225e9eb538f22';
const TWILIO_AUTH_TOKEN   = '3a6a368abe68ede2900dd18712d1ec6d';
const TWILIO_WHATSAPP_NO  = 'whatsapp:+14155238886'; // Sandbox number
const OWNER_WHATSAPP      = 'whatsapp:+91XXXXXXXXXX'; // ← CHANGE THIS
const OWNER_PHONE         = '+91XXXXXXXXXX';           // ← CHANGE THIS

const TWILIO_BASE_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
const TWILIO_AUTH     = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

// ── SEND WHATSAPP MESSAGE ────────────────────────
async function sendWhatsApp(to, message) {
  try {
    const body = new URLSearchParams({
      From: TWILIO_WHATSAPP_NO,
      To:   `whatsapp:${to}`,
      Body: message,
    });

    const res = await fetch(TWILIO_BASE_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${TWILIO_AUTH}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await res.json();
    if (data.sid) {
      console.log('WhatsApp sent:', data.sid);
      return { success: true, sid: data.sid };
    } else {
      console.warn('WhatsApp failed:', data);
      return { success: false, error: data };
    }
  } catch (err) {
    console.error('WhatsApp error:', err);
    return { success: false, error: err.message };
  }
}

// ── SEND SMS ─────────────────────────────────────
async function sendSMS(to, message) {
  try {
    const body = new URLSearchParams({
      From: TWILIO_WHATSAPP_NO.replace('whatsapp:', ''),
      To:   to,
      Body: message,
    });

    const res = await fetch(TWILIO_BASE_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${TWILIO_AUTH}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await res.json();
    return data.sid
      ? { success: true, sid: data.sid }
      : { success: false, error: data };
  } catch (err) {
    console.error('SMS error:', err);
    return { success: false, error: err.message };
  }
}

// ── ORDER NOTIFICATION TO OWNER ──────────────────
export async function notifyOwnerNewOrder(order) {
  const itemLines = order.items
    .map(i => `   🍦 ${i.name} x${i.qty} = ₹${i.price * i.qty}`)
    .join('\n');

  const payLabel = {
    cod:  '💵 Cash on Delivery',
    upi:  `📱 UPI — ${order.upiId || 'N/A'}`,
    card: '💳 Card Payment',
  }[order.paymentMethod] || order.paymentMethod;

  const message =
    `🍦 *નવો ઓર્ડર — BharkhaDevi Ice Cream*\n\n` +
    `📋 Order ID : ${order.orderId}\n` +
    `👤 Customer : ${order.userName}\n` +
    `📱 Phone    : ${order.phone}\n` +
    `📍 Address  : ${order.address}` +
    `${order.pincode ? ' — ' + order.pincode : ''}\n\n` +
    `🛒 *Items:*\n${itemLines}\n\n` +
    `💰 *Total   : ₹${order.total}*\n` +
    `💳 Payment  : ${payLabel}\n` +
    `⏰ Time     : ${order.date}\n\n` +
    `✅ Please confirm and prepare the order!`;

  // Send WhatsApp
  const waResult = await sendWhatsApp(OWNER_WHATSAPP, message);

  // Send SMS as backup
  const smsMessage =
    `New Order BD${order.orderId}! ` +
    `Customer: ${order.userName}, ` +
    `Total: Rs.${order.total}, ` +
    `Payment: ${order.paymentMethod.toUpperCase()}. ` +
    `Check WhatsApp for details.`;

  const smsResult = await sendSMS(OWNER_PHONE, smsMessage);

  return { whatsapp: waResult, sms: smsResult };
}

// ── ORDER CONFIRMATION TO CUSTOMER ───────────────
export async function notifyCustomerOrderConfirmed(order) {
  const message =
    `🍦 *BharkhaDevi Ice Cream*\n\n` +
    `✅ તમારો ઓર્ડર મળ્યો!\n` +
    `Order ID: ${order.orderId}\n` +
    `Total: ₹${order.total}\n\n` +
    `🕐 ૩૦-૪૫ મિનિટમાં ડિલિવરી!\n` +
    `જો કોઈ સવાલ હોય: ${OWNER_PHONE}\n\n` +
    `આભાર! 🙏`;

  return await sendWhatsApp(order.phone, message);
}

// ── ORDER STATUS UPDATE TO CUSTOMER ──────────────
export async function notifyCustomerStatusUpdate(order, status) {
  const statusMessages = {
    confirmed: `✅ ઓર્ડર Confirm થઈ ગયો! Order: ${order.orderId}`,
    preparing: `👨‍🍳 તમારી આઈસ્ક્રીમ બની રહી છે! Order: ${order.orderId}`,
    onway:     `🏍️ ડિલિવરી Boy રવાના! Order: ${order.orderId}`,
    delivered: `🎉 ઓર્ડર ડિલિવર! Enjoy BharkhaDevi! 🍦`,
  };

  const message = statusMessages[status] || `Order ${order.orderId} status: ${status}`;
  return await sendWhatsApp(order.phone, `🍦 *BharkhaDevi Ice Cream*\n\n${message}`);
}

// ── BUILD WHATSAPP LINK (fallback) ───────────────
export function buildWhatsAppLink(order) {
  const itemLines = order.items
    .map(i => `${i.emoji || '🍦'} ${i.name} x${i.qty} = ₹${i.price * i.qty}`)
    .join('\n');

  const msg = encodeURIComponent(
    `🍦 NEW ORDER — BharkhaDevi Ice Cream\n\n` +
    `Order ID: ${order.orderId}\n` +
    `Customer: ${order.userName}\n` +
    `Phone: ${order.phone}\n` +
    `Address: ${order.address}\n\n` +
    `Items:\n${itemLines}\n\n` +
    `Total: ₹${order.total}\n` +
    `Payment: ${order.paymentMethod.toUpperCase()}`
  );

  return `https://wa.me/${OWNER_WHATSAPP.replace('whatsapp:+', '')}?text=${msg}`;
}

export default {
  notifyOwnerNewOrder,
  notifyCustomerOrderConfirmed,
  notifyCustomerStatusUpdate,
  buildWhatsAppLink,
};