import { useState, useEffect } from "react";
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

  useEffect(() => {
    const total = selectedProducts.reduce((sum, product) => sum + product.total, 0);
    setTotalAmount(total);
  }, [selectedProducts]);

  const handleAddProduct = (product: any, quantity: number) => {
    if (product.stock_quantity < quantity) {
      setStockError("Quantidade insuficiente em estoque");
      return;
    }

    setStockError("");
    const existingProduct = selectedProducts.find(p => p.productId === product.id);

    if (existingProduct) {
      const totalQuantity = existingProduct.quantity + quantity;
      if (product.stock_quantity < totalQuantity) {
        setStockError("Quantidade total excede o estoque disponível");
        return;
      }

      const updatedProducts = selectedProducts.map(p =>
        p.productId === product.id
          ? { 
              ...p, 
              quantity: totalQuantity, 
              total: totalQuantity * p.price 
            }
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
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(products => products.filter(p => p.productId !== productId));
  };

  const handleInstallmentsChange = (newInstallments: InstallmentData[]) => {
    setInstallments(newInstallments);
  };

  const createSale = async (customerId: string, paymentMethodId: string, numberOfInstallments: number = 1) => {
    try {
      // 1. Create the sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: customerId,
          payment_method_id: paymentMethodId,
          total_amount: totalAmount,
          payment_status: numberOfInstallments > 1 ? 'pending' : 'paid',
          number_of_installments: numberOfInstallments
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
      if (numberOfInstallments > 1 && installments.length > 0) {
        const installmentRecords = installments.map((inst, index) => ({
          sale_id: sale.id,
          amount: inst.amount,
          due_date: inst.dueDate,
          status: 'pending',
          installment_number: index + 1
        }));

        const { error: installmentsError } = await supabase
          .from('installments')
          .insert(installmentRecords);

        if (installmentsError) throw installmentsError;
      }

      // 4. Update product stock
      for (const product of selectedProducts) {
        const { data: currentStock } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', product.productId)
          .single();

        if (!currentStock) throw new Error('Product not found');

        const newStock = currentStock.stock_quantity - product.quantity;

        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', product.productId);

        if (stockError) throw stockError;
      }

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