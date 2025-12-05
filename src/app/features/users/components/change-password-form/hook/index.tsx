import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { changePasswordSchema, type ChangePasswordFormData } from '../schema';
import { UserService } from '../../../services';

type UseChangePasswordProps = {
  onSuccess?: () => void;
};

export function useChangePassword({ onSuccess }: UseChangePasswordProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const handleSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsSubmitting(true);
      await UserService.updatePassword(data.password);

      toast.success('Senha atualizada com sucesso!');
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro inesperado ao atualizar a senha.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit
  };
}
