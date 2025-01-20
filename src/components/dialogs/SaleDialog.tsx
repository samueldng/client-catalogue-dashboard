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
import { toast } from "sonner";

interface SaleDialogProps {
  trigger?: React.ReactNode;
}

export function SaleDialog({ trigger }: SaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [requiresInstallments, setRequiresInstallments] = useState(false);
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);

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

  const { data: paymentMethods } = useQuery({
    queryKey: ["payment_methods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_methods").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handlePaymentMethodChange = (methodId: string) => {
    const method = paymentMethods?.find(m => m.id === methodId);
    setSelectedPaymentMethod(methodId);
    setRequiresInstallments(method?.requires_installments || false);
    if (!method?.requires_installments) {
      setNumberOfInstallments(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || !selectedPaymentMethod || selectedProducts.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (requiresInstallments && numberOfInstallments < 1) {
      toast.error("Número de parcelas inválido");
      return;
    }

    const success = await createSale(selectedCustomer, selectedPaymentMethod, numberOfInstallments);
    if (success) {
      setOpen(false);
      toast.success("Venda realizada com sucesso!");
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
              <Select value={selectedPaymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods?.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
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

            {requiresInstallments && (
              <InstallmentsForm
                totalAmount={totalAmount}
                onInstallmentsChange={(installments) => {
                  setNumberOfInstallments(installments.length);
                  handleInstallmentsChange(installments);
                }}
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
              {requiresInstallments && numberOfInstallments > 1 && (
                <p className="text-sm text-gray-500">
                  {numberOfInstallments}x de {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalAmount / numberOfInstallments)}
                </p>
              )}
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