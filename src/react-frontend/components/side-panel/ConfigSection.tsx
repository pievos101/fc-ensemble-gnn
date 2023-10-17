import {
    Accordion, AccordionDetails, AccordionSummary,
    Alert,
    Button,
    FormControl, FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faSliders} from "@fortawesome/free-solid-svg-icons";
import {ContentAccordion} from "./ContentAccordion";

const MOCK_CONFIGS = [
    {
        name: "Cancer cure mRna fix 1.03",
        id: 1
    },
    {
        name: "Kidney Booster ppi 13-55",
        id: 2
    },
]

function ConfigurationSelect() {
    const theme = useTheme()

    return (
        <FormControl sx={{m: 1, minWidth: 120}}>
            <InputLabel id="demo-simple-select-helper-label">Configuration</InputLabel>
            <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                //value={age}
                label="Configuration"
                //onChange={handleChange}
            >
                {MOCK_CONFIGS.map((it, idx) => <MenuItem key={idx} value={it.id}>
                    <em>{it.name}</em>
                </MenuItem>)}
            </Select>
            <FormHelperText>Loading new configs removes unsaved changes</FormHelperText>
        </FormControl>
    )
}

export function ConfigSection() {
    const theme = useTheme()

    return (
        <ContentAccordion title={'Manual Configuration'} icon={faSliders} disabled>
            <Stack spacing={2}>
                <TextField
                    id="outlined-read-only-input"
                    label="Current Config"
                    variant={'standard'}
                    value={"Christian mRna fix 1.03"}
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <Stack flexDirection={'column'} spacing={1}>
                    <Button variant={'contained'} color={'success'}>
                        Save new
                    </Button>
                    <Button variant={'outlined'} color={'error'}>
                        revert
                    </Button>
                </Stack>
                <Alert severity="info">
                    With configurations, you can save and share your weighting of the different subnets.
                </Alert>
                <ConfigurationSelect/>
            </Stack>
        </ContentAccordion>
    )
}
