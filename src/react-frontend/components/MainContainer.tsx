import {useTheme} from "@mui/material";

export function MainContainer({children}: {children: React.ReactNode}){
    const theme = useTheme()
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            height: "100vh",
            width: "100vw",
            backgroundColor: theme.palette.grey[200],
            alignItems: "stretch",
            justifyContent: "start"
        }}>
            {children}
        </div>
    )
}