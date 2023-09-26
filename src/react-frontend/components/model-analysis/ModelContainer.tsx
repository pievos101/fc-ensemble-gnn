import {Avatar, Card, CardContent, CardHeader, Typography, useTheme} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGlobe} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export function ModelContainer() {
    const theme = useTheme()

    return (
        <Card sx={{borderRadius: 2}} elevation={2}>
            <CardHeader
                avatar={
                    <Avatar color={'info'}>
                        <FontAwesomeIcon icon={faGlobe}/>
                    </Avatar>
                }
                title="Global Model"
                subheader="Aggregated from all participants"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Stats
                </Typography>
                <Typography gutterBottom variant="h5" component="div">
                    Ensemble Parts
                </Typography>
            </CardContent>
        </Card>
    )
}