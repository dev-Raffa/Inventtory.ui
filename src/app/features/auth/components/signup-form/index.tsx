import {
  Wizard,
  WizardContent,
  WizardControl
} from '@/app/components/shared/wizard';
import { steps } from './steps';
import { SignUpFormProvider, useSignUpForm } from './hook';
import { Logo } from '@/app/components/shared/logo';

function SignUpFormContent() {
  const { actions } = useSignUpForm();

  return (
    <form className="bg-white p-4 rounded-lg ">
      <Wizard
        steps={steps}
        urlParamKey="step"
        onBeforeNextStep={actions.handleBeforeNextStep}
        onCancel={actions.handleCancel}
        onFinish={actions.onSubmit}
      >
        <div className="flex w-11/12 justify-center items-center pt-2 pb-6">
          <Logo />
        </div>
        <WizardContent className="border-0 shadow-none p-0" />
        <WizardControl
          labels={{
            finish: 'Criar Conta',
            next: 'Próximo',
            back: 'Voltar',
            cancel: 'Já tenho conta'
          }}
        />
      </Wizard>
    </form>
  );
}

export function SignUpForm() {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-2xl text-green-950 font-bold">Crie sua conta</h1>
        <p className="text-muted-foreground mt-2">
          Comece a gerenciar seu estoque de forma inteligente.
        </p>
      </div>
      <SignUpFormProvider>
        <SignUpFormContent />
      </SignUpFormProvider>
    </div>
  );
}
