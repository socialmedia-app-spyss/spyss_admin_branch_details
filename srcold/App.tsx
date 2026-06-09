import { Refine } from "@refinedev/core";
import { RefineKbarProvider } from "@refinedev/kbar";
import { RefineSnackbarProvider, useNotificationProvider } from "@refinedev/mui";
import { DevtoolsProvider, DevtoolsPanel } from "@refinedev/devtools";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import dataProvider from "./app/dataProvider";
import authProvider from "./app/authProvider";
import routerProvider from "./app/routerProvider";

import { ColorModeContextProvider } from "./contexts/color-mode";

import { BranchResource } from "./resources/branches";
import { EventResource } from "./resources/events";

function App() {
  return (
    <RefineKbarProvider>
      <ColorModeContextProvider>
        <CssBaseline />
        <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />

        <RefineSnackbarProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              routerProvider={routerProvider}
              notificationProvider={useNotificationProvider}
              resources={[
                BranchResource,
                EventResource,
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
              }}
            />
            <DevtoolsPanel />
          </DevtoolsProvider>
        </RefineSnackbarProvider>
      </ColorModeContextProvider>
    </RefineKbarProvider>
  );
}

export default App;