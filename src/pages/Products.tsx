import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Products = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="text-center text-gray-500 py-6">
          Implementar listagem de produtos
        </div>
      </Card>
    </div>
  );
};

export default Products;