import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Donut } from '../Donut';
import { Compliance } from '@/types';

describe('Donut', () => {
  const mockCompliance: Compliance = {
    compliant: 0.54,
    exceptions: 0.20,
    non_compliant: 0.16,
  };

  it('renders compliance percentages correctly', () => {
    render(<Donut data={mockCompliance} />);
    
    expect(screen.getByText('Device Compliance')).toBeInTheDocument();
    expect(screen.getByText('54%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('16%')).toBeInTheDocument();
  });

  it('renders all segment labels', () => {
    render(<Donut data={mockCompliance} />);
    
    expect(screen.getByText('Compliant')).toBeInTheDocument();
    expect(screen.getByText('Exceptions')).toBeInTheDocument();
    expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
  });

  it('has screen reader accessible summary', () => {
    render(<Donut data={mockCompliance} />);
    
    const srText = document.querySelector('.sr-only');
    expect(srText).toBeInTheDocument();
    expect(srText?.textContent).toContain('Device compliance breakdown');
  });
});

