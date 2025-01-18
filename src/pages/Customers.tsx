import { useState } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientForm } from "@/components/forms/ClientForm"; // Importando o formulário de cliente

const Customers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false); // Estado para controlar a visibilidade do formulário
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
  const openForm = () => {
    setIsFormOpen(true);
  };

  // Função para fechar o formulário
  const closeForm = () => {
    setIsFormOpen(false);
  };

  // Função para ser chamada quando o formulário for enviado com sucesso
  const handleFormSuccess = () => {
    queryClient.invalidateQueries(['customers']); // Invalida a query para recarregar os clientes
    closeForm(); // Fecha o formulário
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={openForm}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Exibe o formulário de cliente quando o estado isFormOpen é true */}
      {isFormOpen && <ClientForm onSuccess={handleFormSuccess} />}

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center text-gray-500 py-6">
            Carregando clientes...
          </div>
        ) : !customers?.length ? (
          <div className="text-center text-gray-500 py-6">
            Nenhum cliente cadastrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
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
