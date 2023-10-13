import React from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import {ModelContainer} from "./model-analysis/ModelContainer";
import { useGetStatus } from "../queries/useGetStatus";
import { useGetGraphs } from "../queries/useGetGraphs";
import { useTestSet } from "../queries/useTestSet";

interface ContentContainerProps {
}

export function ContentContainer({}: ContentContainerProps) {
  const { loading } = useGetStatus();
  const { validationSetGraph, testSetGraph, isError } = useGetGraphs();
  const { testSetUnlocked } = useTestSet();

  if (loading) return (
    <Stack spacing={2} sx={{ alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
      <CircularProgress />
      <Typography variant={"h4"}>
        Loading...
      </Typography>
    </Stack>
  );

  if (isError) return (
    <Stack spacing={2} sx={{ alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
      <Typography variant={"h4"}>
        Error loading data
      </Typography>
    </Stack>
  );

    return (
      <Stack direction={"row"} spacing={4} sx={{ p: 4, overflowX: "auto" }}>
        <ModelContainer ensembles={validationSetGraph as any[]}
                        title={"Gloabl Model - Validation Set"}
                        description={"The global model with the results of the validation set"} />
        {testSetUnlocked && <ModelContainer ensembles={testSetGraph as any[]}
                                            title={"Gloabl Model - Test Set"}
                                            description={"The final result with weighted ensembles"} />}
        </Stack>
    )
}