/**
 * Unit tests — ErrorBoundary component
 *
 * Tests that ErrorBoundary catches rendering errors in child components
 * and displays a fallback UI.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ErrorBoundary } from "@/app/components/error-boundary";

// Suppress console.error noise from React error boundary internals
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

// ── Throwing component for testing ──────────────────────────────
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test render error");
  }
  return <div data-testid="child">Safe content</div>;
}

describe("ErrorBoundary", () => {
  test("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  test("displays error fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "An unexpected error occurred. Please try reloading the page."
      )
    ).toBeInTheDocument();
  });

  test("shows Reload Page and Go Home buttons in error state", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Reload Page")).toBeInTheDocument();
    expect(screen.getByText("Go Home")).toBeInTheDocument();
  });

  test("shows error details in dev mode", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // import.meta.env.DEV is true in vitest, so error details are shown
    expect(screen.getByText("Test render error")).toBeInTheDocument();
  });
});
