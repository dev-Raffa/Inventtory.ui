import { Button } from '@/app/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/app/components/ui/tooltip';
import { CircleX, SquareCheck, TriangleAlert } from 'lucide-react';

type TProductTableColumnStock = {
  totalStock: number;
  minimumStock?: number; // [CORREÇÃO]: minimun -> minimum
};

export function ProductTableColumnStock({
  totalStock,
  minimumStock
}: TProductTableColumnStock) {
  const getStockStatus = () => {
    if (
      totalStock === 0 ||
      (minimumStock !== undefined && totalStock <= minimumStock)
    ) {
      return {
        icon: <CircleX className="text-red-700 h-10" />,
        label: 'Crítico'
      };
    }

    if (minimumStock !== undefined && totalStock <= minimumStock * 1.25) {
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
