import {faChevronDown, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Accordion, AccordionDetails, AccordionProps, AccordionSummary, Typography, useTheme} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

interface ContentAccordionProps {
    icon: IconDefinition
    title: string
    children: React.ReactNode
    initiallyOpen?:boolean
}

export function ContentAccordion({title, icon, ...props}: ContentAccordionProps & AccordionProps) {
    const theme = useTheme()

    return (
        <Accordion elevation={0} disableGutters {...props}>
            <AccordionSummary expandIcon={<FontAwesomeIcon icon={faChevronDown}/>}>
                <Typography variant={'subtitle1'} fontWeight={550}>
                    <FontAwesomeIcon icon={icon} style={{marginRight: theme.spacing(1.5)}}/>
                    {title}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {props.children}
            </AccordionDetails>
        </Accordion>
    )
}