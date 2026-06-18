import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Share, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { auth, db, signOutUser, getUserProfile, listenUserOrders, applyReferCode } from '../services/firebase';

export default function AccountScreen() {
  const [profile,  setProfile]  = useState(null);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refInput, setRefInput] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { router.replace('/'); return; }
    getUserProfile(user.uid).then(p => { setProfile(p); setLoading(false); });
    const unsub = listenUserOrders(user.uid, setOrders);
    return () => unsub();
  }, []);

  async function handleShare() {
    await Share.share({
      message: `BharkhaDevi Ice Cream app try karo! Mera refer code: ${profile?.referCode}\nInstall karo aur 50% OFF pao! 🍦`,
    });
  }

  async function handleApplyRefer() {
    if (!refInput.trim()) return;
    const res = await applyReferCode(user.uid, refInput.trim().toUpperCase());
    Alert.alert(res.success ? '🎉 Success!' : '❌ Error', res.msg);
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Pakka logout karvu che?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await signOutUser();
        router.replace('/');
      }},
    ]);
  }

  if (loading) return (
    <LinearGradient colors={COLORS.gradientSplash} style={styles.center}>
      <ActivityIndicator color={COLORS.white} size="large" />
    </LinearGradient>
  );

  const pastOrders   = orders.filter(o => ['delivered','cancelled'].includes(o.status));
  const activeOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradientBrand} style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.displayName?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {profile?.activeCoupon && (
          <View style={styles.couponBadge}>
            <Text style={styles.couponText}>🎟️ {profile.activeCoupon.code} — {profile.activeCoupon.discount}% OFF Active!</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>

        {/* Refer Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎁 Refer & Earn</Text>
          <Text style={styles.cardSub}>Friend ne refer karo → donone 50% OFF</Text>
          <View style={styles.codeRow}>
            <Text style={styles.referCode}>{profile?.referCode || '...'}</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardSub}>Friend no refer code apply karo:</Text>
          <View style={styles.inputRow}>
            <Text
              style={styles.referInput}
              onPress={() => {
                Alert.prompt('Refer Code', 'Friend no code daakhal karo', (text) => setRefInput(text));
              }}
            >
              {refInput || 'Enter Code...'}
            </Text>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyRefer}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Orders */}
        <Text style={styles.sectionTitle}> Active Orders ({activeOrders.length})</Text>
        {activeOrders.length === 0
          ? <Text style={styles.emptyText}>Koi active order nathi</Text>
          : activeOrders.map(o => <OrderCard key={o.id} order={o} />)
        }

        {/* Past Orders */}
        <Text style={styles.sectionTitle}> Past Orders ({pastOrders.length})</Text>
        {pastOrders.length === 0
          ? <Text style={styles.emptyText}>Koi past order nathi</Text>
          : pastOrders.map(o => <OrderCard key={o.id} order={o} />)
        }

        {/* Customer Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📞 Customer Support</Text>
          <Text style={styles.cardSub}>Owner: +91 7984468862</Text>
          <Text style={styles.cardSub}>WhatsApp pe message karo anytime</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}> Logout</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

function OrderCard({ order }) {
  const statusColor = {
    pending: '#ff4d00', confirmed: '#68869f',
    preparing: '#b2a8be', delivered: '#9fdca1', cancelled: '#770f07',
  };
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderRow}>
        <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
        <Text style={[styles.orderStatus, { color: statusColor[order.status] || '#000' }]}>
          {order.status?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.orderItems}>
        {order.items?.map(i => i.name).join(', ')}
      </Text>
      <Text style={styles.orderTotal}>Total: ₹{order.total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { paddingTop: 56, paddingBottom: 24, alignItems: 'center', paddingHorizontal: SPACING.base },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm, ...SHADOWS.medium },
  avatarText:   { fontSize: 36, fontWeight: FONTS.black, color: COLORS.primary },
  userName:     { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.white },
  userEmail:    { fontSize: FONTS.sm, color: COLORS.white, opacity: 0.85, marginTop: 2 },
  couponBadge:  { marginTop: SPACING.sm, backgroundColor: COLORS.yellow, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  couponText:   { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.textDark },
  body:         { padding: SPACING.base },
  card:         { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.small },
  cardTitle:    { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark, marginBottom: 4 },
  cardSub:      { fontSize: FONTS.sm, color: COLORS.textLight, marginBottom: SPACING.sm },
  codeRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  referCode:    { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.primary, letterSpacing: 2 },
  shareBtn:     { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  shareBtnText: { color: COLORS.white, fontWeight: FONTS.bold, fontSize: FONTS.sm },
  inputRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  referInput:   { flex: 1, borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONTS.base, color: COLORS.textDark },
  applyBtn:     { backgroundColor: COLORS.secondary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  applyBtnText: { color: COLORS.white, fontWeight: FONTS.bold, fontSize: FONTS.sm },
  sectionTitle: { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark, marginBottom: SPACING.sm, marginTop: SPACING.sm },
  emptyText:    { fontSize: FONTS.sm, color: COLORS.textLight, marginBottom: SPACING.md },
  orderCard:    { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.small },
  orderRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId:      { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.textDark },
  orderStatus:  { fontSize: FONTS.xs, fontWeight: FONTS.black },
  orderItems:   { fontSize: FONTS.xs, color: COLORS.textLight, marginBottom: 4 },
  orderTotal:   { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.primary },
  logoutBtn:    { backgroundColor: '#FFF0F0', borderRadius: RADIUS.md, padding: SPACING.base, alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.xxl, borderWidth: 1, borderColor: '#FFB3B3' },
  logoutText:   { color: COLORS.error, fontWeight: FONTS.black, fontSize: FONTS.base },
});