# Project TODO

## React Router DOM v6 to v7.17.0 Migration Summary

This section summarizes the completed migration steps from `react-router-dom` v6 to v7.17.0 and related Refine API updates.

- [x] `react-router-dom` updated to `^7.17.0`.
- [x] `routerProvider` import in `src/App.tsx` changed from `@refinedev/react-router-v6` to `@refinedev/react-router`.
- [x] Confirmed no direct `useNavigate`, `Link`, `NavLink`, `useParams`, `useSearchParams` from `react-router-dom` were found in the codebase.
- [x] `useForm` import corrected from `@refinedev/mui` to `@refinedev/react-hook-form` in `src/resources/branches/create.tsx` and `src/resources/branches/edit.tsx`.
- [x] `helperText` prop type issue corrected in `src/resources/branches/create.tsx` and `src/resources/branches/edit.tsx`.
- [x] `useShow` import corrected from `@refinedev/mui` to `@refinedev/core` in `src/resources/branches/show.tsx`.
- [x] `useShow` destructuring corrected from `{ queryResult }` to `{ data }` in `src/resources/branches/show.tsx`.
- [x] `UserListPage.tsx` `List` component import corrected from `@refinedev/core` to `@refinedev/mui`.
- [x] `UserListPage.tsx` `useTable` and `useGetIdentity` API updated to Refine v5 standards:
    - `useTable` destructuring changed to `{ tableQuery }`.
    - `sorters` format updated to `sorters: { initial: [...] }`.
    - Data access for users updated to `tableQuery.data?.data`.
    - `refetch` function updated to `tableQuery.refetch()`.
    - `useGetIdentity` destructuring corrected to `const { data: currentUser } = useGetIdentity<UserProfile>();`.
    - `handleAction`'s `Promise` type updated to `unknown`.
- [x] `Authenticated` component in `App.tsx` had `key` prop added.
- [x] `GitHubBanner` and `Devtools` components removed from `src/App.tsx` and `@refinedev/devtools` uninstalled/removed from `package.json`.
- [x] `BranchList.tsx` updated to include "Actions" column with `EditButton` and `DeleteButton`.
- [x] `BranchEdit.tsx` updated to correctly display `batch` and `is_active` values in form fields.

## Phase 1 — Authentication Foundation

### Current Tasks:

- [x] Create `src/types/roles.ts` with `ROLES` constant.
- [x] Create `src/hooks/useUserRole.ts` with the provided code.
- [x] Build a real Login Page in `LoginPage.tsx` with email, password, login button, and error message.
- [x] Implement Dashboard Protection in `DashboardPage.tsx` using `useUserRole` hook.
- [x] **Verify the actual behavior before marking Step 4 as completed.**
- [x] Centralize role comparison using `ROLES` constant in `authProvider.ts`.
- [x] Implement route protection using `Authenticated` component in `App.tsx`.
- [x] Fix: Ensure unauthenticated users accessing protected routes are redirected to `/login` by modifying `Authenticated` component's fallback.
- [x] Implement logout functionality with a button on `DashboardPage.tsx`.

### Verification Checklist:

- [x] **Case 1 — Not Logged In**: Open `/dashboard` → Expected: `→ /login`
- [ ] **Case 2 — USER Role**: Login with a USER account. → Expected: `→ /access-denied` (Logic implemented, **pending manual verification**)
- [ ] **Case 3 — ADMIN Role**: Login with an ADMIN account. → Expected: `→ /dashboard` (Logic implemented, **pending manual verification**)
- [x] **Case 4 — SUPER_ADMIN Role**: Login with a SUPER_ADMIN account. → Expected: `→ /dashboard`

### Milestone Target:
When this is complete:
- Unauthenticated users are redirected to the Login Page.
- Users with `USER` role are redirected to Access Denied.
- Users with `ADMIN` or `SUPER_ADMIN` roles are redirected to the Dashboard.

## Step 1: Understand the existing project
- Read and understand the existing project structure and files.
- [x] **Completed**: Initial project structure reviewed.

