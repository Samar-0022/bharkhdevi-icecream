import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const BARDOLI_CENTER = { lat: 21.1167, lng: 73.1167 };
const MAX_DISTANCE_KM = 10;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function LocationScreen() {
  const [loading,  setLoading]  = useState(false);
  const [detected, setDetected] = useState(null);
  const [inRange,  setInRange]  = useState(null);

  async function detectLocation() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission chahiye delivery ke liye.');
        setLoading(false); return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const dist = getDistance(latitude, longitude, BARDOLI_CENTER.lat, BARDOLI_CENTER.lng);
      const addr = await Location.reverseGeocodeAsync({ latitude, longitude });
      const area = addr[0]?.city || addr[0]?.district || 'Unknown';
      setDetected({ area, dist: dist.toFixed(1) });
      setInRange(dist <= MAX_DISTANCE_KM);
    } catch (e) {
      Alert.alert('Error', 'Location detect nahi hui. Try again.');
    }
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={COLORS.gradientBrand} style={styles.header}>
        <Text style={styles.headerTitle}>📍 Delivery Location</Text>
        <Text style={styles.headerSub}>Sirf Bardoli area mein delivery available</Text>
      </LinearGradient>

      <View style={styles.body}>
        <TouchableOpacity style={styles.detectBtn} onPress={detectLocation} disabled={loading}>
          <LinearGradient colors={COLORS.gradientPink} style={styles.detectBtnInner}>
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.detectBtnText}>📍 Meri Location Detect Karo</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        {detected && (
          <View style={[styles.resultCard, { borderColor: inRange ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.resultArea}>{detected.area}</Text>
            <Text style={styles.resultDist}>Bardoli thi {detected.dist} km</Text>
            {inRange
              ? <>
                  <Text style={styles.successText}>✅ Delivery available che!</Text>
                  <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/home')}>
                    <Text style={styles.continueBtnText}>Order Karo</Text>
                  </TouchableOpacity>
                </>
              : <Text style={styles.errorText}>❌ Sorry, abhi sirf Bardoli area mein delivery.</Text>
            }
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Delivery Zone</Text>
          <Text style={styles.infoText}>Bardoli + 10km radius</Text>
          <Text style={styles.infoText}>Delivery charge: ₹20 (₹500+ par free)</Text>
          <Text style={styles.infoText}>Support: +91 7984468862</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  content:         { flexGrow: 1 },
  header:          { paddingTop: 56, paddingBottom: 24, paddingHorizontal: SPACING.base, alignItems: 'center' },
  headerTitle:     { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.white },
  headerSub:       { fontSize: FONTS.sm, color: COLORS.white, opacity: 0.85, marginTop: 4 },
  body:            { padding: SPACING.base },
  detectBtn:       { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.base },
  detectBtnInner:  { padding: SPACING.base, alignItems: 'center' },
  detectBtnText:   { color: COLORS.white, fontWeight: FONTS.black, fontSize: FONTS.base },
  resultCard:      { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 2, marginBottom: SPACING.base, ...SHADOWS.small },
  resultArea:      { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.textDark },
  resultDist:      { fontSize: FONTS.sm, color: COLORS.textLight, marginBottom: SPACING.sm },
  successText:     { color: '#4CAF50', fontWeight: FONTS.bold, fontSize: FONTS.base, marginBottom: SPACING.sm },
  errorText:       { color: '#F44336', fontWeight: FONTS.bold, fontSize: FONTS.base },
  continueBtn:     { backgroundColor: '#4CAF50', borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  continueBtnText: { color: COLORS.white, fontWeight: FONTS.black },
  infoCard:        { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.small },
  infoTitle:       { fontSize: FONTS.base, fontWeight: FONTS.black, color: COLORS.textDark, marginBottom: SPACING.sm },
  infoText:        { fontSize: FONTS.sm, color: COLORS.textLight, marginBottom: 4 },
});