import { useState } from 'react';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';
import Checkbox from '../../components/form/input/Checkbox';

export default function Calculator() {
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [isKg, setIsKg] = useState(false); // false = lb, true = kg

  const PRICE_PER_POUND = 2.0;
  const PRICE_PER_KILO = 4.41;

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');

    // Limitar a máximo 5 dígitos (3 enteros y 2 decimales)
    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    if (value.length <= 2) {
      setWeight('0.' + value.padStart(2, '0'));
    } else {
      const intPart = value.slice(0, value.length - 2).replace(/^0+/, '') || '0';
      const decimalPart = value.slice(value.length - 2);
      setWeight(`${intPart}.${decimalPart}`);
    }
  };

  const handleCheckboxChange = () => {
    setIsKg(!isKg);
    setPrice(null); // Reset al cambiar unidad
  };

  const calculatePrice = () => {
    const weightValue = parseFloat(weight);

    if (!isNaN(weightValue) && weightValue > 0) {
      const estimated = weightValue * (isKg ? PRICE_PER_KILO : PRICE_PER_POUND);
      setPrice(estimated);
    } else {
      setPrice(null);
    }
  };

  return (
    <ComponentCard title="Calculadora de Envío Miami → Panamá">
      <div className="space-y-4">
        <div>
          <Label htmlFor="weight">Peso ({isKg ? 'kg' : 'lb'})</Label>
          <Input
            id="weight"
            placeholder="Ej: 2.50"
            type="text"
            inputMode="numeric"
            value={weight}
            onChange={handleWeightChange}
            className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        <Checkbox
          label="Cambiar a kg"
          checked={isKg}
          onChange={handleCheckboxChange}
        />

        <Button size="sm" variant="primary" onClick={calculatePrice}>
          Calcular Precio Estimado
        </Button>

        {price !== null && (
          <div className="text-sm text-gray-700 dark:text-white mt-2">
            Precio aproximado:{' '}
            <span className="font-bold">${price.toFixed(2)}</span>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
