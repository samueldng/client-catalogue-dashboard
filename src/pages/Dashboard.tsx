import { Card } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const Dashboard = () => {
  const { data: totalProfit } = useQuery({
    queryKey: ["totalProfit"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_total_profit");
      if (error) throw error;
      return data || 0;
    },
  });

  const { data: totalReceivables } = useQuery({
    queryKey: ["totalReceivables"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_total_receivables");
      if (error) throw error;
      return data || 0;
    },
  });

  const { data: totalSales } = useQuery({
    queryKey: ["totalSales"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalDebtors } = useQuery({
    queryKey: ["totalDebtors"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .eq("payment_status", "pending");
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalProducts } = useQuery({
    queryKey: ["totalProducts"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Nova query para buscar os produtos mais vendidos
  const { data: topProducts } = useQuery({
    queryKey: ["topProducts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_items")
        .select(
          `
          quantity,
          product:products(
            name
          )
        `
        )
        .order("quantity", { ascending: false })
        .limit(5);

      if (error) throw error;

      return data.map((item) => ({
        name: item.product?.name,
        quantidade: item.quantity,
      }));
    },
  });

  // Nova query para buscar as vendas recentes
  const { data: recentSales } = useQuery({
    queryKey: ["recentSales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
          id,
          total_amount,
          payment_status,
          created_at,
          customer:customers(
            name
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Nell Web</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lucro Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalProfit || 0)}
              </p>
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
              <p className="text-2xl font-bold">
                {formatCurrency(totalReceivables || 0)}
              </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Produtos Mais Vendidos */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Produtos Mais Vendidos</h2>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                bar1: {
                  theme: {
                    light: "#0ea5e9",
                    dark: "#0ea5e9",
                  },
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="quantidade" fill="var(--color-bar1)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        {/* Tabela de Vendas Recentes */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Vendas Recentes</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{formatDate(sale.created_at)}</TableCell>
                  <TableCell>{sale.customer?.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.total_amount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        sale.payment_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {sale.payment_status === "paid" ? "Pago" : "Pendente"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;