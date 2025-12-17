import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Drawer } from '../Drawer';

describe('Drawer', () => {
  const mockOnClose = vi.fn();

  it('does not render when closed', () => {
    render(
      <Drawer title="Test Drawer" open={false} onClose={mockOnClose}>
        <div>Content</div>
      </Drawer>
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <Drawer title="Test Drawer" open={true} onClose={mockOnClose}>
        <div>Content</div>
      </Drawer>
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    render(
      <Drawer title="Test Drawer" open={true} onClose={mockOnClose}>
        <div>Content</div>
      </Drawer>
    );
    
    const closeButton = screen.getByLabelText('Close drawer');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', () => {
    render(
      <Drawer title="Test Drawer" open={true} onClose={mockOnClose}>
        <div>Content</div>
      </Drawer>
    );
    
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(backdrop).toBeInTheDocument();
    
    fireEvent.click(backdrop!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key pressed', () => {
    render(
      <Drawer title="Test Drawer" open={true} onClose={mockOnClose}>
        <div>Content</div>
      </Drawer>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });
});

