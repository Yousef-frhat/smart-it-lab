/**
 * Unit tests — ProtectedRoute component
 *
 * AuthContext is mocked via a wrapper — no real network calls.
 * react-router's MemoryRouter provides routing context.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import React from "react";

// ── Mock AuthContext ──────────────────────────────────────────────
import * as AuthContextModule from "@/app/contexts/auth-context";

type AuthContextValue = {
  user: AuthContextModule.User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  loginWithProvider: () => void;
  logout: () => Promise<void>;
  updateUser: () => void;
};

function mockAuthContext(overrides: Partial<AuthContextValue> = {}) {
  const defaults: AuthContextValue = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    login: vi.fn(),
    register: vi.fn(),
    loginWithProvider: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  };
  vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({ ...defaults, ...overrides });
}

// ── Import component under test ───────────────────────────────────
import { ProtectedRoute } from "@/app/components/protected-route";

// ── Helpers ───────────────────────────────────────────────────────
function renderWithRouter(
  ui: React.ReactElement,
  { initialPath = "/" }: { initialPath?: string } = {}
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth" element={<div data-testid="auth-page">Auth Page</div>} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
        <Route path="/protected" element={ui} />
        <Route path="/admin" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────
describe("ProtectedRoute", () => {
  describe("loading state", () => {
    test("shows loading spinner while auth is resolving", () => {
      mockAuthContext({ isLoading: true, isAuthenticated: false });
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>,
        { initialPath: "/protected" }
      );
      // Loading spinner is rendered — child is not
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
      // The spinner div is present
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("unauthenticated user", () => {
    test("redirects to /auth when not authenticated", () => {
      mockAuthContext({ isAuthenticated: false, isLoading: false });
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>,
        { initialPath: "/protected" }
      );
      expect(screen.getByTestId("auth-page")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });

    test("does not render children when unauthenticated", () => {
      mockAuthContext({ isAuthenticated: false, isLoading: false });
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="secret">Secret</div>
        </ProtectedRoute>,
        { initialPath: "/protected" }
      );
      expect(screen.queryByTestId("secret")).not.toBeInTheDocument();
    });
  });

  describe("authenticated student user", () => {
    const studentUser: AuthContextModule.User = {
      id: "user-1",
      name: "Alice",
      email: "alice@test.com",
      role: "student",
      createdAt: new Date().toISOString(),
    };

    test("renders children when authenticated", () => {
      mockAuthContext({ isAuthenticated: true, isAdmin: false, user: studentUser, isLoading: false });
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>,
        { initialPath: "/protected" }
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    test("does not redirect authenticated user to /auth", () => {
      mockAuthContext({ isAuthenticated: true, isAdmin: false, user: studentUser, isLoading: false });
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="child">Content</div>
        </ProtectedRoute>,
        { initialPath: "/protected" }
      );
      expect(screen.queryByTestId("auth-page")).not.toBeInTheDocument();
    });
  });

  describe("admin-only route", () => {
    const studentUser: AuthContextModule.User = {
      id: "user-2",
      name: "Bob",
      email: "bob@test.com",
      role: "student",
      createdAt: new Date().toISOString(),
    };

    const adminUser: AuthContextModule.User = {
      id: "admin-1",
      name: "Admin",
      email: "admin@test.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    };

    test("redirects student to /dashboard when requireAdmin is true", () => {
      mockAuthContext({ isAuthenticated: true, isAdmin: false, user: studentUser, isLoading: false });
      renderWithRouter(
        <ProtectedRoute requireAdmin>
          <div data-testid="admin-content">Admin Only</div>
        </ProtectedRoute>,
        { initialPath: "/admin" }
      );
      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    });

    test("renders admin content when user is admin", () => {
      mockAuthContext({ isAuthenticated: true, isAdmin: true, user: adminUser, isLoading: false });
      renderWithRouter(
        <ProtectedRoute requireAdmin>
          <div data-testid="admin-content">Admin Only</div>
        </ProtectedRoute>,
        { initialPath: "/admin" }
      );
      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });

    test("non-admin authenticated user cannot see admin content", () => {
      mockAuthContext({ isAuthenticated: true, isAdmin: false, user: studentUser, isLoading: false });
      renderWithRouter(
        <ProtectedRoute requireAdmin>
          <div data-testid="admin-content">Admin Only</div>
        </ProtectedRoute>,
        { initialPath: "/admin" }
      );
      expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    });
  });
});
