"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function BrandHeader({
  rightSlot,
  brandClassName = "text-cyan-300 group-hover:text-cyan-200",
  liveClassName = "text-slate-500",
}: {
  rightSlot?: ReactNode;
  brandClassName?: string;
  liveClassName?: string;
}) {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <Link href="/" className="group flex items-baseline gap-1">
        <span
          className={`font-[family-name:var(--font-display)] text-3xl font-black tracking-tight transition ${brandClassName}`}
        >
          PollPop
        </span>
        <span
          className={`text-xs font-medium uppercase tracking-widest ${liveClassName}`}
        >
          live
        </span>
      </Link>
      {rightSlot}
    </header>
  );
}
