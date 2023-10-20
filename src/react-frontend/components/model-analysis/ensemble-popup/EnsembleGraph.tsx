import { TGraph } from "../../../queries/useGetGraphs";
import { useTheme } from "@mui/material";
import React, { useMemo } from "react";
import { GraphCanvas } from "reagraph";

export function EnsembleGraph({ ensemble }: { ensemble: TGraph }) {
  const theme = useTheme();

  const nodes = useMemo(() =>
      ensemble.nodes.map(it => ({
        id: it.name,
        label: it.name,
        data: {
          weight: it.weight ?? Math.floor(Math.random() * 10)
        }
      }))
    , [ensemble.nodes]);

  const edges = useMemo(() =>
      ensemble.edges.map(it => ({
        id: `${it.source}->${it.target}`,
        source: it.source,
        target: it.target,
        data: {
          weigth: it.weight ?? Math.floor(Math.random() * 10)
        },
        size: Math.floor(Math.random() * 10)
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