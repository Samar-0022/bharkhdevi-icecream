// app/cart.jsx — Cart Screen
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { GU } from '../constants/gujarati';
import { SHOP_CONFIG, getDeliveryCharge } from '../services/shopConfig';

export default function CartScreen() {
  const [cart, setCart] = useState([]);

  useEffect(() => { loadCart(); }, []);

  async function loadCart() {
    const data = await AsyncStorage.getItem('bd_cart');
    if (data) setCart(JSON.parse(data));
  }

  async function saveCart(newCart) {
    setCart(newCart);
    await AsyncStorage.setItem('bd_cart', JSON.stringify(newCart));
  }

  function changeQty(id, delta) {
    const updated = cart.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0);
    saveCart(updated);
  }

  function remove(id) {
    Alert.alert('Remove?', 'Remove this item?', [
      { text: 'Cancel' },
      { text: 'Remove', onPress: () => saveCart(cart.filter(i => i.id !== id)) }
    ]);
  }

  const subtotal  = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const delivery  = getDeliveryCharge(subtotal);
  const total     = subtotal + delivery;

  if (!cart.length) return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>{GU.emptyCart}</Text>
      <Text style={styles.emptyMsg}>{GU.emptyCartMsg}</Text>
      <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
        <LinearGradient colors={COLORS.gradientPink} style={styles.shopBtnGrad}>
          <Text style={styles.shopBtnText}>🍦 Menu જુઓ</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradientBrand} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 {GU.cart}</Text>
        <Text style={styles.headerCount}>{cart.reduce((a,b)=>a+b.qty,0)} items</Text>
      </LinearGradient>

      <FlatList
        data={cart}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemEmoji}>{item.emoji || '🍦'}</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{item.qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.itemTotal}>₹{item.price * item.qty}</Text>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={styles.removeBtn}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{GU.subtotal}</Text>
              <Text style={styles.summaryVal}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{GU.deliveryFee}</Text>
              <Text style={[styles.summaryVal, delivery===0 && {color:COLORS.success}]}>
                {delivery===0 ? 'FREE 🎉' : `₹${delivery}`}
              </Text>
            </View>
            {delivery===0 && (
              <Text style={styles.freeNote}>🎉 ₹{SHOP_CONFIG.deliveryCharges.freeAbove}+ ઓર્ડર પર FREE delivery!</Text>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{GU.total}</Text>
              <Text style={styles.totalVal}>₹{total}</Text>
            </View>
            {subtotal < SHOP_CONFIG.minOrderAmount && (
              <Text style={styles.minOrderNote}>
                ⚠️ ન્યૂનતમ ઓર્ડર ₹{SHOP_CONFIG.minOrderAmount}
              </Text>
            )}
          </View>
        }
      />

      {/* Checkout Button */}
      {subtotal >= SHOP_CONFIG.minOrderAmount && (
        <TouchableOpacity
          style={styles.checkoutWrap}
          onPress={() => router.push({ pathname: '/payment', params: { cart: JSON.stringify(cart), delivery: delivery } })}
          activeOpacity={0.9}
        >
          <LinearGradient colors={COLORS.gradientPink} style={styles.checkoutBtn}>
            <Text style={styles.checkoutText}>{GU.checkout} → ₹{total}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor: COLORS.background },
  empty:        { flex:1, justifyContent:'center', alignItems:'center', padding: SPACING.xl },
  emptyIcon:    { fontSize:80, marginBottom: SPACING.md },
  emptyTitle:   { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.textDark },
  emptyMsg:     { fontSize: FONTS.base, color: COLORS.textLight, marginBottom: SPACING.lg },
  shopBtn:      { borderRadius: RADIUS.md, overflow:'hidden', width:180 },
  shopBtnGrad:  { padding: SPACING.md, alignItems:'center' },
  shopBtnText:  { color: COLORS.white, fontWeight: FONTS.black, fontSize: FONTS.base },
  header:       { paddingTop:48, paddingBottom: SPACING.md, paddingHorizontal: SPACING.base, flexDirection:'row', alignItems:'center', gap: SPACING.md },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' },
  backText:     { color: COLORS.white, fontSize: FONTS.xl, fontWeight: FONTS.bold },
  headerTitle:  { flex:1, fontSize: FONTS.lg, fontWeight: FONTS.black, color: COLORS.white },
  headerCount:  { fontSize: FONTS.sm, color: COLORS.white, opacity:0.85 },
  list:         { padding: SPACING.base, paddingBottom: 100 },
  card:         { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, ...SHADOWS.small, gap: SPACING.sm },
  itemEmoji:    { fontSize:36 },
  itemInfo:     { flex:1 },
  itemName:     { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.textDark },
  itemPrice:    { fontSize: FONTS.xs, color: COLORS.textLight },
  qtyRow:       { flexDirection:'row', alignItems:'center', gap: SPACING.sm },
  qtyBtn:       { width:28, height:28, borderRadius:14, backgroundColor:'#FFF0F7', borderWidth:1.5, borderColor: COLORS.border, justifyContent:'center', alignItems:'center' },
  qtyBtnText:   { fontSize: FONTS.lg, color: COLORS.primary, fontWeight: FONTS.black },
  qtyNum:       { fontSize: FONTS.base, fontWeight: FONTS.black, minWidth:20, textAlign:'center' },
  itemTotal:    { fontSize: FONTS.sm, fontWeight: FONTS.black, color: COLORS.textDark, minWidth:40, textAlign:'right' },
  removeBtn:    { fontSize:20, padding: SPACING.xs },
  summary:      { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.small },
  summaryRow:   { flexDirection:'row', justifyContent:'space-between', paddingVertical: SPACING.xs },
  summaryLabel: { fontSize: FONTS.sm, color: COLORS.textMedium },
  summaryVal:   { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.textDark },
  freeNote:     { fontSize: FONTS.xs, color: COLORS.success, textAlign:'center', marginBottom: SPACING.xs },
  totalRow:     { borderTopWidth:2, borderTopColor: COLORS.border, marginTop: SPACING.xs, paddingTop: SPACING.sm },
  totalLabel:   { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark },
  totalVal:     { fontSize: FONTS.lg, fontWeight: FONTS.black, color: COLORS.primary },
  minOrderNote: { fontSize: FONTS.xs, color: COLORS.error, textAlign:'center', marginTop: SPACING.xs },
  checkoutWrap: { position:'absolute', bottom:0, left:0, right:0, padding: SPACING.base },
  checkoutBtn:  { borderRadius: RADIUS.lg, padding: SPACING.base, alignItems:'center' },
  checkoutText: { color: COLORS.white, fontSize: FONTS.base, fontWeight: FONTS.black },
});