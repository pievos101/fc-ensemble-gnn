import React from 'react';
import {createTheme, ThemeProvider} from "@mui/material";
import {MainContainer} from "./components/MainContainer";
import {ContentContainer} from "./components/ContentContainer";
import {SidePanel} from "./components/side-panel/SidePanel";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import {TestSetProvider} from "./queries/useTestSet";

const queryClient = new QueryClient()

export function getApiUrl() {
    return window.location.href + '/api'
}

function App() {
    const theme = createTheme({});

    return (
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <TestSetProvider>
                    <MainContainer>
                        <SidePanel/>
                        <ContentContainer/>
                    </MainContainer>
                </TestSetProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;
