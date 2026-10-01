import {
  ANIMAL_ICONS,
  THEME_DEFINITIONS,
  THEME_OPTIONS,
  type PollTheme,
  type ThemeDefinition,
} from "@/types/poll";

export type ThemeVisuals = {
  id: PollTheme;
  label: string;
  shortName: string;
  showAvatars: boolean;
  /** Light surface panel for OBS (readable on bright themes) */
  obsLightPanel: boolean;
  barColors: string[];
  chart: {
    label: string;
    meta: string;
    track: string;
    empty: string;
  };
  vote: {
    page: string;
    brand: string;
    title: string;
    meta: string;
    button: string;
    footer: string;
  };
  create: {
    page: string;
    brand: string;
    live: string;
    title: string;
    subtitle: string;
    label: string;
    input: string;
    select: string;
    optionBg: string;
    cta: string;
    chevron: string;
  };
  obs: {
    eyebrow: string;
    title: string;
    badge: string;
  };
};

const THEME_VISUALS: Record<PollTheme, ThemeVisuals> = {
  dark: {
    id: "dark",
    label: "Minimal Dark",
    shortName: "Minimal Dark",
    showAvatars: false,
    obsLightPanel: false,
    barColors: [
      "bg-slate-200",
      "bg-slate-300",
      "bg-zinc-300",
      "bg-neutral-300",
      "bg-stone-300",
    ],
    chart: {
      label: "text-slate-100",
      meta: "text-slate-500",
      track: "bg-slate-800/80",
      empty: "text-slate-600",
    },
    vote: {
      page: "bg-[#0a0a0a]",
      brand: "text-slate-500",
      title: "text-slate-50",
      meta: "text-slate-400",
      button:
        "border-slate-700 bg-slate-950 text-slate-100 enabled:hover:border-slate-500 enabled:hover:bg-slate-900",
      footer: "text-slate-700",
    },
    create: {
      page: "bg-[#050505] text-slate-100",
      brand: "text-slate-100 group-hover:text-white",
      live: "text-slate-600",
      title: "text-slate-50",
      subtitle: "text-slate-500",
      label: "text-slate-500",
      input:
        "border-slate-700 bg-black/40 text-slate-100 placeholder:text-slate-600 ring-slate-400/30",
      select: "border-slate-700 bg-black/40 text-slate-100 ring-slate-400/30",
      optionBg: "bg-black text-slate-100",
      cta: "bg-gradient-to-r from-slate-100 to-zinc-300 text-slate-950 shadow-black/40",
      chevron: "%2394a3b8",
    },
    obs: {
      eyebrow: "text-white/70",
      title: "text-white",
      badge: "bg-black/50 text-white",
    },
  },
  light: {
    id: "light",
    label: "Light Mode",
    shortName: "Light Mode",
    showAvatars: false,
    obsLightPanel: true,
    barColors: [
      "bg-sky-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-violet-500",
    ],
    chart: {
      label: "text-slate-800",
      meta: "text-slate-500",
      track: "bg-slate-200",
      empty: "text-slate-400",
    },
    vote: {
      page: "bg-[#f4f7fb] text-slate-900",
      brand: "text-sky-600",
      title: "text-slate-900",
      meta: "text-slate-600",
      button:
        "border-slate-300 bg-white text-slate-900 shadow-sm enabled:hover:border-sky-400 enabled:hover:bg-sky-50",
      footer: "text-slate-400",
    },
    create: {
      page: "bg-[#f5f7fb] text-slate-900",
      brand: "text-sky-600 group-hover:text-sky-700",
      live: "text-slate-400",
      title: "text-slate-900",
      subtitle: "text-slate-500",
      label: "text-slate-500",
      input:
        "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 ring-sky-400/40",
      select: "border-slate-300 bg-white text-slate-900 ring-sky-400/40",
      optionBg: "bg-white text-slate-900",
      cta: "bg-gradient-to-r from-sky-500 to-emerald-400 text-white shadow-sky-200/60",
      chevron: "%2364748b",
    },
    obs: {
      eyebrow: "text-slate-800/90 drop-shadow-none",
      title: "text-slate-900 drop-shadow-none",
      badge: "bg-white/85 text-slate-800",
    },
  },
  game: {
    id: "game",
    label: "Game Mode",
    shortName: "Game Mode",
    showAvatars: false,
    obsLightPanel: false,
    barColors: [
      "bg-lime-400",
      "bg-fuchsia-500",
      "bg-cyan-400",
      "bg-yellow-300",
      "bg-red-500",
    ],
    chart: {
      label: "text-lime-100",
      meta: "text-fuchsia-200/80",
      track: "bg-slate-950 border border-lime-400/30",
      empty: "text-lime-500/70",
    },
    vote: {
      page: "bg-[#050816]",
      brand: "text-lime-400",
      title: "text-lime-50",
      meta: "text-fuchsia-200/80",
      button:
        "border-lime-400/40 bg-gradient-to-r from-indigo-950 to-slate-950 text-lime-50 enabled:hover:border-lime-300 enabled:hover:from-indigo-900",
      footer: "text-lime-900",
    },
    create: {
      page: "bg-[#0a0618] text-lime-50 bg-[radial-gradient(ellipse_70%_50%_at_15%_0%,rgba(168,85,247,0.28),transparent),radial-gradient(ellipse_50%_40%_at_90%_10%,rgba(34,197,94,0.16),transparent)]",
      brand: "text-lime-300 group-hover:text-lime-200",
      live: "text-fuchsia-400/70",
      title: "text-lime-50",
      subtitle: "text-fuchsia-200/70",
      label: "text-fuchsia-200/70",
      input:
        "border-fuchsia-500/40 bg-indigo-950/40 text-lime-50 placeholder:text-fuchsia-300/40 ring-lime-400/40",
      select:
        "border-fuchsia-500/40 bg-indigo-950/40 text-lime-50 ring-lime-400/40",
      optionBg: "bg-[#120826] text-lime-50",
      cta: "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-lime-400 text-slate-950 shadow-fuchsia-900/40",
      chevron: "%23d8b4fe",
    },
    obs: {
      eyebrow: "text-lime-200",
      title: "text-white",
      badge: "bg-fuchsia-600/70 text-white",
    },
  },
  party: {
    id: "party",
    label: "Party Mode",
    shortName: "Party Mode",
    showAvatars: false,
    obsLightPanel: true,
    barColors: [
      "bg-pink-500",
      "bg-amber-400",
      "bg-cyan-400",
      "bg-yellow-400",
      "bg-violet-400",
    ],
    chart: {
      label: "text-fuchsia-900",
      meta: "text-rose-600",
      track: "bg-pink-100",
      empty: "text-rose-400",
    },
    vote: {
      page: "bg-gradient-to-b from-[#fff7fb] via-[#fff1f7] to-[#fff8e7] text-fuchsia-950",
      brand: "text-pink-500",
      title: "text-fuchsia-950",
      meta: "text-rose-700",
      button:
        "border-pink-300 bg-white text-fuchsia-950 shadow-md shadow-pink-200/50 enabled:hover:border-amber-400 enabled:hover:bg-amber-50",
      footer: "text-rose-400",
    },
    create: {
      page: "bg-gradient-to-br from-white via-[#ffe8f3] to-[#fff3c4] text-fuchsia-950",
      brand: "text-pink-500 group-hover:text-fuchsia-600",
      live: "text-amber-500",
      title: "text-fuchsia-950",
      subtitle: "text-rose-700/80",
      label: "text-rose-700",
      input:
        "border-pink-300 bg-white/90 text-fuchsia-950 placeholder:text-rose-300 ring-pink-400/50",
      select:
        "border-pink-300 bg-white/90 text-fuchsia-950 ring-cyan-400/40",
      optionBg: "bg-white text-fuchsia-950",
      cta: "bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-white shadow-pink-300/50",
      chevron: "%23db2777",
    },
    obs: {
      eyebrow: "text-pink-600 drop-shadow-none",
      title: "text-fuchsia-950 drop-shadow-none",
      badge: "bg-amber-300/90 text-fuchsia-950",
    },
  },
  animal_race: {
    id: "animal_race",
    label: "Animal Race 🦊",
    shortName: "Animal Race",
    showAvatars: true,
    obsLightPanel: true,
    barColors: [
      "bg-amber-400",
      "bg-lime-400",
      "bg-emerald-400",
      "bg-orange-300",
      "bg-teal-300",
    ],
    chart: {
      label: "text-emerald-950",
      meta: "text-lime-800/80",
      track: "bg-emerald-100/80",
      empty: "text-emerald-700/60",
    },
    vote: {
      page: "bg-gradient-to-b from-[#eef8e8] via-[#f7f3e8] to-[#e8f5e4] text-emerald-950",
      brand: "text-emerald-600",
      title: "text-emerald-950",
      meta: "text-lime-800",
      button:
        "border-emerald-200 bg-white/90 text-emerald-950 shadow-sm shadow-emerald-200/40 enabled:hover:border-lime-400 enabled:hover:bg-lime-50",
      footer: "text-emerald-700/50",
    },
    create: {
      page: "bg-gradient-to-br from-[#f4faf0] via-[#eef6e4] to-[#f8f1e2] text-emerald-950",
      brand: "text-emerald-600 group-hover:text-lime-600",
      live: "text-amber-700/70",
      title: "text-emerald-950",
      subtitle: "text-lime-800/80",
      label: "text-emerald-800/80",
      input:
        "border-emerald-200 bg-white/85 text-emerald-950 placeholder:text-emerald-700/40 ring-lime-400/40",
      select:
        "border-emerald-200 bg-white/85 text-emerald-950 ring-lime-400/40",
      optionBg: "bg-white text-emerald-950",
      cta: "bg-gradient-to-r from-lime-400 via-emerald-400 to-amber-300 text-emerald-950 shadow-emerald-200/50",
      chevron: "%2365a30d",
    },
    obs: {
      eyebrow: "text-emerald-700 drop-shadow-none",
      title: "text-emerald-950 drop-shadow-none",
      badge: "bg-lime-200/90 text-emerald-900",
    },
  },
};

