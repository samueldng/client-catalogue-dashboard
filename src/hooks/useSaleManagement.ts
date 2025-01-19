import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SaleProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface InstallmentData {
  amount: number;
  dueDate: string;
}

export function useSaleManagement() {
  const [selectedProducts, setSelectedProducts] = useState<SaleProduct[]>([]);
  const [stockError, setStockError] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [installments, setInstallments] = useState<InstallmentData[]>([]);

  const handleAddProduct = (product: any, quantity: number) => {
    if (product.stock_quantity < quantity) {
      setStockError("Quantidade insuficiente em estoque");
      return;
    }

    setStockError("");
    const existingProduct = selectedProducts.find(p => p.productId === product.id);

    if (existingProduct) {
      const updatedProducts = selectedProducts.map(p =>
        p.productId === product.id
          ? { ...p, quantity: p.quantity + quantity, total: (p.quantity + quantity) * p.price }
          : p
      );
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          total: product.price * quantity
        }
      ]);
    }

    updateTotalAmount();
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(products => products.filter(p => p.productId !== productId));
    updateTotalAmount();
  };

  const updateTotalAmount = () => {
    const total = selectedProducts.reduce((sum, product) => sum + product.total, 0);
    setTotalAmount(total);
  };

  const handleInstallmentsChange = (newInstallments: InstallmentData[]) => {
    setInstallments(newInstallments);
  };

  const createSale = async (customerId: string, paymentMethodId: string) => {
    try {
      // 1. Create the sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: customerId,
          payment_method_id: paymentMethodId,
          total_amount: totalAmount,
          payment_status: paymentMethodId === 'installments' ? 'pending' : 'paid',
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Create sale items
      const saleItems = selectedProducts.map(product => ({
        sale_id: sale.id,
        product_id: product.productId,
        quantity: product.quantity,
        unit_price: product.price,
        total_price: product.total
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // 3. Create installments if applicable
      if (paymentMethodId === 'installments' && installments.length > 0) {
        const installmentRecords = installments.map(inst => ({
          sale_id: sale.id,
          amount: inst.amount,
          due_date: inst.dueDate,
          status: 'pending'
        }));

        const { error: installmentsError } = await supabase
          .from('installments')
          .insert(installmentRecords);

        if (installmentsError) throw installmentsError;
      }

      // 4. Update product stock
      for (const product of selectedProducts) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock_quantity: supabase.rpc('decrement_stock', { 
              p_id: product.productId, 
              qty: product.quantity 
            })
          })
          .eq('id', product.productId);

        if (stockError) throw stockError;
      }

      toast.success('Venda realizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      toast.error('Erro ao realizar a venda');
      return false;
    }
  };

  return {
    selectedProducts,
    stockError,
    totalAmount,
    handleAddProduct,
    handleRemoveProduct,
    handleInstallmentsChange,
    createSale
  };
}