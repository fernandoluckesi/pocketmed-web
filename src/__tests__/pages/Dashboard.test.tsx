import React from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "../../pages/Dashboard/index";
import { ActiveConsultationProvider } from "../../contexts/ActiveConsultationContext";
import { DialogProvider } from "../../components/ui/Dialog";

// Mock motion/react to render plain elements. A Proxy covers every tag the
// tree happens to use (div, section, button, ...) — listing them by hand
// meant a new `motion.section` somewhere silently rendered as undefined.
vi.mock("motion/react", () => {
  const ANIMATION_PROPS = new Set([
    "initial",
    "animate",
    "exit",
    "variants",
    "transition",
    "whileHover",
    "whileTap",
    "whileInView",
    "layout",
    "layoutId",
    "viewport",
  ]);

  const motion = new Proxy(
    {},
    {
      get:
        (_target, tag: string) =>
        ({
          children,
          ...props
        }: {
          children?: React.ReactNode;
          [key: string]: unknown;
        }) => {
          // Strip motion-only props so React doesn't warn about unknown
          // DOM attributes.
          const domProps = Object.fromEntries(
            Object.entries(props).filter(([key]) => !ANIMATION_PROPS.has(key)),
          );
          return React.createElement(tag, domProps, children);
        },
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});

// Mock lucide-react - use importOriginal to get all exports and override with mock icons
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const MockIcon = (_props: Record<string, unknown>) =>
    React.createElement("span", { "data-testid": "icon" });
  const mocked: Record<string, unknown> = {};
  for (const key of Object.keys(actual)) {
    mocked[key] = MockIcon;
  }
  return mocked;
});

// Mock AuthContext
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Test Doctor", type: "doctor", role: "doctor" },
    token: "mock-token",
    logout: vi.fn(),
  }),
}));

// The dashboard and its layout fetch appointments, certificates, and
// notifications on mount. Stub both API clients so this stays a render test
// with no network involved.
vi.mock("../../services/api", () => ({
  api: vi.fn().mockResolvedValue([]),
  ApiError: class ApiError extends Error {},
}));

vi.mock("../../config/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    defaults: { headers: { common: {} } },
  },
}));

// Verification banner state is irrelevant here and would otherwise trigger
// its own request.
vi.mock("../../hooks/useDoctorVerification", () => ({
  useDoctorVerification: () => ({
    status: "APPROVED",
    isApproved: true,
    loading: false,
    applicable: true,
  }),
}));

/** MainLayout reads the active-consultation and dialog contexts, so the page
 * can only render inside both providers — same as in the real app shell.
 * Awaited inside `act` so the mount-time fetches settle before asserting. */
async function renderDashboard() {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ActiveConsultationProvider>
          <DialogProvider>
            <Dashboard />
          </DialogProvider>
        </ActiveConsultationProvider>
      </MemoryRouter>,
    );
  });
}

describe("Dashboard", () => {
  it("renders dashboard layout with sidebar", async () => {
    await renderDashboard();

    // Sidebar navigation (labels are in pt-BR, matching `navItems`).
    expect(screen.getByText("Painel")).toBeInTheDocument();
    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    // The brand is the logo image, identified by its alt text.
    expect(screen.getByAltText("Hispora")).toBeInTheDocument();
  });

  it("shows FAB button", async () => {
    await renderDashboard();

    // The FAB is a button element rendered by motion.button
    const buttons = screen.getAllByRole("button");
    // At least one button should exist (the FAB)
    expect(buttons.length).toBeGreaterThan(0);
  });
});
