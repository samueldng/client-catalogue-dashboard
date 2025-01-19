import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SaleProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface SaleProductListProps {
  products: SaleProduct[];
  onRemoveProduct: (productId: string) => void;
}

export function SaleProductList({ products, onRemoveProduct }: SaleProductListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Produtos Selecionados</h3>
      <div className="space-y-2">
        {products.map((product) => (
          <div 
            key={product.productId}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium">{product.productName}</p>
              <p className="text-sm text-gray-500">
                {product.quantity}x {formatCurrency(product.price)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-medium">{formatCurrency(product.total)}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveProduct(product.productId)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}