/**
 * Feature flags configuration
 * Centralized control for enabling/disabling features across the site
 */

export const featureFlags = {
  // Terminal command interface
  enableTerminal: false,

  // AI assistant functionality
  enableAI: true,

  // Dock navigation component
  enableDock: true,

  // Dynamic Island notifications
  enableDynamicIsland: true,

  // Chat bot floating widget (3D PlayBot with Spline)
  enablePlayBot: false,
} as const;

export type FeatureFlags = typeof featureFlags;
