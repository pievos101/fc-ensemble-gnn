import {Button, Divider, Paper, Stack, Typography, useTheme} from "@mui/material";
import React from "react";
import {ConfigSection} from "./ConfigSection";
// @ts-ignore
import MainLogo from "../../assets/EnsembleGnnLogo.png"
import {StatusSection} from "./StatusSection";
import {InputSection} from "./InputSection";

export function SidePanel() {
    const theme = useTheme()

    return (
        <Paper elevation={4} sx={{borderRadius: 0, pt:2, maxHeight:'100vh', overflowY:'auto'}}>
            <Stack sx={{width: 280, height:'100%'}} flexDirection={'column'}>
                <img src={MainLogo} alt="Main Logo" style={{width: 110, alignSelf: 'center'}}/>
                <StatusSection/>
                <ConfigSection/>
                <InputSection/>
            </Stack>
        </Paper>
    )
}