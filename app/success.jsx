// app/success.jsx — Order Success Screen
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { GU } from '../constants/gujarati';

export default function SuccessScreen() {
  const params = useLocalSearchParams();
  const order  = JSON.parse(params.order || '{}');
  const bounce = useRef(new Animated.Value(0)).current;
  const fade   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounce, { toValue:1, friction:3, tension:100, useNativeDriver:true }),
      Animated.timing(fade,   { toValue:1, duration:600, useNativeDriver:true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#FFF8F0','#FFE4F0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.Text style={[styles.emoji, { transform:[{scale:bounce}] }]}>🎉</Animated.Text>
        <Animated.View style={{ opacity:fade }}>
          <Text style={styles.title}>{GU.orderPlaced}</Text>
          <Text style={styles.sub}>{GU.orderOnWay}</Text>
          <Text style={styles.orderId}>Order #{order.orderId}</Text>

          <View style={styles.card}>
            {(order.items||[]).map(i => (
              <View key={i.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{i.emoji} {i.name} ×{i.qty}</Text>
                <Text style={styles.itemPrice}>₹{i.price*i.qty}</Text>
              </View>
            ))}
            <View style={styles.divider}/>
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>{GU.total}</Text>
              <Text style={styles.totalVal}>₹{order.total}</Text>
            </View>
            <Text style={styles.payNote}>
              {order.paymentMethod==='cod' ? '💵 Cash on Delivery' :
               order.paymentMethod==='upi' ? `📱 UPI — ${order.upiId}` : '💳 Card Payment'}
            </Text>
            <Text style={styles.addrNote}>📍 {order.address}</Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>📦 Order Status</Text>
            {['Placed ✅','Confirmed 🔄','Preparing 👨‍🍳','On the way 🏍️','Delivered 🎉'].map((s,i) => (
              <View key={i} style={styles.statusRow}>
                <View style={[styles.statusDot, i===0 && styles.statusDotActive]}/>
                <Text style={[styles.statusText, i===0 && styles.statusTextActive]}>{s}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.homeBtn}>
            <LinearGradient colors={COLORS.gradientPink} style={styles.homeBtnGrad}>
              <Text style={styles.homeBtnText}>🛍️ {GU.continueShopping}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/orders')} style={styles.ordersBtn}>
            <Text style={styles.ordersBtnText}>📦 {GU.myOrders} જુઓ</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:       { flex:1 },
  scroll:          { padding: SPACING.base, alignItems:'center', paddingTop: SPACING.xxxl },
  emoji:           { fontSize:80, textAlign:'center', marginBottom: SPACING.md },
  title:           { fontSize: FONTS.xxxl, fontWeight: FONTS.black, color: COLORS.success, textAlign:'center' },
  sub:             { fontSize: FONTS.base, color: COLORS.textMedium, textAlign:'center', marginBottom: SPACING.sm },
  orderId:         { fontSize: FONTS.sm, color: COLORS.primary, fontWeight: FONTS.bold, textAlign:'center', marginBottom: SPACING.lg },
  card:            { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, width:'100%', ...SHADOWS.medium, marginBottom: SPACING.md },
  itemRow:         { flexDirection:'row', justifyContent:'space-between', paddingVertical: SPACING.xs },
  itemName:        { fontSize: FONTS.sm, color: COLORS.textMedium, flex:1 },
  itemPrice:       { fontSize: FONTS.sm, fontWeight: FONTS.bold },
  divider:         { height:2, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalLabel:      { fontSize: FONTS.base, fontWeight: FONTS.black },
  totalVal:        { fontSize: FONTS.lg, fontWeight: FONTS.black, color: COLORS.primary },
  payNote:         { fontSize: FONTS.xs, color: COLORS.textLight, marginTop: SPACING.xs },
  addrNote:        { fontSize: FONTS.xs, color: COLORS.textLight },
  statusCard:      { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, width:'100%', ...SHADOWS.small, marginBottom: SPACING.md },
  statusTitle:     { fontSize: FONTS.base, fontWeight: FONTS.black, marginBottom: SPACING.md },
  statusRow:       { flexDirection:'row', alignItems:'center', gap: SPACING.md, marginBottom: SPACING.sm },
  statusDot:       { width:12, height:12, borderRadius:6, backgroundColor: COLORS.border },
  statusDotActive: { backgroundColor: COLORS.success },
  statusText:      { fontSize: FONTS.sm, color: COLORS.textLight },
  statusTextActive:{ color: COLORS.success, fontWeight: FONTS.bold },
  homeBtn:         { borderRadius: RADIUS.lg, overflow:'hidden', width:'100%', marginBottom: SPACING.sm },
  homeBtnGrad:     { padding: SPACING.base, alignItems:'center' },
  homeBtnText:     { color: COLORS.white, fontSize: FONTS.base, fontWeight: FONTS.black },
  ordersBtn:       { padding: SPACING.md, alignItems:'center' },
  ordersBtnText:   { color: COLORS.primary, fontSize: FONTS.sm, fontWeight: FONTS.bold },
});