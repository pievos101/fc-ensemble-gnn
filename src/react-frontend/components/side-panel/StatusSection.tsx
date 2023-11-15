import { Alert, AlertTitle, Button, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useGetStatus } from "../../queries/useGetStatus";
import { getApiUrl } from "../../App";

function ControllerInfo() {
  return (
    <Alert severity={"warning"}>
      <AlertTitle>
        Role: Coordinator
      </AlertTitle>
      The coordinator does not train a model itself, but does the aggregation internally and can overview the global
      model.
    </Alert>
  );
}

export function StatusSection() {
  const { status, error, loading, data } = useGetStatus();

  useEffect(() => {
    console.info("Status Data:", data);
  }, [data]);

  const terminateWorkflow = async () => {
    await fetch(getApiUrl() + "/terminate", { method: "POST" });
  };

  const isCoordinator = data?.role === "coordinator";
  const modelIsLoading = (loading || status === "local_training") && !isCoordinator;

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant={"overline"} fontSize={"1rem"}>
        Status: <Chip color={"info"} label={status} variant={"outlined"} sx={{ p: 0 }} />
      </Typography>
      {modelIsLoading && <Alert severity={"info"}>
        <AlertTitle>Long computing time</AlertTitle>
        The training duration of the model is dependent on the training data size and the number of ensembles.
        It can take several minutes to train the model.
      </Alert>}
      {modelIsLoading && <LinearProgress />}
      <>
        {error && <Typography variant={"subtitle1"} fontSize={"1rem"} color={"error"}>
          {JSON.stringify(error)}
        </Typography>}
      </>
      {
        isCoordinator && <ControllerInfo />
      }
      <Button onClick={terminateWorkflow} color={"error"} variant={"outlined"}>
        Terminate Workflow
      </Button>
    </Stack>
  );
}