const LEGACY_THEME_MAP: Record<string, PollTheme> = {
  gacha: "party",
  neon_rgb: "game",
};

export function getThemeDefinition(theme: PollTheme): ThemeDefinition | undefined {
  return THEME_DEFINITIONS.find((t) => t.value === theme);
}

/** Free themes always allowed; Pro themes allowed for Pro or Free Trial */
export function canUseTheme(theme: PollTheme, isPro = false): boolean {
  const def = getThemeDefinition(theme);
  if (!def) return false;
  if (def.tier === "free") return true;
  if (isPro) return true;
  return Boolean(def.freeTrialAllowed);
}

export function normalizeTheme(theme: unknown): PollTheme {
  if (typeof theme === "string" && theme in THEME_VISUALS) {
    return theme as PollTheme;
  }
  if (typeof theme === "string" && theme in LEGACY_THEME_MAP) {
    return LEGACY_THEME_MAP[theme];
  }
  return "dark";
}

export function getThemeVisuals(theme: unknown): ThemeVisuals {
  return THEME_VISUALS[normalizeTheme(theme)];
}

/** Option-side icons: Animal Race only */
export function getOptionIcon(theme: unknown, index: number): string | null {
  const visuals = getThemeVisuals(theme);
  if (visuals.id !== "animal_race" || !visuals.showAvatars) return null;
  return ANIMAL_ICONS[index % ANIMAL_ICONS.length];
}

export { THEME_OPTIONS, THEME_DEFINITIONS };
