import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../../pages/Dashboard/index';

// Mock motion/react to render plain elements
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
