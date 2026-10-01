"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getOptionIcon, getTheme } from "@/config/themes";
import type { PollOption, PollTheme, VoteCounts } from "@/types/poll";

type WinnerCelebrationProps = {
  open: boolean;
  options: PollOption[];
  counts: VoteCounts;
  theme: PollTheme | string;
  showAvatar: boolean;
};

function playWinnerPop() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + i * 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + 0.45 + i * 0.05);
    });
    window.setTimeout(() => void ctx.close(), 800);
  } catch {
    // Autoplay / AudioContext may be blocked — ignore.
  }
}

export function WinnerCelebration({
  open,
  options,
  counts,
  theme,
  showAvatar,
}: WinnerCelebrationProps) {
  const themeConfig = getTheme(theme);
  const vfx = themeConfig.vfx;

  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        emoji: vfx.confetti[i % vfx.confetti.length],
        x: ((i * 37) % 100) - 50,
        delay: (i % 8) * 0.05,
        duration: 1.4 + (i % 5) * 0.15,
      })),
    [vfx.confetti],
  );

  const winner = useMemo(() => {
    if (!options.length) return null;
    let best = options[0];
    let bestVotes = counts[best.id] ?? 0;
    for (const option of options) {
      const v = counts[option.id] ?? 0;
      if (v > bestVotes) {
        best = option;
        bestVotes = v;
      }
    }
    if (bestVotes <= 0) return null;
    const index = options.findIndex((o) => o.id === best.id);
    return {
      option: best,
      votes: bestVotes,
      icon: showAvatar ? getOptionIcon(theme, Math.max(0, index)) : null,
    };
  }, [options, counts, theme, showAvatar]);

  useEffect(() => {
    if (!open || !winner || !vfx.playWinnerSe) return;
    playWinnerPop();
  }, [open, winner, vfx.playWinnerSe]);

  return (
    <AnimatePresence>
      {open && winner && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute left-1/2 top-3 z-50 -translate-x-1/2"
            initial={{ y: -40, scale: 0.7, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
          >
            <div className={vfx.winnerBanner}>
              <p
                className={`font-[family-name:var(--font-display)] text-sm font-black tracking-[0.2em] sm:text-base ${vfx.winnerTitle}`}
              >
                👑 RESULT
              </p>
              <p
                className={`font-[family-name:var(--font-display)] text-2xl font-black sm:text-3xl ${vfx.winnerTitle}`}
              >
                WINNER!
              </p>
            </div>
          </motion.div>

          {confetti.map((piece) => (
            <motion.span
              key={piece.id}
              className="absolute left-1/2 top-1/3 text-lg sm:text-xl"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0.4,
                rotate: 0,
              }}
              animate={{
                x: piece.x * 4,
                y: [0, -40 - (piece.id % 5) * 12, 120 + (piece.id % 7) * 18],
                opacity: [0, 1, 1, 0],
                scale: [0.4, 1.2, 1, 0.8],
                rotate: [-20, 40, -10],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 0.6,
              }}
            >
              {piece.emoji}
            </motion.span>
          ))}

          {winner.icon ? (
            <motion.div
              className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0.2, y: 40, opacity: 0 }}
              animate={{
                scale: [0.2, 1.35, 1.15],
                y: [40, -8, 0],
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 12 }}
            >
              <div className="relative flex flex-col items-center">
                <span className="text-7xl drop-shadow-xl sm:text-8xl">
                  {winner.icon}
                </span>
                <p
                  className={`mt-2 max-w-[14rem] truncate text-center ${vfx.winnerNameChip}`}
                >
                  {winner.option.text}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.p
              className={`absolute left-1/2 top-[42%] z-50 max-w-[80%] -translate-x-1/2 truncate text-center font-[family-name:var(--font-display)] text-2xl font-black sm:text-3xl ${vfx.winnerNamePlain}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.1, 1], opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 14 }}
            >
              {winner.option.text}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
