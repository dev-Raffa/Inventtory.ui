import { createContext, useContext, useState, type ReactNode } from 'react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpFormData } from '../schema';
import { useSignUpMutation } from '../../../hooks/use-query';
import { generateSlug } from '../../../utils';
import type { WizardStep } from '@/app/components/shared/wizard';
import { formatDocument, normalizeDocument } from '@/lib/utils';

interface SignUpFormContextType {
  form: UseFormReturn<SignUpFormData>;
  isCnpj: boolean;
  actions: {
    handleCompanyNameChange: (value: string) => void;
    handleDocumentChange: (value: string) => void;
    handleBeforeNextStep: (currentStep: WizardStep) => Promise<boolean>;
    onSubmit: () => Promise<void>;
    handleCancel: () => void;
  };
}

const SignUpFormContext = createContext<SignUpFormContextType | null>(null);

export function SignUpFormProvider({ children }: { children: ReactNode }) {
  const { mutateAsync } = useSignUpMutation();
  const [isCnpj, setIsCnpj] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      document: '',
      corporateName: '',
      slug: '',
      fullName: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    }
  });

  const handleCompanyNameChange = (value: string) => {
    form.setValue('companyName', value, { shouldValidate: true });

    if (!form.getFieldState('slug').isDirty) {
      form.setValue('slug', generateSlug(value));
    }
  };

  const handleDocumentChange = (value: string) => {
    form.setValue('document', formatDocument(value));

    const cleanDoc = normalizeDocument(value || '');

    if (cleanDoc.length > 11 && !isCnpj) setIsCnpj(true);
    if (cleanDoc.length <= 11 && isCnpj) setIsCnpj(false);
  };

  const handleBeforeNextStep = async (currentStep: WizardStep) => {
    if (currentStep.id === 'organization') {
      return await form.trigger([
        'companyName',
        'document',
        'slug',
        ...(isCnpj ? (['corporateName'] as const) : [])
      ]);
    }

    if (currentStep.id === 'user') {
      return await form.trigger([
        'fullName',
        'email',
        'password',
        'passwordConfirmation'
      ]);
    }

    return true;
  };

  const handleSubmit = async (data: SignUpFormData) => {
    await mutateAsync(data)
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch(() => {
        return;
      });
  };

  const handleCancel = () => {
    navigate('/auth/login');
  };

  const value = {
    form,
    isCnpj,
    actions: {
      handleCompanyNameChange,
      handleDocumentChange,
      handleBeforeNextStep,
      onSubmit: form.handleSubmit(handleSubmit),
      handleCancel
    }
  };

  return (
    <SignUpFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </SignUpFormContext.Provider>
  );
}

export function useSignUpForm() {
  const context = useContext(SignUpFormContext);

  if (!context) {
    throw new Error(
      'useSignUpForm deve ser usado dentro de um SignUpFormProvider'
    );
  }

  return context;
}
