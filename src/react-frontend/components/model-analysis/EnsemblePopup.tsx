import {TEnsemble} from "./ModelContainer";
import {
    Alert,
    CardContent,
    Dialog,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    Radio,
    RadioGroup,
    Stack,
    Tab,
    Typography,
    useTheme
} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import React, {useMemo, useState} from "react";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {GraphCanvas} from "reagraph";

function EnsembleList() {
    return null
}

// create a helper to sort an array


function EnsembleGraph({ensemble}: { ensemble: TEnsemble }) {
    const theme = useTheme()

    const nodes = useMemo(() =>
            ensemble.network.map(it => ({
                id: it.gene,
                label: it.gene,
                data: {
                    weight: Math.floor(Math.random() * 10)
                }
            }))
        , [ensemble.network])

    const edges = useMemo(() =>
            ensemble.network.map(it => ({
                id: `${it.gene}->${it.connectedTo}`,
                source: it.gene,
                target: it.connectedTo,
                data: {
                    weigth: it.connectionWeight
                },
                size: it.connectionWeight
            }))
        , [ensemble.network])

    return (
        <div style={{
            height: 400, width: '100%', overflow: 'hidden', position: 'relative',
            border: '1px solid',
            borderRadius: theme.spacing(0.5),
            borderColor: theme.palette.grey[400]
        }}>
            <GraphCanvas
                nodes={nodes}
                edges={edges}
                draggable={false}
                sizingType={'attribute'}
                sizingAttribute={'weight'}
                edgeArrowPosition="none"
            />
        </div>
    )
}

interface EnsemblePopup {
    ensemble: TEnsemble,
    open: boolean,
    onClose: VoidFunction
}

export function EnsemblePopup({open, onClose, ensemble}: EnsemblePopup) {
    const theme = useTheme()
    const [currentTab, setCurrentTab] = useState<'graph' | 'list'>('graph')
    return (
        <Dialog open={open}>
            <CardContent>
                <IconButton onClick={onClose} color={'error'} style={{
                    height: 32,
                    width: 32,
                    borderRadius: 8,
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                    position: 'absolute',
                    top: 8,
                    right: 8
                }}>
                    <FontAwesomeIcon icon={faTimes}/>
                </IconButton>
                <Stack spacing={2}>
                    <Typography variant={'h5'}>
                        Ensemble Analysis
                    </Typography>
                    <Alert severity={'info'}>
                        Change the importance of the classifier and analyse the knowledge graph
                    </Alert>
                    <FormControl>
                        <FormLabel id="demo-row-radio-buttons-group-label">Weight</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                        >
                            <FormControlLabel value={0} control={<Radio/>} label="disable"/>
                            <FormControlLabel value={0.5} control={<Radio/>} label="decrese"/>
                            <FormControlLabel value={1} control={<Radio/>} label="neutral"/>
                            <FormControlLabel value={1.5} control={<Radio/>} label="increase"/>
                        </RadioGroup>
                    </FormControl>
                    <Stack spacing={1}>
                        <TabContext value={currentTab}>
                            <TabList onChange={(e, newValue) => setCurrentTab(newValue)}
                                     aria-label="lab API tabs example">
                                <Tab label="Graph" value="graph"/>
                                <Tab label="List" value="list"/>
                            </TabList>
                            <TabPanel value="graph" sx={{p: 0}}><EnsembleGraph ensemble={ensemble}/></TabPanel>
                            <TabPanel value="list"><EnsembleList/></TabPanel>
                        </TabContext>
                    </Stack>
                </Stack>
            </CardContent>
        </Dialog>
    )
}