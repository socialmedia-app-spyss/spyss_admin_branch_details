# React Router DOM v6 to v7.17.0 Migration Plan

This document outlines the steps required to migrate the project from `react-router-dom` version 6 to version 7.17.0.

## Current State Analysis (v6)

Before starting the migration, it's crucial to understand how `react-router-dom` v6 is currently being used in the project. This includes identifying:

*   **Imports**: Which components and hooks are being imported from `react-router-dom`.
*   **Routing Setup**: How routes are defined (e.g., `BrowserRouter`, `Routes`, `Route`).
*   **Navigation**: How programmatic navigation is handled (e.g., `useNavigate`).
*   **Route Parameters**: How route parameters are accessed (e.g., `useParams`).
*   **Query Parameters**: How query parameters are accessed (e.g., `useSearchParams`).
*   **Links**: Usage of `Link` and `NavLink` components.
*   **Nested Routes**: How nested routes are implemented.
*   **Authentication/Authorization**: Any custom routing logic related to authentication.

### Findings from `src/App.tsx`:

*   **Imports**: `BrowserRouter`, `Route`, `Routes`, `Outlet` are imported directly from `react-router-dom`.
*   **Routing Setup**: The main application uses `<BrowserRouter>`, `<Routes>`, and `<Route>` components to define the routing structure.
*   **Nested Routes**: The `<Outlet />` component is used within the `AdminLayout` to render child routes.
*   **Refine Framework Integration**: The project heavily relies on the `@refinedev/core` framework, and specifically uses `@refinedev/react-router-v6` as its `routerProvider`.

### Findings from `package.json`:

*   `react-router-dom` is already updated to `^7.17.0`.
*   `@refinedev/react-router` is at `^2.0.0`.
*   `@refinedev/react-hook-form` is at `5.0.4`.

**Discrepancy**: `src/App.tsx` imports `routerProvider` from `@refinedev/react-router-v6`, but `package.json` indicates `@refinedev/react-router` (without the `-v6` suffix) is installed at version `^2.0.0`. It's likely that `@refinedev/react-router` v2.0.0 is designed to work with `react-router-dom` v7, and the import path in `App.tsx` needs to be updated.

## Migration Steps

1.  **Review `react-router-dom` v7.17.0 Release Notes and Documentation**:
    *   Familiarize ourselves with any breaking changes, new features, and deprecations in v7.17.0 compared to v6.

2.  **Update Dependencies**:
    *   Ensure `react-router-dom` is updated to `7.17.0` (already done as per request).
    *   **Action Item**: Change the import of `routerProvider` in `src/App.tsx` from `@refinedev/react-router-v6` to `@refinedev/react-router`. This assumes `@refinedev/react-router` v2.0.0 is compatible with `react-router-dom` v7. **(Completed)**

3.  **Identify and Address Breaking Changes**:
    *   Based on the analysis and release notes, identify specific code areas that need modification due to breaking changes.

4.  **Update Routing Configuration**:
    *   Review and update the main routing configuration file(s) to align with v7.17.0 best practices. This will likely involve changes related to the Refine `routerProvider`.

5.  **Refactor Navigation Hooks and Components**:
    *   Adjust `useNavigate`, `Link`, `NavLink` usage if there are any changes in their API or behavior. (No direct usage of `useNavigate`, `Link`, or `NavLink` from `react-router-dom` found so far).

6.  **Handle Route Parameters and Query Parameters**:
    *   Verify and update how `useParams` and `useSearchParams` are used. (No direct usage of `useParams` or `useSearchParams` from `react-router-dom` found so far).

7.  **Test Thoroughly**:
    *   Perform comprehensive testing of all routing-related functionalities, including:
        *   Page navigation
        *   Deep linking
        *   Route guards (if any)
        *   Error pages (e.g., 404)

## Codebase Analysis Findings

