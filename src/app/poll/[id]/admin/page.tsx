"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { BrandHeader } from "@/components/BrandHeader";
import { CopyButton } from "@/components/CopyButton";
import { LiveResultsChart } from "@/components/LiveResultsChart";
import { getAppBaseUrl, getConfiguredAppUrl } from "@/lib/app-url";
import { clearActivePollId } from "@/lib/poll-storage";
import { closePoll } from "@/lib/polls";
import { useLivePoll } from "@/lib/hooks/useLivePoll";

function subscribeNoop() {
  return () => {};
}

function readClientBaseUrl() {
  return getAppBaseUrl();
}

function readServerBaseUrl() {
  return getConfiguredAppUrl() ?? "";
}

export default function AdminPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const router = useRouter();
  const { poll, counts, totalVotes, loading, error } = useLivePoll(pollId);
  const [closing, setClosing] = useState(false);
  const baseUrl = useSyncExternalStore(
    subscribeNoop,
    readClientBaseUrl,
    readServerBaseUrl,
  );

  const voteUrl = useMemo(
    () => (baseUrl ? `${baseUrl}/poll/${pollId}` : ""),
    [baseUrl, pollId],
  );
  const obsUrl = useMemo(
    () => (baseUrl ? `${baseUrl}/poll/${pollId}/obs` : ""),
    [baseUrl, pollId],
  );

  async function handleClose() {
    if (!confirm("Close this poll? You can create a new one afterwards.")) {
      return;
    }
    setClosing(true);
    try {
      await closePoll(pollId);
      clearActivePollId();
      router.push("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to close poll");
      setClosing(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
        <p className="text-slate-400">Loading poll…</p>
      </main>
    );
  }

  if (error || !poll) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-4">
        <p className="text-rose-300">{error ?? "Poll not found"}</p>
        <button
          type="button"
          onClick={() => {
            clearActivePollId();
            router.push("/");
          }}
          className="rounded-xl bg-slate-700 px-4 py-2 text-sm"
        >
          Back to home
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <BrandHeader />

      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-slate-50 sm:text-3xl">
          {poll.title}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {poll.is_closed ? "Closed" : "Live"} · {totalVotes} total votes
        </p>
      </div>

      <section className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-10">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            QR Code for Voters
          </p>
          <div className="bg-white p-3">
            {voteUrl ? (
              <QRCodeSVG value={voteUrl} size={160} level="M" />
            ) : (
              <div className="h-40 w-40 animate-pulse bg-slate-200" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Share Link
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 truncate border-b border-slate-700/60 py-2.5 text-xs text-cyan-200">
                {voteUrl || "…"}
              </code>
              <CopyButton label="📋 Copy Link" value={voteUrl} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              OBS Overlay URL (Animal Race)
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 truncate border-b border-slate-700/60 py-2.5 text-xs text-orange-200">
                {obsUrl || "…"}
              </code>
              <CopyButton label="📋 Copy OBS Link" value={obsUrl} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-bold text-slate-100">
          📊 Live Results
        </h2>
        <LiveResultsChart
          options={poll.options}
          counts={counts}
          totalVotes={totalVotes}
          showAnimals
        />
      </section>

      <div className="mt-12 flex flex-col gap-8">
        <button
          type="button"
          disabled={closing || poll.is_closed}
          onClick={() => void handleClose()}
          className="w-full border-b border-rose-400/50 py-4 text-left text-base font-bold text-rose-200 transition hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {poll.is_closed
            ? "Poll Closed"
            : closing
              ? "Closing…"
              : "🔒 Close Poll & Create Next"}
        </button>

        <div className="text-center sm:text-left">
          <p className="text-sm text-slate-400">
            ⭐ Monetize your stream with Super Votes & Custom Avatars!
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-cyan-300/90 underline-offset-4 hover:underline disabled:no-underline disabled:opacity-60"
            disabled
          >
            Upgrade to Pro ($8/mo) — coming soon
          </button>
        </div>
      </div>
    </main>
  );
}
