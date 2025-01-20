import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2, Edit, CheckCircle } from "lucide-react";

const Debtors = () => {
  const queryClient = useQueryClient();
  
  const { data: debtors, isLoading } = useQuery({
    queryKey: ['debtors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(name, phone, email),
          payment_method:payment_methods(name),
          installments(
            id,
            amount,
            due_date,
            status,
            installment_number
          )
        `)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleDeleteSale = async (saleId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['debtors'] });
      toast.success('Venda excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      toast.error('Erro ao excluir venda');
    }
  };

  const handleMarkInstallmentAsPaid = async (installmentId: string) => {
    try {
      const { error } = await supabase
        .rpc('mark_installment_paid', {
          p_installment_id: installmentId
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['debtors'] });
      toast.success('Parcela marcada como paga');
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error);
      toast.error('Erro ao marcar parcela como paga');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Devedores</h1>
      
      <Card className="p-6">
        {isLoading ? (
          <div className="text-center text-gray-500 py-6">
            Carregando devedores...
          </div>
        ) : !debtors?.length ? (
          <div className="text-center text-gray-500 py-6">
            Não há devedores no momento
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data da Venda</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debtors.map((debtor) => (
                <TableRow key={debtor.id}>
                  <TableCell>{debtor.customer?.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p>{debtor.customer?.phone}</p>
                      <p className="text-sm text-gray-500">{debtor.customer?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(debtor.created_at)}</TableCell>
                  <TableCell>{debtor.payment_method?.name}</TableCell>
                  <TableCell>
                    {debtor.installments?.length > 0 ? (
                      <div className="space-y-1">
                        {debtor.installments
                          .sort((a: any, b: any) => a.installment_number - b.installment_number)
                          .map((inst: any) => (
                          <div key={inst.id} className="text-sm flex items-center justify-between gap-2">
                            <div>
                              {inst.installment_number}ª - {formatCurrency(inst.amount)} - {formatDate(inst.due_date)}
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                inst.status === 'paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {inst.status === 'paid' ? 'Pago' : 'Pendente'}
                              </span>
                            </div>
                            {inst.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkInstallmentAsPaid(inst.id)}
                                title="Marcar como paga"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      'Pagamento único'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(debtor.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSale(debtor.id)}
                        title="Excluir venda"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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

export default Debtors;