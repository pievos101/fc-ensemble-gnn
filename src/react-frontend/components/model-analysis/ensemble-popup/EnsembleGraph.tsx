import { TGraph } from "../../../queries/useGetGraphs";
import { Alert, AlertTitle, Snackbar, SnackbarOrigin, Typography, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import { GraphCanvas } from "reagraph";

function ensureWeightIsAboveThreshold(weight: number, threshold: number = 0.1) {
  if (weight < threshold) {
    return threshold * 10;
  }
  return weight * 10;
}

interface SnackbarCall {
  type: "Edge" | "Node";
  value: number;
  id: string;
}

export function EnsembleGraph({ ensemble }: { ensemble: TGraph }) {
  const theme = useTheme();
  const [snackbarPostion, setSnackbarPostion] = useState<SnackbarCall | null>(null);

  const nodes = useMemo(() =>
      ensemble.nodes.map(it => ({
        id: it.name,
        label: it.name,
        data: {
          weight: ensureWeightIsAboveThreshold(it.weight),
          weight_unscaled: it.weight
        }
      }))
    , [ensemble.nodes]);

  const edges = useMemo(() =>
      ensemble.edges.map(it => ({
        id: `${it.source} <-> ${it.target}`,
        source: it.source,
        target: it.target,
        data: {
          weight: ensureWeightIsAboveThreshold(it.weight),
          weight_unscaled: it.weight
        },
        size: ensureWeightIsAboveThreshold(it.weight)
      }))
    , [ensemble.edges]);

  const handleClose = () => {
    setSnackbarPostion(null);
  };

  return (
    <>
      <Snackbar open={Boolean(snackbarPostion)} autoHideDuration={3000} onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
          <AlertTitle style={{ fontWeight: 600 }}>{snackbarPostion?.id}</AlertTitle>
          <Typography variant={"subtitle1"}>
            Weight: {snackbarPostion?.value.toFixed(4)}
          </Typography>
        </Alert>
      </Snackbar>
      <div style={{
        height: 500,
        width: "100%",
        overflow: "hidden",
        position: "relative",
        border: "1px solid",
        borderRadius: theme.spacing(0.5),
        borderColor: theme.palette.grey[400]
      }}>
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          sizingType={"attribute"}
          sizingAttribute={"weight"}
          edgeArrowPosition="none"
          onNodeClick={(node) => {
            setSnackbarPostion({ type: "Node", value: node.data.weight_unscaled, id: node.data.id });
          }}
          onEdgeClick={(edge) => {
            setSnackbarPostion({ type: "Edge", value: edge.data.weight_unscaled, id: edge.data.id });
          }}
        />
      </div>
    </>
  );
}
