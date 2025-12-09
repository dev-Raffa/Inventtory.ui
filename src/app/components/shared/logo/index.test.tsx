import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from './';

describe('Logo Component', () => {
  it('should render the logo image with correct accessibility attributes', () => {
    render(<Logo />);

    const img = screen.getByRole('img', { name: /Inventto Logo/i });

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
  });

  it('should render the brand name text by default', () => {
    render(<Logo />);

    expect(screen.getByText('Inventto')).toBeVisible();
  });

  it('should hide the brand name text when showText is false', () => {
    render(<Logo showText={false} />);

    expect(screen.queryByText('Inventto')).not.toBeInTheDocument();
  });

  it('should accept and apply custom className', () => {
    render(<Logo className="bg-red-500" />);

    const container = screen.getByRole('figure');

    expect(container).toHaveClass('bg-red-500');
  });
});
