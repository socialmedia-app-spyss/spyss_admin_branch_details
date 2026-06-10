import { Refine } from "@refinedev/core"; // Removed GitHubBanner
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  RefineSnackbarProvider,
  useNotificationProvider,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerProvider from "@refinedev/react-router";
import { liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom"; // Added Navigate
import { ColorModeContextProvider } from "./contexts/color-mode";

// Custom imports from your project structure
import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { supabaseClient } from "./supabaseClient";

import { AdminLayout } from "./layouts/adminLayout";
import { BranchList } from "./resources/branches/list";
import { BranchCreate } from "./resources/branches/create";
import { BranchEdit } from "./resources/branches/edit";
import { BranchShow } from "./resources/branches/show";
import { EventList } from "./resources/events/list"; // Import EventList
import { EventCreate } from "./resources/events/create"; // Import EventCreate
import { EventEdit } from "./resources/events/edit"; // Import EventEdit
import { EventShow } from "./resources/events/show"; // Import EventShow
import { NotificationList } from "./resources/notifications/list"; // Import NotificationList
import { NotificationCreate } from "./resources/notifications/create"; // Import NotificationCreate
import { NotificationEdit } from "./resources/notifications/edit"; // Import NotificationEdit
import { NotificationShow } from "./resources/notifications/show"; // Import NotificationShow
// import { ApprovalsList } from "./resources/approvals/list"; // Removed ApprovalsList import
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { AuthGuard } from "./components/AuthGuard";
import { AdminUsers } from "./resources/settings/AdminUsers"; // Updated import path and component name
import { Authenticated } from "@refinedev/core";
import { DashboardPage } from "./pages/dashboard/DashboardPage"; // Assuming you'll create this
// import { SettingsPage } from "./pages/settings/SettingsPage"; // Removed SettingsPage import
// import { RolesPage } from "./resources/settings/RolesPage"; // Removed RolesPage import
// import { SystemConfig } from "./pages/settings/SystemConfig"; // Removed SystemConfig import

function App() {
  return (
    <BrowserRouter basename="/spyss_admin_panel"> {/* Added basename prop */}
      {/* Removed GitHubBanner */}
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            {/* Removed DevtoolsProvider */}
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
                        staleTime: 5 * 60 * 1000, // 5 minutes
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
                  name: "branches",
                  list: "/branches",
                  create: "/branches/create",
                  edit: "/branches/edit/:id",
                  show: "/branches/show/:id",
                },
                {
                  name: "events",
                  list: "/events",
                  create: "/events/create",
                  edit: "/events/edit/:id",
                  show: "/events/show/:id",
                },
                {
                  name: "notifications",
                  list: "/notifications",
                  create: "/notifications/create",
                  edit: "/notifications/edit/:id",
                  show: "/notifications/show/:id",
                },
                {
                  name: "users", // Added users resource
                  list: "/users",
                  // Removed 'can' property as it's not a valid ResourceProps property
                },
              ]}
            >
              <Routes>
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route
                  element={
                    <Authenticated key="authenticated_layout" fallback={<LoginPage />}>
                      <AdminLayout>
                        <Outlet />
                      </AdminLayout>
                    </Authenticated>
                  }
                >
                  {/* Dashboard Route */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Branches Module Routes */}
                  <Route path="/branches" element={<BranchList />} />
                  <Route path="/branches/create" element={<BranchCreate />} />
                  <Route path="/branches/edit/:id" element={<BranchEdit />} />
                  <Route path="/branches/show/:id" element={<BranchShow />} />

                  {/* Events Module Routes */}
                  <Route path="/events" element={<EventList />} />
                  <Route path="/events/create" element={<EventCreate />} />
                  <Route path="/events/edit/:id" element={<EventEdit />} />
                  <Route path="/events/show/:id" element={<EventShow />} />

                  {/* Notifications Module Routes */}
                  <Route path="/notifications" element={<NotificationList />} />
                  <Route path="/notifications/create" element={<NotificationCreate />} />
                  <Route path="/notifications/edit/:id" element={<NotificationEdit />} />
                  <Route path="/notifications/show/:id" element={<NotificationShow />} />

                  {/* Approvals Module Routes */}
                  {/*<Route path="/approvals" element={<ApprovalsList />} />*/}

                  {/* Users Module Route - Protected by AuthGuard */}
                  <Route element={<AuthGuard allowedRoles={["SUPER_ADMIN"]} />}>
                    <Route path="/users" element={<AdminUsers />} /> {/* Updated route path */}
                  </Route>

                  {/* Access Denied Route - Moved here */}
                  <Route path="/access-denied" element={<div>Access Denied: You do not have permission to view this page.</div>} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Removed the old /access-denied route from here */}
                {/* Add other public routes like forgot password, update password */}
              </Routes>
              <RefineKbar />
            </Refine>
            {/* Removed DevtoolsPanel */}
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;