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
  const PRICE_PER_KILO = 4.41; // 1kg = 2.2lb * $2.00

  const formatInput = (value: string) => {
    const numeric = value.replace(/[^\d]/g, '');

    if (numeric.length === 0) return '';

    if (numeric.length <= 2) {
      return '0.' + numeric.padStart(2, '0');
    }

    const intPart = numeric.slice(0, numeric.length - 2).slice(-3); // máximo 3 enteros
    const decimalPart = numeric.slice(-2);

    return `${intPart}.${decimalPart}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setWeight(formatted);
  };

  const handleCheckboxChange = () => {
    setIsKg(!isKg);
    setPrice(null); // reset precio al cambiar unidad
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
            placeholder="Ej: 2.5"
            type="text"
            inputMode="numeric"
            value={weight}
            onChange={handleChange}
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
            Precio aproximado: <span className="font-bold">${price.toFixed(2)}</span>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
