"use client";

import { ALL_SEGMENTS, SEGMENT_COLORS } from "@/lib/constants";
import type { Segment } from "@/lib/types";

interface SegmentFilterProps {
  selected: Segment[];
  onChange: (segments: Segment[]) => void;
}

export default function SegmentFilter({
  selected,
  onChange,
}: SegmentFilterProps) {
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
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Segmentos
      </legend>
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
