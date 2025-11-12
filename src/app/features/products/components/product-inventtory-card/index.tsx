import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card';

export function ProductInventtoryCard({
  minimumStock = 0,
  stock = 0
}: {
  minimumStock?: number;
  stock?: number;
}) {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg">Estoque:</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Qtd Mínima</p>
          <p className="font-medium">{minimumStock} un.</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Qntd Atual</p>
          <p className="font-bold text-lg">{stock}</p>
        </div>
      </CardContent>
    </Card>
  );
}
