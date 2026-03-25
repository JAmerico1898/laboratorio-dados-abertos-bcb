"use client";

import useSWR from "swr";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { IFDataResponse, QuarterResponse, Segment } from "@/lib/types";
import { DEFAULT_SEGMENTS } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseModuleDataOptions {
  report: number;
  defaultVariable: string;
  /** If true, adds annualized=true to the query */
  annualized?: boolean;
}

export function useModuleData({
  report,
  defaultVariable,
  annualized = false,
}: UseModuleDataOptions) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read state from URL params (or defaults)
  const variable = searchParams.get("var") ?? defaultVariable;
  const segments: Segment[] = (
    searchParams.get("seg")?.split(",").filter(Boolean) ??
    DEFAULT_SEGMENTS
  ) as Segment[];

  // Fetch quarter info for period label
  const { data: quarterData } = useSWR<QuarterResponse>(
    "/api/quarter",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3600000 }
  );

  // Build API URL
  const apiUrl = `/api/ifdata/${report}?variable=${encodeURIComponent(variable)}&segments=${segments.join(",")}${annualized ? "&annualized=true" : ""}`;

  const { data, error, isLoading } = useSWR<IFDataResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 min
  });

  // Update URL params without full navigation
  const setVariable = useCallback(
    (newVar: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("var", newVar);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setSegments = useCallback(
    (newSegments: Segment[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("seg", newSegments.join(","));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Quarter label: use period for annualized, label for regular
  const quarterLabel = annualized
    ? quarterData?.period ?? ""
    : quarterData?.label ?? "";

  return {
    variable,
    segments,
    data,
    error,
    isLoading,
    setVariable,
    setSegments,
    quarterLabel,
  };
}
