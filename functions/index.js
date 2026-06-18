const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const twilio = require('twilio');

const TWILIO_SID  = defineSecret('TWILIO_SID');
const TWILIO_AUTH = defineSecret('TWILIO_AUTH');

const OWNER_WHATSAPP  = 'whatsapp:+917984468862';
const TWILIO_WHATSAPP = 'whatsapp:+14155238886';

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
      console.error('Twilio send failed', err);
      throw new HttpsError('internal', 'Failed to send preorder notification');
    }
  }
);