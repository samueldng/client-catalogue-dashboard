import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMonths, format } from "date-fns";

interface InstallmentsFormProps {
  totalAmount: number;
  onInstallmentsChange: (installments: { amount: number; dueDate: string }[]) => void;
}

export function InstallmentsForm({ totalAmount, onInstallmentsChange }: InstallmentsFormProps) {
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);

  useEffect(() => {
    const installmentAmount = totalAmount / numberOfInstallments;
    const installments = Array.from({ length: numberOfInstallments }, (_, index) => ({
      amount: Number(installmentAmount.toFixed(2)),
      dueDate: format(addMonths(new Date(), index + 1), 'yyyy-MM-dd')
    }));
    
    onInstallmentsChange(installments);
  }, [numberOfInstallments, totalAmount, onInstallmentsChange]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Número de Parcelas</Label>
        <Input
          type="number"
          min="1"
          max="12"
          value={numberOfInstallments}
          onChange={(e) => setNumberOfInstallments(Number(e.target.value))}
        />
      </div>
      
      <div className="text-sm text-gray-500">
        {numberOfInstallments > 1 && (
          <p>
            {numberOfInstallments}x de{" "}
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalAmount / numberOfInstallments)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {numberOfInstallments > 1 && Array.from({ length: numberOfInstallments }).map((_, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>Parcela {index + 1}</span>
            <span>{new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalAmount / numberOfInstallments)}</span>
            <span>{format(addMonths(new Date(), index + 1), 'dd/MM/yyyy')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}