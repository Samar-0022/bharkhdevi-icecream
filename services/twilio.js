// ================================================
// twilio.js — WhatsApp + SMS Notifications
// BharkhaDevi Ice Cream App
//
// SECURITY FIX: no longer calls Twilio's API directly with hardcoded
// credentials (those were exposed in the compiled app bundle). All sends
// now go through Firebase Cloud Functions (see functions/index.js), which
// hold the real Twilio Account SID + Auth Token as server-side secrets.
// Public function names/signatures below are unchanged so existing call
// sites (e.g. payment.jsx) don't need to change.
// ================================================

import {
  sendOwnerOrderNotification,
  sendCustomerOrderConfirmation,
  sendCustomerStatusUpdate,
} from './firebase';

const OWNER_WHATSAPP_DISPLAY = '+917984468862'; // used only for the wa.me fallback link below — no credentials needed

// ── ORDER NOTIFICATION TO OWNER ──────────────────
export async function notifyOwnerNewOrder(order) {
  try {
    const result = await sendOwnerOrderNotification(order);
    return result.data;
  } catch (err) {
    console.error('notifyOwnerNewOrder failed', err);
    return { whatsapp: { success: false, error: err.message }, sms: { success: false, error: err.message } };
  }
}

// ── ORDER CONFIRMATION TO CUSTOMER ───────────────
export async function notifyCustomerOrderConfirmed(order) {
  try {
    const result = await sendCustomerOrderConfirmation(order);
    return result.data;
  } catch (err) {
    console.error('notifyCustomerOrderConfirmed failed', err);
    return { success: false, error: err.message };
  }
}

// ── ORDER STATUS UPDATE TO CUSTOMER ──────────────
export async function notifyCustomerStatusUpdate(order, status) {
  try {
    const result = await sendCustomerStatusUpdate(order, status);
    return result.data;
  } catch (err) {
    console.error('notifyCustomerStatusUpdate failed', err);
    return { success: false, error: err.message };
  }
}

// ── BUILD WHATSAPP LINK (fallback, no credentials needed) ──
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

  return `https://wa.me/${OWNER_WHATSAPP_DISPLAY.replace('+', '')}?text=${msg}`;
}

export default {
  notifyOwnerNewOrder,
  notifyCustomerOrderConfirmed,
  notifyCustomerStatusUpdate,
  buildWhatsAppLink,
};