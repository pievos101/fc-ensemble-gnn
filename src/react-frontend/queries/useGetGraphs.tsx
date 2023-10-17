import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "../App";
import { useEffect, useMemo } from "react";

export type TGraph = {
  nodes: {
    name: string,
    weight: number
  }[],
  edges: {
    source: string,
    target: string,
    weight: number
  }[],
  performance: number
}

function graphArrayToObj(graph: any): TGraph {
  const edges = graph[0];
  const edge_starts: number[] = edges[0];
  const edge_ends: number[] = edges[1];
  const nodes = graph[1];
  const performance: number = graph[2];

  return {
    nodes: nodes.map((it: any) => ({ name: it, weight: 1 })),
    performance,
    edges: edge_starts.map((start: number, i: number) => ({
      source: nodes[start],
      target: nodes[edge_ends[i]],
      weight: 1
    }))
  };
}

export function useGetGraphs() {
  const { error: globalModelError, isLoading: globalModelLoading, data: globalModelData, refetch } = useQuery({
    queryKey: ["graphs"],
    queryFn: async () => {
      const res = await fetch(getApiUrl() + "/global-model");
      return await res.json();
    }
  });

  const { error: localModelError, isLoading: localModelLoading, data: localModelData } = useQuery({
    queryKey: ["graphs"],
    queryFn: async () => {
      const res = await fetch(getApiUrl() + "/local-model");
      return await res.json();
    }
  });

  const loading = globalModelLoading && localModelLoading;

  const globalModel: TGraph[] = useMemo(() => {
    return globalModelData?.map(graphArrayToObj);
  }, [globalModelData]);

  return {
    validationSetGraph: globalModel,
    testSetGraph: globalModel,
    error: localModelError ?? globalModelError,
    isError: Boolean(localModelError) || Boolean(globalModelError),
    loading: loading,
    fetch: refetch
  };
}