import { Button, ButtonProps, Tooltip } from "@mui/material";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface StyledButtonProps extends ButtonProps {
  hoverText?: string;
  icon: IconDefinition;
}

export function StyledButton({ hoverText, icon, ...props }: StyledButtonProps) {
  return (
    <Tooltip title={hoverText}>
      <Button startIcon={<FontAwesomeIcon icon={icon} style={{ height: 16 }} />}
              variant={props.disabled ? "outlined" : "contained"} {...props} >
        {props.children}
      </Button>
    </Tooltip>
  );
}