import {ContentAccordion} from "./ContentAccordion";
import {faFile, faFileImport, faFloppyDisk} from "@fortawesome/free-solid-svg-icons";
import {Alert, Button, ButtonBase, Chip, Stack, Typography, useTheme} from "@mui/material";
import {useCallback, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface FileSelectorProps {
    label: string
    file?: File
    onSelected: (file: File) => void
}

function FileElement({label, onSelected}: FileSelectorProps) {
    const theme = useTheme()

    const inputRef = useRef<HTMLInputElement>(null)
    const setFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // @ts-ignore
        const files = Array.from(e.target.files)
        onSelected(files[0])
    }, [])

    const hasFile = Boolean(inputRef.current?.files?.length)

    return (
        <ButtonBase
            sx={{
                borderRadius: 2,
                border: hasFile ? 'solid 2px' : 'dashed 2px',
                borderColor: hasFile ? theme.palette.success.light : theme.palette.grey[300],
                backgroundColor: theme.palette.grey[100],
            }}
            onClick={() => inputRef.current?.click()}
        >
            <Stack spacing={1}
                   sx={{
                       p: 1,
                       alignItems: 'flex-start',
                       width: '100%'
                   }}
            >
                <Typography>{label}</Typography>
                <input onChange={setFile} ref={inputRef} type={'file'} accept={'.txt'} style={{display: 'none'}}/>
                {hasFile && (
                    <Chip
                        label={inputRef.current?.files?.[0].name}
                        icon={<FontAwesomeIcon icon={faFile} style={{marginLeft: 10}}/>}
                    />
                )}
                {!hasFile &&
                    <Typography variant={'caption'} color={theme.palette.grey[700]}>Click to select file</Typography>}
            </Stack>
        </ButtonBase>
    )
}

/**
 * @deprecated
 * NOTE: this was intended to enable data upload from the ui, but was not implemented
 * */
export function InputSection() {
    const [mRNAFile, setMRNAFile] = useState<File | undefined>(undefined)
    const [ppiFile, setPpiFile] = useState<File | undefined>(undefined)
    const [targetFile, setTargetFile] = useState<File | undefined>(undefined)

    const uploadFiles = useCallback(() => {
        console.log("Uploading mRNAFile, ppiFile, targetFile")
        console.log(mRNAFile)
        console.log(ppiFile)
        console.log(targetFile)
    }, [])

    const canSubmit = Boolean(mRNAFile) && Boolean(ppiFile) && Boolean(targetFile)
    return (
        <ContentAccordion icon={faFileImport} title={'Input Data'} defaultExpanded={true} disabled>
            <Stack spacing={1}>
                <Alert severity={'info'}>
                    Files of type .txt or .csv are accepted
                </Alert>
                <FileElement file={ppiFile} label={'PPI Data'} onSelected={setPpiFile}/>
                <FileElement file={mRNAFile} label={'mRNA Data'} onSelected={setMRNAFile}/>
                <FileElement file={targetFile} label={'Target Data'} onSelected={setTargetFile}/>
                <Button disabled={!canSubmit} onClick={uploadFiles} startIcon={<FontAwesomeIcon icon={faFloppyDisk}/>}
                        variant={'contained'}
                        color={'success'}>Save
                    files</Button>
            </Stack>
        </ContentAccordion>
    )
}