// ================================================
// app/preorder.jsx — Bulk Preorder Form
// BharkhaDevi Ice Cream App
// ================================================

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { auth, sendPreorderRequest } from '../services/firebase';

export default function PreorderScreen() {
  const [qty,        setQty]        = useState('');
  const [dateNeeded,  setDateNeeded] = useState('');
  const [contact,     setContact]   = useState('');
  const [notes,       setNotes]     = useState('');
  const [submitting,  setSubmitting] = useState(false);

  function validate() {
    if (!qty.trim())       return 'Quantity જરૂરી છે';
    if (!dateNeeded.trim()) return 'Date જરૂરી છે';
    if (!contact.trim() || contact.trim().length < 10) return 'માન્ય Contact નંબર દાખલ કરો';
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { Alert.alert('Missing Info', err); return; }

    setSubmitting(true);
    try {
      await sendPreorderRequest({
        qty: qty.trim(),
        dateNeeded: dateNeeded.trim(),
        contact: contact.trim(),
        notes: notes.trim(),
        name: auth.currentUser?.displayName || '',
      });
      Alert.alert(
        'Sent! 🎉',
        'તમારી preorder request મોકલાઈ ગઈ છે. We will contact you soon.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('Error', 'Could not send preorder request. Please try again or contact us directly on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📅 પ્રી-ઓર્ડર (બલ્ક)</Text>
          <Text style={styles.headerSub}>Bulk Preorder Request</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>કેટલા / Quantity *</Text>
          <TextInput
            style={styles.input}
            value={qty}
            onChangeText={setQty}
            placeholder="દા.ત. 50 cups, 5 kg"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.inputLabel}>ક્યારે જોઈએ / Date Needed *</Text>
          <TextInput
            style={styles.input}
            value={dateNeeded}
            onChangeText={setDateNeeded}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.inputLabel}>Contact Number *</Text>
          <TextInput
            style={styles.input}
            value={contact}
            onChangeText={setContact}
            placeholder="9876543210"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>નોટ્સ / Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Flavors, event details, etc."
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
            {submitting
              ? <ActivityIndicator color={COLORS.textOnPrimary} />
              : <Text style={styles.submitText}>🚀 Send Request</Text>
            }
          </TouchableOpacity>

          <Text style={styles.note}>
            We'll reach out on WhatsApp / call to confirm your bulk order.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: COLORS.background },
  scroll:      { paddingBottom: SPACING.xxl },

  header:      { paddingTop: 56, paddingHorizontal: SPACING.base, paddingBottom: SPACING.lg, backgroundColor: COLORS.primary },
  backBtn:     { marginBottom: SPACING.sm },
  backText:    { fontSize: FONTS.base, fontWeight: FONTS.bold, color: COLORS.textOnPrimary },
  headerTitle: { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.textOnPrimary },
  headerSub:   { fontSize: FONTS.sm, color: COLORS.textOnPrimary, opacity: 0.75 },

  card:        { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, margin: SPACING.base, ...SHADOWS.medium },
  inputLabel:  { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.textMedium, marginBottom: 6, marginTop: SPACING.md },
  input:       { borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.base, color: COLORS.textDark, backgroundColor: COLORS.cream },
  textArea:    { minHeight: 90, textAlignVertical: 'top' },

  submitBtn:   { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.base, alignItems: 'center', marginTop: SPACING.lg, ...SHADOWS.small },
  submitText:  { color: COLORS.textOnPrimary, fontSize: FONTS.base, fontWeight: FONTS.black },
  note:        { textAlign: 'center', marginTop: SPACING.md, fontSize: FONTS.xs, color: COLORS.textLight },
});