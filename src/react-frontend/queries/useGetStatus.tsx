import {useQuery} from "@tanstack/react-query";
import {getApiUrl} from "../App";
import {useGetGraphs} from "./useGetGraphs";

export function useGetStatus() {
    const {error: graphError, loading: dataLoading} = useGetGraphs()

    const {error: statusError, isLoading, data, isError} = useQuery({
        queryKey: ['status'],
        queryFn: () =>
            fetch(getApiUrl() + "/status").then(
                (res) => res.json(),
            ),
        refetchInterval: 1000,
    })

    const apiError = graphError || statusError

    const modelLoading = !apiError && (isLoading || !data || data.state !== 'web_controlled' || dataLoading)  // status is hard-coded in status.py

    return {
        status: data,
        error: apiError,
        loading: modelLoading
    }
}