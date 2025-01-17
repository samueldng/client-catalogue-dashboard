import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Sales = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="text-center text-gray-500 py-6">
          Implementar listagem de vendas
        </div>
      </Card>
    </div>
  );
};

export default Sales;