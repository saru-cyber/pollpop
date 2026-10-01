/**
 * Theme helpers — canonical definitions live in `@/config/themes`.
 * Prefer importing `THEMES` / `getTheme` from `@/config/themes` directly.
 */
export {
  ANIMAL_ICONS,
  FREE_THEMES,
  PRO_THEMES,
  THEME_DEFINITIONS,
  THEME_OPTIONS,
  THEMES,
  canUseTheme,
  getOptionIcon,
  getTheme,
  getThemeDefinition,
  getThemeVisuals,
  normalizeTheme,
  type ChartTone,
  type ThemeConfig,
} from "@/config/themes";

/** @deprecated Alias kept for older imports */
export type { ThemeConfig as ThemeVisuals } from "@/config/themes";
