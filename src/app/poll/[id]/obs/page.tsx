"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { LiveResultsChart } from "@/components/LiveResultsChart";
import { useLivePoll } from "@/lib/hooks/useLivePoll";
import { getThemeVisuals } from "@/lib/themes";

export default function ObsOverlayPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const { poll, counts, totalVotes, loading, error, lastBumpedOptionId, votes } =
    useLivePoll(pollId);
  const visuals = getThemeVisuals(poll?.theme);
  const useLightPanel = visuals.obsLightPanel;
  const isAnimalRace = visuals.id === "animal_race";

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
        <p className="text-white/70 drop-shadow">Loading overlay…</p>
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
      <div
        className={`mx-auto w-full max-w-3xl ${
          useLightPanel
            ? isAnimalRace
              ? "rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-[#f3faee]/95 via-[#f8f4e8]/95 to-[#e8f5e0]/95 p-5 shadow-lg shadow-emerald-200/30 backdrop-blur"
              : "rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur"
            : ""
        }`}
      >
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-[0.25em] drop-shadow ${visuals.obs.eyebrow}`}
            >
              PollPop · {visuals.shortName}
            </p>
            <h1
              className={`mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold drop-shadow-md sm:text-2xl ${visuals.obs.title}`}
            >
              {poll.title}
            </h1>
          </div>
          <p
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${visuals.obs.badge}`}
          >
            {totalVotes} votes
            {poll.is_closed ? " · CLOSED" : ""}
            {poll.question_number >= 2 ? ` · Q${poll.question_number}` : ""}
          </p>
        </div>

        <LiveResultsChart
          options={poll.options}
          counts={counts}
          totalVotes={totalVotes}
          theme={poll.theme}
          votesPerVoter={poll.max_votes_per_user}
          votes={votes}
          bumpedOptionId={lastBumpedOptionId}
          transparent={!useLightPanel}
          isClosed={poll.is_closed}
          questionNumber={poll.question_number}
        />
      </div>
    </main>
  );
}
