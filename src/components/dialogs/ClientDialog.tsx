import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { ClientForm } from "@/components/forms/ClientForm"; // Importando o formulário de cliente

interface ClientDialogProps {
  initialData?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  trigger?: React.ReactNode;
}

export function ClientDialog({ initialData, trigger }: ClientDialogProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentClient, setCurrentClient] = useState(initialData); // Armazena o cliente atual que está sendo editado

  // Função para abrir o formulário de edição com dados de um cliente
  const openEditForm = (client: ClientDialogProps['initialData']) => {
    setCurrentClient(client);
    setShowForm(true);
  };

  // Função para abrir o formulário de criação (sem dados)
  const openCreateForm = () => {
    setCurrentClient(undefined); // Limpa os dados do cliente
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Botão para abrir o modal */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={openCreateForm} // Ao clicar em "Novo Cliente", abre o formulário de criação
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Campo de busca */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Telefone</th>
                <th className="text-left py-3 px-4">Endereço</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((_, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Cliente {index + 1}</td>
                  <td className="py-3 px-4">cliente{index + 1}@example.com</td>
                  <td className="py-3 px-4">+55 11 91234-5678</td>
                  <td className="py-3 px-4">Rua Exemplo, 123</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-start"> {/* Alinhando à esquerda */}
                      {/* Ação de Editar */}
                      <button
                        className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md"
                        onClick={() => openEditForm({ 
                          id: `${index + 1}`, 
                          name: `Cliente ${index + 1}`,
                          email: `cliente${index + 1}@example.com`, 
                          phone: `+55 11 91234-5678`, 
                          address: `Rua Exemplo, 123`
                        })} // Abre o formulário de edição com dados do cliente
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {/* Ação de Excluir */}
                      <button className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulário de Novo Cliente */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{currentClient ? "Editar" : "Novo"} Cliente</h2>
            <ClientForm
              initialData={currentClient} // Passando os dados do cliente para o formulário
              onSuccess={() => setShowForm(false)} // Fecha o formulário após sucesso
            />
          </div>
        </div>
      )}
    </div>
  );
}
