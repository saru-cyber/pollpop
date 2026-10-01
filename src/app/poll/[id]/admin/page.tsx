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

type DialogKind = "finishVoting" | "next" | "finish" | null;
type BusyKind = "closing" | "next" | "finish" | null;

export default function AdminPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const router = useRouter();
  const { poll, counts, totalVotes, loading, error, votes, lastBumpedOptionId } =
    useLivePoll(pollId);
  const [busy, setBusy] = useState<BusyKind>(null);
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

  /** Stage 1: close voting, stay on page so winner FX can play on admin + OBS */
  async function runFinishVoting() {
    setBusy("closing");
    try {
      await closePoll(pollId);
      setDialog(null);
      setBusy(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to finish voting");
      setBusy(null);
      setDialog(null);
    }
  }

  /** Stage 2: leave celebration and compose the next question (same room) */
  async function runNextQuestion() {
    setBusy("next");
    try {
      setActivePollId(pollId);
      setSessionPhase("compose_next");
      router.push(`/poll/${pollId}/next`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to open next question");
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

  function requestPrimaryAction() {
    if (poll?.is_closed) {
      setDialog("next");
      return;
    }
    setDialog("finishVoting");
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
  const isVotingOpen = !poll.is_closed;

  return (
    <main
      className={`${admin.bg} ${admin.text} min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden`}
      data-theme={themeConfig.id}
      data-admin-theme={themeConfig.id}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-5 sm:px-5 lg:px-6 lg:py-5">
        <BrandHeader
          className="mb-3 shrink-0 lg:mb-3"
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

        <div className="mb-3 shrink-0 lg:mb-4">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {questionNumber >= 2 ? (
              <span
                className={`rounded-full border px-3 py-0.5 text-xs font-bold tracking-wide ${admin.badge}`}
              >
                Q{questionNumber}
              </span>
            ) : null}
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${admin.badge}`}
            >
              {isVotingOpen ? "● Live" : "Closed"}
            </span>
          </div>
          <h1
            className={`font-[family-name:var(--font-display)] text-xl font-extrabold leading-tight sm:text-2xl ${admin.title}`}
          >
            {poll.title}
          </h1>
          <p className={`mt-0.5 text-sm ${admin.meta}`}>
            {totalVotes} total votes
            {questionNumber >= 2 ? ` · Question #${questionNumber}` : ""}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:gap-5">
          {/* Left: QR / links / stream status */}
          <aside
            className={`${admin.cardBg} flex shrink-0 flex-col gap-4 lg:min-h-0 lg:overflow-y-auto`}
          >
            <div>
              <p
                className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${admin.label}`}
              >
                Stream status
              </p>
              <p className={`text-sm font-semibold ${admin.title}`}>
                {isVotingOpen ? "Voting open" : "Voting closed · Winner reveal"}
              </p>
              <p className={`mt-1 text-xs ${admin.meta}`}>
                Same share / OBS URL for every question in this room.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 sm:items-start">
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${admin.label}`}
              >
                QR Code for Voters
              </p>
              <div className="rounded-xl bg-white p-2.5 shadow-sm">
                {voteUrl ? (
                  <QRCodeSVG value={voteUrl} size={148} level="M" />
                ) : (
                  <div className="h-[148px] w-[148px] animate-pulse bg-slate-200" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <CopyButton
                label="📋 Copy Share Link"
                value={voteUrl}
                className={`w-full ${admin.shareBtn}`}
              />
              <CopyButton
                label="🎥 Copy OBS Link"
                value={obsUrl}
                className={`w-full ${admin.obsBtn}`}
              />
            </div>
          </aside>

          {/* Right: Live Results + progress CTA */}
          <section className="flex min-h-0 flex-1 flex-col gap-3">
            <div
              className={`${admin.cardBg} flex min-h-0 flex-1 flex-col overflow-hidden !p-4`}
            >
              <h2
                className={`mb-3 shrink-0 font-[family-name:var(--font-display)] text-base font-bold sm:text-lg ${admin.title}`}
              >
                📊 Live Results
              </h2>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
            </div>

            <div className="shrink-0 pb-1">
              <button
                type="button"
                disabled={busy !== null}
                onClick={requestPrimaryAction}
                className={`w-full rounded-2xl px-5 py-3.5 text-base font-bold shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                  poll.is_closed
                    ? admin.nextQuestionBtn
                    : admin.finishVotingBtn
                }`}
              >
                {busy === "closing"
                  ? "Finishing voting…"
                  : busy === "next"
                    ? "Opening…"
                    : poll.is_closed
                      ? "🚀 Next Question"
                      : "🏁 Finish Voting"}
              </button>
              <p className={`mt-2 text-center text-xs ${admin.hint}`}>
                {poll.is_closed
                  ? "Winner reveal stays on OBS until you start the next question."
                  : "Closes voting and plays the winner celebration — watch it before Next Question."}
              </p>
            </div>
          </section>
        </div>

        <ConfirmDialog
          open={dialog === "finishVoting"}
          title="Finish Voting?"
          description="Close this question and reveal the winner. Stay on this page to watch the celebration with your stream before starting the next question."
          confirmLabel="🏁 Finish Voting"
          busy={busy === "closing"}
          onCancel={() => setDialog(null)}
          onConfirm={() => void runFinishVoting()}
        />

        <ConfirmDialog
          open={dialog === "next"}
          title="Next Question?"
          description="Leave the winner reveal and create the next question in the same room. Share link and OBS URL stay the same."
          confirmLabel="🚀 Next Question"
          busy={busy === "next"}
          onCancel={() => setDialog(null)}
          onConfirm={() => void runNextQuestion()}
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
