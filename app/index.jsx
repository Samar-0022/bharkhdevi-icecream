import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { GU } from '../constants/gujarati';
import { auth, db, signInEmail, signUpEmail, onAuthChange } from '../services/firebase';

const { width, height } = Dimensions.get('window');

GoogleSignin.configure({
  webClientId: '517542560333-rgl0c3o2hfbvfkpqcale9fspthst3q0o.apps.googleusercontent.com',
});

export default function AuthScreen() {
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSplash,    setIsSplash]    = useState(true);
  const [isSignUp,    setIsSignUp]    = useState(false);
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error,       setError]       = useState('');
  const [showPass,    setShowPass]    = useState(false);

  const logoScale = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onAuthChange(user => {
      if (user) router.replace('/home');
      else startSplash();
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  function startSplash() {
    Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
    setTimeout(() => {
      setIsSplash(false);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 6,   useNativeDriver: true }),
      ]).start();
    }, 2500);
  }

  function shakeError() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function validate() {
    if (isSignUp && !name.trim())                    { setError('નામ દાખલ કરો'); shakeError(); return false; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('માન્ય ઇમેઇલ દાખલ કરો'); shakeError(); return false; }
    if (password.length < 6)                          { setError('પાસવર્ડ ૬+ અક્ષર જોઈએ'); shakeError(); return false; }
    return true;
  }

  async function handleAuth() {
    setError('');
    if (!validate()) return;
    setAuthLoading(true);
    try {
      if (isSignUp) await signUpEmail(email.trim(), password, name.trim());
      else          await signInEmail(email.trim(), password);
      router.replace('/home');
    } catch (err) {
      let msg = 'કંઈક ખોટું થયું';
      if (err.code === 'auth/email-already-in-use')   msg = 'Email already registered!';
      if (err.code === 'auth/wrong-password')          msg = 'Wrong password!';
      if (err.code === 'auth/user-not-found')          msg = 'No account found. Sign up!';
      if (err.code === 'auth/too-many-requests')       msg = 'Too many attempts. Try later!';
      if (err.code === 'auth/network-request-failed')  msg = 'No internet!';
      setError(msg); shakeError();
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setAuthLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo;
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || '',
          email: user.email,
          createdAt: serverTimestamp(),
          referCode: 'BD' + Math.random().toString(36).substring(2,7).toUpperCase(),
          referCount: 0, usedCoupons: [],
        });
      }
      router.replace('/home');
    } catch (err) {
      setError('Google login failed!');
    }
    setAuthLoading(false);
  }

  if (isLoading) return (
    <LinearGradient colors={COLORS.gradientSplash} style={styles.fullCenter}>
      <ActivityIndicator size="large" color={COLORS.white} />
    </LinearGradient>
  );

  if (isSplash) return (
    <LinearGradient colors={COLORS.gradientSplash} style={styles.splash}>
      <Animated.View style={[styles.splashLogo, { transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoB}>B</Text>
        </View>
      </Animated.View>
      <Animated.Text style={[styles.splashTitle, { transform: [{ scale: logoScale }] }]}>BharkhaDevi</Animated.Text>
      <Animated.Text style={[styles.splashSub,   { transform: [{ scale: logoScale }] }]}>ICE CREAM 🍦</Animated.Text>
      <View style={styles.splashDots}>
        {[COLORS.white, COLORS.yellow, COLORS.accent].map((c,i) => (
          <View key={i} style={[styles.dot, { backgroundColor: c }]} />
        ))}
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={[COLORS.yellow, COLORS.secondary, COLORS.primary]} style={styles.authBg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">

          <Animated.View style={[styles.authLogoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.authLogoCircle}>
              <Text style={styles.authLogoB}>B</Text>
            </View>
            <Text style={styles.authAppName}>BharkhaDevi</Text>
            <Text style={styles.authAppSub}>ICE CREAM 🍦</Text>
          </Animated.View>

          <Animated.View style={[styles.authCard, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { translateX: shakeAnim }]
          }]}>
            <Text style={styles.authTitle}>
              {isSignUp ? 'નોંધણી કરો 🎉' : GU.welcomeBack}
            </Text>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {isSignUp && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>👤 {GU.name}</Text>
                <TextInput
                  style={styles.input} value={name} onChangeText={setName}
                  placeholder="તમારું નામ / Your Name"
                  placeholderTextColor={COLORS.textLight} autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>📧 {GU.email}</Text>
              <TextInput
                style={styles.input} value={email} onChangeText={setEmail}
                placeholder="example@email.com" placeholderTextColor={COLORS.textLight}
                keyboardType="email-address" autoCapitalize="none" autoComplete="email"
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>🔒 {GU.password}</Text>
              <View style={styles.passWrap}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={password} onChangeText={setPassword}
                  placeholder="••••••" placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPass} autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.authBtn} onPress={handleAuth} disabled={authLoading} activeOpacity={0.85}>
              <LinearGradient colors={COLORS.gradientPink} style={styles.authBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                {authLoading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.authBtnText}>{isSignUp ? '🎉 ' + GU.signUp : '🚀 ' + GU.signIn}</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={authLoading} activeOpacity={0.85}>
              <Text style={styles.googleBtnText}>🔵 Google થી Sign In કરો</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{isSignUp ? GU.haveAccount : GU.noAccount}</Text>
              <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(''); }}>
                <Text style={styles.switchLink}>{isSignUp ? GU.signIn : GU.signUp}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.secureNote}>🔒 Firebase Secured Authentication</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullCenter:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splash:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splashLogo:     { marginBottom: SPACING.lg },
  logoCircle:     { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.large },
  logoB:          { fontSize: 64, fontWeight: FONTS.black, color: COLORS.primary },
  splashTitle:    { fontSize: FONTS.epic, fontWeight: FONTS.black, color: COLORS.white },
  splashSub:      { fontSize: FONTS.xl, fontWeight: FONTS.bold, color: COLORS.white, marginTop: 4 },
  splashDots:     { flexDirection: 'row', gap: 8, marginTop: SPACING.xl },
  dot:            { width: 10, height: 10, borderRadius: 5 },
  authBg:         { flex: 1 },
  authScroll:     { flexGrow: 1, justifyContent: 'center', padding: SPACING.base },
  authLogoWrap:   { alignItems: 'center', marginBottom: SPACING.lg },
  authLogoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium, marginBottom: SPACING.sm },
  authLogoB:      { fontSize: 44, fontWeight: FONTS.black, color: COLORS.primary },
  authAppName:    { fontSize: FONTS.xxl, fontWeight: FONTS.black, color: COLORS.white },
  authAppSub:     { fontSize: FONTS.md, fontWeight: FONTS.bold, color: COLORS.white, opacity: 0.9 },
  authCard:       { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOWS.large },
  authTitle:      { fontSize: FONTS.xl, fontWeight: FONTS.black, color: COLORS.textDark, marginBottom: SPACING.base, textAlign: 'center' },
  errorBox:       { backgroundColor: '#FFF5F5', borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.error },
  errorText:      { color: COLORS.error, fontSize: FONTS.sm, fontWeight: FONTS.semiBold },
  inputWrap:      { marginBottom: SPACING.md },
  inputLabel:     { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.textMedium, marginBottom: 6 },
  input:          { borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.base, color: COLORS.textDark, backgroundColor: '#FFF8FF' },
  passWrap:       { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: '#FFF8FF', overflow: 'hidden' },
  eyeBtn:         { padding: SPACING.md },
  eyeText:        { fontSize: FONTS.lg },
  authBtn:        { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm, marginBottom: SPACING.sm },
  authBtnGrad:    { padding: SPACING.base, alignItems: 'center' },
  authBtnText:    { color: COLORS.white, fontSize: FONTS.base, fontWeight: FONTS.black },
  googleBtn:      { borderRadius: RADIUS.md, padding: SPACING.base, alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#4285F4', marginBottom: SPACING.base },
  googleBtnText:  { color: '#4285F4', fontSize: FONTS.base, fontWeight: FONTS.black },
  switchRow:      { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  switchText:     { color: COLORS.textLight, fontSize: FONTS.sm },
  switchLink:     { color: COLORS.primary, fontSize: FONTS.sm, fontWeight: FONTS.bold },
  secureNote:     { textAlign: 'center', marginTop: SPACING.md, fontSize: FONTS.xs, color: COLORS.textLight },
});