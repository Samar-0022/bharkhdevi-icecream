// app/payment.jsx — Payment Screen
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { GU } from '../constants/gujarati';
import { auth, saveOrder } from '../services/firebase';
import { notifyOwnerNewOrder, buildWhatsAppLink } from '../services/twilio';
import { SHOP_CONFIG, isDeliverableArea } from '../services/shopConfig';
import { Linking } from 'react-native';

export default function PaymentScreen() {
  const params   = useLocalSearchParams();
  const items    = JSON.parse(params.cart || params.buyNow || '[]');
  const delivery = Number(params.delivery || 0);
  const subtotal = items.reduce((a,b)=>a+b.price*b.qty,0);
  const total    = subtotal + delivery;

  const [name,    setName]    = useState(auth.currentUser?.displayName || '');
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [method,  setMethod]  = useState('cod');
  const [upiId,   setUpiId]   = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!name.trim())  { Alert.alert('Error', GU.fullName + ' જરૂરી છે'); return false; }
    if (!/^\d{10}$/.test(phone.replace(/\s/g,''))) { Alert.alert('Error', GU.invalidPhone); return false; }
    if (!address.trim()) { Alert.alert('Error', GU.address + ' જરૂરી છે'); return false; }
    if (!isDeliverableArea(address, pincode)) { Alert.alert('⚠️ Delivery Area', GU.outsideArea); return false; }
    if (method==='upi' && !upiId.includes('@')) { Alert.alert('Error', 'Valid UPI ID દાખલ કરો'); return false; }
    return true;
  }

  async function placeOrder() {
    if (!validate()) return;
    setLoading(true);
    const orderId = 'BD' + Date.now().toString().slice(-7);
    const u = auth.currentUser;
    const order = {
      orderId, items, subtotal, delivery, total,
      userName:      u?.displayName || name,
      userEmail:     u?.email || '',
      userId:        u?.uid   || '',
      phone, address, pincode,
      paymentMethod: method,
      upiId: method==='upi' ? upiId : '',
      status: 'Processing',
      date:   new Date().toLocaleString('en-IN'),
      timestamp: new Date().toISOString(),
    };
    try {
      await saveOrder(order);
      await notifyOwnerNewOrder(order);
      // Clear cart
      await AsyncStorage.removeItem('bd_cart');
      router.replace({ pathname: '/success', params: { order: JSON.stringify(order) } });
    } catch(e) {
      // Save locally as backup
      const local = JSON.parse(await AsyncStorage.getItem('bd_local_orders') || '[]');
      local.push(order);
      await AsyncStorage.setItem('bd_local_orders', JSON.stringify(local));
      const waLink = buildWhatsAppLink(order);
      Alert.alert('ઓર્ડર Ready!', 'WhatsApp પર owner ને notify કરો?', [
        { text: 'Yes', onPress: () => { Linking.openURL(waLink); router.replace('/home'); } },
        { text: 'OK',  onPress: () => router.replace('/home') }
      ]);
    } finally { setLoading(false); }
  }

  const PayMethod = ({ id, icon, label }) => (
    <TouchableOpacity
      style={[styles.payMethod, method===id && styles.payMethodActive]}
      onPress={() => setMethod(id)}
    >
      <Text style={styles.payIcon}>{icon}</Text>
      <Text style={[styles.payLabel, method===id && styles.payLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS.gradientBrand} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 {GU.payment}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 {GU.orderDetails}</Text>
          {items.map(i => (
            <View key={i.id} style={styles.summaryRow}>
              <Text style={styles.summaryItem}>{i.emoji} {i.name} ×{i.qty}</Text>
              <Text style={styles.summaryPrice}>₹{i.price*i.qty}</Text>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{GU.total}</Text>
            <Text style={styles.totalVal}>₹{total}</Text>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 {GU.deliveryDetails}</Text>
          <Text style={styles.areaNote}>⚠️ {GU.deliveryArea}</Text>
          {[
            { val:name,    set:setName,    ph:GU.fullName,  key:'name' },
            { val:phone,   set:setPhone,   ph:GU.phone,     key:'tel',  kb:'phone-pad' },
            { val:address, set:setAddress, ph:GU.address,   key:'addr', multi:true },
            { val:pincode, set:setPincode, ph:GU.pincode,   key:'pin',  kb:'numeric' },
          ].map(f => (
            <TextInput
              key={f.key}
              style={[styles.input, f.multi && {height:80, textAlignVertical:'top'}]}
              value={f.val}
              onChangeText={f.set}
              placeholder={f.ph}
              placeholderTextColor={COLORS.textLight}
              keyboardType={f.kb || 'default'}
              multiline={f.multi}
            />
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 {GU.payment}</Text>
          <View style={styles.payRow}>
            {SHOP_CONFIG.paymentMethods.cod  && <PayMethod id="cod"  icon="💵" label={GU.cod} />}
            {SHOP_CONFIG.paymentMethods.upi  && <PayMethod id="upi"  icon="📱" label={GU.upi} />}
            {SHOP_CONFIG.paymentMethods.card && <PayMethod id="card" icon="💳" label={GU.card} />}
          </View>
          {method==='upi' && (
            <>
              <TextInput style={styles.input} value={upiId} onChangeText={setUpiId}
                placeholder="UPI ID (e.g. name@paytm)" placeholderTextColor={COLORS.textLight} autoCapitalize="none" />
              <Text style={styles.upiNote}>💡 Payment goes to: {SHOP_CONFIG.ownerUPI}</Text>
            </>
          )}
        </View>

        <Text style={styles.secureNote}>🔒 Firebase Secured | SSL Encrypted</Text>
      </ScrollView>

      {/* Place Order */}
      <TouchableOpacity style={styles.orderWrap} onPress={placeOrder} disabled={loading} activeOpacity={0.9}>
        <LinearGradient colors={COLORS.gradientPink} style={styles.orderBtn}>
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.orderText}>🎉 {GU.placeOrder} — ₹{total}</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex:1, backgroundColor: COLORS.background },
  header:          { paddingTop:48, paddingBottom: SPACING.md, paddingHorizontal: SPACING.base, flexDirection:'row', alignItems:'center', gap: SPACING.md },
  backBtn:         { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' },
  backText:        { color: COLORS.white, fontSize: FONTS.xl, fontWeight: FONTS.bold },
  headerTitle:     { fontSize: FONTS.lg, fontWeight: FONTS.black, color: COLORS.white },
  scroll:          { padding: SPACING.base, paddingBottom:100 },
  section:         { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.small },
  sectionTitle:    { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark, marginBottom: SPACING.md },
  summaryRow:      { flexDirection:'row', justifyContent:'space-between', paddingVertical: SPACING.xs },
  summaryItem:     { fontSize: FONTS.sm, color: COLORS.textMedium, flex:1 },
  summaryPrice:    { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.textDark },
  totalRow:        { borderTopWidth:2, borderTopColor: COLORS.border, marginTop: SPACING.xs, paddingTop: SPACING.sm },
  totalLabel:      { fontSize: FONTS.base, fontWeight: FONTS.black },
  totalVal:        { fontSize: FONTS.lg,   fontWeight: FONTS.black, color: COLORS.primary },
  areaNote:        { fontSize: FONTS.xs, color: COLORS.warning, backgroundColor:'#FFF8E1', padding: SPACING.sm, borderRadius: RADIUS.sm, marginBottom: SPACING.md },
  input:           { borderWidth:2, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sm, color: COLORS.textDark, marginBottom: SPACING.md },
  payRow:          { flexDirection:'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  payMethod:       { flex:1, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth:2, borderColor: COLORS.border, alignItems:'center' },
  payMethodActive: { borderColor: COLORS.primary, backgroundColor:'#FFF0F7' },
  payIcon:         { fontSize:24, marginBottom: SPACING.xs },
  payLabel:        { fontSize: FONTS.xs, fontWeight: FONTS.bold, color: COLORS.textMedium, textAlign:'center' },
  payLabelActive:  { color: COLORS.primary },
  upiNote:         { fontSize: FONTS.xs, color: COLORS.success, backgroundColor:'#E8F5E9', padding: SPACING.sm, borderRadius: RADIUS.sm },
  secureNote:      { textAlign:'center', fontSize: FONTS.xs, color: COLORS.textLight, marginBottom: SPACING.md },
  orderWrap:       { position:'absolute', bottom:0, left:0, right:0, padding: SPACING.base },
  orderBtn:        { borderRadius: RADIUS.lg, padding: SPACING.base, alignItems:'center' },
  orderText:       { color: COLORS.white, fontSize: FONTS.base, fontWeight: FONTS.black },
});