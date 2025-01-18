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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
  };
  onSuccess?: () => void;
}

interface CategoryFormData {
  name: string;
  description: string;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from("categories")
          .update(data)
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Categoria atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("categories").insert(data);
        if (error) throw error;
        toast.success("Categoria criada com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar categoria");
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {initialData ? "Atualizar" : "Criar"} Categoria
        </Button>
      </form>
    </Form>
  );
}