import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMonths, format } from "date-fns";
import { Card } from "@/components/ui/card";

interface InstallmentsFormProps {
  totalAmount: number;
  onInstallmentsChange: (installments: { amount: number; dueDate: string }[]) => void;
}

export function InstallmentsForm({ totalAmount, onInstallmentsChange }: InstallmentsFormProps) {
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);

  useEffect(() => {
    if (totalAmount > 0) {
      const installmentAmount = Number((totalAmount / numberOfInstallments).toFixed(2));
      const remainder = Number((totalAmount - (installmentAmount * numberOfInstallments)).toFixed(2));
      
      const installments = Array.from({ length: numberOfInstallments }, (_, index) => {
        const amount = index === 0 ? installmentAmount + remainder : installmentAmount;
        return {
          amount,
          dueDate: format(addMonths(new Date(), index + 1), 'yyyy-MM-dd')
        };
      });
      
      onInstallmentsChange(installments);
    }
  }, [numberOfInstallments, totalAmount, onInstallmentsChange]);

  return (
    <Card className="p-4 space-y-4">
      <div>
        <Label>Número de Parcelas</Label>
        <Input
          type="number"
          min="1"
          max="12"
          value={numberOfInstallments}
          onChange={(e) => setNumberOfInstallments(Math.max(1, Number(e.target.value)))}
        />
      </div>
      
      {totalAmount > 0 && numberOfInstallments > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Previsão das Parcelas:</p>
          {Array.from({ length: numberOfInstallments }).map((_, index) => {
            const installmentAmount = Number((totalAmount / numberOfInstallments).toFixed(2));
            const remainder = Number((totalAmount - (installmentAmount * numberOfInstallments)).toFixed(2));
            const amount = index === 0 ? installmentAmount + remainder : installmentAmount;
            
            return (
              <div key={index} className="flex justify-between text-sm">
                <span>Parcela {index + 1}</span>
                <span>{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(amount)}</span>
                <span>{format(addMonths(new Date(), index + 1), 'dd/MM/yyyy')}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}