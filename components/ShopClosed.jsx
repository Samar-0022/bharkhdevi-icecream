// ================================================
// components/ShopClosed.jsx — Shop Closed Screen
// BharkhaDevi Ice Cream App
// ================================================

import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { SHOP_CONFIG } from '../services/shopConfig';

const { width, height } = Dimensions.get('window');

export default function ShopClosed({ message }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    // Continuous bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -15, duration: 800, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const displayMsg = message
    || SHOP_CONFIG.closedMessage
    || 'અત્યારે અમે બંધ છીએ.\nકૃપા કરીને પછી ફરી આવો! 🙏';

  return (
    <LinearGradient
      colors={['#FFF8F0', '#FFE4F0', '#FFF0F7']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Animated Ice Cream */}
        <Animated.Text style={[styles.bigEmoji, {
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ]
        }]}>
          🍦
        </Animated.Text>

        {/* Closed Badge */}
        <View style={styles.closedBadge}>
          <View style={styles.closedDot} />
          <Text style={styles.closedBadgeText}>દુકાન બંધ છે</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>અત્યારે બંધ! 😴</Text>
        <Text style={styles.titleEn}>We're Closed Right Now</Text>

        {/* Message */}
        <View style={styles.msgCard}>
          <Text style={styles.msg}>{displayMsg}</Text>
        </View>

        {/* Timing Info */}
        <View style={styles.timingCard}>
          <Text style={styles.timingTitle}>⏰ Shop Timing</Text>
          <View style={styles.timingRow}>
            <Text style={styles.timingLabel}>ખુલવાનો સમય / Opens:</Text>
            <Text style={styles.timingValue}>{SHOP_CONFIG.openTime} AM</Text>
          </View>
          <View style={styles.timingRow}>
            <Text style={styles.timingLabel}>બંધ થવાનો સમય / Closes:</Text>
            <Text style={styles.timingValue}>{SHOP_CONFIG.closeTime} PM</Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryText}>
            📍 ડિલિવરી ફક્ત બરડોલી વિસ્તારમાં
          </Text>
          <Text style={styles.deliveryTextEn}>
            Delivery only in Bardoli area
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          BharkhaDevi Ice Cream 🍦{'\n'}
          બરડોલીની સૌથી મીઠી આઈસ્ક્રીમ!
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  content:      { alignItems: 'center', width: '100%' },

  bigEmoji:     { fontSize: 100, marginBottom: SPACING.lg },

  closedBadge:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: '#FFE4E4', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, marginBottom: SPACING.md },
  closedDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  closedBadgeText: { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.error },

  title:        { fontSize: FONTS.xxxl, fontWeight: FONTS.black, color: COLORS.textDark, textAlign: 'center' },
  titleEn:      { fontSize: FONTS.base,  fontWeight: FONTS.medium, color: COLORS.textLight, marginBottom: SPACING.lg },

  msgCard:      { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, width: '100%', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border },
  msg:          { fontSize: FONTS.base, color: COLORS.textMedium, textAlign: 'center', lineHeight: 24 },

  timingCard:   { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, width: '100%', borderWidth: 2, borderColor: '#FFE4F0' },
  timingTitle:  { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark, marginBottom: SPACING.sm, textAlign: 'center' },
  timingRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  timingLabel:  { fontSize: FONTS.sm, color: COLORS.textMedium },
  timingValue:  { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.primary },

  deliveryInfo: { alignItems: 'center', marginBottom: SPACING.lg },
  deliveryText: { fontSize: FONTS.sm, color: COLORS.textMedium, fontWeight: FONTS.bold },
  deliveryTextEn:{ fontSize: FONTS.xs, color: COLORS.textLight },

  footer:       { fontSize: FONTS.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
});