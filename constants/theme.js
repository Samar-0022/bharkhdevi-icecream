// ================================================
// theme.js — Colors, Fonts, Spacing
// BharkhaDevi Ice Cream App
// RETHEMED: white + yellow (main) + green (subtle accent)
// All original keys kept so existing imports never break —
// only hex values / gradient arrays changed.
// ================================================

export const COLORS = {
  // Primary Brand Colors — Yellow is now the main theme color
  primary:        '#FFD600',   // Bright yellow — main brand color
  primaryDark:    '#F2A900',   // Deep gold — use for text/icons that sit ON yellow or white (contrast)
  primaryLight:   '#FFF59D',   // Pale yellow — subtle surfaces/highlights

  secondary:      '#FFA726',   // Warm amber — gradient depth partner for primary
  secondaryLight: '#FFE0B2',

  accent:         '#4CAF50',   // Green — sparingly: badges, success states, tiny highlights
  accentLight:    '#81C784',

  purple:         '#6A1B9A',   // kept for backward compat (unused in new theme)
  purpleLight:    '#CE93D8',

  yellow:         '#FFD600',   // alias of primary, kept for back-compat references
  yellowLight:    '#FFF9C4',

  // UI Base
  white:          '#FFFFFF',
  cream:          '#FFFDF6',
  background:     '#FFFFFF',
  card:           '#FFFFFF',

  // Text
  textDark:       '#1A1A2E',
  textMedium:     '#555555',
  textLight:      '#888888',
  textWhite:      '#FFFFFF',
  textOnPrimary:  '#1A1A2E',   // dark text for legibility on yellow backgrounds

  // Status
  success:        '#4CAF50',
  error:          '#F44336',
  warning:        '#FF9800',
  info:           '#2196F3',

  // Borders
  border:         '#FFF3C4',   // pale yellow border tint (was pink)
  borderLight:    '#F5F5F5',

  // Overlay
  overlay:        'rgba(0,0,0,0.5)',
  overlayLight:   'rgba(0,0,0,0.3)',

  // Gradient arrays (for LinearGradient) — retheme: pink/orange/purple → yellow/amber/green family
  gradientPink:   ['#FFD600', '#FFC107'],            // key name kept for compat; now yellow-tone
  gradientOrange: ['#FFA726', '#FFD600'],
  gradientGreen:  ['#4CAF50', '#81C784'],
  gradientFull:   ['#FFD600', '#FFA726', '#4CAF50'],
  gradientBrand:  ['#FFD600', '#FFE066'],            // header — soft yellow, no orange/pink/purple
  gradientSplash: ['#FFD600', '#FFFFFF'],            // splash/loading — yellow to white
};

export const FONTS = {
  regular:    '400',
  medium:     '500',
  semiBold:   '600',
  bold:       '700',
  extraBold:  '800',
  black:      '900',

  xs:   10,
  sm:   12,
  md:   14,
  base: 16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 28,
  huge: 32,
  epic: 40,
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 40,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default { COLORS, FONTS, SPACING, RADIUS, SHADOWS };