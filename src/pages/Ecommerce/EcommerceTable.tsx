// EcommerceTable.tsx
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
  ShoppingCart,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";

const apiUrl = import.meta.env.VITE_API_URL || "";

/** ================== Tipos ================== */

type EstadoVehiculo = "EN VENTA" | "ALQUILER" | "USO INTERNO" | string;

interface Vehicle {
  id: number;
  placa: string;
  ubicacion: string;
  propietario: string;
  municipio: string;
  mes_de_placa: string;
  marca: string;
  modelo: string;
  capacidad: number | string;
  vin?: string;
  ton: number | string;
  year: number;
  uso: string;
  created_at: string;

  // precios/estado
  precio: number | string;        // precio base existente
  precio_venta?: number | string; // precio para "EN VENTA"
  estado?: EstadoVehiculo;

  // media
  vehicle_images?: string[] | string | null;
  seguro_pdf?: string | null;
}

type SortKey = "newest" | "brand" | "year";

type CartItem = {
  id: number;
  name: string;
  cover: string | null;
  quantitySelected: number;
  price: number | null; // EN VENTA usa precio_venta; ALQUILER -> null (demo)
  estado: EstadoVehiculo;
  placa: string;
};

/** ================== Helpers ================== */

const buildFileUrl = (p?: string | null) => {
  if (!p) return "";
  let clean = p.trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("/uploads")) return `${apiUrl}${clean}`;
  if (clean.startsWith("/vehicles")) return `${apiUrl}/uploads${clean}`;
  if (clean.startsWith("/")) return `${apiUrl}${clean}`;
  if (!/\/?uploads\//i.test(clean)) clean = `uploads/${clean.replace(/^\/+/, "")}`;
  return `${apiUrl}/${clean}`;
};

function normalizeImages(images?: string[] | string | null): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean).slice(0, 10);
  const raw = images.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).slice(0, 10);
  } catch {}
  return raw.split(",").map(s => s.trim()).filter(Boolean).slice(0, 10);
}

const toNumberSafe = (v?: number | string | null): number | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const num = Number(String(v).replace(/,/g, "").replace(" ", ""));
  return Number.isFinite(num) ? num : null;
};

