export interface GlassConfig {
  [key: string]: any;
}

/**
 * Nordic Warm Wood Design Tokens & Palette (Strict Enforcement)
 */
export const NORDIC_PALETTE = {
  charcoal: '#1F2933', // Deep fjord anchor
  fjord: '#6B7280',    // Cool slate midtone
  cloud: '#D1D5DB',    // Soft overcast tone
  snow: '#F7F7F2',     // Warm snowy surface
  wood: '#A68A64',     // Natural cedar accent
  woodLight: '#C2A882',
  woodDark: '#8A704C',
  semantic: {
    income: { light: '#2E7D5B', dark: '#4ADE80', bg: 'rgba(74, 222, 128, 0.10)' },
    expense: { light: '#C0564B', dark: '#F87171', bg: 'rgba(248, 113, 113, 0.10)' },
    transfer: { light: '#4A6FA5', dark: '#60A5FA', bg: 'rgba(96, 165, 250, 0.10)' },
    warning: { light: '#A68A64', dark: '#C2A882', bg: 'rgba(166, 138, 100, 0.10)' },
  },
} as const;

/**
 * Juniper & Coral Palette (Candle, Coral, Leaf, Juniper)
 */
export const JUNIPER_CORAL_PALETTE = {
  candle: '#EFE9D7',  // Warm candle cream surface
  coral: '#7D2826',   // Deep brick / terracotta coral red
  coralLight: '#E26865',
  coralDark: '#631E1D',
  leaf: '#898861',    // Natural moss / sage leaf midtone
  juniper: '#343723', // Deep juniper dark forest anchor
  juniperDark: '#202316',
  semantic: {
    income: { light: '#4A6B3D', dark: '#898861', bg: 'rgba(137, 136, 97, 0.15)' },
    expense: { light: '#7D2826', dark: '#E26865', bg: 'rgba(125, 40, 38, 0.15)' },
    transfer: { light: '#898861', dark: '#B5B38F', bg: 'rgba(137, 136, 97, 0.15)' },
    warning: { light: '#C26A3E', dark: '#E89066', bg: 'rgba(194, 106, 62, 0.15)' },
  },
} as const;

export interface ThemePaletteDefinition {
  id: 'nordic' | 'juniper_coral';
  name: string;
  enName: string;
  desc: string;
  colors: {
    key: string;
    name: string;
    hex: string;
    role: string;
  }[];
}

export const THEME_PALETTES: ThemePaletteDefinition[] = [
  {
    id: 'nordic',
    name: 'نوردیک چوب گرم',
    enName: 'Nordic Warm Wood',
    desc: 'الهام‌گرفته از اسکاندیناوی با چوب سدر، سنگ فیورد، زغال تیره و برف',
    colors: [
      { key: 'snow', name: 'برف کرمی', hex: '#F7F7F2', role: 'روشن / پایه' },
      { key: 'wood', name: 'چوب سدر', hex: '#A68A64', role: 'اکسنت اصلی' },
      { key: 'fjord', name: 'سنگ فیورد', hex: '#6B7280', role: 'ثانویه / مات' },
      { key: 'charcoal', name: 'ذغال نوردیک', hex: '#1F2933', role: 'تیره / عمیق' },
    ],
  },
  {
    id: 'juniper_coral',
    name: 'طبیعت ارس و مرجان',
    enName: 'Candle, Coral, Leaf & Juniper',
    desc: 'پالت طبیعی و چشم‌نواز شامل شمعی، مرجان گرم، برگ زیتونی و ارس جنگلی',
    colors: [
      { key: 'candle', name: 'Candle', hex: '#EFE9D7', role: 'شمعی / پایه روشن' },
      { key: 'coral', name: 'Coral', hex: '#7D2826', role: 'مرجانی / اکسنت' },
      { key: 'leaf', name: 'Leaf', hex: '#898861', role: 'برگ / زیتونی' },
      { key: 'juniper', name: 'Juniper', hex: '#343723', role: 'ارس / پایه تیره' },
    ],
  },
];

/**
 * Modern Glassmorphism Presets for UI elements (Nordic Warm Wood Edition)
 */
export const LIQUID_GLASS_PRESETS: Record<string, Partial<GlassConfig>> = {
  // Modern Hero Banner
  heroBanner: {
    blurAmount: 0.18,
    refraction: 0.38,
    chromAberration: 0.015,
    edgeHighlight: 0.16,
    specular: 0.14,
    fresnel: 1.0,
    cornerRadius: 24,
    zRadius: 20,
    tintStrength: 0.04,
    shadowOpacity: 0.14,
    shadowSpread: 18,
    shadowOffsetY: 6,
  },

  // Frosted Widget Card
  glassCard: {
    blurAmount: 0.25,
    refraction: 0.35,
    chromAberration: 0.02,
    edgeHighlight: 0.12,
    specular: 0.10,
    fresnel: 0.9,
    cornerRadius: 20,
    zRadius: 18,
    shadowOpacity: 0.12,
    shadowSpread: 16,
    shadowOffsetY: 4,
  },

  // Floating Header Capsule
  glassHeader: {
    blurAmount: 0.20,
    refraction: 0.40,
    chromAberration: 0.02,
    edgeHighlight: 0.18,
    specular: 0.15,
    fresnel: 1.0,
    cornerRadius: 32,
    zRadius: 20,
    shadowOpacity: 0.20,
    shadowSpread: 18,
    shadowOffsetY: 4,
  },

  // Floating Bottom Dock & Sidebar
  glassDock: {
    blurAmount: 0.25,
    refraction: 0.35,
    chromAberration: 0.02,
    edgeHighlight: 0.14,
    specular: 0.10,
    fresnel: 0.95,
    cornerRadius: 24,
    zRadius: 20,
    shadowOpacity: 0.20,
    shadowSpread: 16,
    shadowOffsetY: 6,
  },

  // Interactive Glass Button
  glassButton: {
    blurAmount: 0.15,
    refraction: 0.40,
    chromAberration: 0.02,
    edgeHighlight: 0.20,
    specular: 0.18,
    button: true,
    cornerRadius: 16,
    zRadius: 12,
    shadowOpacity: 0.18,
    shadowSpread: 12,
    shadowOffsetY: 3,
  },

  // Liquid Glass Pill
  glassPill: {
    blurAmount: 0.14,
    refraction: 0.45,
    chromAberration: 0.02,
    edgeHighlight: 0.24,
    specular: 0.20,
    fresnel: 1.1,
    cornerRadius: 24,
    zRadius: 18,
    button: true,
    bevelMode: 0,
    shadowOpacity: 0.15,
    shadowSpread: 14,
    shadowOffsetY: 4,
  },

  // Clean Crystal Widget
  crystalWidget: {
    blurAmount: 0.18,
    refraction: 0.50,
    chromAberration: 0.03,
    edgeHighlight: 0.22,
    specular: 0.20,
    fresnel: 1.1,
    cornerRadius: 20,
    zRadius: 20,
    opacity: 0.92,
    saturation: 0.10,
    tintStrength: 0.05,
    shadowOpacity: 0.18,
    shadowSpread: 20,
    shadowOffsetY: 6,
    button: false,
    bevelMode: 0,
  },
};
