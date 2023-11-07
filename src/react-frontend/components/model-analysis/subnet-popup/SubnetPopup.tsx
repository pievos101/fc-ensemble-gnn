import { Dialog, IconButton, Stack, Tab, Typography, useTheme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNodes, faList, faTimes, faWeightHanging } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { TGraph } from "../../../queries/useGetGraphs";
import { SubnetGraph } from "./SubnetGraph";
import { SubnetList } from "./SubnetList";
import { SubnetWeighting } from "./SubnetWeighting";

interface EnsemblePopup {
  ensemble: TGraph,
  open: boolean,
  onClose: VoidFunction
}

export function SubnetPopup({ open, onClose, ensemble }: EnsemblePopup) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<"graph" | "list" | "weight">("graph");

  return (
    <Dialog open={open} maxWidth={"xl"} fullWidth={currentTab === "graph"}>
      <Stack spacing={1} sx={{ p: 2, overflow: "hidden" }}>
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
          Ensemble Classifier Analysis
        </Typography>
        <Stack spacing={1} sx={{ width: "100%" }}>
          <TabContext value={currentTab}>
            <TabList onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label="Graph" value="graph" sx={{ flexDirection: "row" }}
                   icon={<FontAwesomeIcon icon={faCircleNodes} style={{ width: 14, height: 14, marginRight: 6 }} />} />
              <Tab label="List" value="list" sx={{ flexDirection: "row", alignItems: "center" }}
                   icon={<FontAwesomeIcon icon={faList}
                                          style={{ width: 14, height: 14, marginRight: 6, marginTop: 4 }} />} />
              <Tab label="Weighting" value="weight" sx={{ flexDirection: "row", alignItems: "center" }}
                   icon={<FontAwesomeIcon icon={faWeightHanging}
                                          style={{ width: 14, height: 14, marginRight: 6, marginTop: 4 }} />} />
            </TabList>
            <TabPanel value="graph" sx={{ p: 0, height: "fill-available" }}>
              <SubnetGraph ensemble={ensemble} />
            </TabPanel>
            <TabPanel value="list">
              <SubnetList ensemble={ensemble} />
            </TabPanel>
            <TabPanel value="weight">
              <SubnetWeighting ensemble={ensemble} />
            </TabPanel>
          </TabContext>
        </Stack>
      </Stack>
    </Dialog>
  );
}