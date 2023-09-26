import React from 'react';
import {createTheme, ThemeProvider} from "@mui/material";
import {MainContainer} from "./components/MainContainer";
import {ContentContainer} from "./components/ContentContainer";
import {SidePanel} from "./components/side-panel/SidePanel";

function App() {
    const theme = createTheme({});

    return (
        <ThemeProvider theme={theme}>
            <MainContainer>
                <SidePanel/>
                <ContentContainer/>
            </MainContainer>
        </ThemeProvider>
    );
}

export default App;