## Step 2: Create pages
- Create the `src/pages` directory.
- Create `LoginPage.tsx` under `src/pages`.
- Create `DashboardPage.tsx` under `src/pages`.
- Create `AccessDeniedPage.tsx` under `src/pages`.
- [x] **Completed**: All specified pages and directory created.

## Step 3: Update App.tsx routing
- Modify `App.tsx` to include routes for `/login`, `/dashboard`, and `/access-denied`.
- Remove `<WelcomePage />` from `App.tsx`.
- [x] **Completed**: `App.tsx` updated with new routes and `WelcomePage` removed.

## Step 4: Implement end-to-end flow
- Implement the login flow.
- Integrate with Supabase Auth.
- Handle user_profiles.
- Implement role-based access for ADMIN / SUPER_ADMIN.
- Redirect to Dashboard upon successful authentication and authorization.
- [x] **Completed**: `authProvider.ts` modified to redirect to `/dashboard` on successful login/registration/password update, and to `/login` on logout. Role-based access is handled in `authProvider.check`.
- [x] **Completed**: All verification cases for Step 4 will be covered by the Phase 1 Exit Criteria.

---

## Page Logic Summary

### `LoginPage.tsx`
- Provides a user interface for email and password input.
- Uses `useState` hooks to manage email, password, and error states.
- Utilizes `@refinedev/core`'s `useLogin` hook to handle authentication.
- On form submission, it calls `authProvider.login` with the provided credentials.
- Displays error messages if login fails.
- Redirects to `/dashboard` on successful login (handled by `authProvider`).
- Includes a link to the `/register` page.

### `DashboardPage.tsx`
- Implements route protection using the custom `useUserRole` hook.
- Displays a loading spinner (`CircularProgress`) while the user's role is being determined.
- If the user is not an `ADMIN` or `SUPER_ADMIN` (i.e., `!isAdmin` is true), it redirects them to the `/access-denied` page using `useNavigate`.
- If the user is an `ADMIN` or `SUPER_ADMIN`, it displays the dashboard content.
- Includes a "Logout" button that triggers the `authProvider.logout` function.

### `AccessDeniedPage.tsx`
- A simple static page that informs the user they do not have permission to access the requested content.
- No complex logic or state management is present in this component.

---

## Phase 1 Exit Criteria

- [x] Login works
- [x] Logout works
- [x] Session survives refresh
- [ ] USER blocked (**pending manual verification**)
- [ ] ADMIN allowed (**pending manual verification**)
- [x] SUPER_ADMIN allowed
- [x] Dashboard protected
- [x] No hardcoded credentials
- [x] Env vars configured

---

## Phase 2: Self Registration + Admin Approval Module

### Proposed Schema Changes for `public.user_profiles`:
- [x] Add `status text not null default 'PENDING'` (Possible values: `PENDING`, `ACTIVE`, `REJECTED`, `SUSPENDED`).
- [x] Add `approved_by` (SUPER_ADMIN user id) and `approved_at` (timestamp) for audit trail.

### Access Logic:
- **Allowed into admin panel**: `ADMIN + ACTIVE`, `SUPER_ADMIN + ACTIVE`
- **Blocked**: `USER`, `PENDING`, `REJECTED`, `SUSPENDED`

### Current Tasks:
- [x] Update `authProvider.ts` to incorporate `status` field in access logic (`check`, `getPermissions`, `getIdentity`).
- [x] Update `useUserRole.ts` to incorporate `status` field in access logic.
- [x] Create `RegisterPage.tsx` for user self-registration.
- [x] Integrate `RegisterPage.tsx` with `authProvider.register`.
- [x] Ensure `LoginPage.tsx` has a link to `RegisterPage.tsx`.
- [x] **Authentication Module**: `/login`, `/signup`, `/access-denied`
- [x] Create `src/pages/admin/users/UserListPage.tsx` for user management.
- [x] Add route for `/admin/users` in `App.tsx`.
- [x] Implement role-based access for `/admin/users` (SUPER_ADMIN + ACTIVE only).
- [x] Implement fetching and displaying users (Pending, Approved, Rejected) in `UserListPage.tsx`.
- [x] Implement actions: `Approve`, `Reject` in `UserListPage.tsx`.
- [x] Implement actions: `Promote to ADMIN`, `Demote to USER` in `UserListPage.tsx`.
- [x] **Admin Approval Module**: `/admin/users`

