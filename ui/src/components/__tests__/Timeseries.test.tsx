import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeseries } from '../Timeseries';
import { TimeseriesData, TimeRange } from '@/types';

describe('Timeseries', () => {
  const mockSeries: TimeseriesData[] = [
    {
      name: 'security_incidents',
      points: [
        [Date.now() - 7200000, 15],
        [Date.now() - 3600000, 20],
        [Date.now(), 18],
      ],
    },
    {
      name: 'office_access',
      points: [
        [Date.now() - 7200000, 4200],
        [Date.now() - 3600000, 4500],
        [Date.now(), 4300],
      ],
    },
  ];

  const mockRange: TimeRange = {
    earliest: '-24h',
    latest: 'now',
  };

  it('renders title', () => {
    render(<Timeseries series={mockSeries} range={mockRange} />);
    expect(screen.getByText('Remote Workers and Security Incidents')).toBeInTheDocument();
  });

  it('draws all series', () => {
    const { container } = render(<Timeseries series={mockSeries} range={mockRange} />);
    
    // Check for Recharts LineChart
    const lines = container.querySelectorAll('.recharts-line');
    expect(lines.length).toBe(2);
  });

  it('has screen reader accessible summary', () => {
    render(<Timeseries series={mockSeries} range={mockRange} />);
    
    const srText = document.querySelector('.sr-only');
    expect(srText).toBeInTheDocument();
    expect(srText?.textContent).toContain('Time series data');
  });
});

