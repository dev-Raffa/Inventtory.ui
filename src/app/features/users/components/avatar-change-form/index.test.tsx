import {
  render,
  screen,
  fireEvent,
  renderHook,
  act
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll
} from 'vitest';
import { AvatarChangeForm } from './index';
import { useAvatarChange } from './hook';

const { mockedUseUpdateAvatarMutation, mockedUseUser } = vi.hoisted(() => {
  return {
    mockedUseUpdateAvatarMutation: vi.fn(),
    mockedUseUser: vi.fn()
  };
});

vi.mock('../../hooks/use-query', () => ({
  useUpdateAvatarMutation: mockedUseUpdateAvatarMutation
}));

vi.mock('../../hooks/use-user', () => ({
  useUser: mockedUseUser
}));

vi.mock('@/app/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),

  AvatarImage: ({ src, className }: any) => (
    <img src={src} className={className} alt="Avatar do usuário" />
  ),

  AvatarFallback: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/app/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max }: any) => (
    <input
      data-testid="mock-slider"
      type="range"
      min={min}
      max={max}
      step={0.1}
      value={value?.[0] ?? 1}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
    />
  )
}));

vi.mock('react-easy-crop', () => ({
  default: ({ onCropChange, onCropComplete }: any) => (
    <div data-testid="mock-cropper">
      <button
        type="button"
        onClick={() => {
          onCropChange({ x: 10, y: 10 });
          onCropComplete(
            { x: 10, y: 10, width: 100, height: 100 },
            { x: 10, y: 10, width: 200, height: 200 }
          );
        }}
      >
        Simulate Crop
      </button>
    </div>
  )
}));

describe('AvatarChangeForm Feature', () => {
  const user = userEvent.setup();
  const mockMutate = vi.fn();
  const defaultUser = {
    id: 'user-123',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  beforeAll(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseUser.mockReturnValue({
      user: defaultUser
    });

    mockedUseUpdateAvatarMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      status: 'idle',
      data: undefined,
      error: null,
      reset: vi.fn()
    } as any);
  });

  const selectFile = async () => {
    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload image file/i);

    await user.upload(input, file);

    return file;
  };

  describe('Integration Tests (Component UI)', () => {
    describe('Estado Inicial', () => {
      it('deve renderizar o avatar atual do usuário', () => {
        render(<AvatarChangeForm />);

        const avatarImage = screen.getByRole('img');

        expect(avatarImage).toHaveAttribute('src', defaultUser.avatarUrl);
      });

      it('deve mostrar o botão de upload inicialmente', () => {
        render(<AvatarChangeForm />);

        expect(screen.getByText(/carregar foto/i)).toBeInTheDocument();
      });
    });

    describe('Fluxo de Seleção e Edição', () => {
      it('deve exibir o Cropper após selecionar um arquivo', async () => {
        render(<AvatarChangeForm />);

        await selectFile();

        expect(await screen.findByTestId('mock-cropper')).toBeInTheDocument();
        expect(screen.getByText(/arraste para ajustar/i)).toBeInTheDocument();
      });

      it('deve permitir cancelar a edição e limpar o arquivo', async () => {
        render(<AvatarChangeForm />);

        await selectFile();

        const secondaryBtn = await screen.findByText(/trocar imagem/i);

        await user.click(secondaryBtn);

        expect(screen.queryByTestId('mock-cropper')).not.toBeInTheDocument();
        expect(screen.getByText(/carregar foto/i)).toBeInTheDocument();
      });

      it('deve atualizar o zoom via slider', async () => {
        render(<AvatarChangeForm />);

        await selectFile();

        const slider = await screen.findByTestId('mock-slider');

        fireEvent.change(slider, { target: { value: '2' } });

        expect(slider).toHaveValue('2');
      });
    });

    describe('Fluxo de Salvamento (Submit)', () => {
      it('deve disparar a mutation com os dados corretos ao salvar', async () => {
        render(<AvatarChangeForm />);

        await selectFile();

        const cropBtn = await screen.findByText('Simulate Crop');

        await user.click(cropBtn);

        const saveBtn = screen.getByRole('button', { name: /salvar avatar/i });

        await user.click(saveBtn);

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: defaultUser.id,
            imageSrc: 'blob:mock-preview-url',
            pixelCrop: expect.objectContaining({
              width: 200,
              height: 200
            })
          }),
          expect.objectContaining({
            onSuccess: expect.any(Function)
          })
        );
      });

      it('não deve salvar se as coordenadas de corte não estiverem definidas', async () => {
        vi.mocked(await import('react-easy-crop')).default = (() => (
          <div data-testid="dumb-cropper" />
        )) as any;

        render(<AvatarChangeForm />);

        await selectFile();
        await screen.findByTestId('dumb-cropper');

        const saveBtn = screen.getByRole('button', { name: /salvar avatar/i });

        await user.click(saveBtn);

        expect(mockMutate).not.toHaveBeenCalled();
      });
    });

    describe('Estado de Loading', () => {
      it('deve desabilitar botões enquanto a mutation está pendente', () => {
        mockedUseUpdateAvatarMutation.mockReturnValue({
          mutate: mockMutate,
          isPending: true,
          status: 'pending'
        } as any);

        render(<AvatarChangeForm />);

        const cancelBtn = screen.getByText(/cancelar/i).closest('button');

        expect(cancelBtn).toBeDisabled();
      });
    });
  });

  describe('Unit Tests (Hook Logic)', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useAvatarChange({}));

      expect(result.current.files).toEqual([]);
      expect(result.current.zoom).toBe(1);
    });

    describe('Guard Clauses (handleSave)', () => {
      it('não deve salvar se não houver usuário logado', () => {
        mockedUseUser.mockReturnValue({ user: null });

        const { result } = renderHook(() => useAvatarChange({}));

        act(() => {
          result.current.handleSave();
        });

        expect(mockMutate).not.toHaveBeenCalled();
      });

      it('não deve salvar se não houver arquivo selecionado', () => {
        const { result } = renderHook(() => useAvatarChange({}));

        act(() => {
          result.current.handleSave();
        });

        expect(mockMutate).not.toHaveBeenCalled();
      });
    });

    describe('Callback onSuccess', () => {
      it('deve resetar o estado e chamar onSuccess externo após sucesso da mutation', () => {
        const onExternalSuccess = vi.fn();
        const { result } = renderHook(() =>
          useAvatarChange({ onSuccess: onExternalSuccess })
        );

        act(() => {
          result.current.setFiles([{ src: 'blob:file' } as any]);
          result.current.onCropComplete({} as any, {
            width: 100,
            height: 100,
            x: 0,
            y: 0
          });
        });

        act(() => {
          result.current.handleSave();
        });

        expect(mockMutate).toHaveBeenCalled();

        const mutationOptions = mockMutate.mock.calls[0][1];

        act(() => {
          mutationOptions.onSuccess();
        });

        expect(result.current.files).toEqual([]);
        expect(result.current.zoom).toBe(1);
        expect(onExternalSuccess).toHaveBeenCalled();
      });
    });
  });
});
