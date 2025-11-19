import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { ProductTableColumnActions } from './column-action';
import userEvent from '@testing-library/user-event';

vi.mock('react-router', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router')>();
  return {
    ...mod,
    Link: ({ to, children, className }: any) => (
      <a
        href={to}
        className={className}
        data-testid={`link-${children[1].toLowerCase().trim().replace(' ', '-')}`}
      >
        {children}
      </a>
    )
  };
});

const renderComponent = (productId: string) => {
  return render(
    <MemoryRouter>
      <ProductTableColumnActions productId={productId} />
    </MemoryRouter>
  );
};

describe('ProductTableColumnActions', () => {
  const TEST_PRODUCT_ID = 'prod-xyz-123';

  it('should render the menu`s trigger button', () => {
    renderComponent(TEST_PRODUCT_ID);

    expect(
      screen.getByRole('button', { name: /toggle menu/i })
    ).toBeInTheDocument();
  });

  it('should open the menu and display all 5 action items', async () => {
    renderComponent(TEST_PRODUCT_ID);

    const triggerButton = screen.getByRole('button', { name: /toggle menu/i });
    const user = userEvent.setup();

    act(() => {
      user.click(triggerButton);
    });

    const menuItems = await screen.findAllByRole('menuitem', undefined);

    expect(menuItems).toHaveLength(4);
    expect(screen.getByText('Detalhes')).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Ver Histórico')).toBeInTheDocument();
    expect(screen.getByText('Registrar Movimentação')).toBeInTheDocument();
  });

  it('should generate the "Details" and "Edit" links with the correct product ID', async () => {
    const user = userEvent.setup();
    renderComponent(TEST_PRODUCT_ID);

    const triggerButton = screen.getByRole('button', { name: /toggle menu/i });

    act(() => {
      user.click(triggerButton);
    });

    const linkDetalhes = await screen.findByTestId('link-detalhes');
    expect(linkDetalhes).toHaveAttribute(
      'href',
      `/products/${TEST_PRODUCT_ID}`
    );

    const linkEditar = await screen.findByTestId('link-editar');
    expect(linkEditar).toHaveAttribute(
      'href',
      `/products/${TEST_PRODUCT_ID}/edit`
    );
  });
});
