import { Paper, Stack } from "@mui/material";
import React from "react";
// @ts-ignore
import MainLogo from "../../assets/EnsembleGnnLogo.png";
import { StatusSection } from "./StatusSection";

export function SidePanel() {
  return (
    <Paper elevation={4}
           sx={{ width: 300, flexShrink: 0, borderRadius: 0, pt: 2, maxHeight: "100vh", overflowY: "auto" }}>
      <Stack sx={{ height: "100%", flexShrink: 0 }} flexDirection={"column"}>
        <img src={MainLogo} alt="Main Logo" style={{ width: 110, alignSelf: "center" }} />
        <StatusSection />
      </Stack>
    </Paper>
  );
}