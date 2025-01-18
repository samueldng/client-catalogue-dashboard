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
  import { toast } from "sonner"; // Adicionando toast para feedback de erros ou sucessos.
  
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
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [stockError, setStockError] = useState<string>("");
  
    // Fetch customers and products
    const { data: customerData, isLoading: loadingCustomers } = useQuery({
      queryKey: ["customers"],
      queryFn: async () => {
        const { data, error } = await supabase.from("customers").select("id, name");
        if (error) throw error;
        return data;
      },
    });
  
    const { data: productData, isLoading: loadingProducts } = useQuery({
      queryKey: ["products"],
      queryFn: async () => {
        const { data, error } = await supabase.from("products").select("id, name, price, stock_quantity");
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
  
      if (product) {
        if (quantity > product.stock_quantity) {
          setStockError("Quantidade insuficiente em estoque.");
          return;
        } else {
          setStockError(""); // Clear the stock error
          // Check if product is already added
          const existingProductIndex = selectedProducts.findIndex(p => p.productId === productId);
          if (existingProductIndex >= 0) {
            // Update existing product's quantity and total
            const updatedProducts = [...selectedProducts];
            updatedProducts[existingProductIndex].quantity += quantity;
            updatedProducts[existingProductIndex].total =
              updatedProducts[existingProductIndex].price * updatedProducts[existingProductIndex].quantity;
            setSelectedProducts(updatedProducts);
          } else {
            // Add new product to selected products list
            setSelectedProducts(prev => [
              ...prev,
              {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity,
                total: product.price * quantity,
              },
            ]);
          }
          setTotalAmount(prev => prev + product.price * quantity);
        }
      }
    };
  
    const handleRemoveProduct = (productId: string) => {
      const productToRemove = selectedProducts.find(p => p.productId === productId);
      if (productToRemove) {
        setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
        setTotalAmount(prev => prev - productToRemove.total);
      }
    };
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
  
      if (!selectedCustomer || !selectedPaymentMethod || selectedProducts.length === 0) {
        toast.error("Preencha todos os campos obrigatórios.");
        return;
      }
  
      // Process sale data
      const saleData = {
        customer_id: selectedCustomer,
        payment_method: selectedPaymentMethod,
        total_amount: totalAmount,
        status: "pending", // You can update the status logic
        created_at: new Date().toISOString(),
      };
  
      // Insert sale into the database
      const { error } = await supabase.from("sales").insert([saleData]);
  
      if (error) {
        console.error("Error creating sale:", error);
      } else {
        toast.success("Venda registrada com sucesso!");
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
                    onChange={(e) => handleAddProduct(e.target.value, quantity)}
                    required
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
                    value={quantity}
                    min="1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="Quantidade"
                    required
                  />
                </div>
  
                <div className="col-span-2">
                  <input
                    type="number"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={totalAmount}
                    disabled
                    placeholder="Preço Total"
                  />
                </div>
              </div>
  
              {stockError && <p className="text-red-500">{stockError}</p>}
  
              {/* List of selected products with quantity and total */}
              <div className="mt-4">
                <h4 className="text-lg font-medium">Produtos Selecionados</h4>
                <ul className="space-y-2">
                  {selectedProducts.map((product) => (
                    <li key={product.productId} className="flex justify-between">
                      <span>{product.productName} - {product.quantity}x</span>
                      <span>R$ {product.total.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.productId)}
                        className="text-red-500"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
  
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-lg font-medium">Total: R$ {totalAmount.toFixed(2)}</p>
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
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  