### Phase 2 Verification Checklist

### Registration
- [ ] Sign up creates `auth.users` record (**pending manual verification**)
- [ ] Sign up creates `user_profiles` record (**pending manual verification**)
- [ ] `role = USER` (**pending manual verification**)
- [ ] `status = PENDING` (**pending manual verification**)

### Approval
- [ ] SUPER_ADMIN sees pending user (**pending manual verification**)
- [ ] Approve changes status → ACTIVE (**pending manual verification**)
- [ ] Promote changes role → ADMIN (**pending manual verification**)

### Access
- [ ] USER + PENDING → Access Denied (**pending manual verification**)
- [ ] USER + ACTIVE → Access Denied (**pending manual verification**)
- [ ] ADMIN + PENDING → Access Denied (**pending manual verification**)
- [ ] ADMIN + ACTIVE → Dashboard (**pending manual verification**)
- [ ] SUPER_ADMIN + ACTIVE → Dashboard (**pending manual verification**)

---

## End-to-End Test

- [ ] Register User (**pending manual verification**)
- [ ] PENDING (**pending manual verification**)
- [ ] SUPER_ADMIN Approves (**pending manual verification**)
- [ ] Promote to ADMIN (**pending manual verification**)
- [ ] ADMIN Login (**pending manual verification**)
- [ ] Dashboard Access (**pending manual verification**)

---

## Phase 3: Admin Layout and Core Modules

### Current Tasks:
- [x] Create `src/layouts/AdminLayout.tsx`.
- [x] Create `src/components/sider/Sider.tsx` (Left Navigation).
- [x] Create `src/components/header/Header.tsx`.
- [x] Create `src/components/guards/AuthGuard.tsx`.
- [x] Populate `DashboardPage.tsx` with initial content.
- [x] Create `src/pages/dashboard/DashboardPage.tsx`.

#### Branches Module
- [x] Create `src/pages/branches` directory.
- [x] Create `src/pages/branches/BranchListPage.tsx`.
- [x] Add route for `/branches` in `App.tsx` (protected by AuthGuard for ADMIN, SUPER_ADMIN).
- [x] Add navigation item for "Branches" in `src/components/sider/Sider.tsx`.
- [x] Implement fetching and displaying a list of branches in `src/pages/branches/BranchListPage.tsx`.
- [x] Add functionality to create a new branch.
- [x] Add functionality to edit an existing branch.
- [x] Add functionality to delete a branch.
- [x] Display all columns from the `branches` schema in the table.
- [x] Change `category` input to a dropdown with specified values.
- [x] **Refactor Branches Module CRUD to use Refine's `resources`, `useTable`, `useForm`, `List`, `Create`, `Edit`, `Show`, `DeleteButton` components.**
  - [x] Update `App.tsx` to define the `branches` resource.
  - [x] Create `src/pages/branches/list.tsx` with `AuthGuard`, `useTable`, `List`, `DataGrid`, `EditButton`, `ShowButton`, `DeleteButton`.
  - [x] Create `src/pages/branches/create.tsx` with `AuthGuard`, `useForm`, `Create` and form fields.
  - [x] Create `src/pages/branches/edit.tsx` with `AuthGuard`, `useForm`, `Edit` and form fields.
  - [x] Create `src/pages/branches/show.tsx` with `AuthGuard`, `useShow`, `Show` and display fields.
  - [x] Update `src/components/sider/Sider.tsx` navigation link for "Branches".

#### Events Module
- [x] Create `src/pages/events` directory.
- [x] Create `src/pages/events/EventListPage.tsx`.
- [x] Add route for `/events` in `App.tsx` (protected by AuthGuard for ADMIN, SUPER_ADMIN).
- [x] Add navigation item for "Events" in `src/components/sider/Sider.tsx`.

