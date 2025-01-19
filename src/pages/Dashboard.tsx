import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const Dashboard = () => {
  // Query for top selling products
  const { data: topProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["top-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_items")
        .select(`
          product_id,
          quantity,
          products (
            name
          )
        `)
        .limit(5);

      if (error) throw error;

      // Aggregate quantities by product
      const aggregated = data.reduce((acc: any, item) => {
        const productName = item.products?.name || "Unknown";
        acc[productName] = (acc[productName] || 0) + item.quantity;
        return acc;
      }, {});

      // Convert to chart format
      return Object.entries(aggregated).map(([name, quantity]) => ({
        name,
        quantity,
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Query for recent sales
  const { data: recentSales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["recent-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          customers (
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Query for total sales amount
  const { data: totalSales } = useQuery({
    queryKey: ["total-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_total_receivables");
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalSales || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center h-full">
                Carregando...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSales ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales?.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.customers?.name}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(sale.total_amount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(sale.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;