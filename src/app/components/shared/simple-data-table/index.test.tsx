import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { SimpleDataTable } from './index';

interface TestData {
  id: string;
  name: string;
  role: string;
}

const mockData: TestData[] = [
  { id: '1', name: 'Ana Silva', role: 'Admin' },
  { id: '2', name: 'João Santos', role: 'User' }
];

const mockColumns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Nome Completo'
  },
  {
    accessorKey: 'role',
    header: 'Função'
  }
];

describe('SimpleDataTable Component', () => {
  describe('Rendering Data', () => {
    it('should render headers and rows correctly when data is provided', () => {
      render(<SimpleDataTable data={mockData} columns={mockColumns} />);

      expect(
        screen.getByRole('columnheader', { name: 'Nome Completo' })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('columnheader', { name: 'Função' })
      ).toBeInTheDocument();

      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('João Santos')).toBeInTheDocument();
    });
  });

  describe('Empty States (Branch Coverage)', () => {
    it('should render the default empty message when data is empty and no custom message is provided', () => {
      render(<SimpleDataTable data={[]} columns={mockColumns} />);

      const cell = screen.getByRole('cell');

      expect(cell).toHaveTextContent('Nenhum registro disponível.');
      expect(cell).toHaveClass('text-muted-foreground');
      expect(cell).toHaveAttribute('colspan', '2');
    });

    it('should render the custom empty message when provided', () => {
      const customMessage = 'Não há itens para exibir neste momento.';

      render(
        <SimpleDataTable
          data={[]}
          columns={mockColumns}
          emptyMessage={customMessage}
        />
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(
        screen.queryByText('Nenhum registro disponível.')
      ).not.toBeInTheDocument();
    });
  });
});
