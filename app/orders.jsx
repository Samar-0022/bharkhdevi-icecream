// ================================================
// app/orders.jsx — My Orders tab
// BharkhaDevi Ice Cream App
// ================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { auth, listenUserOrders } from '../services/firebase';

const STATUS_LABELS = {
  pending:   { label: 'Pending',   color: COLORS.warning },
  confirmed: { label: 'Confirmed', color: COLORS.info },
  preparing: { label: 'Preparing', color: COLORS.secondary },
  ready:     { label: 'Ready',     color: COLORS.accent },
  delivered: { label: 'Delivered', color: COLORS.success },
  cancelled: { label: 'Cancelled', color: COLORS.error },
};

function formatDate(ts) {
  if (!ts?.toDate) return '';
  const d = ts.toDate();
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function OrderCard({ order }) {
  const statusInfo = STATUS_LABELS[order.status] || { label: order.status || 'Unknown', color: COLORS.textLight };
  const itemCount = Array.isArray(order.items) ? order.items.length : 0;
  const total = order.total ?? order.amount ?? null;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </View>
      <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.itemCount}>{itemCount} item{itemCount === 1 ? '' : 's'}</Text>
        {total !== null && <Text style={styles.total}>₹{total}</Text>}
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = listenUserOrders(uid, data => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primaryDark} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>મારા ઓર્ડર</Text>
        <Text style={styles.headerSub}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>કોઈ ઓર્ડર નથી</Text>
            <Text style={styles.emptySubText}>No orders yet — go grab some ice cream!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  header:        { paddingTop: 56, paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, backgroundColor: COLORS.primary },
  headerTitle:   { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.textOnPrimary },
  headerSub:     { fontSize: FONTS.sm, color: COLORS.textOnPrimary, opacity: 0.75 },

  listContent:   { padding: SPACING.base },
  card:          { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.small },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId:       { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark },
  statusBadge:   { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  statusText:    { fontSize: FONTS.xs, fontWeight: FONTS.bold, color: COLORS.white },
  orderDate:     { fontSize: FONTS.xs, color: COLORS.textLight, marginTop: 4 },
  cardBottom:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
  itemCount:     { fontSize: FONTS.sm, color: COLORS.textMedium },
  total:         { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.primaryDark },

  emptyWrap:     { alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxl },
  emptyIcon:     { fontSize: 60, marginBottom: SPACING.md },
  emptyText:     { fontSize: FONTS.lg, fontWeight: FONTS.bold, color: COLORS.textMedium },
  emptySubText:  { fontSize: FONTS.sm, color: COLORS.textLight, marginTop: SPACING.xs, textAlign: 'center' },
});