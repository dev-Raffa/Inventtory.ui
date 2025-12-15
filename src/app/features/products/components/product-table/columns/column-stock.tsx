import { Button } from '@/app/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/app/components/ui/tooltip';
import { CircleX, SquareCheck, TriangleAlert } from 'lucide-react';
import { getProductStockStatus } from '../../../utils';

type TProductTableColumnStock = {
  totalStock: number;
  minimumStock?: number;
};

export function ProductTableColumnStock({
  totalStock,
  minimumStock
}: TProductTableColumnStock) {
  const getStockStatus = () => {
    const stockStatus = getProductStockStatus(totalStock, minimumStock);

    if (stockStatus === 'critical') {
      return {
        icon: <CircleX className="text-red-700 h-10" />,
        label: 'Crítico'
      };
    }

    if (stockStatus === 'warning') {
      return {
        icon: <TriangleAlert className="text-orange-400 h-10" />,
        label: 'Atenção'
      };
    }

    return {
      icon: <SquareCheck className="text-green-600 h-10" />,
      label: 'Saudável'
    };
  };

  const { icon, label } = getStockStatus();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-transparent">
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            Estoque Atual: {totalStock}
          </p>
          {minimumStock !== undefined && (
            <p className="text-xs text-muted-foreground">
              Estoque Mínimo: {minimumStock}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
