"use client";

import { useState, useEffect } from "react";
import RankingsTab from "./tabs/RankingsTab";
import BankTab from "./tabs/BankTab";
import ChartsTab from "./tabs/ChartsTab";
import type { RankingsResponse } from "@/lib/types";

const TABS = [
  { key: "rankings", label: "📊 Ranking" },
  { key: "bank", label: "🏦 Banco Individual" },
  { key: "charts", label: "📈 Gráficos" },
];

export default function TaxasJurosClient() {
  const [activeTab, setActiveTab] = useState("rankings");

  // Only fetch the batch rankings endpoint — it's fast (~5s) and
  // contains top/bottom 10 for all modalities
  const [rankingsData, setRankingsData] = useState<RankingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/taxas/rankings")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setRankingsData(d);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
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
      {activeTab === "bank" && <BankTab />}
      {activeTab === "charts" && <ChartsTab />}
    </>
  );
}
