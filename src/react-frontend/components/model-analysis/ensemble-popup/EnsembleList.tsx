import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TGraph } from "../../../queries/useGetGraphs";
import { Divider, Stack, Typography } from "@mui/material";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsTurnToDots, faDna } from "@fortawesome/free-solid-svg-icons";

const nodeColumns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 150, type: "string" },
  { field: "weight", headerName: "Weight", width: 120, type: "number" }
];
const edgeColumns: GridColDef[] = [
  { field: "source", headerName: "Node 1", width: 150, type: "string" },
  { field: "target", headerName: "Node 2", width: 120, type: "string" },
  { field: "weight", headerName: "Weight", width: 120, type: "number" }
];

export function EnsembleList({ ensemble }: { ensemble: TGraph }) {
  return (
    <Stack spacing={2} direction={"row"} sx={{ justifyContent: "center" }}>
      <Stack spacing={1}>
        <Typography variant={"h6"} fontWeight={600}>
          <FontAwesomeIcon icon={faDna} /> Nodes
        </Typography>
        <DataGrid columns={nodeColumns}
                  rows={ensemble.nodes.map((it, idx) => ({ id: idx, ...it }))}
                  hideFooter
                  style={{ maxHeight: "40vh" }}
        />
      </Stack>
      <Divider orientation={"vertical"} flexItem />
      <Stack spacing={1}>
        <Typography variant={"h6"} fontWeight={600}>
          <FontAwesomeIcon icon={faArrowsTurnToDots} /> Edges
        </Typography>
        <DataGrid columns={edgeColumns}
                  rows={ensemble.edges.map((it, idx) => ({ id: idx, ...it }))}
                  hideFooter
                  style={{ maxHeight: "40vh" }}
        />
      </Stack>
    </Stack>
  );
}