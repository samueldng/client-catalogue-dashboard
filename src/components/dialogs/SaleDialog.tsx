import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Plus } from "lucide-react";
  import { useState, useEffect } from "react";
  import { supabase } from "@/integrations/supabase/client";
  import { useQuery } from "@tanstack/react-query";
  
  interface SaleDialogProps {
    initialData?: {
      id: string;
      customer_id: string;
      payment_method: string;
      status: string;
      total_amount: number;
      created_at: string;
    };
    trigger?: React.ReactNode;
  }
  
  export function SaleDialog({ initialData, trigger }: SaleDialogProps) {
    const [open, setOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
  
    // Fetch customers and products
    const { data: customerData, isLoading: loadingCustomers } = useQuery({
      queryKey: ['customers'],
      queryFn: async () => {
        const { data, error } = await supabase.from('customers').select('id, name');
        if (error) throw error;
        return data;
      },
    });
  
    const { data: productData, isLoading: loadingProducts } = useQuery({
      queryKey: ['products'],
      queryFn: async () => {
        const { data, error } = await supabase.from('products').select('id, name, price');
        if (error) throw error;
        return data;
      },
    });
  
    useEffect(() => {
      if (customerData) setCustomers(customerData);
      if (productData) setProducts(productData);
    }, [customerData, productData]);
  
    const handleAddProduct = (productId: string, quantity: number) => {
      const product = products.find(p => p.id === productId);
      if (product && quantity > 0) {
        setSelectedProducts((prev) => [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity,
            total: product.price * quantity,
          }
        ]);
        setTotalAmount((prev) => prev + product.price * quantity);
      }
    };
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      
      // Process sale data
      const saleData = {
        customer_id: selectedCustomer,
        payment_method: selectedPaymentMethod,
        total_amount: totalAmount,
        status: 'pending', // You can update the status logic
        created_at: new Date().toISOString(),
      };
  
      // Insert sale into the database
      const { error } = await supabase.from('sales').insert([saleData]);
  
      if (error) {
        console.error('Error creating sale:', error);
      } else {
        setOpen(false); // Close the dialog on success
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
  
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{initialData ? "Editar" : "Nova"} Venda</DialogTitle>
          </DialogHeader>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                required
              >
                <option>Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                required
              >
                <option>Selecione a forma de pagamento</option>
                <option value="cash">Dinheiro</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="pix">PIX</option>
                <option value="installments">A Prazo</option>
              </select>
            </div>
  
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Produtos</h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    onChange={(e) => {
                      const productId = e.target.value;
                      const quantity = 1; // Default quantity for simplicity
                      handleAddProduct(productId, quantity);
                    }}
                  >
                    <option>Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Quantidade"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    onChange={(e) => handleAddProduct(selectedCustomer, Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Preço"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled
                    value={totalAmount}
                  />
                </div>
              </div>
            </div>
  
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium">Total: R$ {totalAmount}</p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Finalizar Venda
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  