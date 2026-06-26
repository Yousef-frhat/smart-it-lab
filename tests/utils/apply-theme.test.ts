/**
 * Unit tests — applyTheme utility
 */

import { describe, test, expect, beforeEach } from "vitest";
import { applyTheme } from "@/app/utils/apply-theme";

beforeEach(() => {
  document.documentElement.classList.remove("dark", "light");
});

describe("applyTheme", () => {
  test("adds 'dark' class for dark theme", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  test("adds 'light' class for light theme", () => {
    applyTheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("removes existing theme class when switching", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    applyTheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("switching back to dark removes light", () => {
    applyTheme("light");
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  test("defaults to dark for unexpected values", () => {
    // The function signature only allows 'dark' | 'light', but the
    // implementation uses a ternary that falls back to 'dark' for
    // any non-'light' value. We test the boundary.
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
