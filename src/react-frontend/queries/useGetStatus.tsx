import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "../App";

export function useGetStatus() {
  const { isLoading, data, ...rest } = useQuery<{
    status: string,
    global_training_complete: boolean,
    local_training_complete: boolean,
    weight_aggregation_ongoing: boolean,
    global_weights_available: boolean,
    state?: string, // only available in FeatureCloud environment
    role: "client" | "coordinator"
  }>({
    queryKey: ["status"],
    queryFn: async () => {
      const res = await fetch(getApiUrl() + "/status");
      return await res.json();
    },
    refetchInterval: 1500
  });

  return {
    ...rest,
    status: data?.state ?? "unknown",
    loading: isLoading,
    data
  };
}