// ================================================
// app/home.jsx — Main Home / Menu Screen
// BharkhaDevi Ice Cream App
// ================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Animated, RefreshControl, StatusBar,
  Dimensions, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router }         from 'expo-router';
import { Ionicons }       from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { GU } from '../constants/gujarati';
import { auth }            from '../services/firebase';
import { listenProducts, listenShopStatus } from '../services/firebase';
import { isShopOpen, SHOP_CONFIG }          from '../services/shopConfig';
import ProductCard  from '../components/ProductCard';
import ShopClosed   from '../components/ShopClosed';
import AccountSheet from '../components/AccountSheet';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'All',       label: 'બધું 🍦',      labelEn: 'All' },
  { key: 'Ice Cream', label: 'આઈસ્ક્રીમ 🍨', labelEn: 'Ice Cream' },
  { key: 'Milkshake', label: 'મિલ્કશેક 🥤',  labelEn: 'Milkshake' },
  { key: 'Sundae',    label: 'સન્ડે 🍧',      labelEn: 'Sundae' },
  { key: 'Waffle',    label: 'વેફ 🧇',        labelEn: 'Waffle' },
  { key: 'Dessert',   label: 'ડેઝર્ટ 🍮',    labelEn: 'Dessert' },
  { key: 'Beverage',  label: 'પીણું ☕',      labelEn: 'Beverage' },
];

