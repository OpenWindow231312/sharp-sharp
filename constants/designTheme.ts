// Shap Shap brand tokens — the single canonical design-system file.
// constants/theme.ts (Colors light/dark) is a thin pass-through onto these
// values so the Expo-boilerplate theming chain keeps working unchanged.
export const theme = {
  colors: {
    // Brand palette
    indigo: '#263B8C',
    indigoDeep: '#182864',
    marigold: '#FFB627',
    protea: '#FF5F45',
    highveld: '#1FA45C',
    beadwork: '#E63888',
    paper: '#FFF8EC',
    paperAlt: '#FBEFD6',
    card: '#FFFFFF',
    ink: '#241C15',
    inkSoft: '#6B6055',
    borderColor: 'rgba(38,59,140,0.15)',

    // Component-facing aliases — keep existing component APIs stable while
    // the underlying values move to the Shap Shap brand palette above.
    background: '#FFF8EC',
    surface: '#FBEFD6',
    border: 'rgba(38,59,140,0.15)',
    text: '#241C15',
    textMuted: '#6B6055',
    primary: '#263B8C',
    primaryText: '#FFFFFF',
    secondary: '#FFFFFF',
    secondaryText: '#263B8C',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 14,
    md: 20,
    lg: 28,
    pill: 999,
  },
  fontSize: {
    sm: 12,
    body: 15,
    heading: 20,
    display: 30,
  },
  fonts: {
    displaySemibold: 'Baloo2_600SemiBold',
    displayBold: 'Baloo2_700Bold',
    displayExtraBold: 'Baloo2_800ExtraBold',
    body: 'PlusJakartaSans_400Regular',
    bodyMedium: 'PlusJakartaSans_500Medium',
    bodySemibold: 'PlusJakartaSans_600SemiBold',
    bodyBold: 'PlusJakartaSans_700Bold',
    mono: 'IBMPlexMono_500Medium',
  },
  shadow: {
    card: {
      shadowColor: '#263B8C',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.2,
      shadowRadius: 28,
      elevation: 8,
    },
    soft: {
      shadowColor: '#241C15',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
  },
  // Four pattern motifs, each scoped to one job — see components/ui/PatternFill.tsx
  patterns: {
    chevron: { fg: '#FFB627', bg: '#263B8C' },
    diamond: { fg: 'rgba(255,255,255,0.55)', bg: '#FF5F45' },
    triangle: { fg: 'rgba(255,255,255,0.5)', bg: '#1FA45C' },
    beadscatter: { fg: 'rgba(255,255,255,0.85)', bg: '#E63888' },
  },
  tapTarget: 48,
} as const;
