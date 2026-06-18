const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const twilio = require('twilio');

const TWILIO_SID  = defineSecret('TWILIO_SID');
const TWILIO_AUTH = defineSecret('TWILIO_AUTH');

const TWILIO_WHATSAPP = 'whatsapp:+14155238886';
const OWNER_WHATSAPP  = 'whatsapp:+917984468862';
const OWNER_SMS_TO    = '+917984468862';

// ── Preorder (bulk order request) ───────────────
exports.sendPreorderWhatsApp = onCall(
  { secrets: [TWILIO_SID, TWILIO_AUTH] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login required');
    const { qty, dateNeeded, contact, notes, name } = request.data || {};
    if (!qty || !dateNeeded || !contact) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    const client = twilio(TWILIO_SID.value(), TWILIO_AUTH.value());
    const body =
      `🍦 New Preorder Request — BharkhaDevi\n` +
      `Name: ${name || 'N/A'}\n` +
      `Qty: ${qty}\n` +
      `Date Needed: ${dateNeeded}\n` +
      `Contact: ${contact}\n` +
      `Notes: ${notes || '-'}`;

    try {
      await client.messages.create({ from: TWILIO_WHATSAPP, to: OWNER_WHATSAPP, body });
      return { success: true };
    } catch (err) {
      console.error('Preorder WhatsApp failed', err);
      throw new HttpsError('internal', 'Failed to send preorder notification');
    }
  }
);

// ── New order → notify owner (WhatsApp + SMS backup) ──
exports.notifyOwnerNewOrder = onCall(
  { secrets: [TWILIO_SID, TWILIO_AUTH] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login required');
    const order = request.data?.order;
    if (!order?.items) throw new HttpsError('invalid-argument', 'Order data missing');

    const client = twilio(TWILIO_SID.value(), TWILIO_AUTH.value());
    const itemLines = order.items.map(i => `   🍦 ${i.name} x${i.qty} = ₹${i.price * i.qty}`).join('\n');
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
      `📍 Address  : ${order.address}${order.pincode ? ' — ' + order.pincode : ''}\n\n` +
      `🛒 *Items:*\n${itemLines}\n\n` +
      `💰 *Total   : ₹${order.total}*\n` +
      `💳 Payment  : ${payLabel}\n` +
      `⏰ Time     : ${order.date}\n\n` +
      `✅ Please confirm and prepare the order!`;

    let waResult, smsResult;
    try {
      const wa = await client.messages.create({ from: TWILIO_WHATSAPP, to: OWNER_WHATSAPP, body: message });
      waResult = { success: true, sid: wa.sid };
    } catch (err) {
      console.error('Owner WhatsApp failed', err);
      waResult = { success: false, error: err.message };
    }

    try {
      // NOTE: SMS "From" needs a real Twilio SMS-capable number — the WhatsApp
      // sandbox number generally cannot send plain SMS. Likely fails until
      // a proper Twilio phone number is provisioned.
      const smsBody = `New Order BD${order.orderId}! Customer: ${order.userName}, Total: Rs.${order.total}, Payment: ${(order.paymentMethod || '').toUpperCase()}. Check WhatsApp for details.`;
      const sms = await client.messages.create({ from: TWILIO_WHATSAPP.replace('whatsapp:', ''), to: OWNER_SMS_TO, body: smsBody });
      smsResult = { success: true, sid: sms.sid };
    } catch (err) {
      console.error('Owner SMS failed (needs a real Twilio SMS number)', err);
      smsResult = { success: false, error: err.message };
    }

    return { whatsapp: waResult, sms: smsResult };
  }
);

// ── Order confirmed → notify customer ───────────
exports.notifyCustomerOrderConfirmed = onCall(
  { secrets: [TWILIO_SID, TWILIO_AUTH] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login required');
    const order = request.data?.order;
    if (!order?.phone) throw new HttpsError('invalid-argument', 'Order phone missing');

    const client = twilio(TWILIO_SID.value(), TWILIO_AUTH.value());
    const message =
      `🍦 *BharkhaDevi Ice Cream*\n\n` +
      `✅ તમારો ઓર્ડર મળ્યો!\n` +
      `Order ID: ${order.orderId}\n` +
      `Total: ₹${order.total}\n\n` +
      `🕐 ૩૦-૪૫ મિનિટમાં ડિલિવરી!\n` +
      `જો કોઈ સવાલ હોય: ${OWNER_SMS_TO}\n\n` +
      `આભાર! 🙏`;

    try {
      // NOTE: Twilio sandbox can only message numbers that joined the sandbox.
      // Real customers haven't — this will fail until production WhatsApp sender is set up.
      const wa = await client.messages.create({ from: TWILIO_WHATSAPP, to: `whatsapp:${order.phone}`, body: message });
      return { success: true, sid: wa.sid };
    } catch (err) {
      console.error('Customer confirm WhatsApp failed', err);
      throw new HttpsError('internal', 'Could not send confirmation');
    }
  }
);

// ── Order status changed → notify customer ──────
exports.notifyCustomerStatusUpdate = onCall(
  { secrets: [TWILIO_SID, TWILIO_AUTH] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login required');
    const { order, status } = request.data || {};
    if (!order?.phone || !status) throw new HttpsError('invalid-argument', 'Order phone/status missing');

    const client = twilio(TWILIO_SID.value(), TWILIO_AUTH.value());
    const statusMessages = {
      confirmed: `✅ ઓર્ડર Confirm થઈ ગયો! Order: ${order.orderId}`,
      preparing: `👨‍🍳 તમારી આઈસ્ક્રીમ બની રહી છે! Order: ${order.orderId}`,
      onway:     `🏍️ ડિલિવરી Boy રવાના! Order: ${order.orderId}`,
      delivered: `🎉 ઓર્ડર ડિલિવર! Enjoy BharkhaDevi! 🍦`,
    };
    const message = `🍦 *BharkhaDevi Ice Cream*\n\n${statusMessages[status] || `Order ${order.orderId} status: ${status}`}`;

    try {
      const wa = await client.messages.create({ from: TWILIO_WHATSAPP, to: `whatsapp:${order.phone}`, body: message });
      return { success: true, sid: wa.sid };
    } catch (err) {
      console.error('Status update WhatsApp failed', err);
      throw new HttpsError('internal', 'Could not send status update');
    }
  }
);