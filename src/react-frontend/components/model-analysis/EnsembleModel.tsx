import {
  Avatar,
  Card,
  CardHeader,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown91,
  faArrowDownWideShort,
  faArrowUp19,
  faArrowUpShortWide,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useMemo, useState } from "react";
import { TGraph } from "../../queries/useGetGraphs";
import { SubnetElement } from "./SubnetElement";
import { SettingsContext, useSettingsConstructor } from "../../queries/useSettings";
import { StatsElement } from "./StatsElement";


function ModelNotReadyStatsPlaceholder() {
  const theme = useTheme();

  return (
    <Paper sx={{
      borderRadius: 0,
      p: 2,
      borderTop: `1px solid ${theme.palette.grey[400]}`,
      zIndex: 1
    }} elevation={2}>
      <Typography variant="overline" color={theme.palette.grey[700]}>
        Waiting for model...
      </Typography>
      <LinearProgress sx={{ my: 1 }} />
    </Paper>
  );
}

enum SortBy {
  PerformanceAsc = "perf-asc",
  PerformanceDesc = "perf-desc",
  NodesAsc = "nodes-asc",
  NodesDesc = "nodes-desc"
}

interface ModelContainerProps {
  title: string;
  ensembles: TGraph[];
  description?: string;
  icon: IconDefinition;
  modelNotReady?: boolean;
  client?: "local" | "global";
}

export function EnsembleModel({ ensembles, title, description, icon, modelNotReady, client }: ModelContainerProps) {
  const theme = useTheme();
  const value = useSettingsConstructor(client);
  const [sortValue, setSortValue] = useState<SortBy>(SortBy.NodesDesc);

  useEffect(() => {
    if (ensembles.length > 0) {
      console.info("Initializing weights");
      value.initializeWeights(ensembles.length);
    }
  }, [ensembles.length]);

  const sortedEnsembles = useMemo(() => {
    switch (sortValue) {
      case "perf-asc":
        return ensembles.sort((a, b) => a.performance - b.performance);
      case "perf-desc":
        return ensembles.sort((a, b) => b.performance - a.performance);
      case "nodes-asc":
        return ensembles.sort((a, b) => a.nodes.length - b.nodes.length);
      case "nodes-desc":
        return ensembles.sort((a, b) => b.nodes.length - a.nodes.length);
      default:
        return ensembles;
    }
  }, [ensembles, sortValue]);

  return (
    <SettingsContext.Provider value={value}>
      <Card sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        width: 500,
        maxHeight: "-webkit-fill-available"
      }} elevation={2}>
        <CardHeader
          avatar={
            <Avatar color={"info"}>
              <FontAwesomeIcon icon={icon} />
            </Avatar>
          }
          title={title}
          subheader={description}
        />
        {modelNotReady ? (
          <ModelNotReadyStatsPlaceholder />
        ) : (
          <StatsElement ensembleLength={ensembles.length} />
        )}
        <Stack spacing={1} sx={{ overflowY: "auto", p: 2, zIndex: 0 }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography variant="overline" color={theme.palette.grey[700]} fontSize={14}>
              Ensemble
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel id="demo-select-small-label">Sort by</InputLabel>
              <Select
                value={sortValue}
                label="Sort by"
                onChange={e => setSortValue(e.target.value as any)}
              >
                <MenuItem value={SortBy.PerformanceAsc}>
                  <FontAwesomeIcon icon={faArrowUp19} style={{ marginRight: 8 }} />
                  Result increasing
                </MenuItem>
                <MenuItem value={SortBy.PerformanceDesc}>
                  <FontAwesomeIcon icon={faArrowDown91} style={{ marginRight: 8 }} />
                  Result decreasing
                </MenuItem>
                <MenuItem value={SortBy.NodesAsc}>
                  <FontAwesomeIcon icon={faArrowUpShortWide} style={{ marginRight: 8 }} />
                  Nodes increasing
                </MenuItem>
                <MenuItem value={SortBy.NodesDesc}>
                  <FontAwesomeIcon icon={faArrowDownWideShort} style={{ marginRight: 8 }} />
                  Nodes decreasing
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
          {
            sortedEnsembles.map((it, idx) => <SubnetElement key={idx} ensembleClassifier={it} />)
          }
        </Stack>
      </Card>
    </SettingsContext.Provider>
  );
}
