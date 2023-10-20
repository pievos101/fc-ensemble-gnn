import {
  Alert,
  Dialog,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Typography,
  useTheme
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNodes, faList, faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { TGraph } from "../../../queries/useGetGraphs";
import { ColorGradedValueChip } from "../ColorGradedPercentageChip";
import { EnsembleGraph } from "./EnsembleGraph";
import { EnsembleList } from "./EnsembleList";

function EnsembleWeighting() {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        borderRadius: 1,
        border: `2px solid ${theme.palette.grey[300]}`,
        width: "fit-content",
        p: 1
      }}
      spacing={1}
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
        >
          <FormControlLabel value={0} control={<Radio />} label="Disable" />
          <FormControlLabel value={0.5} control={<Radio />} label="Decrese" />
          <FormControlLabel value={1} control={<Radio />} label="Neutral" />
          <FormControlLabel value={1.5} control={<Radio />} label="Increase" />
        </RadioGroup>
      </FormControl>
    </Stack>
  )
}

interface EnsemblePopup {
  ensemble: TGraph,
  open: boolean,
  onClose: VoidFunction
}

export function EnsemblePopup({ open, onClose, ensemble }: EnsemblePopup) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<"graph" | "list">("graph");
  return (
    <Dialog open={open} maxWidth={"xl"}>
      <Stack spacing={1} sx={{ p: 2, height: "100%" }}>
        <IconButton onClick={onClose} color={"error"} style={{
          height: 32,
          width: 32,
          borderRadius: 8,
          backgroundColor: theme.palette.error.main,
          color: "white",
          position: "absolute",
          top: 8,
          right: 8
        }}>
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>
        <Typography variant={"h5"}>
          Ensemble Analysis
        </Typography>
        <Stack
          flexDirection={"row"}
          sx={{
            borderRadius: 1,
            border: "2px solid",
            borderColor: theme.palette.grey[300],
            p: 1,
            px: 2,
            alignItems: "center",
            width: "fit-content"
          }}
        >
          <Typography variant={"overline"}>
            Performance: <ColorGradedValueChip value={Math.ceil(ensemble.performance * 100)} />
          </Typography>
          <Typography variant={"overline"} sx={{ ml: 3 }}>
            Number Nodes: <b>{ensemble.nodes.length}</b>
          </Typography>
        </Stack>
        <EnsembleWeighting />
        <Stack spacing={1} sx={{ width: "100%", maxHeight: "100%" }}>
          <TabContext value={currentTab}>
            <TabList onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label="Graph" value="graph" sx={{ flexDirection: "row" }}
                   icon={<FontAwesomeIcon icon={faCircleNodes} style={{ width: 14, height: 14, marginRight: 6 }} />} />
              <Tab label="List" value="list" sx={{ flexDirection: "row", alignItems: "center" }}
                   icon={<FontAwesomeIcon icon={faList}
                                          style={{ width: 14, height: 14, marginRight: 6, marginTop: 4 }} />} />
            </TabList>
            <TabPanel value="graph" sx={{ p: 0, width: "90vw" }}><EnsembleGraph ensemble={ensemble} /></TabPanel>
            <TabPanel value="list"><EnsembleList ensemble={ensemble} /></TabPanel>
          </TabContext>
        </Stack>
      </Stack>
    </Dialog>
  );
}