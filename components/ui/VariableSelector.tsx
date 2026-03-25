"use client";

import { useCallback } from "react";

interface VarOption {
  key: string;
  label: string;
  icon: string;
  description: string;
}

interface VariableSelectorProps {
  variables: VarOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export default function VariableSelector({
  variables,
  selected,
  onSelect,
}: VariableSelectorProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let next = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next = (index + 1) % variables.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        next = (index - 1 + variables.length) % variables.length;
      }
      if (next !== index) {
        onSelect(variables[next].key);
        // Focus the next element
        const el = document.getElementById(`var-${variables[next].key}`);
        el?.focus();
      }
    },
    [variables, onSelect]
  );

  return (
    <div
      role="radiogroup"
      aria-label="Selecionar variável"
      className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {variables.map((v, i) => {
        const isSelected = v.key === selected;
        return (
          <button
            key={v.key}
            id={`var-${v.key}`}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(v.key)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`var-card cursor-pointer ${isSelected ? "selected" : ""}`}
          >
            <div className="mb-1.5 text-3xl">{v.icon}</div>
            <div className="text-sm font-bold text-text-primary">
              {v.label}
            </div>
            <div className="mt-1 text-[0.72rem] text-text-muted">
              {v.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
