import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";

const apiUrl = import.meta.env.VITE_API_URL || "";
const createPartUrl = `${apiUrl}/parts/parts/create`;

export default function CreatePart() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    part_name: "",
    part_number: "",
    quantity: "",
    price: ""
  });

  const formatWithThousands = (value: string): string => {
    const numeric = value.replace(/[^\d]/g, "");
    if (!numeric) return "";
    const intPart = numeric.slice(0, -2).replace(/^0+/, "") || "0";
    const decimalPart = numeric.slice(-2).padStart(2, "0");
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$${withCommas}.${decimalPart}`;
  };

  const handleChange = (field: string, value: string) => {
    if (field === "price") {
      const numeric = value.replace(/[^\d]/g, "").slice(0, 11);
      const padded = numeric.padStart(3, "0");
      setForm({ ...form, [field]: formatWithThousands(padded) });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const quantityValue = parseInt(form.quantity || "0", 10);
      const cleanForm = {
        ...form,
        price: form.price.replace(/[$,]/g, ""),
        quantity: form.quantity || "0",
        available: quantityValue > 0 ? "1" : "0"
      };

      await axios.post(createPartUrl, cleanForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("¡Parte registrada correctamente!");
      navigate("/parts");
    } catch (error) {
      console.error("Error al registrar parte:", error);
      alert("Hubo un error al registrar la parte.");
    }
  };

  return (
    <ComponentCard title="Registrar Parte Mecánica">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Volver
          </button>
        </div>

        <div>
          <Label>PRODUCTO</Label>
          <Input
            value={form.part_name}
            onChange={(e) => handleChange("part_name", e.target.value)}
            placeholder="Nombre de la parte"
          />
        </div>

        <div>
          <Label>CÓDIGO</Label>
          <Input
            value={form.part_number}
            onChange={(e) => handleChange("part_number", e.target.value)}
            placeholder="Código único"
          />
        </div>

        <div>
          <Label>CANTIDAD</Label>
          <Input
            value={form.quantity}
            onChange={(e) => handleChange("quantity", e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Ej: 100"
            inputMode="numeric"
          />
        </div>

        <div>
          <Label>PRECIO</Label>
          <Input
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="$"
            inputMode="numeric"
          />
        </div>

        <Button variant="primary" size="md" className="w-full">
          Registrar Parte
        </Button>
      </form>
    </ComponentCard>
  );
}
