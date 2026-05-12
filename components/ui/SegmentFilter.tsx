"use client";

import { useEffect, useRef, useState } from "react";
import {
  ALL_SEGMENTS,
  SEGMENT_COLORS,
  SEGMENT_DEFINITIONS,
} from "@/lib/constants";
import type { Segment } from "@/lib/types";

interface SegmentFilterProps {
  selected: Segment[];
  onChange: (segments: Segment[]) => void;
}

export default function SegmentFilter({
  selected,
  onChange,
}: SegmentFilterProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helpOpen) return;
    const onClick = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelpOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [helpOpen]);

  const toggle = (seg: Segment) => {
    if (selected.includes(seg)) {
      // Don't allow deselecting all
      if (selected.length > 1) {
        onChange(selected.filter((s) => s !== seg));
      }
    } else {
      onChange([...selected, seg]);
    }
  };

  return (
    <fieldset className="mb-4">
      <div ref={helpRef} className="relative mb-2 flex items-center gap-1.5">
        <legend className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Segmentos
        </legend>
        <button
          type="button"
          aria-label="O que são os Segmentos?"
          aria-expanded={helpOpen}
          onClick={() => setHelpOpen((v) => !v)}
          className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold leading-none transition-colors hover:brightness-110"
          style={{
            borderColor: "var(--accent, #2563eb)",
            backgroundColor: "var(--accent, #2563eb)",
            color: "#fff",
          }}
        >
          ?
        </button>
        {helpOpen && (
          <div
            role="dialog"
            aria-label="Definição dos Segmentos"
            className="absolute left-0 top-full z-20 mt-1 w-[min(28rem,90vw)] rounded-md border p-3 shadow-lg"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--background, #fff)",
            }}
          >
            <ul className="space-y-2 text-xs leading-snug text-text-secondary">
              {ALL_SEGMENTS.map((seg) => (
                <li key={seg} className="flex gap-2">
                  <span
                    className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: SEGMENT_COLORS[seg] }}
                  />
                  <span>
                    <span
                      className="font-mono font-bold"
                      style={{ color: SEGMENT_COLORS[seg] }}
                    >
                      {seg}
                    </span>{" "}
                    — {SEGMENT_DEFINITIONS[seg]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {ALL_SEGMENTS.map((seg) => {
          const isChecked = selected.includes(seg);
          const color = SEGMENT_COLORS[seg];
          return (
            <label
              key={seg}
              className="flex cursor-pointer items-center gap-1.5 rounded-pill border px-3 py-1.5 font-mono text-xs font-bold transition-all"
              style={{
                borderColor: isChecked ? color : "var(--border-color)",
                backgroundColor: isChecked
                  ? `${color}20`
                  : "transparent",
                color: isChecked ? color : "var(--text-secondary)",
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(seg)}
                className="sr-only"
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {seg}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
