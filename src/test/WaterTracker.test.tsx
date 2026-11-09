import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WaterTracker from '@/components/WaterTracker';

describe('WaterTracker', () => {
  it('renders title and default goal', () => {
    render(<WaterTracker />);
    expect(screen.getByText('Трекер води')).toBeInTheDocument();
    expect(screen.getAllByText(/2500 мл/).length).toBeGreaterThan(0);
  });
});