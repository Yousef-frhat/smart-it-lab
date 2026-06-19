import { createBrowserRouter } from "react-router";
import LandingPage from "@/app/pages/landing";
import PricingPage from "@/app/pages/pricing";
import AuthPage from "@/app/pages/auth";
import StudentDashboard from "@/app/pages/student-dashboard";
import MyLabs from "@/app/pages/my-labs";
import Achievements from "@/app/pages/achievements";
import Leaderboard from "@/app/pages/leaderboard";
import Settings from "@/app/pages/settings";
import LabInterface from "@/app/pages/lab-interface";
import AdminDashboard from "@/app/pages/admin-dashboard";
import VerifyEmail from "@/app/pages/verify-email";
import ResetPassword from "@/app/pages/reset-password";
import NotFound from "@/app/pages/not-found";
import AuthCallback from "@/app/pages/auth-callback";
import { ProtectedRoute } from "@/app/components/protected-route";
import { DashboardLayout } from "@/app/components/dashboard-layout";
import { ErrorBoundary } from "@/app/components/error-boundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
    errorElement: <ErrorBoundary><NotFound /></ErrorBoundary>,
  },
  {
    path: "/pricing",
    Component: PricingPage,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
    path: "/verify-email",
    Component: VerifyEmail,
  },
  {
    // Public route — handles GitHub/Google OAuth redirect
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <StudentDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/labs",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <MyLabs />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/achievements",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Achievements />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/leaderboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Leaderboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/settings",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/lab/:id",
    element: (
      <ProtectedRoute>
        <LabInterface />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
