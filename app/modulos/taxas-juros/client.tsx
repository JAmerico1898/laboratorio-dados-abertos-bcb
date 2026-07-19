"use client";

import { useState, useEffect } from "react";
import RankingsTab from "./tabs/RankingsTab";
import BankTab from "./tabs/BankTab";
import ChartsTab from "./tabs/ChartsTab";
import type { RankingsResponse } from "@/lib/types";

type Segment = "pf" | "pj";

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "pf", label: "Pessoa Física" },
  { key: "pj", label: "Pessoa Jurídica" },
];

const TABS = [
  { key: "rankings", label: "📊 Ranking" },
  { key: "bank", label: "🏦 Banco Individual" },
  { key: "charts", label: "📈 Gráficos" },
];

export default function TaxasJurosClient() {
  const [segment, setSegment] = useState<Segment>("pf");
  const [activeTab, setActiveTab] = useState("rankings");

  // Batch rankings endpoint for the active segment — fast, pre-computed.
  const [rankingsData, setRankingsData] = useState<RankingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetch(`/api/taxas/rankings?segment=${segment}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setRankingsData(d);
        setIsLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [segment]);

  return (
    <>
      {/* Segment toggle */}
      <div className="mb-4 flex gap-1 rounded-[12px] border border-border bg-bg-surface p-1">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.key}
            onClick={() => setSegment(seg.key)}
            className={`flex-1 rounded-[10px] px-4 py-2.5 text-sm font-bold transition-all ${
              segment === seg.key
                ? "bg-gradient-to-br from-accent-cyan to-cyan-600 text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-[12px] border border-border bg-bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-gradient-to-br from-accent-cyan to-cyan-600 text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "rankings" && (
        <RankingsTab data={rankingsData} isLoading={isLoading} error={error} />
      )}
      {/* key={segment} remounts these so their internal selections reset on switch */}
      {activeTab === "bank" && <BankTab key={segment} segment={segment} />}
      {activeTab === "charts" && <ChartsTab key={segment} segment={segment} />}
    </>
  );
}
