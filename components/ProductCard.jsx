// ================================================
// components/ProductCard.jsx — Animated Product Card
// BharkhaDevi Ice Cream App
// ================================================

import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.base * 2 - SPACING.sm) / 2;

export default function ProductCard({ product, index, onAddToCart, onBuyNow }) {
  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function onPressIn() {
    Animated.spring(pressScale, { toValue: 0.95, useNativeDriver: true, friction: 5 }).start();
  }
  function onPressOut() {
    Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true, friction: 5 }).start();
  }

  function getAvgRating() {
    if (!product.ratings?.length) return 0;
    return (product.ratings.reduce((a, b) => a + b, 0) / product.ratings.length).toFixed(1);
  }

  function starsHTML(avg) {
    const n = Math.round(avg);
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= n ? '⭐' : '☆';
    return s;
  }

  const avg = getAvgRating();

  return (
    <Animated.View style={[
      styles.wrapper,
      {
        opacity:   fadeAnim,
        transform: [{ scale: scaleAnim }, { scale: pressScale }],
      }
    ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
      >
        {/* Image Area */}
        <View style={styles.imageWrap}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#FFF0F7', '#F0F8FF']} style={styles.imagePlaceholder}>
              <Text style={styles.emoji}>{product.emoji || '🍦'}</Text>
            </LinearGradient>
          )}

          {/* Badge */}
          {product.badge === 'bestseller' && (
            <View style={[styles.badge, { backgroundColor: COLORS.yellow }]}>
              <Text style={styles.badgeText}>⭐ Best</Text>
            </View>
          )}
          {product.badge === 'new' && (
            <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
              <Text style={[styles.badgeText, { color: COLORS.white }]}>✨ New</Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Name */}
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          {/* Gujarati name if available */}
          {product.nameGu && (
            <Text style={styles.nameGu} numberOfLines={1}>{product.nameGu}</Text>
          )}

          {/* Description */}
          <Text style={styles.desc} numberOfLines={2}>
            {product.desc}
          </Text>

          {/* Ratings */}
          {avg > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.stars}>{starsHTML(avg)}</Text>
              <Text style={styles.ratingCount}>({product.ratings.length})</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={onAddToCart}
              activeOpacity={0.8}
            >
              <Text style={styles.cartBtnText}>+ કાર્ટ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onBuyNow}
              activeOpacity={0.8}
              style={styles.buyBtnWrap}
            >
              <LinearGradient
                colors={COLORS.gradientPink}
                style={styles.buyBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buyBtnText}>ખરીદો</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper:       { width: CARD_WIDTH, margin: SPACING.xs },
  card:          { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.medium },

  // Image
  imageWrap:     { height: 130, position: 'relative' },
  image:         { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  emoji:         { fontSize: 48 },

  // Badge
  badge:         { position: 'absolute', top: 6, left: 6, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:     { fontSize: FONTS.xs, fontWeight: FONTS.black, color: COLORS.textDark },

  // Body
  body:          { padding: SPACING.sm },
  name:          { fontSize: FONTS.sm, fontWeight: FONTS.black, color: COLORS.textDark, marginBottom: 1 },
  nameGu:        { fontSize: FONTS.xs, color: COLORS.textMedium, marginBottom: 2 },
  desc:          { fontSize: FONTS.xs, color: COLORS.textLight,  lineHeight: 16, marginBottom: SPACING.xs },

  // Rating
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.xs },
  stars:         { fontSize: FONTS.xs },
  ratingCount:   { fontSize: FONTS.xs, color: COLORS.textLight },

  // Price
  priceRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm },
  price:         { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark },
  originalPrice: { fontSize: FONTS.xs,   fontWeight: FONTS.regular, color: COLORS.textLight, textDecorationLine: 'line-through' },

  // Buttons
  btnRow:        { flexDirection: 'row', gap: SPACING.xs },
  cartBtn:       { flex: 1, paddingVertical: 7, borderRadius: RADIUS.sm, backgroundColor: '#FFF0F7', borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cartBtnText:   { fontSize: FONTS.xs, fontWeight: FONTS.black, color: COLORS.primary },
  buyBtnWrap:    { flex: 1, borderRadius: RADIUS.sm, overflow: 'hidden' },
  buyBtn:        { paddingVertical: 7, alignItems: 'center' },
  buyBtnText:    { fontSize: FONTS.xs, fontWeight: FONTS.black, color: COLORS.white },
});