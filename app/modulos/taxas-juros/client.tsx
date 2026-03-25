"use client";

import { useState } from "react";
import RankingsTab from "./tabs/RankingsTab";
import BankTab from "./tabs/BankTab";
import ChartsTab from "./tabs/ChartsTab";

const TABS = [
  { key: "rankings", label: "📊 Ranking" },
  { key: "bank", label: "🏦 Banco Individual" },
  { key: "charts", label: "📈 Gráficos" },
];

export default function TaxasJurosClient() {
  const [activeTab, setActiveTab] = useState("rankings");

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

      {activeTab === "rankings" && <RankingsTab />}
      {activeTab === "bank" && <BankTab />}
      {activeTab === "charts" && <ChartsTab />}
    </>
  );
}