export default function HomeScreen() {
  // ── State ─────────────────────────────────────
  const [products,    setProducts]    = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [search,      setSearch]      = useState('');
  const [activecat,   setActiveCat]   = useState('All');
  const [shopOpen,    setShopOpen]    = useState(true);
  const [shopMsg,     setShopMsg]     = useState('');
  const [cartCount,   setCartCount]   = useState(0);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loading,     setLoading]     = useState(true);
  const user = auth.currentUser;

  // ── Animations ────────────────────────────────
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const cartBounce = useRef(new Animated.Value(1)).current;

  // ── Account bottom sheet ref ────────────────────
  // NOTE: <AccountSheet /> component not built yet — wiring the trigger now so
  // this file is ready the moment that component lands. Optional chaining
  // means tapping "B" is a safe no-op until then (no crash, no missing import).
  const accountSheetRef = useRef(null);

  // ── Effects ───────────────────────────────────
  useEffect(() => {
    // Animate header in
    Animated.parallel([
      Animated.spring(headerAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim,   { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Listen to products (real-time)
    const unsubProducts = listenProducts(data => {
      setProducts(data);
      applyFilter(data, activecat, search);
      setLoading(false);
    });

    // Listen to shop status (real-time from Firebase)
    const unsubShop = listenShopStatus(status => {
      setShopOpen(status.isOpen ?? isShopOpen());
      setShopMsg(status.message || '');
    });

    // Load cart count
    loadCartCount();

    return () => { unsubProducts(); unsubShop(); };
  }, []);

  useEffect(() => {
    applyFilter(products, activecat, search);
  }, [search, activecat, products]);

  // ── Filter Logic ──────────────────────────────
  function applyFilter(data, cat, q) {
    let result = data;
    if (cat !== 'All') result = result.filter(p => p.cat === cat);
    if (q.trim()) {
      const lower = q.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        (p.nameGu || '').includes(lower) ||
        p.desc.toLowerCase().includes(lower)
      );
    }
    setFiltered(result);
  }

  function loadCartCount() {
    // Read from global cart state / AsyncStorage
    // Simple placeholder — will be managed by cart.jsx
    setCartCount(0);
  }

  function bounceCart() {
    Animated.sequence([
      Animated.spring(cartBounce, { toValue: 1.4, friction: 3, useNativeDriver: true }),
      Animated.spring(cartBounce, { toValue: 1,   friction: 3, useNativeDriver: true }),
    ]).start();
  }

  function handleAddToCart(product) {
    bounceCart();
    setCartCount(c => c + 1);
    // Cart logic handled in cart.jsx via global state
  }

  function handleOpenAccount() {
    accountSheetRef.current?.expand?.();
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // ── HEADER ────────────────────────────────────
  const Header = () => (
    <Animated.View style={{ transform: [{ translateY: headerAnim }] }}>
      <LinearGradient colors={COLORS.gradientBrand} style={styles.header}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />

        {/* Top row */}
        <View style={styles.headerTop}>
          {/* Logo + Name — tap opens account bottom sheet */}
          <TouchableOpacity
            style={styles.logoRow}
            onPress={handleOpenAccount}
            activeOpacity={0.75}
          >
            <View style={styles.headerLogo}>
              <Text style={styles.headerLogoB}>B</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>BharkhaDevi</Text>
              <Text style={styles.headerSub}>ICE CREAM 🍦</Text>
            </View>
          </TouchableOpacity>

          {/* Cart Button */}
          <TouchableOpacity onPress={() => router.push('/cart')} activeOpacity={0.8}>
            <Animated.View style={[styles.cartBtn, { transform: [{ scale: cartBounce }] }]}>
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>
          {GU.hello}, {user?.displayName?.split(' ')[0] || 'Friend'}! 👋
        </Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            autoFocus={false}
            blurOnSubmit={false}
            placeholder={GU.searchHint}
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // ── PROMO BANNER ──────────────────────────────
  const PromoBanner = () => (
    <LinearGradient colors={[COLORS.secondary, COLORS.primary]} style={styles.promo}>
      <View>
        <Text style={styles.promoTitle}>🎉 {SHOP_CONFIG.offers.firstOrderDiscount}% OFF</Text>
        <Text style={styles.promoText}>{GU.offerText}</Text>
      </View>
      <TouchableOpacity style={styles.promoBtn} activeOpacity={0.8}>
        <Text style={styles.promoBtnText}>{GU.offerBtn}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  // ── CATEGORIES ────────────────────────────────
  const Categories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.catList}
    >
      {CATEGORIES.map(cat => (
        <TouchableOpacity
          key={cat.key}
          onPress={() => setActiveCat(cat.key)}
          activeOpacity={0.8}
        >
          {activecat === cat.key ? (
            <LinearGradient colors={COLORS.gradientPink} style={styles.catPillActive}>
              <Text style={styles.catTextActive}>{cat.label}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.catPill}>
              <Text style={styles.catText}>{cat.label}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // ── SECTION HEADER ────────────────────────────
  const SectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>🌟 {GU.ourMenu}</Text>
      <Text style={styles.sectionCount}>{filtered.length} items</Text>
    </View>
  );

  // ── SHOP CLOSED ───────────────────────────────
  if (!shopOpen) {
    return (
      <View style={{ flex: 1 }}>
        <Header />
        <ShopClosed message={shopMsg} />
      </View>
    );
  }

  // ── LOADING ───────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientSplash} style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={COLORS.primaryDark} />
        <Text style={styles.loadingText}>{GU.loading}</Text>
      </LinearGradient>
    );
  }

  // ── MAIN RENDER ───────────────────────────────
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            <Header />
            <PromoBanner />
            <Categories />
            <SectionHeader />
          </>
        }
        renderItem={({ item, index }) => (
          <ProductCard
            product={item}
            index={index}
            onAddToCart={() => handleAddToCart(item)}
            onBuyNow={() => {
              router.push({ pathname: '/payment', params: { buyNow: JSON.stringify([{ ...item, qty: 1 }]) } });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🍦</Text>
            <Text style={styles.emptyText}>કોઈ items મળ્યા નહિ</Text>
            <Text style={styles.emptySubText}>Try a different search!</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryDark]} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <AccountSheet ref={accountSheetRef} />
    </Animated.View>
  );
}

// ── STYLES ────────────────────────────────────────
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  loadingCenter:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:    { color: COLORS.textOnPrimary, marginTop: SPACING.md, fontSize: FONTS.base, fontWeight: FONTS.bold },

  // Header — shrunk + shifted up per request
  header:         { paddingTop: 36, paddingBottom: SPACING.base, paddingHorizontal: SPACING.base },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  logoRow:        { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  headerLogo:     { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerLogoB:    { fontSize: 19, fontWeight: FONTS.black, color: COLORS.primaryDark },
  headerTitle:    { fontSize: FONTS.md, fontWeight: FONTS.black, color: COLORS.textOnPrimary },
  headerSub:      { fontSize: FONTS.xs, color: COLORS.textOnPrimary, opacity: 0.75 },

  // Cart
  cartBtn:        { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  cartIcon:       { fontSize: 20 },
  cartBadge:      { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText:  { fontSize: 10, fontWeight: FONTS.black, color: COLORS.white },

  // Greeting
  greeting:       { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textOnPrimary, marginBottom: SPACING.sm },

  // Search
  searchWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  searchIcon:     {},
  searchInput:    { flex: 1, fontSize: FONTS.sm, color: COLORS.textDark },

  // Promo
  promo:          { margin: SPACING.base, borderRadius: RADIUS.lg, padding: SPACING.base, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.medium },
  promoTitle:     { fontSize: FONTS.xl,  fontWeight: FONTS.black, color: COLORS.textOnPrimary },
  promoText:      { fontSize: FONTS.xs,  color: COLORS.textOnPrimary, opacity: 0.85, marginTop: 2 },
  promoBtn:       { backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  promoBtnText:   { color: COLORS.primaryDark, fontSize: FONTS.sm, fontWeight: FONTS.black },

  // Categories
  catList:        { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: SPACING.sm },
  catPill:        { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.border },
  catPillActive:  { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  catText:        { fontSize: FONTS.sm, fontWeight: FONTS.bold,  color: COLORS.textMedium },
  catTextActive:  { fontSize: FONTS.sm, fontWeight: FONTS.black, color: COLORS.textOnPrimary },

  // Section
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm },
  sectionTitle:   { fontSize: FONTS.lg, fontWeight: FONTS.black, color: COLORS.textDark },
  sectionCount:   { fontSize: FONTS.sm, color: COLORS.textLight },

  // Grid
  row:            { paddingHorizontal: SPACING.sm },
  listContent:    { paddingBottom: SPACING.xxl },

  // Empty
  emptyWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl },
  emptyIcon:      { fontSize: 60, marginBottom: SPACING.md },
  emptyText:      { fontSize: FONTS.lg, fontWeight: FONTS.bold, color: COLORS.textMedium },
  emptySubText:   { fontSize: FONTS.sm, color: COLORS.textLight, marginTop: SPACING.xs },
});