import {
  Accordion,
  AccordionDetails,
  AccordionSummary, Button,
  Chip,
  LinearProgress,
  Stack,
  styled,
  Typography,
  useTheme
} from "@mui/material";
import { ColorGradedValueChip } from "./ColorGradedPercentageChip";
import { useSettings } from "../../queries/useSettings";
import { useGetPerformance } from "../../queries/useGetPerformance";
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

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

export function PerformanceOverview({ stats, loading, title }: PerformanceOverviewProps) {

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

export function StatsElement({ ensembleLength }: { ensembleLength: number }) {
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
    <Accordion elevation={2} defaultExpanded>
      <AccordionSummary
        expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant="overline" color={theme.palette.grey[700]} fontSize={14}>
          Statistic Overview
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
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
      </AccordionDetails>
    </Accordion>
  );
}