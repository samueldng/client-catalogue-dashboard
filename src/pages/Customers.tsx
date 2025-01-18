import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientForm } from "@/components/forms/ClientForm"; // Importando o formulário de cliente
import { toast } from "sonner";

const Customers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false); // Estado para controlar a visibilidade do formulário
  const [searchQuery, setSearchQuery] = useState(""); // Estado para armazenar o termo de busca
  const [editClientData, setEditClientData] = useState(null); // Estado para armazenar dados do cliente a ser editado
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Função para abrir o formulário
  const openForm = (client?: any) => {
    setEditClientData(client);
    setIsFormOpen(true);
  };

  // Função para fechar o formulário
  const closeForm = () => {
    setIsFormOpen(false);
    setEditClientData(null); // Resetando os dados do cliente
  };

  // Função para ser chamada quando o formulário for enviado com sucesso
  const handleFormSuccess = () => {
    queryClient.invalidateQueries(['customers']); // Invalida a query para recarregar os clientes
    closeForm(); // Fecha o formulário
  };

  // Função para excluir um cliente
  const handleDelete = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      toast.success("Cliente excluído com sucesso!");
      queryClient.invalidateQueries(['customers']);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir cliente");
    }
  };

  // Filtra os clientes com base no nome ou no e-mail
  const filteredCustomers = customers?.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Button
          onClick={() => openForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </Button>
      </div>

      {/* Exibe o formulário de cliente quando o estado isFormOpen é true */}
      {isFormOpen && <ClientForm initialData={editClientData} onSuccess={handleFormSuccess} />}

      {/* Barra de busca */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar clientes..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center text-gray-500 py-6">
            Carregando clientes...
          </div>
        ) : !filteredCustomers?.length ? (
          <div className="text-center text-gray-500 py-6">
            Nenhum cliente encontrado
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => openForm(customer)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default Customers;
