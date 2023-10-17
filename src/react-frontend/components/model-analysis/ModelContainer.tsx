import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { EnsemblePopup } from "./EnsemblePopup";
import { TGraph } from "../../queries/useGetGraphs";

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

function EnsembleElement({ ensembleClassifier }: { ensembleClassifier: TGraph }) {
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

interface ModelContainerProps {
  title: string;
  description?: string;
  stats?: any;
  ensembles: TGraph[];
}

export function ModelContainer({ ensembles, title }: ModelContainerProps) {
  const theme = useTheme();

  if (!ensembles || ensembles?.length === 0) return (
    <Card sx={{ borderRadius: 2, width: 400 }} elevation={2}>
      <CardHeader
        avatar={
          <Avatar color={"info"}>
            <FontAwesomeIcon icon={faGlobe} />
          </Avatar>
        }
        title={title}
        subheader="Aggregated from all participants"
      />
      <CardContent>
        <Typography variant="overline" color={theme.palette.grey[700]}>
          Ensemble
        </Typography>
        <Typography variant="subtitle2">
          No ensembles available yet
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Card sx={{ borderRadius: 2, width: 400 }} elevation={2}>
      <CardHeader
        avatar={
          <Avatar color={"info"}>
            <FontAwesomeIcon icon={faGlobe} />
          </Avatar>
        }
        title={title}
        subheader="Aggregated from all participants"
      />
      <Paper elevation={2} sx={{ borderRadius: 0, p: 2 }}>
        <Typography variant="overline" color={theme.palette.grey[700]}>
          Overview
        </Typography>
        <Typography variant="subtitle2">
          Acc: 55%
        </Typography>
        <Typography variant="subtitle2">
          Acc bal: 55%
        </Typography>
        <Typography variant="subtitle2">
          NMI: 55%
        </Typography>
        <Typography variant="subtitle2">
          Ensemble Size: {ensembles.length}
        </Typography>
      </Paper>
      <CardContent style={{}}>
        <Typography variant="overline" color={theme.palette.grey[700]}>
          Ensemble
        </Typography>
        <Stack spacing={1} style={{ overflowY: "auto" }}>
          {
            ensembles.map((it, idx) => <EnsembleElement key={idx} ensembleClassifier={it} />)
          }
        </Stack>
      </CardContent>
    </Card>
  );
}