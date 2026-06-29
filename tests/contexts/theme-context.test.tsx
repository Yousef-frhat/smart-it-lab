/**
 * Unit tests — ThemeContext
 *
 * Tests the ThemeProvider, useTheme hook, toggle/set behaviour,
 * localStorage persistence, and HTML class application.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ThemeProvider, useTheme } from "@/app/contexts/theme-context";

// ── Test consumer component ──────────────────────────────────────
function ThemeConsumer() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button data-testid="toggle" onClick={toggleTheme}>
        Toggle
      </button>
      <button data-testid="set-light" onClick={() => setTheme("light")}>
        Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>
        Dark
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark", "light");
});

describe("ThemeProvider", () => {
  test("defaults to dark theme when localStorage is empty", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  test("reads saved theme from localStorage", () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  test("normalizes legacy 'auto' value to dark", () => {
    localStorage.setItem("theme", "auto");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  test("toggleTheme switches from dark to light", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByTestId("toggle"));

    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  test("toggleTheme switches from light to dark", async () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByTestId("toggle"));

    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  test("setTheme sets specific theme", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByTestId("set-light"));
    expect(screen.getByTestId("theme").textContent).toBe("light");

    await userEvent.click(screen.getByTestId("set-dark"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  test("persists theme to localStorage on change", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByTestId("set-light"));
    expect(localStorage.getItem("theme")).toBe("light");
  });

  test("applies dark class to document.documentElement", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("useTheme outside provider", () => {
  test("throws error when used outside ThemeProvider", () => {
    const ErrorComponent = () => {
      useTheme();
      return null;
    };

    expect(() => render(<ErrorComponent />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
  });
});
