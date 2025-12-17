import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Filters } from '../Filters';
import { Filters as FiltersType } from '@/types';

describe('Filters', () => {
  const mockFilters: FiltersType = {
    group: [],
    country: [],
    deviceType: [],
    compliance: [],
  };

  const mockOnChange = vi.fn();

  it('renders filter button', () => {
    render(<Filters value={mockFilters} onChange={mockOnChange} />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('shows active filter count when filters applied', () => {
    const activeFilters: FiltersType = {
      group: ['team1'],
      country: ['US', 'UK'],
      deviceType: [],
      compliance: [],
    };

    render(<Filters value={activeFilters} onChange={mockOnChange} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('opens filter panel on click', () => {
    render(<Filters value={mockFilters} onChange={mockOnChange} />);
    
    const button = screen.getByText('Filters');
    fireEvent.click(button);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onChange when clearing filters', () => {
    const activeFilters: FiltersType = {
      group: ['team1'],
      country: ['US'],
      deviceType: [],
      compliance: [],
    };

    render(<Filters value={activeFilters} onChange={mockOnChange} />);
    
    const button = screen.getByText('Filters');
    fireEvent.click(button);
    
    const clearButton = screen.getByText('Clear all');
    fireEvent.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith({
      group: [],
      country: [],
      deviceType: [],
      compliance: [],
    });
  });
});

