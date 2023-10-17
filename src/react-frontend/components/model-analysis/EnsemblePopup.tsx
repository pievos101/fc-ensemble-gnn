import { TEnsemble } from "./ModelContainer";
import {
  Alert,
  CardContent,
  Dialog, Divider,
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
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useMemo, useState } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { GraphCanvas } from "reagraph";
import { TGraph } from "../../queries/useGetGraphs";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const nodeColumns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 150, type: "string" },
  { field: "weight", headerName: "Weight", width: 120, type: "number" }
];

const edgeColumns: GridColDef[] = [
  { field: "source", headerName: "Node 1", width: 150, type: "string" },
  { field: "target", headerName: "Node 2", width: 120, type: "string" },
  { field: "weight", headerName: "Weight", width: 120, type: "number" }
];

function EnsembleList({ ensemble }: { ensemble: TGraph }) {
  return (
    <Stack spacing={2} direction={"row"} sx={{ justifyContent: "center" }}>
      <Stack spacing={1}>
        <Typography variant={"h6"} fontWeight={600}>
          Nodes
        </Typography>
        <DataGrid columns={nodeColumns}
                  rows={ensemble.nodes.map((it, idx) => ({ id: idx, ...it }))}
                  hideFooter
        />
      </Stack>
      <Divider orientation={"vertical"} flexItem />
      <Stack spacing={1}>
        <Typography variant={"h6"} fontWeight={600}>
          Edges
        </Typography>
        <DataGrid columns={edgeColumns}
                  rows={ensemble.edges.map((it, idx) => ({ id: idx, ...it }))}
                  hideFooter
        />
      </Stack>
    </Stack>
  );
}

function EnsembleGraph({ ensemble }: { ensemble: TGraph }) {
  const theme = useTheme();

  const nodes = useMemo(() =>
      ensemble.nodes.map(it => ({
        id: it.name,
        label: it.name,
        data: {
          weight: it.weight ?? Math.floor(Math.random() * 10)
        }
      }))
    , [ensemble.nodes]);

  const edges = useMemo(() =>
      ensemble.edges.map(it => ({
        id: `${it.source}->${it.target}`,
        source: it.source,
        target: it.target,
        data: {
          weigth: it.weight ?? Math.floor(Math.random() * 10)
        },
        size: Math.floor(Math.random() * 10)
      }))
    , [ensemble.edges]);

  return (
    <div style={{
      height: 500,
      width: "100%",
      overflow: "hidden",
      position: "relative",
      border: "1px solid",
      borderRadius: theme.spacing(0.5),
      borderColor: theme.palette.grey[400]
    }}>
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        sizingType={"attribute"}
        sizingAttribute={"weight"}
        edgeArrowPosition="none"
      />
    </div>
  );
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
    <Dialog open={open} fullWidth maxWidth={"xl"}>
      <CardContent>
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
        <Stack spacing={2} alignItems={"flex-start"}>
          <Typography variant={"h5"}>
            Ensemble Analysis
          </Typography>
          <Stack
            sx={{
              borderRadius: 1,
              border: "2px solid",
              borderColor: theme.palette.grey[300],
              p: 0.5
            }}>
            <Typography variant={"overline"}>
              Performance: <b>{Math.ceil(ensemble.performance * 100)}%</b>
            </Typography>
            <Typography variant={"overline"}>
              Number Nodes: <b>{ensemble.nodes.length}</b>
            </Typography>
          </Stack>
          <Alert severity={"info"}>
            Change the importance of the classifier and analyse the knowledge graph
          </Alert>
          <FormControl>
            <FormLabel id="demo-row-radio-buttons-group-label">Weight</FormLabel>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
            >
              <FormControlLabel value={0} control={<Radio />} label="disable" />
              <FormControlLabel value={0.5} control={<Radio />} label="decrese" />
              <FormControlLabel value={1} control={<Radio />} label="neutral" />
              <FormControlLabel value={1.5} control={<Radio />} label="increase" />
            </RadioGroup>
          </FormControl>
          <Stack spacing={1} sx={{ width: "100%" }}>
            <TabContext value={currentTab}>
              <TabList onChange={(e, newValue) => setCurrentTab(newValue)}
                       aria-label="lab API tabs example">
                <Tab label="Graph" value="graph" />
                <Tab label="List" value="list" />
              </TabList>
              <TabPanel value="graph" sx={{ p: 0 }}><EnsembleGraph ensemble={ensemble} /></TabPanel>
              <TabPanel value="list"><EnsembleList ensemble={ensemble} /></TabPanel>
            </TabContext>
          </Stack>
        </Stack>
      </CardContent>
    </Dialog>
  );
}