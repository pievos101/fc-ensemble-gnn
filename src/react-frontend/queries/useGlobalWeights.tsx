import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "../App";
import { useGetStatus } from "./useGetStatus";
import { useSettings } from "./useSettings";
import { useEffect } from "react";

export function useGlobalWeights() {
  const { data: status } = useGetStatus();
  const { error, data, refetch } = useQuery<number[]>({
    queryKey: ["global-weights"],
    queryFn: async () => {
      const res = await fetch(getApiUrl() + "/global-weights");
      return await res.json();
    },
    enabled: false
  });

  useEffect(() => {
    // if the weights are available, load them
    if (status?.global_weights_available) {
      void refetch();
    }
  }, [status?.global_weights_available]);

  /**
   * Distributes the weights to the coordinator.
   * The weights are already stored on the client, so we don't need to send them again.
   * */
  const distributeWeights = async () => {
    if (status?.weight_aggregation_ongoing) {
      window.alert("Weight aggregation is already ongoing.");
      return;
    }
    await fetch(getApiUrl() + "/distribute-weights", { method: "POST" });
  };


  return {
    weights: data ?? [],
    error,
    fetchWeights: refetch,
    distributeWeights,
    loading: Boolean(status?.weight_aggregation_ongoing),
    available: Boolean(status?.global_weights_available)
  };
}