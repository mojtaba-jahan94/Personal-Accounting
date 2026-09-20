import type { GlassConfig } from '@ybouane/liquidglass';

/**
 * iOS 27 & Spatial Glass Presets for LiquidGlass WebGL effect
 */
export const LIQUID_GLASS_PRESETS: Record<string, Partial<GlassConfig>> = {
  // Ultra-modern Hero Banner with deep refraction and chromatic dispersion
  ios27Hero: {
    blurAmount: 0.28,
    refraction: 0.65,
    chromAberration: 0.06,
    edgeHighlight: 0.18,
    specular: 0.14,
    fresnel: 1.1,
    cornerRadius: 32,
    zRadius: 28,
    tintStrength: 0.08,
    shadowOpacity: 0.22,
    shadowSpread: 24,
    shadowOffsetY: 8,
  },

  // Apple VisionOS / iOS 27 Frosted Widget Card
  ios27Card: {
    blurAmount: 0.35,
    refraction: 0.45,
    chromAberration: 0.04,
    edgeHighlight: 0.14,
    specular: 0.10,
    fresnel: 0.95,
    cornerRadius: 24,
    zRadius: 20,
    shadowOpacity: 0.20,
    shadowSpread: 18,
    shadowOffsetY: 6,
  },

  // Floating Dynamic Island & Top Pill
  ios27DynamicIsland: {
    blurAmount: 0.22,
    refraction: 0.55,
    chromAberration: 0.05,
    edgeHighlight: 0.22,
    specular: 0.18,
    fresnel: 1.15,
    cornerRadius: 40,
    zRadius: 22,
    shadowOpacity: 0.35,
    shadowSpread: 22,
    shadowOffsetY: 6,
  },

  // Floating Bottom Dock & Sidebar
  ios27Dock: {
    blurAmount: 0.30,
    refraction: 0.50,
    chromAberration: 0.04,
    edgeHighlight: 0.16,
    specular: 0.12,
    fresnel: 1.0,
    cornerRadius: 30,
    zRadius: 24,
    shadowOpacity: 0.28,
    shadowSpread: 20,
    shadowOffsetY: 8,
  },

  // Tactile Interactive Glass Button
  ios27Button: {
    blurAmount: 0.18,
    refraction: 0.50,
    chromAberration: 0.05,
    edgeHighlight: 0.25,
    specular: 0.20,
    button: true,
    cornerRadius: 20,
    zRadius: 14,
    shadowOpacity: 0.25,
    shadowSpread: 14,
    shadowOffsetY: 4,
  },

  // Ultra-realistic Convex Liquid Glass Lens Pill (matching reference image)
  ios27LiquidPill: {
    blurAmount: 0.16,
    refraction: 0.60,
    chromAberration: 0.04,
    edgeHighlight: 0.32,
    specular: 0.28,
    fresnel: 1.25,
    cornerRadius: 30,
    zRadius: 22,
    button: true,
    bevelMode: 0,
    shadowOpacity: 0.20,
    shadowSpread: 18,
    shadowOffsetY: 6,
  },

  // Crystal Transparent Liquid Widget (matching music player reference image)
  crystalWidget: {
    blurAmount: 0.10,
    refraction: 0.85,
    chromAberration: 0.09,
    edgeHighlight: 0.38,
    specular: 0.34,
    fresnel: 1.40,
    cornerRadius: 32,
    zRadius: 28,
    opacity: 0.96,
    saturation: 0.20,
    tintStrength: 0.08,
    shadowOpacity: 0.25,
    shadowSpread: 26,
    shadowOffsetY: 10,
    button: false,
    bevelMode: 0,
  },
};