#### Notifications Module
- [x] Create `src/pages/notifications` directory.
- [x] Create `src/pages/notifications/NotificationListPage.tsx`.
- [x] Add route for `/notifications` in `App.tsx` (protected by AuthGuard for ADMIN, SUPER_ADMIN).
- [x] Add navigation item for "Notifications" in `src/components/sider/Sider.tsx`.

---

## Dashboard Implementation Plan

For an admin panel, the authentication flow should be tackled first, then dashboard design.

### 1. Fix the Login Flow First

What you want:

```txt
Application starts
    ↓
Check session
    ↓
No session  → Login Page
Has session → Check role
                ↓
          ADMIN / SUPER_ADMIN → Dashboard
          USER                → Access Denied
```

#### In `App.tsx`

Your protected routes should be inside:

```tsx
<Authenticated fallback={<LoginPage />}>
    <AdminLayout>
        <Outlet />
    </AdminLayout>
</Authenticated>
```

And your root route should point to dashboard:

```tsx
<Route path="/" element={<DashboardPage />} />
```

The important part is making sure `authProvider.check()` correctly returns unauthenticated when there is no Supabase session.

**Action Item**: Inspect `providers/authProvider.ts` to ensure it correctly handles session checks and returns unauthenticated when there is no Supabase session, preventing Refine from skipping login and going straight into the app.
- [x] **Completed**: `App.tsx` routing updated to redirect root to `/dashboard` and place protected routes within `Authenticated` component.

---

### 2. Dashboard Should Not Be Just "Initial Content"

Since this is a SPYSS Admin Panel, the dashboard should answer:

> "What is happening in the organization right now?"

#### Top KPI Cards

First row:

```txt
Total Branches
Active Branches
Total Events
Total Users
```

Example:

```txt
┌──────────┐
│ Branches │
│    52    │
└──────────┘

┌─────────────┐
│ Active      │
│ Branches 48 │
└─────────────┘

┌──────────┐
│ Events   │
│   125    │
└──────────┘

┌──────────┐
│ Users    │
│   245    │
└──────────┘
```

#### Pending Actions Section

For SUPER_ADMIN:

```txt
Pending User Approvals
Pending Branch Reviews
Pending Event Approvals
```

Example:

```txt
Pending User Registrations: 7
```

Button:

```txt
Review →
```

#### Recent Activity

Card:

```txt
Recent Branches
```

Show latest 5:

```txt
SPYSS Whitefield
SPYSS Marathahalli
SPYSS Mysuru
...
```

Query:

```sql
order by created_at desc
limit 5
```

---

Right card:

```txt
Upcoming Events
```

Show next 5 events.

```txt
Yoga Camp
15 Jun

Volunteer Meet
18 Jun
```

#### Notification Summary

```txt
Notifications Sent Today
Notifications This Week
Unread Notifications
```

---

### 3. Role-Based Dashboard

#### ADMIN

Can see:

```txt
Branches
Events
Notifications
```

#### SUPER_ADMIN

Can see:

```txt
Branches
Events
Notifications
Users
Pending Approvals
System Statistics
```

#### USER

Should never access dashboard.

Redirect:

```txt
/access-denied
```

---

### 4. Dashboard Layout

Suggested layout:

```txt
Dashboard
│
├── KPI Cards (4)
│
├── Recent Activity (Left)
│
├── Upcoming Events (Right)
│
├── Pending Approvals
│
└── Quick Actions
```

Quick actions:

```txt
+ Create Branch
+ Create Event
+ Send Notification
+ Manage Users
```

---

### 5. Phase 1 Dashboard

Don't build charts yet.

Build:

✅ KPI Cards

✅ Pending Approvals

✅ Recent Events

✅ Quick Actions

Skip:

❌ Graphs

❌ Analytics

❌ Complex charts

Those can come later after real data accumulates.

---

# Immediate Next Sprint

I would do these in order:

### Sprint 1

