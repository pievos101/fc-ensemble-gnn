import React from "react";
import { Alert, AlertTitle, Button, createTheme, ThemeProvider } from "@mui/material";
import { MainContainer } from "./components/MainContainer";
import { ContentContainer } from "./components/ContentContainer";
import { SidePanel } from "./components/side-panel/SidePanel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

const queryClient = new QueryClient()

export function getApiUrl() {
  // check if window.location.href includes the string "app-traffic"
  // if it does, then return the production API url
  // otherwise, return the local API url
  if (window.location.href.includes("app-traffic")) {
    return window.location.href + "api";
  } else {
    // This is the default port for local development
    return "http://localhost:5001/web-api";
  }
}

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Alert severity={"error"}>
        <AlertTitle>A React runtime error occurred</AlertTitle>
        Error: <pre>{error.message}</pre>
        <Button onClick={resetErrorBoundary} variant={"contained"} color={"error"}>
          Try again
        </Button>
      </Alert>
    </div>
  );
}

function App() {
    const theme = createTheme({});

    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                    <MainContainer>
                        <SidePanel/>
                        <ContentContainer/>
                    </MainContainer>
            </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
}

export default App;
