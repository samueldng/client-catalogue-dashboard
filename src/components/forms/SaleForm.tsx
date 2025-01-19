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
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [stockError, setStockError] = useState<string>("");

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
    const productInStock = products?.find((product) => product.id === data.product_id);
    
    if (productInStock && productInStock.stock_quantity < data.quantity) {
      setStockError("Quantidade insuficiente no estoque.");
      return;
    }
    setStockError("");

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
          payment_status: "pending",
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
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
              <Select 
                onValueChange={(value) => {
                  const selected = products?.find(
                    (product) => product.id === value
                  );
                  setSelectedProduct(selected);
                  field.onChange(value);
                }}
                defaultValue={field.value}
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
                    onChange={(e) => {
                      const value = Math.max(1, Number(e.target.value));
                      field.onChange(value);
                    }}
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
                    value={selectedProduct?.price || 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    readOnly={!selectedProduct}
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
              variant="outline"
            >
              Cancelar
            </Button>
            <Button type="submit">
              Finalizar Venda
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}