*   **Imports**: `BrowserRouter`, `Route`, `Routes`, `Outlet` from `react-router-dom`.
*   **Routing Setup**: `<BrowserRouter>`, `<Routes>`, `<Route>`.
*   **Navigation**: No direct usage of `useNavigate`, `<Link>`, or `<NavLink>` from `react-router-dom` found. It's likely that navigation is handled through Refine's `routerProvider` or other Refine-specific hooks/components.
*   **Route Parameters**: No direct usage of `useParams` from `react-router-dom` found. Parameter access is likely abstracted by Refine.
*   **Query Parameters**: No direct usage of `useSearchParams` from `react-router-dom` found. Query parameter access is likely abstracted by Refine.
*   **Links**: No direct usage of `<Link>` or `<NavLink>` from `react-router-dom` found. Link generation is likely handled by Refine components.
*   **Nested Routes**: Implemented using `<Outlet />`.
*   **Authentication/Authorization**: Custom `AuthGuard` component and Refine's `Authenticated` component are used for route protection.
*   **Refine Router Provider**: Updated to import from `@refinedev/react-router`.
*   **`useForm` Import Issue**: The `useForm` hook was incorrectly imported from `@refinedev/mui` in `src/resources/branches/create.tsx` and `src/resources/branches/edit.tsx`. This has been corrected to import from `@refinedev/react-hook-form`. No other instances of this specific incorrect import pattern were found in files importing from `@refinedev/mui`.
*   **`helperText` Type Issue**: The `helperText` prop in `TextField` components in `src/resources/branches/create.tsx` and `src/resources/branches/edit.tsx` was updated to explicitly cast `errors.fieldName.message` to `String` to resolve a TypeScript error. The same fix was applied to `errors.batch.message` when used as children of `<p>` tags.
*   **`list.tsx` and `show.tsx`**: Checked `src/resources/branches/list.tsx` and `src/resources/branches/show.tsx` and confirmed they do not have the `useForm` import or `helperText` prop type issues.
*   **`useShow` Import Issue**: The `useShow` hook was incorrectly imported from `@refinedev/mui` in `src/resources/branches/show.tsx`. This has been corrected to import from `@refinedev/core`.
*   **`useShow` Destructuring Issue**: The `useShow` hook's return value destructuring in `src/resources/branches/show.tsx` was updated from `{ queryResult }` to `{ data }` to align with the `@refinedev/core` API.
*   **`UserListPage.tsx` Issues**:
    *   `List` component import corrected from `@refinedev/core` to `@refinedev/mui`.
    *   `useTable` hook destructuring updated from `{ tableQueryResult, refetch }` to `{ refetch, data }`.
    *   Data access for users updated from `tableQueryResult.data?.data` to `data?.data`.
    *   `useGetIdentity` destructuring corrected from `const currentUser = useGetIdentity<UserProfile>();` to `const { data: currentUser } = useGetIdentity<UserProfile>();`.
    *   **Refine v5 `useTable` API Update**: The `useTable` hook in `src/resources/users/UserListPage.tsx` was updated to use the Refine v5 API:
        *   Destructuring changed from `{ refetch, data }` to `{ tableQuery }`.
        *   `sorters` format updated to `sorters: { initial: [...] }`.
        *   `users` array populated from `tableQuery.data?.data`.
        *   `refresh` function calls `tableQuery.refetch()`.
        *   `handleAction`'s `Promise` type updated to `unknown`.

## Action Items

*   [x] Update `migration.md` with `package.json` findings.
*   [x] Change the import of `routerProvider` in `src/App.tsx` from `@refinedev/react-router-v6` to `@refinedev/react-router`.
*   [x] Search for usages of `useNavigate`, `Link`, `NavLink`, `useParams`, `useSearchParams` across the project.
*   [x] Corrected `useForm` import in `src/resources/branches/create.tsx` and `src/resources/branches/edit.tsx`.
*   [x] Corrected `helperText` type issue in `src/resources/branches/create.tsx` and `src/resources/branches/edit.tsx`.
*   [x] Checked `src/resources/branches/list.tsx` and `src/resources/branches/show.tsx` for related issues.
*   [x] Corrected `useShow` import in `src/resources/branches/show.tsx`.
*   [x] Corrected `useShow` destructuring in `src/resources/branches/show.tsx`.
*   [x] Corrected `UserListPage.tsx` issues related to `List` import and `useTable` and `useGetIdentity` usage, including the Refine v5 API changes for `useTable`.
*   [ ] Perform a full build and run of the application to identify any immediate compilation or runtime errors.
*   [ ] Thoroughly test all routing functionalities as outlined in step 7 of the migration plan.
*   [ ] Delete `src/tempRefineApiCheck.tsx` (the temporary file created for type inspection).