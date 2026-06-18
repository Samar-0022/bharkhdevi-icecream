// app/orders.jsx — My Orders Screen
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { GU } from '../constants/gujarati';
import { auth, getUserOrders } from '../services/firebase';

const STATUS_COLORS = {
  Processing: { bg:'#FFF3E0', text:'#E65100' },
  Confirmed:  { bg:'#E3F2FD', text:'#1565C0' },
  Preparing:  { bg:'#F3E5F5', text:'#6A1B9A' },
  'On the way':{ bg:'#E8F5E9', text:'#2E7D32' },
  Delivered:  { bg:'#E8F5E9', text:'#1B5E20' },
  Cancelled:  { bg:'#FFEBEE', text:'#B71C1C' },
};

export default function OrdersScreen() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const u = auth.currentUser;
      if (u) {
        const data = await getUserOrders(u.uid);
        setOrders(data);
      }
    } catch {
      const local = JSON.parse(await AsyncStorage.getItem('bd_local_orders') || '[]');
      setOrders(local.reverse());
    } finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS.gradientBrand} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📦 {GU.myOrders}</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : !orders.length ? (
        <View style={styles.center}>
          <Text style={{fontSize:60}}>📦</Text>
          <Text style={styles.emptyText}>{GU.noOrders}</Text>
          <Text style={styles.emptySubText}>{GU.noOrdersMsg}</Text>
          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.shopBtn}>
            <LinearGradient colors={COLORS.gradientPink} style={styles.shopBtnGrad}>
              <Text style={styles.shopBtnText}>🍦 Shop Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={i => i.orderId || i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS.Processing;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.orderId}>#{item.orderId}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.itemsText}>
                  {item.items?.map(i => `${i.emoji} ${i.name} ×${i.qty}`).join(', ')}
                </Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.total}>₹{item.total}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={styles.addr}>📍 {item.address}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor: COLORS.background },
  header:      { paddingTop:48, paddingBottom: SPACING.md, paddingHorizontal: SPACING.base, flexDirection:'row', alignItems:'center', gap: SPACING.md },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' },
  backText:    { color: COLORS.white, fontSize: FONTS.xl, fontWeight: FONTS.bold },
  headerTitle: { fontSize: FONTS.lg, fontWeight: FONTS.black, color: COLORS.white },
  center:      { flex:1, justifyContent:'center', alignItems:'center', padding: SPACING.xl },
  emptyText:   { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.textDark, marginTop: SPACING.md },
  emptySubText:{ fontSize: FONTS.sm, color: COLORS.textLight, marginBottom: SPACING.lg },
  shopBtn:     { borderRadius: RADIUS.md, overflow:'hidden' },
  shopBtnGrad: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  shopBtnText: { color: COLORS.white, fontWeight: FONTS.black },
  list:        { padding: SPACING.base },
  card:        { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.small, borderLeftWidth:4, borderLeftColor: COLORS.primary },
  cardTop:     { flexDirection:'row', justifyContent:'space-between', marginBottom: SPACING.xs },
  orderId:     { fontSize: FONTS.sm, fontWeight: FONTS.black, color: COLORS.primary },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical:3 },
  statusText:  { fontSize: FONTS.xs, fontWeight: FONTS.bold },
  itemsText:   { fontSize: FONTS.sm, color: COLORS.textMedium, marginBottom: SPACING.sm },
  cardBottom:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  total:       { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark },
  date:        { fontSize: FONTS.xs, color: COLORS.textLight },
  addr:        { fontSize: FONTS.xs, color: COLORS.textLight, marginTop: SPACING.xs },
});