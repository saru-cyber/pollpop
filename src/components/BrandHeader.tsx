"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function BrandHeader({
  rightSlot,
}: {
  rightSlot?: ReactNode;
}) {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <Link href="/" className="group flex items-baseline gap-1">
        <span className="font-[family-name:var(--font-display)] text-3xl font-black tracking-tight text-cyan-300 transition group-hover:text-cyan-200">
          PollPop
        </span>
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
          live
        </span>
      </Link>
      {rightSlot}
    </header>
  );
}
