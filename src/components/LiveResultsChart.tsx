"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WinnerCelebration } from "@/components/WinnerCelebration";
import { getOptionIcon, getTheme } from "@/config/themes";
import type { PollOption, PollTheme, Vote, VoteCounts } from "@/types/poll";

const SLEEP_IDLE_MS = 30_000;
const JUMP_MS = 2_000;

type LiveResultsChartProps = {
  options: PollOption[];
  counts: VoteCounts;
  totalVotes: number;
  theme?: PollTheme | string;
  /** Votes-per-voter limit */
  votesPerVoter?: number;
  votes?: Vote[];
  showAnimals?: boolean;
  bumpedOptionId?: number | null;
  transparent?: boolean;
  /** Use admin chart palette (dark forest for Animal Race, etc.) */
  surface?: "default" | "admin";
  isClosed?: boolean;
  questionNumber?: number;
};

type RankKind = "first" | "second" | "lowest" | null;

function computeRanks(
  options: PollOption[],
  counts: VoteCounts,
  totalVotes: number,
): Record<number, RankKind> {
  const ranks: Record<number, RankKind> = {};
  if (options.length === 0) return ranks;

  if (totalVotes === 0) {
    for (const option of options) ranks[option.id] = "lowest";
    return ranks;
  }

  const tallies = options.map((o) => ({
    id: o.id,
    votes: counts[o.id] ?? 0,
  }));
  const unique = [...new Set(tallies.map((t) => t.votes))].sort((a, b) => b - a);
  const first = unique[0] ?? 0;
  const second = unique.length > 1 ? unique[1] : null;
  const lowest = unique[unique.length - 1] ?? 0;

  for (const { id, votes } of tallies) {
    if (votes === first) ranks[id] = "first";
    else if (second !== null && votes === second) ranks[id] = "second";
    else if (votes === lowest) ranks[id] = "lowest";
    else ranks[id] = null;
  }
  return ranks;
}

function lastVoteTimesFromLog(votes: Vote[]): Record<number, number> {
  const merged: Record<number, number> = {};
  for (const vote of votes) {
    const ts = Date.parse(vote.created_at);
    if (!Number.isFinite(ts)) continue;
    merged[vote.option_id] = Math.max(merged[vote.option_id] ?? 0, ts);
  }
  return merged;
}

