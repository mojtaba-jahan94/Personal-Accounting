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

import { ThemePaletteId } from '../types';

export interface ThemePaletteDefinition {
  id: ThemePaletteId;
  name: string;
  enName: string;
  desc: string;
  gradient: string;
  colors: {
    key: string;
    name: string;
    hex: string;
    role: string;
  }[];
}

export const THEME_PALETTES: ThemePaletteDefinition[] = [
  {
    id: 'cyber_violet',
    name: 'سایبر ویولت کیهانی',
    enName: 'VisionOS Cyber Violet',
    desc: 'پالت مدرن فین‌تک با بنفش نئونی، سایان کریستالی و سیاه ابسیدین',
    gradient: 'from-violet-600 via-indigo-600 to-cyan-500',
    colors: [
      { key: 'obsidian', name: 'ابسیدین', hex: '#08070B', role: 'پایه تیره' },
      { key: 'violet', name: 'بنفش سایبری', hex: '#8B5CF6', role: 'اکسنت نئونی' },
      { key: 'indigo', name: 'ایندیگو فضایی', hex: '#6366F1', role: 'ثانویه نوری' },
      { key: 'cyan', name: 'سایان کریستالی', hex: '#06B6D4', role: 'پرتو نوری' },
    ],
  },
  {
    id: 'emerald_neon',
    name: 'امرالد نئون سایبری',
    enName: 'Cyber Emerald & Mint',
    desc: 'پالت لوکس ثروت با زمرد نئونی، نعنایی درخشان و فیروزه‌ای عمیق',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-400',
    colors: [
      { key: 'forest', name: 'ابسیدین زمردی', hex: '#050D0A', role: 'پایه تیره' },
      { key: 'emerald', name: 'زمرد نئونی', hex: '#10B981', role: 'اکسنت نئونی' },
      { key: 'mint', name: 'نعنایی لوکس', hex: '#059669', role: 'ثانویه' },
      { key: 'cyan', name: 'فیروزه‌ای', hex: '#14B8A6', role: 'هایلایت' },
    ],
  },
  {
    id: 'quantum_gold',
    name: 'کوانتوم گلد خورشیدی',
    enName: 'Quantum Solar Gold',
    desc: 'پالت فاخر با طلای خورشیدی، کهربایی غنی و برنز بلورین',
    gradient: 'from-amber-400 via-orange-500 to-yellow-500',
    colors: [
      { key: 'dark_amber', name: 'زغال کهربایی', hex: '#0D0A05', role: 'پایه تیره' },
      { key: 'gold', name: 'طلای کوانتوم', hex: '#F59E0B', role: 'اکسنت نئونی' },
      { key: 'amber', name: 'کهربایی گرم', hex: '#D97706', role: 'ثانویه' },
      { key: 'solar', name: 'خورشیدی روشن', hex: '#FDE047', role: 'هایلایت' },
    ],
  },
  {
    id: 'cyber_cyan',
    name: 'سایان کریستالی اقیانوس',
    enName: 'Crystal Electric Cyan',
    desc: 'پالت آینده‌نگر با آبی آسمانی الکتریک، سایان یخی و کبالت عمیق',
    gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    colors: [
      { key: 'ocean_depth', name: 'عمق اقیانوس', hex: '#050B10', role: 'پایه تیره' },
      { key: 'cyan', name: 'سایان الکتریک', hex: '#06B6D4', role: 'اکسنت نئونی' },
      { key: 'sky', name: 'آبی کوانتوم', hex: '#0EA5E9', role: 'ثانویه' },
      { key: 'cobalt', name: 'کبالت فضایی', hex: '#3B82F6', role: 'هایلایت' },
    ],
  },
  {
    id: 'cyber_crimson',
    name: 'سایبر یاقوت و رز نئون',
    enName: 'Cyber Crimson & Ruby',
    desc: 'پالت پرانرژی با یاقوت سرخ کریستالی، ارغوانی نئونی و روبی آتشین',
    gradient: 'from-rose-500 via-pink-600 to-fuchsia-600',
    colors: [
      { key: 'void_ruby', name: 'ابسیدین یاقوت', hex: '#0D0608', role: 'پایه تیره' },
      { key: 'crimson', name: 'یاقوت سرخ', hex: '#F43F5E', role: 'اکسنت نئونی' },
      { key: 'fuchsia', name: 'ارغوانی نئونی', hex: '#D946EF', role: 'ثانویه' },
      { key: 'coral', name: 'مرجانی کریستالی', hex: '#FB7185', role: 'هایلایت' },
    ],
  },
  {
    id: 'nordic',
    name: 'نوردیک استیل مینیمال',
    enName: 'Nordic Clean Slate',
    desc: 'پالت مینیمالیستی و صنعتی با تیتانیوم نقره‌ای، خاکستری یخی و گرافیت',
    gradient: 'from-slate-400 via-zinc-400 to-stone-500',
    colors: [
      { key: 'graphite', name: 'گرافیت تیره', hex: '#0A0C10', role: 'پایه تیره' },
      { key: 'titanium', name: 'تیتانیوم روشن', hex: '#94A3B8', role: 'اکسنت' },
      { key: 'slate', name: 'سنگ متالیک', hex: '#64748B', role: 'ثانویه' },
      { key: 'ice', name: 'نقره‌ای یخی', hex: '#E2E8F0', role: 'هایلایت' },
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
