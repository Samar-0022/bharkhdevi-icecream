// ================================================
// components/AccountSheet.jsx — Account bottom sheet
// Opens via "B" logo tap on home screen header.
// ================================================

import React, { useState, useEffect, forwardRef, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Share,
} from 'react-native';
import BottomSheet, {
  BottomSheetView, BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import {
  auth, signOutUser, getUserProfile, updateUserProfile, applyReferCode,
} from '../services/firebase';

const OWNER_WHATSAPP = '917984468862'; // no + or spaces, for wa.me / whatsapp:// links

const AccountSheet = forwardRef((props, ref) => {
  const [profile,      setProfile]      = useState(null);
  const [expanded,     setExpanded]     = useState(null); // 'account' | 'refer' | null
  const [nameInput,    setNameInput]    = useState('');
  const [phoneInput,   setPhoneInput]   = useState('');
  const [referInput,   setReferInput]   = useState('');
  const [saving,        setSaving]       = useState(false);
  const [applyingCode,  setApplyingCode] = useState(false);

  const snapPoints = useMemo(() => ['78%'], []);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    getUserProfile(uid).then(data => {
      if (data) {
        setProfile(data);
        setNameInput(data.name || '');
        setPhoneInput(data.phone || '');
      }
    });
  }, [uid]);

  const renderBackdrop = useCallback(
    (backdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  function closeSheet() {
    ref.current?.close?.();
  }

  function toggleExpand(key) {
    setExpanded(prev => (prev === key ? null : key));
  }

  async function handleSaveAccount() {
    if (!uid) return;
    setSaving(true);
    try {
      await updateUserProfile(uid, { name: nameInput.trim(), phone: phoneInput.trim() });
      setProfile(p => ({ ...p, name: nameInput.trim(), phone: phoneInput.trim() }));
      Alert.alert('Saved ✅', 'Profile updated.');
      setExpanded(null);
    } catch (e) {
      Alert.alert('Error', 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleShareReferCode() {
    if (!profile?.referCode) return;
    try {
      await Share.share({
        message: `🍦 BharkhaDevi Ice Cream માં જોડાઓ! મારો refer code વાપરો અને 50% OFF મેળવો: ${profile.referCode}`,
      });
    } catch (e) {
      // user cancelled share — no-op
    }
  }

  async function handleApplyReferCode() {
    if (!uid || !referInput.trim()) return;
    setApplyingCode(true);
    try {
      const result = await applyReferCode(uid, referInput.trim().toUpperCase());
      Alert.alert(result.success ? 'Success 🎉' : 'Oops', result.msg);
      if (result.success) setReferInput('');
    } catch (e) {
      Alert.alert('Error', 'Could not apply code. Try again.');
    } finally {
      setApplyingCode(false);
    }
  }

  function handleOrders() {
    closeSheet();
    router.push('/orders');
  }

  function handleLocation() {
    closeSheet();
    router.push('/loaction');
  }

  function handlePreorder() {
    closeSheet();
    router.push('/preorder');
  }

  async function handleSupport() {
    const text = encodeURIComponent('નમસ્તે! મને ઓર્ડર વિશે મદદ જોઈએ છે.');
    const appUrl = `whatsapp://send?phone=${OWNER_WHATSAPP}&text=${text}`;
    const webUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${text}`;
    try {
      const canOpen = await Linking.canOpenURL(appUrl);
      await Linking.openURL(canOpen ? appUrl : webUrl);
    } catch (e) {
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('Error', 'Could not open WhatsApp.');
      });
    }
  }

  function handleComingSoon(label) {
    Alert.alert('Coming Soon 🚧', `${label} is on its way!`);
  }

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          closeSheet();
          await signOutUser();
          router.replace('/');
        },
      },
    ]);
  }

  const MENU_ITEMS = [
    { key: 'account',  icon: '👤', label: 'મારું એકાઉન્ટ',        labelEn: 'My Account',     onPress: () => toggleExpand('account') },
    { key: 'orders',   icon: '📦', label: 'મારા ઓર્ડર',          labelEn: 'My Orders',      onPress: handleOrders },
    { key: 'support',  icon: '💬', label: 'કસ્ટમર સપોર્ટ',       labelEn: 'Customer Care',  onPress: handleSupport },
    { key: 'refer',    icon: '🎁', label: 'રેફર કરો અને કમાવો',   labelEn: 'Refer & Earn',   onPress: () => toggleExpand('refer') },
    { key: 'wishlist', icon: '❤️', label: 'વિશલિસ્ટ',            labelEn: 'Wishlist',       onPress: () => handleComingSoon('Wishlist') },
    { key: 'preorder', icon: '📅', label: 'પ્રી-ઓર્ડર (બલ્ક)',    labelEn: 'Preorder (Bulk)', onPress: handlePreorder },
    { key: 'payment',  icon: '💳', label: 'પેમેન્ટ મેથડ',         labelEn: 'Payment Method', onPress: () => handleComingSoon('Payment Method') },
    { key: 'location', icon: '📍', label: 'લોકેશન અપડેટ કરો',     labelEn: 'Update Location', onPress: handleLocation },
    { key: 'logout',   icon: '🚪', label: 'લોગ આઉટ',             labelEn: 'Logout',         onPress: handleLogout, danger: true },
  ];

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.headerWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.name || auth.currentUser?.displayName || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.profileName}>
            {profile?.name || auth.currentUser?.displayName || 'Friend'}
          </Text>
          <Text style={styles.profileEmail}>{auth.currentUser?.email || ''}</Text>
        </View>
      </BottomSheetView>

      <BottomSheetScrollView contentContainerStyle={styles.listContent}>
        {MENU_ITEMS.map(item => (
          <View key={item.key}>
            <TouchableOpacity style={styles.row} onPress={item.onPress} activeOpacity={0.7}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <Text style={[styles.rowLabel, item.danger && styles.rowLabelDanger]}>
                {item.label} <Text style={styles.rowLabelEn}>({item.labelEn})</Text>
              </Text>
              <Text style={styles.chevron}>{expanded === item.key ? '︿' : '›'}</Text>
            </TouchableOpacity>

            {item.key === 'account' && expanded === 'account' && (
              <View style={styles.expandPanel}>
                <Text style={styles.inputLabel}>નામ / Name</Text>
                <BottomSheetTextInput
                  style={styles.input}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="તમારું નામ"
                />
                <Text style={styles.inputLabel}>ફોન / Phone</Text>
                <BottomSheetTextInput
                  style={styles.input}
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAccount} disabled={saving}>
                  <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.key === 'refer' && expanded === 'refer' && (
              <View style={styles.expandPanel}>
                <Text style={styles.referCodeLabel}>તમારો Refer Code:</Text>
                <Text style={styles.referCode}>{profile?.referCode || '...'}</Text>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShareReferCode}>
                  <Text style={styles.shareBtnText}>🔗 Share Code</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.inputLabel}>બીજાનો Code વાપરો / Apply a Code</Text>
                <BottomSheetTextInput
                  style={styles.input}
                  value={referInput}
                  onChangeText={setReferInput}
                  placeholder="BD12345"
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleApplyReferCode} disabled={applyingCode}>
                  <Text style={styles.saveBtnText}>{applyingCode ? 'Applying...' : 'Apply Code'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export default AccountSheet;

const styles = StyleSheet.create({
  sheetBg:         { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, ...SHADOWS.large },
  handle:          { backgroundColor: COLORS.border, width: 40 },

  headerWrap:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  avatar:          { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText:      { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.textOnPrimary },
  profileName:     { fontSize: FONTS.lg, fontWeight: FONTS.black, color: COLORS.textDark },
  profileEmail:    { fontSize: FONTS.sm, color: COLORS.textLight, marginTop: 2 },

  listContent:     { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, paddingTop: SPACING.sm },
  row:             { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, gap: SPACING.sm },
  rowIcon:         { fontSize: 20, width: 28 },
  rowLabel:        { flex: 1, fontSize: FONTS.base, fontWeight: FONTS.semiBold, color: COLORS.textDark },
  rowLabelDanger:  { color: COLORS.error },
  rowLabelEn:      { fontSize: FONTS.xs, color: COLORS.textLight, fontWeight: FONTS.regular },
  chevron:         { fontSize: FONTS.lg, color: COLORS.textLight },

  expandPanel:     { backgroundColor: COLORS.cream, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  inputLabel:      { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.textMedium, marginBottom: 6, marginTop: SPACING.sm },
  input:           { borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONTS.base, color: COLORS.textDark, backgroundColor: COLORS.white },
  saveBtn:         { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, alignItems: 'center', marginTop: SPACING.md },
  saveBtnText:     { color: COLORS.textOnPrimary, fontWeight: FONTS.black, fontSize: FONTS.base },

  referCodeLabel:  { fontSize: FONTS.sm, color: COLORS.textMedium },
  referCode:       { fontSize: FONTS.xxl, fontWeight: FONTS.black, color: COLORS.primaryDark, letterSpacing: 2, marginTop: 4, marginBottom: SPACING.sm },
  shareBtn:        { backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, alignItems: 'center' },
  shareBtnText:    { color: COLORS.white, fontWeight: FONTS.black, fontSize: FONTS.base },
  divider:         { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
});