import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
  styled,
  CircularProgress, Button, LinearProgress
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useEffect } from "react";
import { TGraph } from "../../queries/useGetGraphs";
import { EnsembleElement } from "./EnsembleElement";
import { ColorGradedValueChip } from "./ColorGradedPercentageChip";
import { useGetPerformance } from "../../queries/useGetPerformance";
import { SettingsContext, useSettings, useSettingsConstructor } from "../../queries/useSettings";

const StatsContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid`,
  borderColor: theme.palette.grey[400],
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1.5)

}));

interface PerformanceOverviewProps {
  stats: { acc: number, nmi: number, acc_balanced: number };
  title: string;
  loading?: boolean;
}

function PerformanceOverview({ stats, loading, title }: PerformanceOverviewProps) {

  return (
    <Stack flexDirection={"column"} spacing={0.25}>
      <Typography variant="overline" fontWeight={600}>
        {title}
      </Typography>
      {
        loading ? (
          <LinearProgress sx={{ my: 1 }} />
        ) : (
          <>
            <Typography variant="subtitle2">
              Accuracy: <ColorGradedValueChip value={stats.acc} />
            </Typography>
            <Typography variant="subtitle2">
              Balanced accuracy: <Chip color={"info"} sx={{ fontWeight: 600 }} size={"small"} variant={"outlined"}
                                       label={`${stats.acc_balanced} %`} />
            </Typography>
            <Typography variant="subtitle2">
              Normalized Mutual Information: <Chip color={"info"} sx={{ fontWeight: 600 }} size={"small"}
                                                   variant={"outlined"}
                                                   label={stats.nmi} />
            </Typography>
          </>
        )
      }
    </Stack>
  );
}

function StatsElement({ ensembleLength }: { ensembleLength: number }) {
  const theme = useTheme();
  const { settings, setSettings, weights } = useSettings();

  const {
    stats: validationStats,
    refetch: fetchValidationStats,
    isLoading: validationStatsLoading
  } = useGetPerformance({
    isTestSet: false,
    client: settings.client,
    weights: weights
  });

  const { stats: testStats, refetch: fetchTestStats, isLoading: testStatsLoading } = useGetPerformance({
    isTestSet: true,
    client: settings.client,
    weights: weights
  });

  useEffect(() => {
    if (ensembleLength > 0) void fetchValidationStats();
  }, [ensembleLength]);

  useEffect(() => {
    // always refetch when weights change to get new score
    console.info("Refetching validation stats");
    void fetchValidationStats();
  }, [weights]);

  const testWithTestSet = async () => {
    setSettings({ testSetUnlocked: true });
    await fetchTestStats();
  };

  return (
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
        <StatsContainer spacing={1}>
          <PerformanceOverview stats={validationStats} loading={validationStatsLoading} title={"Validation Set"} />
        </StatsContainer>
        {settings.testSetUnlocked ? (
            <StatsContainer spacing={1}>
              <PerformanceOverview stats={testStats} loading={testStatsLoading} title={"Test Set"} />
            </StatsContainer>
          ) :
          (
            <Button variant={"outlined"} color={"info"} onClick={testWithTestSet}>Test on Test set</Button>
          )
        }
        <Typography variant="subtitle2" style={{ alignItems: "center" }}>
          Ensemble Size: <Chip size={"small"} variant={"outlined"} label={ensembleLength} />
        </Typography>
      </Stack>
    </Paper>
  );
}

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

interface ModelContainerProps {
  title: string;
  ensembles: TGraph[];
  description?: string;
  icon: IconDefinition;
  modelNotReady?: boolean;
}

export function EnsembleModel({ ensembles, title, description, icon, modelNotReady }: ModelContainerProps) {
  const theme = useTheme();
  const value = useSettingsConstructor();

  useEffect(() => {
    if (ensembles.length > 0) {
      console.info("Initializing weights");
      value.initializeWeights(ensembles.length);
    }
  }, [ensembles.length]);

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
          <Typography variant="overline" color={theme.palette.grey[700]}>
            Ensemble
          </Typography>
          {
            ensembles.map((it, idx) => <EnsembleElement key={idx} ensembleClassifier={it} />)
          }
        </Stack>
      </Card>
    </SettingsContext.Provider>
  );
}
