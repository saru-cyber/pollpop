"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { BrandHeader } from "@/components/BrandHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CopyButton } from "@/components/CopyButton";
import { LiveResultsChart } from "@/components/LiveResultsChart";
import { getAppBaseUrl, getConfiguredAppUrl } from "@/lib/app-url";
import {
  clearActivePollId,
  setActivePollId,
  setSessionPhase,
} from "@/lib/poll-storage";
import { closePoll } from "@/lib/polls";
import { useLivePoll } from "@/lib/hooks/useLivePoll";
import { getTheme } from "@/config/themes";

function subscribeNoop() {
  return () => {};
}

function readClientBaseUrl() {
  return getAppBaseUrl();
}

function readServerBaseUrl() {
  return getConfiguredAppUrl() ?? "";
}

type DialogKind = "next" | "finish" | null;

export default function AdminPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const router = useRouter();
  const { poll, counts, totalVotes, loading, error, votes, lastBumpedOptionId } =
    useLivePoll(pollId);
  const [busy, setBusy] = useState<"next" | "finish" | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const baseUrl = useSyncExternalStore(
    subscribeNoop,
    readClientBaseUrl,
    readServerBaseUrl,
  );

  const themeConfig = getTheme(poll?.theme);
  const admin = themeConfig.admin;

  useEffect(() => {
    document.body.classList.add("admin-shell");
    document.documentElement.dataset.adminTheme = themeConfig.id;
    return () => {
      document.body.classList.remove("admin-shell");
      delete document.documentElement.dataset.adminTheme;
    };
  }, [themeConfig.id]);

  const voteUrl = useMemo(
    () => (baseUrl ? `${baseUrl}/poll/${pollId}` : ""),
    [baseUrl, pollId],
  );
  const obsUrl = useMemo(
    () => (baseUrl ? `${baseUrl}/poll/${pollId}/obs` : ""),
    [baseUrl, pollId],
  );

  async function runCloseAndNext() {
    setBusy("next");
    try {
      if (poll && !poll.is_closed) {
        await closePoll(pollId);
      }
      setActivePollId(pollId);
      setSessionPhase("compose_next");
      router.push(`/poll/${pollId}/next`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to close poll");
      setBusy(null);
      setDialog(null);
    }
  }

  async function runFinishStream() {
    setBusy("finish");
    try {
      if (poll && !poll.is_closed) {
        await closePoll(pollId);
      }
      clearActivePollId();
      router.push("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to finish stream");
      setBusy(null);
      setDialog(null);
    }
  }

  function requestCloseAndNext() {
    // Already closed → go straight to next-question compose
    if (poll?.is_closed) {
      void runCloseAndNext();
      return;
    }
    setDialog("next");
  }

  function requestFinishStream() {
    setDialog("finish");
  }

  if (loading) {
    return (
      <main
        className={`${admin.bg} ${admin.text} flex items-center justify-center px-4`}
        data-theme={themeConfig.id}
      >
        <p className={admin.meta}>Loading poll…</p>
      </main>
    );
  }

  if (error || !poll) {
    return (
      <main
        className={`${admin.bg} ${admin.text} flex flex-col items-center justify-center gap-4 px-4`}
        data-theme={themeConfig.id}
      >
        <p className="text-rose-300">{error ?? "Poll not found"}</p>
        <button
          type="button"
          onClick={() => {
            clearActivePollId();
            router.push("/");
          }}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${admin.shareBtn}`}
        >
          Back to home
        </button>
      </main>
    );
  }

  const questionNumber = poll.question_number ?? 1;

  return (
    <main
      className={`${admin.bg} ${admin.text}`}
      data-theme={themeConfig.id}
      data-admin-theme={themeConfig.id}
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <BrandHeader
          brandClassName={admin.brand}
          liveClassName={admin.live}
          rightSlot={
            <button
              type="button"
              disabled={busy !== null}
              onClick={requestFinishStream}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${admin.finishBtn}`}
            >
              {busy === "finish" ? "Finishing…" : "🛑 Finish Stream"}
            </button>
          }
        />

        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {questionNumber >= 2 ? (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${admin.badge}`}
              >
                Q{questionNumber}
              </span>
            ) : null}
            <span
              className={`text-xs font-medium uppercase tracking-wider ${admin.label}`}
            >
              {poll.is_closed ? "Closed" : "Live"}
            </span>
          </div>
          <h1
            className={`font-[family-name:var(--font-display)] text-2xl font-extrabold sm:text-3xl ${admin.title}`}
          >
            {poll.title}
          </h1>
          <p className={`mt-1 text-sm ${admin.meta}`}>
            {totalVotes} total votes
            {questionNumber >= 2 ? ` · Question #${questionNumber}` : ""}
          </p>
        </div>

        <section className={`${admin.cardBg} grid gap-8 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-10`}>
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${admin.label}`}
            >
              QR Code for Voters
            </p>
            <div className="rounded-xl bg-white p-3 shadow-sm">
              {voteUrl ? (
                <QRCodeSVG value={voteUrl} size={160} level="M" />
              ) : (
                <div className="h-40 w-40 animate-pulse bg-slate-200" />
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:pt-6">
            <CopyButton
              label="📋 Copy Share Link"
              value={voteUrl}
              className={`w-full sm:w-auto ${admin.shareBtn}`}
            />
            <CopyButton
              label="🎥 Copy OBS Link"
              value={obsUrl}
              className={`w-full sm:w-auto ${admin.obsBtn}`}
            />
          </div>
        </section>

        <section className="mt-8">
          <h2
            className={`mb-4 font-[family-name:var(--font-display)] text-lg font-bold ${admin.title}`}
          >
            📊 Live Results
          </h2>
          <div className={admin.cardBg}>
            <LiveResultsChart
              options={poll.options}
              counts={counts}
              totalVotes={totalVotes}
              theme={poll.theme}
              surface="admin"
              votesPerVoter={poll.max_votes_per_user}
              votes={votes}
              bumpedOptionId={lastBumpedOptionId}
              isClosed={poll.is_closed}
              questionNumber={poll.question_number}
            />
          </div>
        </section>

        <div className="mt-10">
          <button
            type="button"
            disabled={busy !== null}
            onClick={requestCloseAndNext}
            className={`w-full rounded-2xl px-6 py-4 text-base font-bold shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${admin.cta}`}
          >
            {busy === "next"
              ? "Closing…"
              : poll.is_closed
                ? `🚀 Create Q${questionNumber + 1}`
                : "🚀 Close & Next Question"}
          </button>
          <p className={`mt-3 text-center text-xs ${admin.hint}`}>
            Keeps the same share / OBS URL for the next question in this stream.
          </p>
        </div>

        <ConfirmDialog
          open={dialog === "next"}
          title="Close & Next Question"
          description="Close this question and create the next one in the same room. Share link and OBS URL stay the same."
          confirmLabel="🚀 Next Question"
          busy={busy === "next"}
          onCancel={() => setDialog(null)}
          onConfirm={() => void runCloseAndNext()}
        />

        <ConfirmDialog
          open={dialog === "finish"}
          title="Finish Stream"
          description="End this stream session? You'll leave this room and create a brand-new poll URL next time."
          confirmLabel="🛑 Finish Stream"
          busy={busy === "finish"}
          onCancel={() => setDialog(null)}
          onConfirm={() => void runFinishStream()}
        />
      </div>
    </main>
  );
}
