import { TGraph } from "../../../queries/useGetGraphs";
import {
  Alert,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack, TextField,
  Typography,
  useTheme
} from "@mui/material";
import React from "react";
import { ColorGradedValueChip } from "../ColorGradedPercentageChip";
import { PerformanceOverview } from "../StatsElement";
import { useSettings } from "../../../queries/useSettings";
import { useGetPerformance } from "../../../queries/useGetPerformance";

function WeightSelect({ id }: { id: number }) {
  const theme = useTheme();
  const { weights, setWeight } = useSettings();

  return (
    <Stack
      sx={{
        borderRadius: 1,
        border: `2px solid ${theme.palette.grey[300]}`,
        width: "fit-content",
        p: 2
      }}
      spacing={2}
    >
      <Alert severity={"info"}>
        Change the weighting of the ensembles to see how the model performance changes
      </Alert>
      <FormControl>
        <FormLabel id="demo-row-radio-buttons-group-label">Weight</FormLabel>
        <RadioGroup
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          value={weights[id]}
          onChange={(e) => {
            setWeight(id, parseFloat(e.target.value));
          }}
          style={{
            flexDirection: "column",
            marginBottom: theme.spacing(1)
          }}
        >
          <FormControlLabel value={0} control={<Radio />} label="Disable (x0)" />
          <FormControlLabel value={1} control={<Radio />} label="Neutral (x1)" />
          <FormControlLabel value={2} control={<Radio />} label="Small increase (x2)" />
          <FormControlLabel value={5} control={<Radio />} label="Large increase (x5)" />
        </RadioGroup>
        {/*Add the weighting as input field*/}
        <FormLabel id="demo-row-radio-buttons-group-label">Custom Weight</FormLabel>
        <TextField value={weights[id]} onChange={(e) => setWeight(id, parseFloat(e.target.value))}
                   onBlur={(e) => setWeight(id, parseFloat(e.target.value))} style={{ width: 80 }}
                   size={"small"} type={"number"} inputMode={"numeric"}
                   inputProps={{ min: 0 }}
        />
      </FormControl>
    </Stack>
  );
}

export function SubnetWeighting({ ensemble }: { ensemble: TGraph }) {
  const theme = useTheme();
  const { settings, weights } = useSettings();

  const {
    stats: validationStats,
    isLoading: validationStatsLoading
  } = useGetPerformance({
    isTestSet: false,
    client: settings.client,
    weights: weights
  });

  return (
    <Stack direction={"row"} spacing={1}>
      <Stack
        sx={{
          p: 1,
          px: 2,
          borderRadius: 1,
          border: "2px solid",
          width: "fit-content",
          alignItems: "flex-start",
          borderColor: theme.palette.grey[300],
          textAlign: "start",
          justifyContent: "space-around"
        }}
      >
        <Typography variant="overline" fontWeight={600}>
          Subnetwork performance
        </Typography>
        <Typography variant={"subtitle2"}>
          Performance: <ColorGradedValueChip value={Math.ceil(ensemble.performance * 100)} />
        </Typography>
        <Typography variant={"subtitle2"}>
          Number Nodes: <b>{ensemble.nodes.length}</b>
        </Typography>
        <Divider style={{ width: "100%" }} />
        <PerformanceOverview stats={validationStats} loading={validationStatsLoading} title={"Model Performance"} />
      </Stack>
      <WeightSelect id={ensemble.id} />
    </Stack>
  );
}