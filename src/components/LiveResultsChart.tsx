"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getOptionIcon, getThemeVisuals } from "@/lib/themes";
import type { PollOption, PollTheme, VoteCounts } from "@/types/poll";

type LiveResultsChartProps = {
  options: PollOption[];
  counts: VoteCounts;
  totalVotes: number;
  theme?: PollTheme | string;
  showAnimals?: boolean;
  bumpedOptionId?: number | null;
  transparent?: boolean;
};

export function LiveResultsChart({
  options,
  counts,
  totalVotes,
  theme = "animal_race",
  showAnimals,
  bumpedOptionId = null,
  transparent = false,
}: LiveResultsChartProps) {
  const visuals = getThemeVisuals(theme);
  const useAvatars = showAnimals ?? visuals.showAvatars;
  const maxCount = Math.max(1, ...options.map((o) => counts[o.id] ?? 0));
  const barHeight = useAvatars ? "h-10" : "h-3";

  const labelClass = transparent
    ? "text-white drop-shadow"
    : visuals.chart.label;
  const metaClass = transparent
    ? "text-white/90 drop-shadow"
    : visuals.chart.meta;
  const trackClass = transparent ? "bg-white/15" : visuals.chart.track;
  const emptyClass = transparent ? "text-white/70" : visuals.chart.empty;

  return (
    <div className="flex flex-col gap-4">
      {options.map((option, index) => {
        const count = counts[option.id] ?? 0;
        const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        const widthPct = (count / maxCount) * 100;
        const icon = useAvatars ? getOptionIcon(theme, index) : null;
        const isBumped = bumpedOptionId === option.id;
        const barColor =
          visuals.barColors[index % visuals.barColors.length];

        return (
          <div key={option.id} className="relative">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className={`truncate text-sm font-semibold ${labelClass}`}>
                {icon ? `${icon} ` : ""}
                {option.text}
              </span>
              <span className={`shrink-0 text-xs tabular-nums ${metaClass}`}>
                {count} ({pct.toFixed(0)}%)
              </span>
            </div>

            <div
              className={`relative overflow-visible rounded-full ${barHeight} ${trackClass}`}
            >
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(widthPct, count > 0 ? (useAvatars ? 8 : 4) : 0)}%`,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />

              {useAvatars && icon && (
                <motion.div
                  className="absolute top-1/2 z-10 -translate-y-1/2 text-2xl drop-shadow-lg"
                  style={{
                    left: `calc(${Math.max(widthPct, count > 0 ? 8 : 0)}% - 1.1rem)`,
                  }}
                  animate={
                    isBumped
                      ? { scale: [1, 1.4, 1], y: [0, -18, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  {icon}
                </motion.div>
              )}
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {totalVotes === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm ${emptyClass}`}
          >
            Waiting for votes…
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
