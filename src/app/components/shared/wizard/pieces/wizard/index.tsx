import { WizardProvider } from '../../hooks';
import type { WizardRootProps } from '../../types';

export function Wizard(props: WizardRootProps) {
  return <WizardProvider {...props} />;
}
