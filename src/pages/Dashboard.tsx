import { Card } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: totalProfit } = useQuery({
    queryKey: ['totalProfit'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_total_profit');
      if (error) throw error;
      return data || 0;
    },
  });

  const { data: totalReceivables } = useQuery({
    queryKey: ['totalReceivables'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_total_receivables');
      if (error) throw error;
      return data || 0;
    },
  });

  const { data: totalSales } = useQuery({
    queryKey: ['totalSales'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalDebtors } = useQuery({
    queryKey: ['totalDebtors'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalProducts } = useQuery({
    queryKey: ['totalProducts'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nell Web</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lucro Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalProfit || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Vendas</p>
              <p className="text-2xl font-bold">{totalSales || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor a Receber</p>
              <p className="text-2xl font-bold">{formatCurrency(totalReceivables || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Produtos</p>
              <p className="text-2xl font-bold">{totalProducts || 0}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;