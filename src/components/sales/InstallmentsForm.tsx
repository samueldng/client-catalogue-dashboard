import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      dueDate: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
    </div>
  );
}