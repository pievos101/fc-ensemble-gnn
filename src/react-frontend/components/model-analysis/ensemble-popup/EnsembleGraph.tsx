import { TGraph } from "../../../queries/useGetGraphs";
import { useTheme } from "@mui/material";
import React, { useMemo } from "react";
import { GraphCanvas } from "reagraph";

function ensureWeightIsAboveThreshold(weight: number, threshold: number = 0.1) {
  if (weight < threshold) {
    return threshold * 10;
  }
  return weight * 10;
}

export function EnsembleGraph({ ensemble }: { ensemble: TGraph }) {
  const theme = useTheme();

  const nodes = useMemo(() =>
      ensemble.nodes.map(it => ({
        id: it.name,
        label: it.name,
        data: {
          weight: ensureWeightIsAboveThreshold(it.weight)
        }
      }))
    , [ensemble.nodes]);

  const edges = useMemo(() =>
      ensemble.edges.map(it => ({
        id: `${it.source}->${it.target}`,
        source: it.source,
        target: it.target,
        data: {
          weight: ensureWeightIsAboveThreshold(it.weight)
        },
        size: ensureWeightIsAboveThreshold(it.weight)
      }))
    , [ensemble.edges]);

  return (
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
      />
    </div>
  );
}