import type { WizardStep } from '@/app/components/shared/wizard';
import { OrganizationStep } from './organization-infos';
import { UserStep } from './user-infos';

export const steps: WizardStep[] = [
  {
    id: 'organization',
    label: 'Dados da Empresa',
    component: <OrganizationStep />
  },
  {
    id: 'user',
    label: 'Dados de Acesso',
    component: <UserStep />
  }
];
