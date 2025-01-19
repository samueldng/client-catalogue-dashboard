import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaleProductForm } from "../sales/SaleProductForm";
import { SaleProductList } from "../sales/SaleProductList";
import { InstallmentsForm } from "../sales/InstallmentsForm";
import { useSaleManagement } from "@/hooks/useSaleManagement";

interface SaleDialogProps {
  trigger?: React.ReactNode;
}

export function SaleDialog({ trigger }: SaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const {
    selectedProducts,
    stockError,
    totalAmount,
    handleAddProduct,
    handleRemoveProduct,
    handleInstallmentsChange,
    createSale
  } = useSaleManagement();

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || !selectedPaymentMethod || selectedProducts.length === 0) {
      return;
    }

    const success = await createSale(selectedCustomer, selectedPaymentMethod);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nova Venda</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="installments">A Prazo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <SaleProductForm
              products={products || []}
              onAddProduct={(productId, quantity) => {
                const product = products?.find(p => p.id === productId);
                if (product) {
                  handleAddProduct(product, quantity);
                }
              }}
              stockError={stockError}
            />

            {selectedProducts.length > 0 && (
              <SaleProductList
                products={selectedProducts}
                onRemoveProduct={handleRemoveProduct}
              />
            )}

            {selectedPaymentMethod === 'installments' && (
              <InstallmentsForm
                totalAmount={totalAmount}
                onInstallmentsChange={handleInstallmentsChange}
              />
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-lg font-medium">
                Total: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalAmount)}
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Finalizar Venda
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}