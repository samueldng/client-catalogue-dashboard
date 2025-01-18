import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Sales = () => {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [total, setTotal] = useState(0);

  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(name),
          payment_method:payment_methods(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price');

      if (error) throw error;
      return data;
    },
  });

  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name');

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (productData) {
      setProducts(productData);
    }
    if (customerData) {
      setCustomers(customerData);
    }
  }, [productData, customerData]);

  useEffect(() => {
    if (selectedProduct && quantity > 0) {
      setTotal(price * quantity);
    }
  }, [selectedProduct, quantity, price]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Aqui você pode enviar os dados para o Supabase para salvar a nova venda
    console.log("Venda registrada!");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center text-gray-500 py-6">
            Carregando vendas...
          </div>
        ) : !sales?.length ? (
          <div className="text-center text-gray-500 py-6">
            Nenhuma venda registrada
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{formatDate(sale.created_at)}</TableCell>
                  <TableCell>{sale.customer?.name}</TableCell>
                  <TableCell>{sale.payment_method?.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.total_amount)}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      sale.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal para Nova Venda */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Nova Venda</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    name="customer"
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
                    name="payment_method"
                    required
                  >
                    <option>Selecione a forma de pagamento</option>
                    <option>Dinheiro</option>
                    <option>Cartão de Crédito</option>
                    <option>PIX</option>
                    <option>A Prazo</option>
                  </select>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Produtos</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        name="product"
                        required
                        onChange={(e) => {
                          const selected = products.find(
                            (product) => product.id === e.target.value
                          );
                          setSelectedProduct(selected);
                          setPrice(selected?.price || 0);
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
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Preço"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={price}
                        readOnly
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Total"
                        disabled
                        className="block w-full rounded-md border-gray-300 bg-gray-50"
                        value={total}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium">Total: {formatCurrency(total)}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)} // Fecha o modal sem salvar
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
