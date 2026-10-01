"use client";

import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { createPoll } from "@/lib/polls";
import {
  getActivePollId,
  setActivePollId,
} from "@/lib/poll-storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { canUseTheme, getOptionIcon, getThemeVisuals } from "@/lib/themes";
import {
  MAX_VOTES_OPTIONS,
  THEME_OPTIONS,
  type MaxVotesPerUser,
  type PollOption,
  type PollTheme,
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
  const [theme, setTheme] = useState<PollTheme>("dark");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visuals = getThemeVisuals(theme);
  const create = visuals.create;

  const selectChevron = useMemo(
    () => ({
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${create.chevron}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    }),
    [create.chevron],
  );

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

    // Free users may still pick Animal Race via Free Trial.
    if (!canUseTheme(theme, false)) {
      setError("This theme requires Pro. Pick another theme or upgrade.");
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
        theme,
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
      <main
        className={`flex min-h-screen w-full items-center justify-center px-4 transition-colors duration-300 ${create.page}`}
      >
        <p className={create.subtitle}>Opening your active poll…</p>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen w-full transition-colors duration-300 ${create.page}`}
    >
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <BrandHeader
          brandClassName={create.brand}
          liveClassName={create.live}
          title="Create a live poll in 5 seconds"
          titleClassName={create.subtitle}
        />

        <section>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
            <label className="block space-y-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${create.label}`}
              >
                Poll Title (Optional)
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. What game next?"
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${create.input}`}
              />
            </label>

            <fieldset className="space-y-3">
              <legend
                className={`text-xs font-semibold uppercase tracking-wider ${create.label}`}
              >
                Options (Up to 5)
              </legend>
              {options.map((value, index) => {
                const icon = getOptionIcon(theme, index);
                return (
                  <div key={index} className="flex items-center gap-3">
                    {icon ? (
                      <span
                        className="w-8 shrink-0 text-center text-2xl"
                        aria-hidden
                      >
                        {icon}
                      </span>
                    ) : null}
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={
                        index < 2
                          ? `${index + 1}. Option ${index + 1}`
                          : `${index + 1}. Option ${index + 1} (Optional)`
                      }
                      className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${create.input}`}
                    />
                  </div>
                );
              })}
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${create.label}`}
                >
                  Votes per voter
                </span>
                <select
                  value={maxVotes}
                  onChange={(e) =>
                    setMaxVotes(Number(e.target.value) as MaxVotesPerUser)
                  }
                  className={`w-full appearance-none rounded-xl border bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat px-4 py-3 pr-10 outline-none focus:ring-2 ${create.select}`}
                  style={selectChevron}
                >
                  {MAX_VOTES_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className={create.optionBg}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${create.label}`}
                >
                  Theme
                </span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as PollTheme)}
                  className={`w-full appearance-none rounded-xl border bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat px-4 py-3 pr-10 outline-none focus:ring-2 ${create.select}`}
                  style={selectChevron}
                >
                  {THEME_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className={create.optionBg}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-2xl px-6 py-4 text-base font-bold shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${create.cta}`}
            >
              {submitting ? "Creating…" : "🚀 Share & Create Poll"}
            </button>

            <div className={`space-y-1 pt-1 text-center text-xs ${create.subtitle}`}>
              <p>★ Monetize your stream with Super Votes & Custom Avatars!</p>
              <p className="opacity-80">Upgrade to Pro ($8/mo) — coming soon</p>
            </div>

            <footer
              className={`space-y-2 pt-2 text-center text-xs ${create.subtitle}`}
            >
              <p>Free plan: one active poll at a time. Close it to create the next.</p>
              <p>
                © PollPop 2026 |{" "}
                <a
                  href="/terms"
                  className="underline-offset-2 transition hover:underline"
                >
                  Terms
                </a>
              </p>
            </footer>
          </form>
        </section>
      </div>
    </main>
  );
}
