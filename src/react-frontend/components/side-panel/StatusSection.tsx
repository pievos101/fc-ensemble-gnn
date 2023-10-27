import { Alert, AlertTitle, Button, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useGetStatus } from "../../queries/useGetStatus";
import { useSettings } from "../../queries/useSettings";

export function StatusSection() {
  const { status, error, loading, data } = useGetStatus();

  useEffect(() => {
    console.info("Status Data:", data);
  }, [data]);

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant={"overline"} fontSize={"1rem"}>
        Status: <Chip color={"info"} label={status} variant={"outlined"} sx={{ p: 0 }} />
      </Typography>
      {loading && <Alert severity={"info"}>
        <AlertTitle>Long computing time</AlertTitle>
        The training duration of the model is dependent on the training data size and the number of ensembles.
        It can take several minutes to train the model.
      </Alert>}
      <>
        {error && <Typography variant={"subtitle1"} fontSize={"1rem"} color={"error"}>
          {JSON.stringify(error)}
        </Typography>}
        {loading && <LinearProgress />}
      </>
    </Stack>
  );
}