export function LiveResultsChart({
  options,
  counts,
  totalVotes,
  theme = "animal_race",
  votesPerVoter = 5,
  votes = [],
  showAnimals,
  bumpedOptionId = null,
  transparent = false,
  surface = "default",
  isClosed = false,
  questionNumber = 1,
}: LiveResultsChartProps) {
  const themeConfig = getTheme(theme);
  const chartTone =
    surface === "admin" && !transparent
      ? themeConfig.admin.chart
      : themeConfig.chart;
  const useAvatars = showAnimals ?? themeConfig.showAvatars;
  const maxVotesInPoll = Math.max(
    0,
    ...options.map((o) => counts[o.id] ?? 0),
  );
  const voterScale = votesPerVoter > 0 ? votesPerVoter * 2 : 0;
  const maxScale = Math.max(voterScale, maxVotesInPoll * 1.2, 1);
  const barHeight = useAvatars ? "h-10" : "h-3";

  const [now, setNow] = useState(0);
  const [clockOrigin, setClockOrigin] = useState(0);
  const [clientLastVotes, setClientLastVotes] = useState<Record<number, number>>(
    {},
  );
  const [jumpUntil, setJumpUntil] = useState<Record<number, number>>({});
  const [winnerActive, setWinnerActive] = useState(false);

  const logLastVotes = useMemo(() => lastVoteTimesFromLog(votes), [votes]);

  useEffect(() => {
    const start = Date.now();
    const boot = window.setTimeout(() => {
      setClockOrigin(start);
      setNow(start);
    }, 0);
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (bumpedOptionId == null) return;
    const t = Date.now();
    const frame = window.setTimeout(() => {
      setClientLastVotes((prev) => ({ ...prev, [bumpedOptionId]: t }));
      setJumpUntil((prev) => ({ ...prev, [bumpedOptionId]: t + JUMP_MS }));
      setNow(Date.now());
    }, 0);
    return () => window.clearTimeout(frame);
  }, [bumpedOptionId]);

  // Trigger / reset winner celebration with close & next question
  useEffect(() => {
    if (isClosed && totalVotes > 0) {
      const t = window.setTimeout(() => setWinnerActive(true), 0);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setWinnerActive(false), 0);
    return () => window.clearTimeout(t);
  }, [isClosed, totalVotes, questionNumber]);

  const ranks = useMemo(
    () => computeRanks(options, counts, totalVotes),
    [options, counts, totalVotes],
  );

  const winnerId = useMemo(() => {
    if (totalVotes <= 0) return null;
    let bestId: number | null = null;
    let bestVotes = -1;
    for (const option of options) {
      const v = counts[option.id] ?? 0;
      if (v > bestVotes) {
        bestVotes = v;
        bestId = option.id;
      }
    }
    return bestId;
  }, [options, counts, totalVotes]);

  const labelClass = transparent
    ? "text-white drop-shadow"
    : chartTone.label;
  const metaClass = transparent
    ? "text-white/90 drop-shadow"
    : chartTone.meta;
  const trackClass = transparent ? "bg-white/20" : chartTone.track;
  const emptyClass = transparent ? "text-white/70" : chartTone.empty;

  const badgeClass = themeConfig.vfx.mascotBadge;

  return (
    <div className={`relative flex flex-col ${useAvatars ? "gap-6" : "gap-4"}`}>
      <WinnerCelebration
        open={winnerActive}
        options={options}
        counts={counts}
        theme={theme}
        showAvatar={useAvatars}
      />

      {options.map((option, index) => {
        const optionVotes = counts[option.id] ?? 0;
        const sharePct =
          totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
        const widthPercent = (optionVotes / maxScale) * 100;
        const icon = useAvatars ? getOptionIcon(theme, index) : null;
        const barColor =
          themeConfig.barColors[index % themeConfig.barColors.length];

        const rank = ranks[option.id] ?? null;
        const lastAt = Math.max(
          logLastVotes[option.id] ?? 0,
          clientLastVotes[option.id] ?? 0,
        );
        const idleMs =
          lastAt > 0
            ? now - lastAt
            : now > 0 && clockOrigin > 0
              ? now - clockOrigin
              : 0;
        const isSleeping =
          !winnerActive &&
          now > 0 &&
          (rank === "lowest" || optionVotes === 0) &&
          idleMs >= SLEEP_IDLE_MS &&
          rank !== "first";
        const isJumping =
          !winnerActive && (jumpUntil[option.id] ?? 0) > now;
        const isChasing =
          !winnerActive && rank === "second" && !isSleeping && !isJumping;
        const isWinnerBar =
          winnerActive && !useAvatars && option.id === winnerId;

        let badge: string | null = null;
        if (!winnerActive) {
          if (isSleeping) badge = "💤 zZz...";
          else if (rank === "first" && totalVotes > 0) badge = "👑 Leading!";
          else if (rank === "second") badge = "🔥 Come on!!";
        }

        let mascotAnim = "";
        if (isJumping) mascotAnim = "mascot-jump";
        else if (isSleeping) mascotAnim = "mascot-sleep";
        else if (isChasing) mascotAnim = "mascot-chase";

        return (
          <div key={option.id} className="relative">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span
                className={`relative z-10 min-w-0 truncate text-sm font-bold tracking-tight ${labelClass}`}
              >
                {option.text}
              </span>
              <span
                className={`relative z-10 shrink-0 text-xs font-medium tabular-nums ${metaClass}`}
              >
                {optionVotes} ({sharePct.toFixed(0)}%)
              </span>
            </div>

            {/* Reserve vertical room so mascot badges never cover option labels */}
            <div className={useAvatars ? "pt-6" : undefined}>
              <div
                className={`relative overflow-visible rounded-full ${barHeight} ${trackClass}`}
              >
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out ${
                    isWinnerBar ? "winner-bar-pulse" : barColor
                  }`}
                  style={{ width: `${widthPercent}%` }}
                />

                {useAvatars && icon && !winnerActive && (
                  <div
                    className="absolute top-1/2 z-10 -translate-y-1/2 transition-[left] duration-500 ease-out"
                    style={{
                      left: `calc(${widthPercent}% - 1.1rem)`,
                    }}
                  >
                    <div className="relative">
                      <AnimatePresence>
                        {badge && (
                          <motion.span
                            key={badge}
                            initial={{ opacity: 0, y: 4, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`mascot-badge absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${badgeClass}`}
                          >
                            {badge}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span
                        className={`inline-block text-2xl drop-shadow-lg ${mascotAnim}`}
                        aria-hidden
                      >
                        {icon}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {totalVotes === 0 && !winnerActive && (
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
