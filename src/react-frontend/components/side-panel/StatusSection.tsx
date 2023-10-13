import {Button, Chip, LinearProgress, Stack, Typography} from "@mui/material";
import React from "react";
import {useGetStatus} from "../../queries/useGetStatus";
import {useTestSet} from "../../queries/useTestSet";

export function StatusSection() {
    const {status, error, loading} = useGetStatus()
    const {unlockTestSet, testSetUnlocked} = useTestSet()
    return (
        <Stack spacing={2} sx={{p: 2}}>
            <Typography variant={'overline'} fontSize={'1rem'}>
                Status: <Chip color={'info'} label={status} variant={'outlined'} sx={{p: 0}}/>
            </Typography>
            <>
                {error && <Typography variant={'subtitle1'} fontSize={'1rem'} color={'error'}>
                    {JSON.stringify(error)}
                </Typography>}
                {loading && <LinearProgress/>}
            </>
            {!testSetUnlocked && <Button variant={'outlined'} color={'info'} onClick={unlockTestSet}>
                Evaluate Test Set with Config
            </Button>}
        </Stack>
    )
}