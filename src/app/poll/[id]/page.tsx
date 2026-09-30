"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ComboPopup } from "@/components/ComboPopup";
import {
  getVotedCount,
  incrementVotedCount,
} from "@/lib/poll-storage";
import { castVote } from "@/lib/polls";
import { useLivePoll } from "@/lib/hooks/useLivePoll";
import { ANIMAL_ICONS } from "@/types/poll";

const COMBO_WINDOW_MS = 1800;

export default function VotePage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const { poll, loading, error } = useLivePoll(pollId);

  const [votedCount, setVotedCount] = useState(() => getVotedCount(pollId));
  const [trackedPollId, setTrackedPollId] = useState(pollId);
  if (trackedPollId !== pollId) {
    setTrackedPollId(pollId);
    setVotedCount(getVotedCount(pollId));
  }

  const [combo, setCombo] = useState(0);
  const [votingOptionId, setVotingOptionId] = useState<number | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [lastTapAt, setLastTapAt] = useState(0);

  const maxVotes = poll?.max_votes_per_user ?? 5;
  const unlimited = maxVotes === -1;
  const remaining = unlimited ? Infinity : Math.max(0, maxVotes - votedCount);
  const canVote = !poll?.is_closed && (unlimited || remaining > 0);

  const remainingLabel = useMemo(() => {
    if (!poll) return "";
    if (unlimited) return `Votes cast: ${votedCount} · Unlimited`;
    return `Remaining: ${remaining} / ${maxVotes}`;
  }, [poll, unlimited, votedCount, remaining, maxVotes]);

  const handleVote = useCallback(
    async (optionId: number) => {
      if (!poll || !canVote || votingOptionId !== null) return;

      setVoteError(null);
      setVotingOptionId(optionId);

      try {
        await castVote(pollId, optionId);
        const nextCount = incrementVotedCount(pollId);
        setVotedCount(nextCount);

        const now = Date.now();
        const nextCombo =
          lastTapAt && now - lastTapAt < COMBO_WINDOW_MS ? combo + 1 : 1;
        setCombo(nextCombo);
        setLastTapAt(now);
        window.setTimeout(() => {
          setCombo((c) => (c === nextCombo ? 0 : c));
        }, COMBO_WINDOW_MS);
      } catch (e) {
        setVoteError(e instanceof Error ? e.message : "Vote failed");
      } finally {
        setVotingOptionId(null);
      }
    },
    [poll, canVote, votingOptionId, pollId, lastTapAt, combo],
  );

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
        <p className="text-slate-400">Loading…</p>
      </main>
    );
  }

  if (error || !poll) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
        <p className="text-rose-300">{error ?? "Poll not found"}</p>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8">
      <ComboPopup combo={combo} />

      <div className="mb-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
          PollPop
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold leading-tight text-slate-50 sm:text-3xl">
          {poll.title}
        </h1>
        <p className="mt-3 text-sm font-medium text-slate-300">{remainingLabel}</p>
        {poll.is_closed && (
          <p className="mt-2 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
            This poll is closed.
          </p>
        )}
        {!poll.is_closed && !canVote && (
          <p className="mt-2 rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
            You&apos;ve used all your votes. Thanks for playing!
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3">
        {poll.options.map((option, index) => {
          const animal = ANIMAL_ICONS[index % ANIMAL_ICONS.length];
          const busy = votingOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={!canVote || votingOptionId !== null}
              onClick={() => void handleVote(option.id)}
              className="min-h-[4.5rem] rounded-2xl border border-slate-600/80 bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 text-left text-lg font-bold text-slate-50 shadow-lg shadow-black/20 transition active:scale-[0.98] enabled:hover:border-cyan-400/50 enabled:hover:from-slate-800 enabled:hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="mr-3 text-2xl">{animal}</span>
              {busy ? "Sending…" : option.text}
            </button>
          );
        })}
      </div>

      {voteError && (
        <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {voteError}
        </p>
      )}

      <p className="mt-8 text-center text-xs text-slate-600">
        Tap fast for COMBO! · Votes sync live to OBS
      </p>
    </main>
  );
}
