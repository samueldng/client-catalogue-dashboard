import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';

interface ClientFormProps {
  initialData?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  onSuccess?: () => void;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Validação com Zod
const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
});

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ClientFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from("customers")
          .update(data)
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("customers").insert(data);
        if (error) throw error;
        toast.success("Cliente criado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["customers"] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar cliente");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nome */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-gray-700">Nome</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Digite o nome do cliente"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600 mt-1" />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-gray-700">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Digite o email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600 mt-1" />
            </FormItem>
          )}
        />

        {/* Telefone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-gray-700">Telefone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Digite o telefone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600 mt-1" />
            </FormItem>
          )}
        />

        {/* Endereço */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-gray-700">Endereço</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Digite o endereço"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600 mt-1" />
            </FormItem>
          )}
        />

        {/* Botão de Submissão */}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4 py-3"
        >
          {initialData ? "Atualizar" : "Criar"} Cliente
        </Button>
      </form>
    </Form>
  );
}
