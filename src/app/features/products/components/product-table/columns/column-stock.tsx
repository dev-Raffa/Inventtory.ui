import { Button } from '@/app/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/app/components/ui/tooltip';
import { CircleX, SquareCheck, TriangleAlert } from 'lucide-react';

type TProductTableColumnStock = {
  totalStock: number;
  minimunStock?: number;
};

export function ProductTableColumnStock({
  totalStock,
  minimunStock
}: TProductTableColumnStock) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost">
          {totalStock === 0 || (minimunStock && totalStock <= minimunStock) ? (
            <CircleX className="text-red-700 h-10 " />
          ) : minimunStock &&
            totalStock > minimunStock &&
            totalStock <= minimunStock * 1.25 ? (
            <TriangleAlert className="text-orange-400 h-10" />
          ) : (minimunStock && totalStock > minimunStock * 1.25) ||
            (!minimunStock && totalStock > 0) ? (
            <SquareCheck className="text-green-600 h-10" />
          ) : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>estoque atual: {totalStock}</p>
        <p>estoque minimo: {minimunStock}</p>
      </TooltipContent>
    </Tooltip>
  );
}
