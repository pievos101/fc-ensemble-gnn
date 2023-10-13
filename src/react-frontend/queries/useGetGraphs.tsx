import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "../App";
import { useEffect } from "react";

export function useGetGraphs() {
  const { error: globalModelError, isLoading: globalModelLoading, data: globalModelData } = useQuery({
    queryKey: ["graphs"],
    queryFn: () =>
      fetch(getApiUrl() + "/global-model").then(
        (res) => res.json()
      )
  });
  const { error: localModelError, isLoading: localModelLoading, data: localModelData } = useQuery({
    queryKey: ["graphs"],
    queryFn: () =>
      fetch(getApiUrl() + "/local-model").then(
        (res) => res.json()
      )
  });

  const loading = globalModelLoading && localModelLoading;

  useEffect(() => {
    console.log("globalModelData", globalModelData);
    console.log("localModelData", localModelData);
  }, [globalModelData, localModelData]);

  return {
    validationSetGraph: globalModelData,
    testSetGraph: globalModelData,
    error: localModelError ?? globalModelError,
    isError: Boolean(localModelError) || Boolean(globalModelError),
    loading: loading
  };
}