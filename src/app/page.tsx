"use client";

import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { createPoll } from "@/lib/polls";
import {
  getActivePollId,
  setActivePollId,
} from "@/lib/poll-storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  MAX_VOTES_OPTIONS,
  type MaxVotesPerUser,
  type PollOption,
} from "@/types/poll";

const EMPTY_OPTIONS = ["", "", "", "", ""];

function subscribeNoop() {
  return () => {};
}

export default function HomePage() {
  const router = useRouter();
  const activePollId = useSyncExternalStore(
    subscribeNoop,
    getActivePollId,
    () => null,
  );

  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(EMPTY_OPTIONS);
  const [maxVotes, setMaxVotes] = useState<MaxVotesPerUser>(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activePollId) {
      router.replace(`/poll/${activePollId}/admin`);
    }
  }, [activePollId, router]);

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase is not configured. Copy .env.local.example to .env.local and add your project URL + anon key.",
      );
      return;
    }

    const filled = options
      .map((text) => text.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (filled.length < 2) {
      setError("Add at least 2 options.");
      return;
    }

    const pollOptions: PollOption[] = filled.map((text, i) => ({
      id: i + 1,
      text,
    }));

    setSubmitting(true);
    try {
      const poll = await createPoll({
        title: title.trim() || "Untitled Poll",
        options: pollOptions,
        max_votes_per_user: maxVotes,
      });
      setActivePollId(poll.id);
      router.push(`/poll/${poll.id}/admin`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create poll");
      setSubmitting(false);
    }
  }

  if (activePollId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4">
        <p className="text-slate-400">Opening your active poll…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <BrandHeader />

      <section>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-slate-50 sm:text-3xl">
          Create a live poll in 5 seconds
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Free plan: one active poll at a time. Close it to create the next.
        </p>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-6">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Poll Title (Optional)
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. What game next?"
              className="w-full rounded-xl border border-slate-700/80 bg-transparent px-4 py-3 text-slate-100 outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2"
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Options (Up to 5)
            </legend>
            {options.map((value, index) => (
              <input
                key={index}
                type="text"
                value={value}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={
                  index < 2
                    ? `${index + 1}. Option ${index + 1}`
                    : `${index + 1}. Option ${index + 1} (Optional)`
                }
                className="w-full rounded-xl border border-slate-700/80 bg-transparent px-4 py-3 text-slate-100 outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2"
              />
            ))}
          </fieldset>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Votes per person
            </span>
            <select
              value={maxVotes}
              onChange={(e) =>
                setMaxVotes(Number(e.target.value) as MaxVotesPerUser)
              }
              className="w-full appearance-none rounded-xl border border-slate-700/80 bg-transparent bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat px-4 py-3 text-slate-100 outline-none ring-cyan-400/40 focus:ring-2"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              }}
            >
              {MAX_VOTES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-orange-400 px-6 py-4 text-base font-bold text-slate-950 shadow-lg shadow-cyan-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating…" : "🚀 Share & Create Poll"}
          </button>
        </form>
      </section>
    </main>
  );
}
