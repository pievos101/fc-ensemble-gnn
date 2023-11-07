import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "../App";
import { useEffect, useMemo } from "react";
import { useSettings } from "./useSettings";

export type TGraph = {
  id: number,
  nodes: {
    id: number,
    name: string,
    weight: number
  }[],
  edges: {
    id: number,
    source: string,
    target: string,
    weight: number
  }[],
  performance: number
}

function graphArrayToObj(subnetwork: any, idx: number): TGraph {
  const edges = subnetwork[0];
  const edge_starts: number[] = edges[0];
  const edge_ends: number[] = edges[1];
  const nodes = subnetwork[1];
  const performance: number = subnetwork[2];
  const node_weights: number[] = subnetwork[3];
  const edge_weights: number[] = subnetwork[4];

  return {
    id: idx,
    nodes: nodes.map((it: any, idx: number) => ({
      id: idx,
      name: it,
      weight: node_weights?.[idx] ?? 0 // fallback to 1 if no weights are provided
    })),
    performance,
    edges: edge_starts.map((start: number, i: number) => ({
      id: i,
      source: nodes[start],
      target: nodes[edge_ends[i]],
      weight: edge_weights?.[i] ?? 0 // fallback to 1 if no weights are provided
    }))
  };
}

export function useGetGlobalGraphs(disabled: boolean = false) {
  const { data: globalModelData, ...rest } = useQuery({
    queryKey: ["global-graphs"],
    queryFn: async () => {
      const res = await fetch(getApiUrl() + "/global-model");
      return await res.json();
    },
    retryDelay: 2000,
    retry: true,
    enabled: !disabled
  });

  const globalModel: TGraph[] = useMemo(() => {
    return globalModelData?.map(graphArrayToObj) ?? [];
  }, [globalModelData]);

  return {
    globalModel: globalModel,
    ...rest
  };
}

export function useGetLocalGraphs(disabled: boolean = false) {
  const { data: globalModelData, ...rest } = useQuery({
    queryKey: ["local-graphs"],
    queryFn: async () => {
      const res = await fetch(getApiUrl() + "/local-model");
      return await res.json();
    },
    retryDelay: 2000,
    retry: true,
    enabled: !disabled
  });

  const localModel: TGraph[] = useMemo(() => {
    return globalModelData?.map(graphArrayToObj) ?? [];
  }, [globalModelData]);

  return {
    localModel: localModel,
    ...rest
  };
}