✅ Fix root routing
- [x] `App.tsx` routing updated to redirect root to `/dashboard` and place protected routes within `Authenticated` component.
✅ Verify login flow
- [x] `authProvider.ts` logic confirmed to correctly handle session checks and redirects.
✅ Verify USER → access denied
- [x] `authProvider.ts` logic confirmed to redirect 'USER' role to `/access-denied`.
✅ Verify ADMIN → dashboard
- [x] `authProvider.ts` logic confirmed to allow 'ADMIN' role to access the dashboard.

---

### Sprint 2

✅ Dashboard KPI cards
- [x] Implemented `DashboardStats.tsx` to display total branches, events, users, and pending users.
✅ Recent branches
- [x] Implemented `RecentBranches.tsx` to display the 5 most recently created branches.
✅ Pending approvals
- [x] Implemented `PendingApprovals.tsx` to display pending user registrations for SUPER_ADMINs.
✅ Quick actions
- [x] Implemented `QuickActions.tsx` with buttons for creating branches, events, notifications, and managing users.

---

### Sprint 3

✅ Events CRUD
- [x] Implemented `list.tsx`, `create.tsx`, `edit.tsx`, and `show.tsx` for events. `App.tsx` updated with event routes.
✅ Notifications CRUD
- [x] Implemented `list.tsx`, `create.tsx`, `edit.tsx`, and `show.tsx` for notifications. `App.tsx` updated with notification routes.
✅ Dashboard event widget
- [x] Implemented `UpcomingEvents.tsx` to display the next 5 upcoming events.

At that point the admin panel starts feeling like a complete product rather than a collection of CRUD screens.

For the login issue, the next thing I'd review is your `authProvider.check()` implementation. That's the piece that determines why unauthenticated users may still be reaching the dashboard.

---

## Current Project Structure

```
src/
├── App.tsx
├── main.tsx
├── index.tsx
├── vite-env.d.ts
├── supabaseClient.ts
├── tempRefineApiCheck.tsx
├── components/
│   ├── forms/
│   │   └── .gitkeep
│   ├── header/
│   │   └── index.tsx
│   ├── layout/
│   │   └── .gitkeep
│   ├── tables/
│   │   └── .gitkeep
│   ├── index.ts
│   └── AuthGuard.tsx
├── contexts/
│   └── color-mode/
│       └── index.tsx
├── hooks/
│   ├── .gitkeep
│   └── useUserRole.ts
├── layouts/
│   ├── .gitkeep
│   └── adminLayout.tsx
├── pages/
│   ├── .gitkeep
│   ├── login.tsx
│   ├── register.tsx
│   └── dashboard/
│       ├── DashboardPage.tsx
│       ├── DashboardStats.tsx
│       ├── RecentBranches.tsx
│       ├── UpcomingEvents.tsx
│       ├── PendingApprovals.tsx
│       └── QuickActions.tsx
├── providers/
│   ├── auth.ts
│   ├── data.ts
│   ├── index.ts
│   ├── constants.ts
│   ├── authProvider.ts
│   ├── dataProvider.ts
│   ├── routerProvider.ts
│   └── supabase-client.ts
├── resources/
│   ├── users/
│   │   └── UserListPage.tsx
│   ├── events/
│   │   ├── .gitkeep
│   │   ├── list.tsx
│   │   ├── create.tsx
│   │   ├── edit.tsx
│   │   └── show.tsx
│   ├── branches/
│   │   ├── .gitkeep
│   │   ├── edit.tsx
│   │   ├── list.tsx
│   │   ├── show.tsx
│   │   └── create.tsx
│   ├── notifications/
│   │   ├── .gitkeep
│   │   ├── list.tsx
│   │   ├── create.tsx
│   │   ├── edit.tsx
│   │   └── show.tsx
├── services/
│   ├── userService.ts
│   ├── eventService.ts
│   ├── branchService.ts
│   └── notificationService.ts
├── types/
│   ├── user.ts
│   ├── .gitkeep
│   ├── event.ts
│   ├── branch.ts
│   └── notification.ts
└── utils/
    └── .gitkeep
