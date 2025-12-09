import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlaceholderPage } from './index';
import { Wrench } from 'lucide-react';

describe('PlaceholderPage Component', () => {
  it('should render default content when no props are provided', () => {
    render(<PlaceholderPage />);

    expect(
      screen.getByRole('heading', { name: 'Página em Desenvolvimento' })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Esta funcionalidade ainda está sendo construída pela nossa equipe.'
      )
    ).toBeInTheDocument();

    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('should render custom title and message', () => {
    const customTitle = 'Manutenção Programada';
    const customMessage = 'Voltamos em breve.';

    render(<PlaceholderPage title={customTitle} message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: customTitle })
    ).toBeInTheDocument();
  });

  it('should render a custom icon', () => {
    render(<PlaceholderPage icon={Wrench} />);

    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
