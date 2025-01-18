import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash } from "lucide-react";
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
import { ProductDialog } from "@/components/dialogs/ProductDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";

const Products = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(""); // Estado para armazenar a busca

  // Query para buscar produtos no banco de dados
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(name)
        `)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir produto");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filtra os produtos com base no valor de busca
  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) || // Filtro por nome
      product.category?.name.toLowerCase().includes(search.toLowerCase()) // Filtro por categoria
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <ProductDialog />
      </div>

      {/* Campo de busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar produto..."
          className="w-full px-4 py-2 border rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Atualiza o estado de busca
        />
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center text-gray-500 py-6">
            Carregando produtos...
          </div>
        ) : !filteredProducts?.length ? (
          <div className="text-center text-gray-500 py-6">
            Nenhum produto encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.cost_price)}</TableCell>
                  <TableCell className="text-right">{product.stock_quantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProductDialog
                        initialData={product}
                        trigger={
                          <Button size="icon" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

export default Products;
