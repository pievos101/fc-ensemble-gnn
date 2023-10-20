import React from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import {ModelContainer} from "./model-analysis/ModelContainer";
import { useGetStatus } from "../queries/useGetStatus";
import { useGetGraphs } from "../queries/useGetGraphs";
import { useTestSet } from "../queries/useTestSet";

interface ContentContainerProps {
}

export function ContentContainer({}: ContentContainerProps) {
  const { loading, modelNotReadyYet } = useGetStatus();
  const { validationSetGraph, testSetGraph, isError } = useGetGraphs();
  const { testSetUnlocked } = useTestSet();

  console.log("validationSetGraph", validationSetGraph);
  console.log("testSetGraph", testSetGraph);


    return (
      <Stack direction={"row"} spacing={4} sx={{ p: 4, overflowX: "auto", alignItems: "start" }}>
        <ModelContainer ensembles={validationSetGraph}
                        title={"Gloabl Model - Validation Set"}
                        description={"The global model with the results of the validation set"} />
        {testSetUnlocked && <ModelContainer ensembles={testSetGraph}
                                            title={"Gloabl Model - Test Set"}
                                            description={"The final result with weighted ensembles"} />}
        </Stack>
    )
}