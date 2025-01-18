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

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ClientFormData>({
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
          .from("clients")
          .update(data)
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("clients").insert(data);
        if (error) throw error;
        toast.success("Cliente criado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar cliente");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {initialData ? "Atualizar" : "Criar"} Cliente
        </Button>
      </form>
    </Form>
  );
}
