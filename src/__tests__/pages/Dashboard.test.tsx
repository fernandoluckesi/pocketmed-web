import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../../pages/Dashboard/index';

// Mock motion/react to render plain elements
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <button {...props}>{children}</button>,
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockIcon = (_props: Record<string, unknown>) => <span data-testid="icon" />;
  return {
    LayoutDashboard: MockIcon,
    Users: MockIcon,
    Stethoscope: MockIcon,
    Calendar: MockIcon,
    Activity: MockIcon,
    UserCircle: MockIcon,
    CreditCard: MockIcon,
    LogOut: MockIcon,
    Search: MockIcon,
    Bell: MockIcon,
    Settings: MockIcon,
    TrendingUp: MockIcon,
    ChevronRight: MockIcon,
    Filter: MockIcon,
    Plus: MockIcon,
    Clock: MockIcon,
  };
});

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  it('renders dashboard layout with sidebar', () => {
    renderDashboard();

    // Sidebar should be present with navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('PocketMed')).toBeInTheDocument();
  });

  it('shows FAB button', () => {
    renderDashboard();

    // The FAB is a button element rendered by motion.button
    const buttons = screen.getAllByRole('button');
    // At least one button should exist (the FAB)
    expect(buttons.length).toBeGreaterThan(0);
  });
});
