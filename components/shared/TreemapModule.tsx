"use client";

import { Suspense } from "react";
import { useModuleData } from "@/hooks/useModuleData";
import VariableSelector from "@/components/ui/VariableSelector";
import SegmentFilter from "@/components/ui/SegmentFilter";
import SummaryMetrics from "@/components/ui/SummaryMetrics";
import TreemapChart from "@/components/charts/TreemapChart";
import Top20Table from "@/components/ui/Top20Table";
import SearchInput from "@/components/ui/SearchInput";
import { SkeletonBox } from "@/components/ui/Skeleton";
import type { Segment } from "@/lib/types";

interface VarOption {
  key: string;
  label: string;
  icon: string;
  description: string;
}

interface TreemapModuleProps {
  report: number;
  variables: VarOption[];
  defaultVariable: string;
  /** DRE variables need annualization */
  annualized?: boolean;
  /** DRE values can be negative — use absolute for treemap */
  useAbsValues?: boolean;
}

export default function TreemapModule({
  report,
  variables,
  defaultVariable,
  annualized = false,
  useAbsValues = false,
}: TreemapModuleProps) {
  const {
    variable,
    segments,
    data,
    isLoading,
    setVariable,
    setSegments,
    quarterLabel,
  } = useModuleData({ report, defaultVariable, annualized });

  const currentVar = variables.find((v) => v.key === variable) ?? variables[0];

  return (
    <Suspense fallback={<SkeletonBox className="h-[650px]" />}>
      <VariableSelector
        variables={variables}
        selected={variable}
        onSelect={setVariable}
      />

      <SegmentFilter
        selected={segments}
        onChange={(segs) => setSegments(segs as Segment[])}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="h-20" />
            ))}
          </div>
          <SkeletonBox className="h-[400px] lg:h-[650px]" />
        </div>
      ) : data ? (
        <>
          <SummaryMetrics
            total={data.total}
            systemTotal={data.systemTotal}
            count={data.count}
            top5Share={data.top5Share}
            quarterLabel={quarterLabel}
          />

          <TreemapChart
            data={data.institutions}
            total={data.total}
            systemTotal={data.systemTotal}
            variableLabel={currentVar.label}
            useAbsValues={useAbsValues}
          />

          <div className="mt-6">
            <h2 className="mb-3 text-xl font-bold">
              🏆 Top 20 Instituições
            </h2>
            <Top20Table
              data={data.institutions}
              total={data.total}
              systemTotal={data.systemTotal}
              valueLabel={currentVar.label}
            />
          </div>

          <SearchInput data={data.institutions} />
        </>
      ) : (
        <div className="flex h-64 items-center justify-center text-text-muted">
          Nenhum dado disponível
        </div>
      )}
    </Suspense>
  );
}
