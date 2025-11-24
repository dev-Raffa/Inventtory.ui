type entryReasonOptions = 'Compra' | 'Devolução';
type withdrawalReasonOptions = 'Venda' | 'Troca';

type adjustmentReasonOptions = 'Perda / Avaria' | 'Ajuste de Inventário';

export type reason =
  | entryReasonOptions
  | withdrawalReasonOptions
  | adjustmentReasonOptions;

interface reasonOptions {
  entry: entryReasonOptions[];
  withdrawal: withdrawalReasonOptions[];

  adjustment: adjustmentReasonOptions[];
}

export const ReasonOptions: reasonOptions = {
  entry: ['Compra', 'Devolução'],
  adjustment: ['Ajuste de Inventário', 'Perda / Avaria'],
  withdrawal: ['Troca', 'Venda']
};
