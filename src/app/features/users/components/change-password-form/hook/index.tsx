import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormData } from '../schema';
import { useUpdatePasswordMutation } from '../../../hooks/use-query';

type UseChangePasswordProps = {
  onSuccess?: () => void;
};

export function useChangePassword({ onSuccess }: UseChangePasswordProps) {
  const { mutateAsync, isPending } = useUpdatePasswordMutation();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const handleSubmit = async (data: ChangePasswordFormData) => {
    await mutateAsync(data.password, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      }
    }).catch(() => {
      return;
    });
  };

  return {
    form,
    isSubmitting: isPending,
    handleSubmit
  };
}
