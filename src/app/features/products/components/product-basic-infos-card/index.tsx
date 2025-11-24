import { Badge } from '@/app/components/ui/badge';
import type { IProduct } from '../../types/models';
import { Separator } from '@/app/components/ui/separator';

type TProductBasicInfosCard = Pick<
  IProduct,
  'name' | 'category' | 'sku' | 'description'
>;
export function ProductBasicInfosCard({
  name,
  category,
  sku,
  description
}: TProductBasicInfosCard) {
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold">{name}</h2>
        <div className="flex gap-2 mb-2">
          <Badge variant="outline">SKU: {sku || 'N/A'}</Badge>
          <Badge variant="secondary">{category.name}</Badge>
        </div>
        <Separator />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
    </div>
  );
}
