import React, { Suspense, lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { IncidentProvider } from "./context/IncidentContext";
import { AuthGate, RequireRole, Splash } from "./screens/shell/guards";
import { CitizenShell } from "./screens/shell/CitizenShell";
import Home from "./screens/citizen/Home";
import MyReports from "./screens/citizen/MyReports";
import MapView from "./screens/citizen/MapView";
import Profile from "./screens/citizen/Profile";

// Route-level chunks: the report flow (Gemini client), admin and agency
// tooling never load on a citizen's home screen.
const StartReport = lazy(() => import("./screens/citizen/StartReport"));
const AdminArea = lazy(() => import("./screens/admin/AdminArea"));
const AgencyArea = lazy(() => import("./screens/agency/AgencyArea"));

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<Splash />}>{node}</Suspense>
);

const router = createBrowserRouter([
  {
    element: <AuthGate />,
    children: [
      {
        element: <RequireRole allow="citizen" />,
        children: [
          {
            path: "/",
            element: <CitizenShell />,
            children: [
              { index: true, element: <Home /> },
              { path: "reports", element: <MyReports /> },
              { path: "report", element: withSuspense(<StartReport />) },
              { path: "map", element: <MapView /> },
              { path: "profile", element: <Profile /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole allow="admin" />,
        children: [{ path: "/admin", element: withSuspense(<AdminArea />) }],
      },
      {
        element: <RequireRole allow="agency" />,
        children: [{ path: "/agency", element: withSuspense(<AgencyArea />) }],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <IncidentProvider>
        <RouterProvider router={router} />
      </IncidentProvider>
    </AuthProvider>
  );
}
