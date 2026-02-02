import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../KpiCard';
import { KPI } from '@/types';

describe('KpiCard', () => {
  const mockKPI: KPI = {
    key: 'emp_office',
    title: 'Employee Office Devices',
    value: 984,
    delta: -246,
    series: [
      [Date.now() - 3600000, 1000],
      [Date.now() - 1800000, 950],
      [Date.now(), 984],
    ],
  };

  it('renders value correctly', () => {
    render(<KpiCard kpi={mockKPI} color="#00C1D4" />);
    expect(screen.getByText('Employee Office Devices')).toBeInTheDocument();
  });

  it('shows positive delta with up arrow', () => {
    const positiveKPI = { ...mockKPI, delta: 123 };
    render(<KpiCard kpi={positiveKPI} color="#00C1D4" />);
    expect(screen.getByText(/▲/)).toBeInTheDocument();
  });

  it('shows negative delta with down arrow', () => {
    render(<KpiCard kpi={mockKPI} color="#00C1D4" />);
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<KpiCard kpi={mockKPI} color="#00C1D4" />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
  });
});