const currencyFmt = new Intl.NumberFormat("es-PA", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const fmtPrice = (v?: number | string | null): string => {
  const n = toNumberSafe(v);
  return n === null ? "—" : currencyFmt.format(n);
};

/** ================== Componente ================== */

export default function EcommerceTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [query, setQuery] = useState("");
  const [onlySale, setOnlySale] = useState(false);
  const [onlyRent, setOnlyRent] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  // paginación
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // modal detalle
  const [detalle, setDetalle] = useState<Vehicle | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  // carrito (demo)
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // lock scroll cuando el carrito está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [cartOpen]);

  // fetch
  useEffect(() => {
    (async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const { data } = await axios.get(`${apiUrl}/vehicles/vehicles/all`, { headers });
        const list: Vehicle[] = Array.isArray(data) ? data : [];
        setVehicles(
          list.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );
      } catch (e) {
        console.error("Error al obtener vehículos:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // lista filtrada
  const filtered = useMemo(() => {
    let list = vehicles.filter(
      (v) => (v.estado || "").toUpperCase() === "EN VENTA" || (v.estado || "").toUpperCase() === "ALQUILER"
    );

    if (onlySale) list = list.filter((v) => (v.estado || "").toUpperCase() === "EN VENTA");
    if (onlyRent) list = list.filter((v) => (v.estado || "").toUpperCase() === "ALQUILER");

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          (v.marca || "").toLowerCase().includes(q) ||
          (v.modelo || "").toLowerCase().includes(q) ||
          String(v.year || "").toLowerCase().includes(q) ||
          (v.uso || "").toLowerCase().includes(q) ||
          (v.estado || "").toLowerCase().includes(q)
      );
    }

    switch (sortKey) {
      case "brand":
        list.sort((a, b) => (a.marca || "").localeCompare(b.marca || ""));
        break;
      case "year":
        list.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case "newest":
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return list;
  }, [vehicles, query, onlySale, onlyRent, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [query, onlySale, onlyRent, sortKey]);

  // modal
  const openDetalle = (v: Vehicle) => {
    setDetalle(v);
    setActiveIdx(0);
    document.body.style.overflow = "hidden";
  };
  const closeDetalle = useCallback(() => {
    setDetalle(null);
    setActiveIdx(0);
    document.body.style.overflow = "";
  }, []);

  // carrito demo
  const addToCart = (v: Vehicle) => {
    const images = normalizeImages(v.vehicle_images);
    const cover = images[0] || null;
    const isSale = (v.estado || "").toUpperCase() === "EN VENTA";
    const salePrice = isSale ? toNumberSafe(v.precio_venta) : null;

    const item: CartItem = {
      id: v.id,
      name: `${v.marca || ""} ${v.modelo || ""} ${v.year || ""}`.trim(),
      cover,
      quantitySelected: 1,
      price: salePrice, // null si es alquiler (solo demo)
      estado: (v.estado || "").toUpperCase(),
      placa: v.placa,
    };

    setCart((prev) => {
      const exists = prev.find((x) => x.id === v.id);
      if (exists) {
        return prev.map((x) =>
          x.id === v.id ? { ...x, quantitySelected: x.quantitySelected + 1 } : x
        );
      }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((x) => x.id !== id));
  const setItemQty = (id: number, qty: number) =>
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, quantitySelected: Math.max(1, qty) } : x))
    );
  const decQty = (id: number) =>
    setCart((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, quantitySelected: Math.max(1, x.quantitySelected - 1) } : x
      )
    );
  const incQty = (id: number) =>
    setCart((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, quantitySelected: x.quantitySelected + 1 } : x
      )
    );
  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, it) => acc + it.quantitySelected, 0);
  const totalAmount = cart.reduce((acc, it) => acc + (it.price || 0) * it.quantitySelected, 0);

  function handleCheckout(): void {
    if (cart.length === 0) return;
    alert(
      `Demo de checkout 🚀\n\nVehículos: ${totalItems}\nTotal (solo EN VENTA): ${currencyFmt.format(
        totalAmount
      )}\n\nAquí iría tu formulario de venta/alquiler.`
    );
  }

  // helpers de UI
  const getImages = (v: Vehicle) => normalizeImages(v.vehicle_images);
  const imgUrl = (rel?: string | null) => buildFileUrl(rel || "");

  const priceLabel = (v: Vehicle) => {
    const est = (v.estado || "").toUpperCase();
    if (est === "EN VENTA") return fmtPrice(v.precio_venta);
    if (est === "ALQUILER") return "Consultar precio de alquiler";
    return "—";
  };

  const estadoBadge = (estado?: EstadoVehiculo) => {
    const e = (estado || "").toUpperCase();
    switch (e) {
      case "EN VENTA":
        return <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-600 text-white shadow">En venta</span>;
      case "ALQUILER":
        return <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-600 text-white shadow">Alquiler</span>;
      default:
        return <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-500 text-white shadow">{e || "—"}</span>;
    }
  };

  /** ================== Render ================== */

  return (
    <>
      <PageMeta title="Tienda de Vehículos" description="Explora vehículos en venta y en alquiler." />

      <div className="p-4 md:p-6 space-y-6 transition-colors">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Tienda de Vehículos
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Visualiza vehículos disponibles <strong>EN VENTA</strong> y <strong>ALQUILER</strong>.
          </p>
        </div>

        {/* Filtros */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4 md:p-5 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por marca, modelo, año, uso o estado…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-gray-800 dark:text-gray-100 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer bg-white dark:bg-transparent transition-colors">
                <input
                  type="checkbox"
                  checked={onlySale}
                  onChange={(e) => setOnlySale(e.target.checked)}
                  className="accent-green-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">Solo en venta</span>
              </label>

              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer bg-white dark:bg-transparent transition-colors">
                <input
                  type="checkbox"
                  checked={onlyRent}
                  onChange={(e) => setOnlyRent(e.target.checked)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">Solo alquiler</span>
              </label>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent transition-colors">
                <Select
                  defaultValue={sortKey}
                  onChange={(val) => setSortKey(val as SortKey)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
                  options={[
                    { value: "newest", label: "Más recientes" },
                    { value: "brand", label: "Marca (A-Z)" },
                    { value: "year", label: "Año (Mayor-Menor)" },
                  ]}
                />
              </div>

              {/* Botón carrito */}
              <button
                onClick={() => setCartOpen(true)}
                className="ml-auto md:ml-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-gray-800 dark:text-gray-100" />
                <span className="text-sm text-gray-800 dark:text-gray-100">Carrito</span>
                {!!totalItems && (
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden transition-colors"
                >
                  <div className="aspect-square animate-pulse bg-gray-200 dark:bg-white/10" />
                  <div className="p-3">
                    <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-white/10 mb-2" />
                    <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length ? (
            <>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {currentPageItems.map((v) => {
                  const imgs = getImages(v);
                  const cover = imgs[0] || null;
                  const hasMore = imgs.length > 1;

                  return (
                    <li
                      key={v.id}
                      className="group rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] flex flex-col transition-colors"
                    >
                      {/* Imagen */}
                      <button
                        type="button"
                        onClick={() => openDetalle(v)}
                        className="relative aspect-square w-full overflow-hidden"
                        aria-label={`Ver detalle de ${v.marca} ${v.modelo}`}
                      >
                        {cover ? (
                          <>
                            <img
                              src={imgUrl(cover)}
                              alt={`${v.marca} ${v.modelo}`}
                              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                                hasMore ? "opacity-100 group-hover:opacity-0" : ""
                              }`}
                              loading="lazy"
                              decoding="async"
                            />
                            {hasMore && (
                              <img
                                src={imgUrl(imgs[1])}
                                alt={`${v.marca} ${v.modelo}-alt`}
                                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}

                        {/* Estado */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {estadoBadge(v.estado)}
                        </div>
                      </button>

                      {/* Contenido (solo Marca, Modelo, Año, Uso, Estado + precio regla) */}
                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <div className="min-h-[40px]">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                            {v.marca} {v.modelo} {v.year}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-300">
                            Uso: {v.uso || "—"}
                          </p>
                        </div>

                        <div className="mt-auto">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {priceLabel(v)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Paginación */}
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />{" "}
                  <span className="text-gray-800 dark:text-gray-100">Anterior</span>
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Página {page} de {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-800 dark:text-gray-100">Siguiente</span>{" "}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-gray-600 dark:text-gray-300 py-20">
              No hay resultados (solo se muestran vehículos <strong>EN VENTA</strong> o <strong>ALQUILER</strong>).
            </div>
          )}
        </section>
      </div>

      {/* ============== MODAL DETALLE ============== */}
      {detalle && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDetalle} />
          {/* Contenedor modal */}
          <div className="relative mx-auto w-full max-w-5xl max-h-[92vh] mt-8 md:mt-16 px-4">
            <div className="relative bg-white dark:bg-white/[0.03] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/[0.05] overflow-hidden transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.05] transition-colors">
                <div className="min-w-0">
                  <h2 className="text/base md:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {detalle.marca} {detalle.modelo} {detalle.year}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {estadoBadge(detalle.estado)}
                  </div>
                </div>
                <button
                  onClick={closeDetalle}
                  className="size-9 inline-flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              {/* Cuerpo */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-6 p-4 md:p-6">
                {/* Viewer principal */}
                <div className="md:col-span-3">
                  <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] transition-colors">
                    {getImages(detalle).length ? (
                      <div className="aspect-square w-full flex items-center justify-center">
                        <img
                          key={activeIdx}
                          src={imgUrl(getImages(detalle)[activeIdx])}
                          alt={`vehicle-${detalle.id}-${activeIdx}`}
                          className="h-full w-full object-contain md:object-cover"
                        />
                        {getImages(detalle).length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setActiveIdx((i) => {
                                  const total = getImages(detalle).length;
                                  return (i - 1 + total) % total;
                                })
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors"
                              aria-label="Anterior"
                            >
                              ‹
                            </button>
                            <button
                              onClick={() =>
                                setActiveIdx((i) => {
                                  const total = getImages(detalle).length;
                                  return (i + 1) % total;
                                })
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors"
                              aria-label="Siguiente"
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square w-full flex items-center justify-center text-gray-400 dark:text-gray-300">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Miniaturas */}
                  {getImages(detalle).length > 1 && (
                    <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2">
                      {getImages(detalle).map((rel, i) => (
                        <button
                          key={`${rel}-${i}`}
                          onClick={() => setActiveIdx(i)}
                          className={`relative aspect-square overflow-hidden rounded-lg border transition-colors ${
                            i === activeIdx
                              ? "border-gray-400 dark:border-white/50"
                              : "border-gray-200 dark:border-white/10"
                          }`}
                          aria-label={`Miniatura ${i + 1}`}
                        >
                          <img
                            src={imgUrl(rel)}
                            alt={`thumb-${i}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Panel info: SOLO Marca, Modelo, Año, Uso, Estado + precio/regla */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] p-4 md:p-5 bg-gray-50/60 dark:bg-white/[0.02] transition-colors">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Información
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="text-gray-600 dark:text-gray-300">Marca</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-gray-100">{detalle.marca}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="text-gray-600 dark:text-gray-300">Modelo</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-gray-100">{detalle.modelo}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="text-gray-600 dark:text-gray-300">Año</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-gray-100">{detalle.year}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="text-gray-600 dark:text-gray-300">Uso</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-gray-100">{detalle.uso || "—"}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="text-gray-600 dark:text-gray-300">Estado</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-gray-100">{(detalle.estado || "—").toString()}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="text-gray-600 dark:text-gray-300">
                          {((detalle.estado || "").toUpperCase() === "ALQUILER") ? "Precio alquiler" : "Precio venta"}
                        </dt>
                        <dd className="col-span-2 text-gray-900 dark:text-gray-100">
                          {priceLabel(detalle)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => addToCart(detalle)} className="flex-1">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {((detalle.estado || "").toUpperCase() === "ALQUILER") ? "Solicitar alquiler (demo)" : "Agregar (demo)"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCartOpen(true)} className="flex-1">
                      Ver carrito
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white/90 dark:bg-white/10 backdrop-blur border-t border-gray-100 dark:border-white/[0.05] px-5 py-3 flex items-center justify-end gap-2 transition-colors">
                <Button variant="outline" size="sm" onClick={closeDetalle}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============== DRAWER CARRITO (demo) ============== */}
      <div
        className={`fixed inset-0 z-[120] isolation-isolate pointer-events-none ${cartOpen ? "" : ""}`}
        aria-hidden={!cartOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 z-[110] bg-black/40 transition-opacity duration-300 ${
            cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={() => setCartOpen(false)}
        />
        {/* Panel */}
        <aside
          className={`absolute right-0 top-0 h-[100svh] w-[90vw] sm:w-[420px]
          bg-white dark:bg-[#0b0b0b] border-l border-gray-200 dark:border-white/10
          shadow-xl transform transition-transform duration-300
          ${cartOpen ? "translate-x-0" : "translate-x-full"}
          z-[120] pointer-events-auto flex flex-col`}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-800 dark:text-gray-100" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Tu carrito (demo)</h3>
              {!!totalItems && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">{totalItems}</span>
              )}
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="size-9 inline-flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-4 h-4 text-gray-800 dark:text-gray-100" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-300">
                <ShoppingCart className="w-10 h-10 mb-2" />
                Tu carrito está vacío.
              </div>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => {
                  const unit = typeof item.price === "number" ? item.price : null;
                  const line = unit ? unit * item.quantitySelected : null;
                  return (
                    <li
                      key={item.id}
                      className="rounded-xl border border-gray-200 dark:border-white/10 p-3 flex gap-3 transition-colors"
                    >
                      <div className="size-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0">
                        {item.cover ? (
                          <img src={buildFileUrl(item.cover)} className="h-full w-full object-cover" alt={item.name} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {item.name}
                            </p>
                            {/* En el carrito ya no mostramos más que la regla de precio */}
                            <p className="text-[12px] text-gray-800 dark:text-gray-100 mt-1">
                              {item.estado === "ALQUILER" ? "Consultar precio de alquiler" : `Precio: ${currencyFmt.format(item.price || 0)}`}
                            </p>
                            <p className="text-[12px] text-gray-800 dark:text-gray-100">
                              Subtotal: {item.estado === "ALQUILER" ? "—" : currencyFmt.format(line || 0)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="size-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg:white/10 transition-colors"
                            title="Quitar"
                          >
                            <Trash2 className="w-4 h-4 text-gray-800 dark:text-gray-100" />
                          </button>
                        </div>

                        {/* Cantidad (demo) */}
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => decQty(item.id)}
                            className="size-8 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                            title="Menos"
                          >
                            <Minus className="w-4 h-4 text-gray-800 dark:text-gray-100" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantitySelected}
                            onChange={(e) => setItemQty(item.id, Number(e.target.value || 1))}
                            className="w-14 text-center px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-gray-800 dark:text-gray-100 transition-colors"
                          />
                          <button
                            onClick={() => incQty(item.id)}
                            className="size-8 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                            title="Más"
                          >
                            <Plus className="w-4 h-4 text-gray-800 dark:text-gray-100" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-gray-200 dark:border-white/10 p-3 transition-colors">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Ítems</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-800 dark:text-gray-100 font-medium">Total</span>
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {currencyFmt.format(totalAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearCart} disabled={cart.length === 0} className="flex-1">
                Vaciar
              </Button>
              <Button size="sm" onClick={handleCheckout} disabled={cart.length === 0} className="flex-1">
                Continuar (demo)
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
