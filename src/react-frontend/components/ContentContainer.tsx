import React from "react";
import { Stack } from "@mui/material";
import { EnsembleModel } from "./model-analysis/EnsembleModel";
import { useGetStatus } from "../queries/useGetStatus";
import { useGetGlobalGraphs, useGetLocalGraphs } from "../queries/useGetGraphs";
import { faComputer, faGlobe } from "@fortawesome/free-solid-svg-icons";

export function ContentContainer() {
  const { data: statusData } = useGetStatus();
  const { globalModel } = useGetGlobalGraphs(!statusData?.global_training_complete);
  const { localModel } = useGetLocalGraphs(!statusData?.local_training_complete);

  return (
    <Stack direction={"row"} spacing={5}
           sx={{ p: 3, overflowX: "auto", alignItems: "start", justifyContent: "space-around" }}>
      <EnsembleModel ensembles={localModel}
                     icon={faComputer}
                     title={"Local Model"}
                     description={"Only trained on the local data"}
      />
      <EnsembleModel ensembles={globalModel}
                     icon={faGlobe}
                     title={"Global Model"}
                     description={"Aggregated from all participating clients"}
      />
    </Stack>
  );
}