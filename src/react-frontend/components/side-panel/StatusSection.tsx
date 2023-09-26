import {Chip, LinearProgress, Stack, Typography} from "@mui/material";
import React from "react";

export function StatusSection(){
    return (
        <Stack spacing={2} sx={{p:2}}>
            <Typography variant={'overline'} fontSize={'1rem'}>
                Status: <Chip color={'success'} label={'Idle'} variant={'outlined'} sx={{p:0}}/>
            </Typography>
            <LinearProgress />
        </Stack>
    )
}