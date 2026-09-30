"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ANIMAL_ICONS } from "@/types/poll";
import type { PollOption, VoteCounts } from "@/types/poll";

const BAR_COLORS = [
  "bg-orange-400",
  "bg-cyan-400",
  "bg-lime-400",
  "bg-rose-400",
  "bg-amber-300",
];

type LiveResultsChartProps = {
  options: PollOption[];
  counts: VoteCounts;
  totalVotes: number;
  showAnimals?: boolean;
  bumpedOptionId?: number | null;
  transparent?: boolean;
};

export function LiveResultsChart({
  options,
  counts,
  totalVotes,
  showAnimals = false,
  bumpedOptionId = null,
  transparent = false,
}: LiveResultsChartProps) {
  const maxCount = Math.max(1, ...options.map((o) => counts[o.id] ?? 0));

  return (
    <div className={`flex flex-col gap-4 ${transparent ? "" : ""}`}>
      {options.map((option, index) => {
        const count = counts[option.id] ?? 0;
        const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        const widthPct = (count / maxCount) * 100;
        const animal = ANIMAL_ICONS[index % ANIMAL_ICONS.length];
        const isBumped = bumpedOptionId === option.id;

        return (
          <div key={option.id} className="relative">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span
                className={`truncate text-sm font-semibold ${
                  transparent ? "text-white drop-shadow" : "text-slate-100"
                }`}
              >
                {showAnimals ? `${animal} ` : ""}
                {option.text}
              </span>
              <span
                className={`shrink-0 text-xs tabular-nums ${
                  transparent ? "text-white/90 drop-shadow" : "text-slate-400"
                }`}
              >
                {count} ({pct.toFixed(0)}%)
              </span>
            </div>

            <div
              className={`relative h-10 overflow-visible rounded-full ${
                transparent ? "bg-white/15" : "bg-slate-800"
              }`}
            >
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(widthPct, count > 0 ? 8 : 0)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />

              {showAnimals && (
                <motion.div
                  className="absolute top-1/2 z-10 -translate-y-1/2 text-2xl drop-shadow-lg"
                  style={{ left: `calc(${Math.max(widthPct, count > 0 ? 8 : 0)}% - 1.1rem)` }}
                  animate={
                    isBumped
                      ? { scale: [1, 1.4, 1], y: [0, -18, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  {animal}
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
            className={`text-center text-sm ${
              transparent ? "text-white/70" : "text-slate-500"
            }`}
          >
            Waiting for votes…
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
