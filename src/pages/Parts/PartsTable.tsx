import { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface MechanicalPart {
  id: number;
  part_name: string;
  part_number: string;
  quantity: number;
  price: number;
  available: boolean;
  created_at: string;
  updated_at: string;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

export default function PartsTable() {
  const [parts, setParts] = useState<MechanicalPart[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchParts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/parts/parts/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const filtered = parts.filter((p) =>
    p.part_name.toLowerCase().includes(search.toLowerCase()) ||
    p.part_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por código o producto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="ml-auto">
          <Button variant="primary" onClick={() => navigate("/parts/create")}>
            Crear parte
          </Button>
        </div>
      </div>

      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {["Código", "Producto", "Precio", "Cantidad"].map((h) => (
                <th key={h} className="px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer"
                onClick={() => navigate(`/parts/edit/${p.id}`)}
              >
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{p.part_number}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{p.part_name}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatPrice(p.price)}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {p.available ? p.quantity : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden p-4 space-y-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/parts/edit/${p.id}`)}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer text-gray-800 dark:text-gray-200"
          >
            <p><strong>Código:</strong> {p.part_number}</p>
            <p><strong>Producto:</strong> {p.part_name}</p>
            <p><strong>Precio:</strong> {formatPrice(p.price)}</p>
            <p><strong>Cantidad:</strong> {p.available ? p.quantity : 0}</p>
            
          </div>
        ))}
      </div>
    </div>
  );
}
