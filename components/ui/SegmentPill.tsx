import { SEGMENT_COLORS } from "@/lib/constants";
import type { Segment } from "@/lib/types";

export default function SegmentPill({ segment }: { segment: string }) {
  const color = SEGMENT_COLORS[segment as Segment] ?? "#64748b";
  return (
    <span
      className="seg-pill"
      style={{
        backgroundColor: `${color}20`,
        color,
      }}
    >
      {segment}
    </span>
  );
}
