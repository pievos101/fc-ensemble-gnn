import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "../App";

export function useGetStatus() {
  const { error, isLoading, data, isError } = useQuery<{
    status: string,
    global_training_complete: boolean,
    local_training_complete: boolean
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
    status: data?.state ?? "unknown",
    error,
    loading: isLoading,
    data
  };
}