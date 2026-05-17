import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../../components/Sidebar';

// Mock motion/react to render plain divs
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Mock lucide-react icons as simple spans
vi.mock('lucide-react', () => {
  const MockIcon = ({ size, ...props }: any) => <span data-testid="icon" {...props} />;
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

function renderWithRouter(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('renders navigation links', () => {
    renderWithRouter();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Doctors')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Clinical Management')).toBeInTheDocument();
    expect(screen.getByText('My Account')).toBeInTheDocument();
    expect(screen.getByText('Plans')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('highlights active link based on current route', () => {
    renderWithRouter('/patients');

    const patientsLink = screen.getByText('Patients').closest('a');
    const dashboardLink = screen.getByText('Dashboard').closest('a');

    // Active link should have the active classes
    expect(patientsLink).toHaveClass('bg-white', 'text-primary');
    // Inactive link should not have active classes
    expect(dashboardLink).not.toHaveClass('bg-white');
    expect(dashboardLink).toHaveClass('text-slate-600');
  });
});
