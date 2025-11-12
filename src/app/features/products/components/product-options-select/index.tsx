import { Button } from '@/app/components/ui/button';
import type { IProductAttribute } from '../../types';
import { Separator } from '@/app/components/ui/separator';

type TProductOptionsSelect = {
  attributes: IProductAttribute[];
  selectedOptions: Record<string, string>;
  handleSelectOption: (attributeName: string, value: string) => void;
};
export function ProductOptionsSelect({
  attributes,
  selectedOptions,
  handleSelectOption
}: TProductOptionsSelect) {
  return (
    <div className="space-y-3">
      {attributes.map((attr) => (
        <div key={attr.name}>
          <p className="font-medium">{attr.name}</p>
          <div className="flex flex-wrap gap-2">
            {attr.values.split(',').map((value) => {
              const val = value.trim();
              const isActive = selectedOptions[attr.name] === val;
              return (
                <Button
                  type="button"
                  key={val}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSelectOption(attr.name, val)}
                >
                  {val}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      <Separator />
    </div>
  );
}
