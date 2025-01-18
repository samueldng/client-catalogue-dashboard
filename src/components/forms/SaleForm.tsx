import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SaleFormProps {
  onSuccess?: () => void;
}

interface SaleFormData {
  customer_id: string;
  payment_method: string;
  product_id: string;
  quantity: number;
  price: number;
}

export function SaleForm({ onSuccess }: SaleFormProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stockError, setStockError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (customersData) {
      setCustomers(customersData);
    }
    if (productsData) {
      setProducts(productsData);
    }
  }, [customersData, productsData]);

  const form = useForm<SaleFormData>({
    defaultValues: {
      customer_id: "",
      payment_method: "",
      product_id: "",
      quantity: 1,
      price: 0,
    },
  });

  const onSubmit = async (data: SaleFormData) => {
    // Verificar quantidade em estoque antes de prosseguir
    const productInStock = products.find((product) => product.id === data.product_id);
    
    if (productInStock && productInStock.stock_quantity < data.quantity) {
      setStockError("Quantidade insuficiente no estoque.");
      return;
    } else {
      setStockError("");  // Limpar o erro de estoque se não houver problemas
    }

    try {
      const { error } = await supabase
        .from("sales")
        .insert({
          customer_id: data.customer_id,
          payment_method: data.payment_method,
          product_id: data.product_id,
          quantity: data.quantity,
          price: data.price,
          total_amount: data.price * data.quantity,
          payment_status: "pending", // Assuming new sales are pending
        });

      if (error) throw error;

      toast.success("Venda registrada com sucesso!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar a venda");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Select {...field}>
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de Pagamento</FormLabel>
              <FormControl>
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="A Prazo">A Prazo</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onChange={(e) => {
                    const selected = products.find(
                      (product) => product.id === e.target.value
                    );
                    setSelectedProduct(selected);
                    field.onChange(e);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {stockError && <p className="text-red-500">{stockError}</p>}

        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-medium">
              Total: R$ {form.getValues("price") * form.getValues("quantity")}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => form.reset()}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Finalizar Venda
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
