import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/ProductForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

interface ProductDialogProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    cost_price: number;
    stock_quantity: number;
    category_id: string | null;
  };
  trigger?: React.ReactNode;
}

export function ProductDialog({ initialData, trigger }: ProductDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar" : "Novo"} Produto
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          initialData={initialData}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}