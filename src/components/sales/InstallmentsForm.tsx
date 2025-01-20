import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMonths, format } from "date-fns";

interface InstallmentsFormProps {
  totalAmount: number;
  onInstallmentsChange: (installments: { amount: number; dueDate: string }[]) => void;
}

export function InstallmentsForm({ totalAmount, onInstallmentsChange }: InstallmentsFormProps) {
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);

  const handleInstallmentsChange = (value: number) => {
    const installmentAmount = totalAmount / value;
    const installments = Array.from({ length: value }, (_, index) => ({
      amount: installmentAmount,
      dueDate: format(addMonths(new Date(), index + 1), 'yyyy-MM-dd')
    }));
    
    setNumberOfInstallments(value);
    onInstallmentsChange(installments);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Número de Parcelas</Label>
        <Input
          type="number"
          min="1"
          max="12"
          value={numberOfInstallments}
          onChange={(e) => handleInstallmentsChange(Number(e.target.value))}
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
            <span>{format(addMonths(new Date(), index + 1), 'dd/MM/yyyy')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}