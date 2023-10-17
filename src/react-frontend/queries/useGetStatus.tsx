import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "../App";
import React from "react";

export function useGetStatus() {
  const { error, isLoading, data, isError } = useQuery<{ status?: string, state?: string }>({
    queryKey: ["status"],
    queryFn: async () => {
      const res = await fetch(getApiUrl() + "/status");
      return await res.json();
    },
    refetchInterval: 1000
  });

  const modelNotReadyYet = !data || data?.state !== "web_controlled"; // status is hard-coded in status.py

  return {
    status: data?.state ?? "unknown",
    error,
    loading: isLoading,
    modelNotReadyYet
  };
}