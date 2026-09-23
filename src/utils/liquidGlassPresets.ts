import type { GlassConfig } from '@ybouane/liquidglass';

/**
 * Modern Glassmorphism Presets for UI elements
 */
export const LIQUID_GLASS_PRESETS: Record<string, Partial<GlassConfig>> = {
  // Modern Hero Banner
  heroBanner: {
    blurAmount: 0.20,
    refraction: 0.40,
    chromAberration: 0.02,
    edgeHighlight: 0.15,
    specular: 0.12,
    fresnel: 1.0,
    cornerRadius: 20,
    zRadius: 20,
    tintStrength: 0.05,
    shadowOpacity: 0.15,
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
