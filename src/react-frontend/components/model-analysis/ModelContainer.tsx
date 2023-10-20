import { Avatar, Card, CardContent, CardHeader, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { TGraph } from "../../queries/useGetGraphs";
import { EnsembleElement } from "./EnsembleElement";
import { ColorGradedValueChip } from "./ColorGradedPercentageChip";

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
    <Card sx={{
      display: "flex",
      flexDirection: "column",
      borderRadius: 2,
      width: 400,
      maxHeight: "-webkit-fill-available"
    }} elevation={2}>
      <CardHeader
        avatar={
          <Avatar color={"info"}>
            <FontAwesomeIcon icon={faGlobe} />
          </Avatar>
        }
        title={title}
        subheader="Aggregated from all participants"
      />
      <Paper sx={{
        borderRadius: 0,
        p: 2,
        borderTop: `1px solid ${theme.palette.grey[400]}`,
        zIndex: 1
      }} elevation={2}>
        <Typography variant="overline" color={theme.palette.grey[700]}>
          Overview
        </Typography>
        <Stack flexDirection={"column"} spacing={1}>
          <Typography variant="subtitle2">
            Accuracy: <ColorGradedValueChip value={5} />
          </Typography>
          <Typography variant="subtitle2">
            Balanced accuracy: <ColorGradedValueChip value={40} />
          </Typography>
          <Typography variant="subtitle2">
            Normalized Mutual Information: <ColorGradedValueChip value={91} />
          </Typography>
          <Typography variant="subtitle2" style={{ alignItems: "center" }}>
            Ensemble Size: <Chip size={"small"} variant={"outlined"} label={ensembles.length} />
          </Typography>
        </Stack>
      </Paper>
      <Stack spacing={1} sx={{ overflowY: "auto", p: 2, zIndex: 0 }}>
        <Typography variant="overline" color={theme.palette.grey[700]}>
          Ensemble
        </Typography>
          {
            ensembles.map((it, idx) => <EnsembleElement key={idx} ensembleClassifier={it} />)
          }
        </Stack>
    </Card>
  );
}