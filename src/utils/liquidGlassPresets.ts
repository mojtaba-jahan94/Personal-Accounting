import type { GlassConfig } from '@ybouane/liquidglass';

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
