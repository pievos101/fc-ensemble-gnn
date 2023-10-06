import {Avatar, Card, CardContent, CardHeader, Chip, Divider, Paper, Stack, Typography, useTheme} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import {EnsemblePopup} from "./EnsemblePopup";

export type TEnsemble = {
    result: number
    weighting: number,
    genes: { name: string, weight:number }[],
    network: {
        gene: string
        connectedTo: string
        connectionWeight: number
    }[]
}

const Ensembles: TEnsemble[] = [
    {
        result: 55,
        weighting: 1,
        genes: [{name:'MTOR', weight:0.5}, {name:'WASBI', weight:6}, {name:'CRISPR', weight:.4}],
        network:[{
            gene:'MTOR',
            connectedTo:'WASBI',
            connectionWeight:0.8
        },
            {
                gene:'CRISPR',
                connectedTo:'MTOR',
                connectionWeight:5
            },
            {
                gene:'WASBI',
                connectedTo:'MTOR',
                connectionWeight:0.8
            }
            ]
    }
]

function EnsembleElement({ensembleClassifier}: { ensembleClassifier:TEnsemble }) {
    const [popupOpen, setPopupOpen] = useState(false)
    return (
        <>
            <EnsemblePopup ensemble={ensembleClassifier} open={popupOpen} onClose={() => setPopupOpen(false)}/>
            <Card style={{cursor:'pointer'}} sx={{p: 1, borderRadius: 2}} onClick={() => setPopupOpen(true)}>
                <Stack spacing={0.5} sx={{mb: 1}}>
                    <Typography>
                        Result: <b>{ensembleClassifier.result}%</b>
                    </Typography>
                    <Typography>
                        Weighting: <b>+{ensembleClassifier.weighting}</b>
                    </Typography>
                </Stack>
                <Stack direction={'row'} sx={{overflowX: 'auto'}} spacing={1}>
                    {ensembleClassifier.genes.map((it, idx) => <Chip key={idx} size={'small'} color={"info"} label={it.name}/>)}
                </Stack>
            </Card>
        </>
    )
}

interface ModelContainerProps {
    title: string
    description: string
    stats: any
    ensembles: any[]
}

export function ModelContainer() {
    const theme = useTheme()

    return (
        <Card sx={{borderRadius: 2, width: 400}} elevation={2}>
            <CardHeader
                avatar={
                    <Avatar color={'info'}>
                        <FontAwesomeIcon icon={faGlobe}/>
                    </Avatar>
                }
                title="Global Model"
                subheader="Aggregated from all participants"
            />
            <Paper elevation={2} sx={{borderRadius: 0, p: 2}}>
                <Typography variant="overline" color={theme.palette.grey[700]}>
                    Overview
                </Typography>
                <Typography variant="subtitle2">
                    Performance: 55%
                </Typography>
                <Typography variant="subtitle2">
                    Error Rate: 0.3%
                </Typography>
            </Paper>
            <CardContent>
                <Typography variant="overline" color={theme.palette.grey[700]}>
                    Ensemble
                </Typography>
                {
                    Ensembles.map((it, idx) => <EnsembleElement key={idx} ensembleClassifier={it}/>)
                }
            </CardContent>
        </Card>
    )
}