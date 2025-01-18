import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/ClientForm"; // Importando o formulário de cliente

interface ClientDialogProps {
  initialData?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  trigger?: React.ReactNode; // Permite passar um botão personalizado para abrir o modal
}

export function ClientDialog({ initialData, trigger }: ClientDialogProps) {
  const [open, setOpen] = useState(false);

  // Função para alternar o estado de abertura do modal
  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Usando DialogTrigger com o trigger passado como prop ou um botão padrão */}
      <DialogTrigger asChild>
        {trigger || (
          <Button onClick={handleDialogOpen}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar" : "Novo"} Cliente</DialogTitle>
        </DialogHeader>
        <ClientForm
          initialData={initialData}
          onSuccess={handleDialogClose} // Fecha o diálogo após o sucesso
        />
      </DialogContent>
    </Dialog>
  );
}
