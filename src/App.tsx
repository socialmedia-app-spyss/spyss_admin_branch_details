import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  RefineSnackbarProvider,
  useNotificationProvider,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerProvider from "@refinedev/react-router";
import { liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";
import { ColorModeContextProvider } from "./contexts/color-mode";

import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { supabaseClient } from "./supabaseClient";

import { AdminLayout } from "./layouts/adminLayout";
import { BranchList } from "./resources/branches/list";
import { BranchCreate } from "./resources/branches/create";
import { BranchEdit } from "./resources/branches/edit";
import { BranchShow } from "./resources/branches/show";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { AuthGuard } from "./components/AuthGuard";
import { AdminUsers } from "./resources/settings/AdminUsers";
import { Authenticated } from "@refinedev/core";
import { DashboardPage } from "./pages/dashboard/DashboardPage";

function App() {
  return (
    <BrowserRouter basename="/spyss_admin_branch_details">
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <Refine
              dataProvider={dataProvider}
              liveProvider={liveProvider(supabaseClient)}
              authProvider={authProvider}
              routerProvider={routerProvider}
              notificationProvider={useNotificationProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "S1dXdY-l8kRsZ-B1YWqi",
                reactQuery: {
                  clientConfig: {
                    defaultOptions: {
                      queries: {
                        staleTime: 5 * 60 * 1000,
                      },
                    },
                  },
                },
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                },
                {
                  name: "latest_branches",
                  list: "/branches",
                  create: "/branches/create",
                  edit: "/branches/edit/:id",
                  show: "/branches/show/:id",
                },
                {
                  name: "users",
                  list: "/users",
                },
              ]}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route
                  element={
                    <Authenticated key="authenticated_layout">
                      <AdminLayout>
                        <Outlet />
                      </AdminLayout>
                    </Authenticated>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />

                  <Route path="/branches" element={<BranchList />} />
                  <Route path="/branches/create" element={<BranchCreate />} />
                  <Route path="/branches/edit/:id" element={<BranchEdit />} />
                  <Route path="/branches/show/:id" element={<BranchShow />} />

                  <Route element={<AuthGuard allowedRoles={["SUPER_ADMIN", "VALAYA_ADMIN"]} />}>
                    <Route path="/users" element={<AdminUsers />} />
                  </Route>
                </Route>

                <Route
                  path="/login"
                  element={
                    <Authenticated key="login_page" fallback={<LoginPage />}>
                      <Navigate to="/dashboard" replace />
                    </Authenticated>
                  }
                />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/access-denied" element={<div>Access Denied: You do not have permission to view this page.</div>} />
              </Routes>
              <RefineKbar />
            </Refine>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
