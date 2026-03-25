"use client";

import { useState, useEffect } from "react";
import { formatBRL } from "@/lib/formatting";

interface RegionData {
  name: string;
  value: number;
  color: string;
  cx: number;
  cy: number;
}

interface DorlingCartogramProps {
  regions: RegionData[];
  total: number;
}

const MIN_R = 30;
const MAX_R = 110;

// Simplified Brazil outline path
const BRAZIL_PATH =
  "M 200 60 Q 230 50, 280 55 Q 340 50, 380 60 Q 420 55, 460 70 Q 500 85, 510 110 Q 520 140, 515 170 Q 510 200, 500 230 Q 490 260, 480 280 Q 470 300, 460 320 Q 450 345, 440 365 Q 430 385, 415 400 Q 400 415, 385 425 Q 370 440, 360 455 Q 350 470, 340 485 Q 330 500, 315 510 Q 300 520, 285 515 Q 270 505, 260 490 Q 250 475, 245 455 Q 240 440, 240 420 Q 235 400, 230 380 Q 220 355, 215 335 Q 210 310, 200 290 Q 190 275, 180 265 Q 170 255, 165 240 Q 155 220, 150 200 Q 145 175, 150 150 Q 155 125, 165 105 Q 175 85, 190 70 Z";

export default function DorlingCartogram({
  regions,
  total,
}: DorlingCartogramProps) {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const maxVal = Math.max(...regions.map((r) => r.value), 1);

  const withRadius = regions.map((r) => ({
    ...r,
    radius: MIN_R + (MAX_R - MIN_R) * Math.sqrt(r.value / maxVal),
    share: total > 0 ? (r.value / total) * 100 : 0,
  }));

  return (
    <div className="relative">
      {/* Total display */}
      <div className="mb-2 text-center">
        <div className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
          Crédito Total por Região
        </div>
        <div className="font-mono text-2xl font-bold text-accent-cyan">
          {formatBRL(total)}
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative mx-auto" style={{ maxWidth: 600 }}>
        <svg
          viewBox="0 0 600 580"
          preserveAspectRatio="xMidYMid meet"
          className="w-full"
          role="img"
          aria-label="Cartograma de crédito por região do Brasil"
        >
          {/* Brazil outline */}
          <path d={BRAZIL_PATH} fill="#111827" fillOpacity={0.4} />
          <path
            d={BRAZIL_PATH}
            fill="none"
            stroke="#1e293b"
            strokeWidth={1.5}
            opacity={0.5}
          />

          {/* Circles */}
          {withRadius.map((r, i) => (
            <g key={r.name}>
              <circle
                cx={r.cx}
                cy={r.cy}
                r={animated ? r.radius : 0}
                fill={r.color}
                fillOpacity={
                  hovered === null || hovered === r.name ? 0.8 : 0.25
                }
                stroke={r.color}
                strokeWidth={2}
                strokeOpacity={
                  hovered === null || hovered === r.name ? 0.4 : 0.15
                }
                style={{
                  transition: `r 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 150}ms, fill-opacity 0.3s, filter 0.3s`,
                  cursor: "pointer",
                  filter:
                    hovered === r.name
                      ? "drop-shadow(0 0 20px rgba(255,255,255,0.15))"
                      : "none",
                }}
                onMouseEnter={() => setHovered(r.name)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>
                  {r.name}: {formatBRL(r.value)} ({r.share.toFixed(1)}%)
                </title>
              </circle>

              {/* Labels */}
              <text
                x={r.cx}
                y={r.cy - 8}
                textAnchor="middle"
                className="pointer-events-none font-mono font-bold"
                fill="#f1f5f9"
                fontSize={Math.max(11, Math.min(15, r.radius / 6))}
                opacity={
                  animated
                    ? hovered === null || hovered === r.name
                      ? 1
                      : 0.2
                    : 0
                }
                style={{ transition: "opacity 0.5s ease 0.8s" }}
              >
                {r.name.toUpperCase()}
              </text>
              <text
                x={r.cx}
                y={r.cy + 10}
                textAnchor="middle"
                className="pointer-events-none font-mono font-bold"
                fill="#e2e8f0"
                fontSize={Math.max(9, Math.min(13, r.radius / 7))}
                opacity={
                  animated
                    ? hovered === null || hovered === r.name
                      ? 1
                      : 0.2
                    : 0
                }
                style={{ transition: "opacity 0.5s ease 1s" }}
              >
                {r.share.toFixed(1)}%
              </text>
              <text
                x={r.cx}
                y={r.cy + 25}
                textAnchor="middle"
                className="pointer-events-none font-mono"
                fill="#94a3b8"
                fontSize={Math.max(8, Math.min(11, r.radius / 8))}
                opacity={
                  animated
                    ? hovered === null || hovered === r.name
                      ? 1
                      : 0.2
                    : 0
                }
                style={{ transition: "opacity 0.5s ease 1.1s" }}
              >
                {formatBRL(r.value)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
