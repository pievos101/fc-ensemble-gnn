import {SidePanel} from "./side-panel/SidePanel";
import React from "react";
import {Stack} from "@mui/material";
import {ModelContainer} from "./model-analysis/ModelContainer";

interface ContentContainerProps {
}
export function ContentContainer({}:ContentContainerProps){
    return (
        <Stack direction={'row'} spacing={4} sx={{p:4}}>
                <ModelContainer/>
        </Stack>
    )
}