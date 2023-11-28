import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import { useSettings } from "../../queries/useSettings";
import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faPaperPlane, faScaleBalanced, faScaleUnbalanced } from "@fortawesome/free-solid-svg-icons";
import { StyledButton } from "../StyledButton";
import { useGlobalWeights } from "../../queries/useGlobalWeights";
import { useGetStatus } from "../../queries/useGetStatus";

export function WeightingElement({ ensembleLength }: { ensembleLength: number }) {
  const theme = useTheme();
  const { status } = useGetStatus();
  const { initializeWeights, setWeight, weights } = useSettings();
  const {
    distributeWeights,
    loading: weightAggregationOngoing,
    available,
    weights: aggregatedWeights
  } = useGlobalWeights();

  const canDistributeWeights = !weightAggregationOngoing && status === "web_controlled";

  const resetWeights = () => {
    initializeWeights(ensembleLength);
  };

  const applyGlobalWeights = useCallback(() => {
    if (!weights || weights.length === 0) {
      return;
    }

    aggregatedWeights.forEach((w, idx) => {
      // TODO: check if order is correct on backend
      if (idx >= weights.length) {
        // global model has too many weights
        return;
      }
      setWeight(idx, w);
    });
  }, [aggregatedWeights, weights, setWeight]);

  return (
    <Accordion elevation={2}>
      <AccordionSummary
        expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant="overline" color={theme.palette.grey[700]} fontSize={14}>
          Weighting Overview
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack flexDirection={"column"} spacing={1}>
          {weightAggregationOngoing && (
            <Tooltip
              title={"The coordinator is aggregating the weights from all clients. The duration depends on when all participants submit their weighting."}>
              <LinearProgress />
            </Tooltip>
          )}
          <StyledButton disabled={!canDistributeWeights} onClick={distributeWeights} color={"info"}
                        icon={faPaperPlane}
                        hoverText={"Sends the current weighting of the global model to the coordinator."}
          >
            Distribute Weights
          </StyledButton>
          <StyledButton disabled={!available}
                        onClick={applyGlobalWeights}
                        color={"warning"}
                        icon={faScaleUnbalanced}
                        hoverText={"Sets the weighting of the global model to the aggregated weight model from the coordinator."}
          >
            Apply Global Weights
          </StyledButton>
          <StyledButton
            onClick={resetWeights}
            color={"warning"}
            icon={faScaleBalanced}
            hoverText={"Reset all weights to neutral (1)."}
            disabled={weights.every(w => w === 1)}
          >
            Reset Weights
          </StyledButton>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}