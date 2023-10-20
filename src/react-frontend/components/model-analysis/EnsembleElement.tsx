import { TGraph } from "../../queries/useGetGraphs";
import React, { useState } from "react";
import { EnsemblePopup } from "./ensemble-popup/EnsemblePopup";
import { Card, Chip, Stack, Typography } from "@mui/material";

export type TEnsemble = {
  result: number
  weighting: number,
  genes: { name: string, weight: number }[],
  network: {
    gene: string
    connectedTo: string
    connectionWeight: number
  }[]
}

export function EnsembleElement({ ensembleClassifier }: { ensembleClassifier: TGraph }) {
  const [popupOpen, setPopupOpen] = useState(false);

  const sortedEnsemble = ensembleClassifier.nodes.sort((a, b) => b.weight - a.weight);

  return (
    <>
      <EnsemblePopup ensemble={ensembleClassifier} open={popupOpen} onClose={() => setPopupOpen(false)} />
      <Card style={{ cursor: "pointer" }} sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}
            onClick={() => setPopupOpen(true)}>
        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <Typography>
            Result: <b>{Math.ceil(ensembleClassifier.performance * 100)}%</b>
          </Typography>
          <Typography>
            Weighting: <b>TODO</b>
          </Typography>
          <Typography>
            Number Nodes: <b>{ensembleClassifier.nodes.length}</b>
          </Typography>
        </Stack>
        <Stack direction={"row"} sx={{ overflowX: "auto" }} spacing={0.5}>
          {sortedEnsemble.map((it, idx) => <Chip key={idx} size={"small"} color={"info"}
                                                 label={it.name} />)}
        </Stack>
      </Card>
    </>
  );
}