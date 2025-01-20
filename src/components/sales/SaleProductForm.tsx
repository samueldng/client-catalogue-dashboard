import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";

interface SaleProductFormProps {
  products: Product[];
  onAddProduct: (productId: string, quantity: number) => void;
  stockError?: string;
}

export function SaleProductForm({ products, onAddProduct, stockError }: SaleProductFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleAddProduct = () => {
    if (selectedProductId && quantity > 0) {
      onAddProduct(selectedProductId, quantity);
      setSelectedProductId("");
      setQuantity(1);
    }
  };

  const subtotal = selectedProduct ? selectedProduct.price * quantity : 0;

  return (
    <Card className="p-4 space-y-4">
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
                  {product.name} - {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(product.price)}
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
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            placeholder="Quantidade"
          />
        </div>

        <div className="col-span-3">
          <Button 
            onClick={handleAddProduct}
            disabled={!selectedProductId || quantity < 1}
            className="w-full"
          >
            Adicionar
          </Button>
        </div>
      </div>
      
      {selectedProduct && (
        <div className="text-sm text-gray-600">
          Subtotal: {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(subtotal)}
        </div>
      )}
      
      {stockError && (
        <p className="text-red-500 text-sm">{stockError}</p>
      )}
    </Card>
  );
}