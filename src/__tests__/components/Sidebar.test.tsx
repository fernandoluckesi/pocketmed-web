import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../../components/Sidebar';

// Mock motion/react to render plain divs
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => React.createElement('div', props, children),
    button: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => React.createElement('button', props, children),
  },
}));

// Mock lucide-react - use importOriginal to get all exports and override with mock icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const MockIcon = (_props: Record<string, unknown>) => React.createElement('span', { 'data-testid': 'icon' });
  const mocked: Record<string, unknown> = {};
  for (const key of Object.keys(actual)) {
    mocked[key] = MockIcon;
  }
  return mocked;
});

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test Doctor', type: 'doctor', role: 'doctor' },
    token: 'mock-token',
    logout: vi.fn(),
  }),
}));

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
