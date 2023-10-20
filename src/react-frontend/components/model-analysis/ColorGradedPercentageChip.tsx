import { Chip, useTheme } from "@mui/material";
import React from "react";

export function ColorGradedValueChip({ value }: { value: number }) {
  const theme = useTheme();

  function getColor(value: number) {
    if (value < 40) return "error";
    if (value < 60) return "warning";
    if (value < 70) return "secondary";
    return "success";
  }

  return <Chip color={getColor(value)} sx={{ fontWeight: 600 }} size={"small"} variant={"outlined"}
               label={`${value}%`} />;
}