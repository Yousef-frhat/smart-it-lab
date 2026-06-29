/**
 * Unit tests — AuthContext
 *
 * Tests the AuthProvider, useAuth hook, login, register, logout,
 * updateUser, and session restoration.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";

// ── Mock dependencies ────────────────────────────────────────────
vi.mock("@/app/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/app/utils/apply-theme", () => ({
  applyTheme: vi.fn(),
}));

import api from "@/app/services/api";
import { toast } from "sonner";
import { applyTheme } from "@/app/utils/apply-theme";
import { AuthProvider, useAuth } from "@/app/contexts/auth-context";

const mockedApi = vi.mocked(api);

// ── Test consumer component ──────────────────────────────────────
function AuthConsumer() {
  const {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    loginWithProvider,
    logout,
    updateUser,
  } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <span data-testid="user-name">{user?.name ?? "none"}</span>
      <span data-testid="user-email">{user?.email ?? "none"}</span>
      <button
        data-testid="login"
        onClick={() => login("test@test.com", "pass123")}
      >
        Login
      </button>
      <button
        data-testid="register"
        onClick={() => register("Test", "test@test.com", "pass123")}
      >
        Register
      </button>
      <button data-testid="logout" onClick={() => logout()}>
        Logout
      </button>
      <button
        data-testid="update"
        onClick={() => updateUser({ name: "Updated" })}
      >
        Update
      </button>
      <button
        data-testid="github"
        onClick={() => loginWithProvider("github")}
      >
        GitHub
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("AuthProvider", () => {
  describe("initial state (no token)", () => {
    test("starts with unauthenticated state when no accessToken", async () => {
      mockedApi.get.mockRejectedValue(new Error("no token"));

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(screen.getByTestId("user-name").textContent).toBe("none");
    });
  });

  describe("session restoration", () => {
    test("restores user from /auth/me when accessToken exists", async () => {
      localStorage.setItem("accessToken", "valid-token");
      mockedApi.get.mockResolvedValue({
        data: {
          data: {
            user: {
              _id: "u-1",
              name: "Alice",
              email: "alice@test.com",
              role: "admin",
              createdAt: "2024-01-01",
            },
          },
        },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("admin").textContent).toBe("true");
      expect(screen.getByTestId("user-name").textContent).toBe("Alice");
    });

    test("clears token when /auth/me fails", async () => {
      localStorage.setItem("accessToken", "expired-token");
      mockedApi.get.mockRejectedValue({ response: { status: 401 } });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
    });
  });

  describe("login", () => {
    test("login sets user and stores token", async () => {
      mockedApi.get.mockRejectedValue(new Error("no session"));
      mockedApi.post.mockResolvedValue({
        data: {
          data: {
            accessToken: "new-token",
            user: {
              id: "u-2",
              name: "Bob",
              email: "bob@test.com",
              role: "student",
              createdAt: "2024-06-01",
            },
          },
        },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      await act(async () => {
        screen.getByTestId("login").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("authenticated").textContent).toBe("true");
      });

      expect(screen.getByTestId("user-name").textContent).toBe("Bob");
      expect(localStorage.getItem("accessToken")).toBe("new-token");
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        "Logged in successfully!"
      );
    });
  });

  describe("register", () => {
    test("register sets user and stores token", async () => {
      mockedApi.get.mockRejectedValue(new Error("no session"));
      mockedApi.post.mockResolvedValue({
        data: {
          data: {
            accessToken: "reg-token",
            user: {
              id: "u-3",
              name: "Carol",
              email: "carol@test.com",
              role: "student",
              createdAt: "2024-06-15",
            },
          },
        },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      await act(async () => {
        screen.getByTestId("register").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("user-name").textContent).toBe("Carol");
      });

      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        "Account created successfully!"
      );
      expect(vi.mocked(applyTheme)).toHaveBeenCalledWith("dark");
    });
  });

  describe("logout", () => {
    test("logout clears user and token", async () => {
      localStorage.setItem("accessToken", "valid-token");
      mockedApi.get.mockResolvedValue({
        data: {
          data: {
            user: {
              id: "u-1",
              name: "Alice",
              email: "a@t.com",
              role: "student",
              createdAt: "2024-01-01",
            },
          },
        },
      });
      mockedApi.post.mockResolvedValue({});

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated").textContent).toBe("true");
      });

      await act(async () => {
        screen.getByTestId("logout").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("authenticated").textContent).toBe("false");
      });

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Logged out");
    });

    test("logout clears state even when API call fails", async () => {
      localStorage.setItem("accessToken", "valid-token");
      mockedApi.get.mockResolvedValue({
        data: {
          data: {
            user: {
              id: "u-1",
              name: "Alice",
              email: "a@t.com",
              role: "student",
              createdAt: "2024-01-01",
            },
          },
        },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated").textContent).toBe("true");
      });

      // Make logout API call fail
      mockedApi.post.mockRejectedValue(new Error("network error"));

      await act(async () => {
        screen.getByTestId("logout").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("authenticated").textContent).toBe("false");
      });
    });
  });

  describe("updateUser", () => {
    test("updateUser merges partial updates into current user", async () => {
      localStorage.setItem("accessToken", "valid-token");
      mockedApi.get.mockResolvedValue({
        data: {
          data: {
            user: {
              id: "u-1",
              name: "Alice",
              email: "a@t.com",
              role: "student",
              createdAt: "2024-01-01",
            },
          },
        },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-name").textContent).toBe("Alice");
      });

      await act(async () => {
        screen.getByTestId("update").click();
      });

      expect(screen.getByTestId("user-name").textContent).toBe("Updated");
      // Email should remain unchanged
      expect(screen.getByTestId("user-email").textContent).toBe("a@t.com");
    });
  });

  describe("isAdmin", () => {
    test("isAdmin is true when user role is admin", async () => {
      localStorage.setItem("accessToken", "valid-token");
      mockedApi.get.mockResolvedValue({
        data: {
          data: {
            user: {
              id: "u-1",
              name: "Admin",
              email: "admin@t.com",
              role: "admin",
              createdAt: "2024-01-01",
            },
          },
        },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("admin").textContent).toBe("true");
      });
    });

    test("isAdmin is false when user role is student", async () => {
      localStorage.setItem("accessToken", "valid-token");
      mockedApi.get.mockResolvedValue({
        data: {
          data: {
            user: {
              id: "u-1",
              name: "Student",
              email: "student@t.com",
              role: "student",
              createdAt: "2024-01-01",
            },
          },
        },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("admin").textContent).toBe("false");
      });
    });
  });
});

describe("useAuth outside provider", () => {
  test("throws error when used outside AuthProvider", () => {
    const ErrorComponent = () => {
      useAuth();
      return null;
    };

    // Suppress console.error for this expected error
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<ErrorComponent />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );
  });
});
