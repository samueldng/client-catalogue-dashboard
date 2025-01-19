import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/product";

interface SaleProductFormProps {
  products: Product[];
  onAddProduct: (productId: string, quantity: number) => void;
  stockError?: string;
}

export function SaleProductForm({ products, onAddProduct, stockError }: SaleProductFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddProduct = () => {
    if (selectedProductId) {
      onAddProduct(selectedProductId, quantity);
      setSelectedProductId("");
      setQuantity(1);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Adicionar Produto</h3>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-3">
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Quantidade"
          />
        </div>

        <div className="col-span-3">
          <Button 
            onClick={handleAddProduct}
            disabled={!selectedProductId}
            className="w-full"
          >
            Adicionar
          </Button>
        </div>
      </div>
      
      {stockError && (
        <p className="text-red-500 text-sm">{stockError}</p>
      )}
    </div>
  );
}