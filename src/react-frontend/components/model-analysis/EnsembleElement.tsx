import { TGraph } from "../../queries/useGetGraphs";
import React, { useMemo, useState } from "react";
import { EnsemblePopup } from "./ensemble-popup/EnsemblePopup";
import { Card, Chip, Palette, Stack, Typography, useTheme } from "@mui/material";
import { useSettings } from "../../queries/useSettings";
import { faBan, faCaretDown, faCaretUp, faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Weighting({ weight }: { weight: number }) {
  const theme = useTheme();

  function getColor(weight: number) {
    switch (weight) {
      case 0:
        return theme.palette.grey[700];
      case 0.5:
        return theme.palette.error.main;
      case 1:
        return theme.palette.grey[700];
      case 1.5:
        return theme.palette.success.main;
    }
  }

  function getIcon(weight: number) {
    switch (weight) {
      case 0:
        return faBan;
      case 0.5:
        return faCaretDown;
      case 1.5:
        return faCaretUp;
    }
  }

  const icon = getIcon(weight);
  return (
    <Typography>
      Weighting:{" "}
      {icon && <FontAwesomeIcon icon={icon} color={getColor(weight)} />}
      <Typography color={getColor(weight)} style={{ display: "contents" }}>
        {" "}{weight}
      </Typography>
    </Typography>
  );
}

export function EnsembleElement({ ensembleClassifier }: { ensembleClassifier: TGraph }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const { weights } = useSettings();

  const ensembleWeight = weights[ensembleClassifier.id];

  const sortedEnsemble = useMemo(() => {
    return ensembleClassifier.nodes.sort((a, b) => b.weight - a.weight);
  }, [ensembleClassifier.nodes]);

  return (
    <>
      <EnsemblePopup ensemble={ensembleClassifier} open={popupOpen} onClose={() => setPopupOpen(false)} />
      <Card style={{ cursor: "pointer" }} sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}
            onClick={() => setPopupOpen(true)}>
        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <Typography>
            Result: <b>{Math.ceil(ensembleClassifier.performance * 100)}%</b>
          </Typography>
          <Weighting weight={ensembleWeight} />
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