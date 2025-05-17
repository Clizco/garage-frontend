import { useState } from 'react';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';

export default function Calculator() {
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [unit, setUnit] = useState<'lb' | 'kg'>('lb');

  const PRICE_PER_POUND = 3.50;
  const PRICE_PER_KILO = 7.70;

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value.length > 5) value = value.slice(0, 5);

    if (value.length <= 2) {
      setWeight('0.' + value.padStart(2, '0'));
    } else {
      const intPart = value.slice(0, value.length - 2).replace(/^0+/, '') || '0';
      const decimalPart = value.slice(value.length - 2);
      setWeight(`${intPart}.${decimalPart}`);
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnit(e.target.value as 'lb' | 'kg');
    setPrice(null);
  };

  const calculatePrice = () => {
    const weightValue = parseFloat(weight);
    if (!isNaN(weightValue) && weightValue > 0) {
      const estimated = weightValue * (unit === 'kg' ? PRICE_PER_KILO : PRICE_PER_POUND);
      setPrice(estimated);
    } else {
      setPrice(null);
    }
  };

  return (
    <ComponentCard title="Calculadora de Envío Miami → Panamá">
      <div className="space-y-4">
        <div>
          <Label htmlFor="weight" className="mb-1 block">
            Peso
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="weight"
              placeholder="Ingrese el peso"
              type="text"
              inputMode="numeric"
              value={weight}
              onChange={handleWeightChange}
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm text-gray-800 dark:text-white">
                <input
                  type="radio"
                  name="unit"
                  value="lb"
                  checked={unit === 'lb'}
                  onChange={handleUnitChange}
                  className="accent-blue-600"
                />
                lb
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-800 dark:text-white">
                <input
                  type="radio"
                  name="unit"
                  value="kg"
                  checked={unit === 'kg'}
                  onChange={handleUnitChange}
                  className="accent-blue-600"
                />
                kg
              </label>
            </div>
          </div>
        </div>

        <Button size="sm" variant="primary" onClick={calculatePrice}>
          Calcular Precio Estimado
        </Button>

        {price !== null && (
          <div className="text-sm text-gray-800 dark:text-white mt-2">
            Precio aproximado:{' '}
            <span className="font-bold">${price.toFixed(2)}</span>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
