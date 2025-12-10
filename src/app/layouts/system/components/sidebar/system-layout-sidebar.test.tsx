import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { SystemLayoutSidebar } from './system-layout-sidebar';

vi.mock('@/app/layouts/system/components/sidebar/navlinks-siderbar', () => ({
  navLinks: [
    {
      href: '/dashboard',
      label: 'Dashboard Test',
      icon: <span data-testid="icon-dashboard" />
    },
    {
      href: '/products',
      label: 'Produtos Test',
      icon: <span data-testid="icon-products" />
    }
  ]
}));

describe('SystemLayoutSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (initialRoute: string = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <SystemLayoutSidebar />
      </MemoryRouter>
    );
  };

  it('should render navigation links correctly based on the mock', () => {
    renderComponent();

    const dashboardLink = screen.getByRole('link', { name: /dashboard test/i });
    const productsLink = screen.getByRole('link', { name: /produtos test/i });

    expect(dashboardLink).toBeInTheDocument();
    expect(productsLink).toBeInTheDocument();
  });

  it('should apply active styles to the current route link', () => {
    renderComponent('/products');

    const activeLink = screen.getByRole('link', { name: /produtos test/i });
    const inactiveLink = screen.getByRole('link', { name: /dashboard test/i });

    expect(activeLink).toHaveClass('bg-primary');
    expect(activeLink).toHaveClass('text-primary-foreground');
    expect(inactiveLink).not.toHaveClass('bg-primary');
    expect(inactiveLink).toHaveClass('text-primary');
  });
});
