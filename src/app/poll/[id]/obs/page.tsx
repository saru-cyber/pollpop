"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { LiveResultsChart } from "@/components/LiveResultsChart";
import { useLivePoll } from "@/lib/hooks/useLivePoll";

export default function ObsOverlayPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const { poll, counts, totalVotes, loading, error, lastBumpedOptionId } =
    useLivePoll(pollId);

  useEffect(() => {
    document.documentElement.classList.add("obs-transparent");
    document.body.classList.add("obs-transparent");
    return () => {
      document.documentElement.classList.remove("obs-transparent");
      document.body.classList.remove("obs-transparent");
    };
  }, []);

  if (loading) {
    return (
      <main className="bg-transparent p-6">
        <p className="text-white/70 drop-shadow">Loading race…</p>
      </main>
    );
  }

  if (error || !poll) {
    return (
      <main className="bg-transparent p-6">
        <p className="text-rose-200 drop-shadow">{error ?? "Poll not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent p-4 sm:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80 drop-shadow">
              PollPop · Animal Race
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold text-white drop-shadow-md sm:text-2xl">
              {poll.title}
            </h1>
          </div>
          <p className="shrink-0 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {totalVotes} votes
            {poll.is_closed ? " · CLOSED" : ""}
          </p>
        </div>

        <LiveResultsChart
          options={poll.options}
          counts={counts}
          totalVotes={totalVotes}
          showAnimals
          bumpedOptionId={lastBumpedOptionId}
          transparent
        />
      </div>
    </main>
  );
}
