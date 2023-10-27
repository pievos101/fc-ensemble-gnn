import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "../App";
import { useEffect, useMemo } from "react";
import { useSettings } from "./useSettings";

export function useGetPerformance(opts: {
  isTestSet: boolean
  client: "local" | "global"
  weights: number[]
}) {
  const { weights, settings } = useSettings();

  const key = opts.isTestSet ? "performance-test" : "performance-validation";

  const { error, isLoading, data, refetch } = useQuery<{
    acc: number,
    acc_bal: number,
    nmi: number,
  }>({
    queryKey: [key],
    queryFn: async () => {
      const res = await fetch(getApiUrl() + "/compute-performance", {
        method: "POST",
        body: JSON.stringify({
          is_test_set: opts.isTestSet,
          weights: opts.weights,
          client: opts.client
        })
      });
      return await res.json();
    },
    enabled: false
  });

  const stats = useMemo(() => ({
    acc: Math.round((data?.acc ?? 0) * 100),
    acc_balanced: ((data?.acc_bal ?? 0) * 100),
    nmi: (data?.nmi ?? 0)
  }), [data]);

  return {
    isLoading,
    stats,
    refetch
  };
}