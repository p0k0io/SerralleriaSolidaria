import { useEffect, useState, useMemo } from "react";
import { useAdminToast } from "../context/AdminToastContext";

const API = "http://localhost:8000/api";
const STORAGE = "http://localhost:8000/storage";

const img = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE}/${path}`;
};

/* ─── CONSTANTES ─────────────────────────────────────────────── */

const STOCK_CONFIG = {
  available:    { label: "Disponible",   color: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-400" },
  out_of_stock: { label: "Sin stock",    color: "bg-red-50 text-red-500 border-red-200",             dot: "bg-red-400" },
  next_batch:   { label: "Lote próximo", color: "bg-amber-50 text-amber-600 border-amber-200",       dot: "bg-amber-400" },
};

const STOCK_OPTIONS = [
  { value: "available",    label: "Disponible" },
  { value: "out_of_stock", label: "Sin stock" },
  { value: "next_batch",   label: "Lote próximo" },
];

/* ─── HELPERS UI ─────────────────────────────────────────────── */

function ImageSlot({ src, size = "md" }) {
  const sizes = { sm: "w-10 h-10", md: "w-16 h-16", lg: "w-20 h-20" };
  return (
    <div className={`${sizes[size]} rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100`}>
      {src ? (
        <img src={src} className="w-full h-full object-cover" alt="" />
      ) : (
        <svg className="w-5 h-5 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )}
    </div>
  );
}

function Badge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-300"}`} />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function StockBadge({ status }) {
  const cfg = STOCK_CONFIG[status] ?? STOCK_CONFIG.available;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function IconBtn({ onClick, title, variant = "default", children }) {
  const variants = {
    default: "bg-slate-100 text-slate-500 hover:bg-slate-200",
    orange:  "bg-orange-500 text-white hover:bg-orange-600",
    red:     "bg-red-50 text-red-500 hover:bg-red-100",
    ghost:   "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
    amber:   "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200",
  };
  return (
    <button onClick={onClick} title={title} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${variants[variant]}`}>
      {children}
    </button>
  );
}

/* ─── SEARCH / FILTER BAR ─────────────────────────────────────── */

function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar producto, SKU, fabricante…"
        className="w-full h-[42px] pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
    </div>
  );
}

function FilterChip({ value, onChange, options, placeholder }) {
  const active = value !== "";
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none h-[42px] pl-3 pr-8 text-sm rounded-xl border transition-all outline-none cursor-pointer
          ${active ? "bg-orange-500 border-orange-500 text-white font-semibold" : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      <div className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${active ? "text-white" : "text-slate-400"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
  );
}

/* ─── EDIT PRODUCT FORM ──────────────────────────────────────── */

function EditProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:               product.name ?? "",
    description:        product.description ?? "",
    manufacturer:       product.manufacturer ?? "",
    shipping_price:     product.shipping_price ?? 0,
    installation_price: product.installation_price ?? 0,
    stock_status:       product.stock_status ?? "available",
    has_extra_keys:     Boolean(product.has_extra_keys),
    extra_key_price:    product.extra_key_price ?? "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  function handleSave() {
    // Construir payload con tipos correctos para el backend
    const payload = {
      name:               form.name,
      description:        form.description,
      manufacturer:       form.manufacturer,
      shipping_price:     parseFloat(form.shipping_price) || 0,
      installation_price: parseFloat(form.installation_price) || 0,
      stock_status:       form.stock_status,
      has_extra_keys:     form.has_extra_keys,          // booleano
      extra_key_price:    form.has_extra_keys && form.extra_key_price !== ""
                            ? parseFloat(form.extra_key_price)
                            : null,
    };
    onSave(payload);
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition";
  const labelCls = "text-xs font-semibold text-slate-400 mb-0.5 block";

  return (
    <div className="space-y-3 mt-1 bg-orange-50/40 rounded-xl p-3 border border-orange-100">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className={labelCls}>Nombre</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre del producto" className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Descripción</label>
          <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Descripción" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Fabricante</label>
          <input value={form.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} placeholder="Fabricante" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Stock</label>
          <select value={form.stock_status} onChange={(e) => set("stock_status", e.target.value)} className={inputCls}>
            {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Precio envío (€)</label>
          <input
            type="number" min="0" step="0.01"
            value={form.shipping_price}
            onChange={(e) => set("shipping_price", e.target.value)}
            placeholder="0.00"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Precio instalación (€)</label>
          <input
            type="number" min="0" step="0.01"
            value={form.installation_price}
            onChange={(e) => set("installation_price", e.target.value)}
            placeholder="0.00"
            className={inputCls}
          />
        </div>
      </div>

      {/* Llaves extra */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative" onClick={() => set("has_extra_keys", !form.has_extra_keys)}>
            <div className={`w-9 h-5 rounded-full transition-colors ${form.has_extra_keys ? "bg-orange-500" : "bg-slate-200"}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.has_extra_keys ? "translate-x-4" : ""}`} />
          </div>
          <span className="text-sm font-medium text-slate-700">Llaves extra</span>
        </label>
        {form.has_extra_keys && (
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-xs text-slate-400">Precio/llave</span>
            <input
              type="number" min="0" step="0.01"
              value={form.extra_key_price}
              onChange={(e) => set("extra_key_price", e.target.value)}
              placeholder="5.00"
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <span className="text-xs text-slate-400">€</span>
          </div>
        )}
      </div>

      {/* Vista previa de lo que se enviará */}
      <div className="text-[10px] text-slate-400 bg-slate-50 rounded-lg px-2 py-1.5 font-mono leading-relaxed">
        <span className="font-semibold text-slate-500">Payload: </span>
        shipping={parseFloat(form.shipping_price)||0} · install={parseFloat(form.installation_price)||0} · keys={form.has_extra_keys?"sí":"no"}
        {form.has_extra_keys && form.extra_key_price !== "" && ` · key_price=${parseFloat(form.extra_key_price)}`}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} className="bg-orange-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-orange-600 transition font-medium">
          Guardar
        </button>
        <button onClick={onCancel} className="text-slate-500 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ─── EXTRA INFO ROW (shipping / install / keys) ─────────────── */

function ProductMeta({ product }) {
  const hasShipping = parseFloat(product.shipping_price) > 0;
  const hasInstall  = parseFloat(product.installation_price) > 0;
  const hasKeys     = product.has_extra_keys;
  if (!hasShipping && !hasInstall && !hasKeys) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {hasShipping && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          Envío {parseFloat(product.shipping_price).toFixed(2)} €
        </span>
      )}
      {hasInstall && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          Instalación {parseFloat(product.installation_price).toFixed(2)} €
        </span>
      )}
      {hasKeys && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          Llaves extra {product.extra_key_price ? `${parseFloat(product.extra_key_price).toFixed(2)} €/ud` : ""}
        </span>
      )}
    </div>
  );
}

/* ─── VARIANT ROW ────────────────────────────────────────────── */

function VariantRow({ variant, onToggle, onDelete, onUpdate, onToggleFeatured, onUpdateStock }) {
  const [editing, setEditing]     = useState(false);
  const [sku, setSku]             = useState(variant.sku ?? "");
  const [price, setPrice]         = useState(variant.price);
  const [imageFile, setImageFile] = useState(null);

  function handleSave() {
    onUpdate(variant.id, { sku, price, image: imageFile ?? variant.image });
    setEditing(false);
  }

  const stockCfg = STOCK_CONFIG[variant.stock_status] ?? STOCK_CONFIG.available;

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-orange-50/40 transition group">
      <ImageSlot src={img(variant.image)} size="sm" />

      {editing ? (
        <div className="flex flex-wrap gap-2 flex-1 items-center">
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" type="number" min="0" step="0.01" className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          <label className="cursor-pointer text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg px-2 py-1 hover:border-orange-400 hover:text-orange-500 transition">
            {imageFile ? imageFile.name.slice(0, 12) + "…" : "Imagen"}
            <input type="file" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
          <button onClick={handleSave} className="bg-orange-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-orange-600 transition">OK</button>
          <button onClick={() => setEditing(false)} className="text-slate-400 text-xs hover:text-slate-600">✕</button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{variant.sku ?? "—"}</p>
          </div>
          <p className="text-sm font-semibold text-orange-500 tabular-nums shrink-0">{parseFloat(variant.price).toFixed(2)} €</p>
          <Badge active={variant.active} />
          <div className="relative shrink-0">
            <select
              value={variant.stock_status ?? "available"}
              onChange={(e) => onUpdateStock(variant.id, e.target.value)}
              className={`appearance-none text-[11px] font-medium pl-5 pr-5 py-1 rounded-full border cursor-pointer outline-none transition ${stockCfg.color}`}
            >
              {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className={`pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${stockCfg.dot}`} />
          </div>
        </>
      )}

      {!editing && (
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <IconBtn onClick={() => onToggleFeatured(variant.id)} title={variant.featured ? "Desmarcar destacado" : "Destacar"} variant={variant.featured ? "orange" : "default"}>★</IconBtn>
          <IconBtn onClick={() => onToggle(variant.id)} title={variant.active ? "Desactivar" : "Activar"}>{variant.active ? "Off" : "On"}</IconBtn>
          <IconBtn onClick={() => setEditing(true)} variant="ghost" title="Editar">✎</IconBtn>
          <IconBtn onClick={() => onDelete(variant.id)} variant="red" title="Eliminar">✕</IconBtn>
        </div>
      )}
    </div>
  );
}

/* ─── NEW VARIANT FORM ───────────────────────────────────────── */

function NewVariantForm({ productId, onCreated, showToast }) {
  const [sku, setSku]             = useState("");
  const [price, setPrice]         = useState("");
  const [stockStatus, setStock]   = useState("available");
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy]           = useState(false);

  async function handleCreate() {
    if (!price) return;
    setBusy(true);
    const form = new FormData();
    if (sku) form.append("sku", sku);
    form.append("price", price);
    form.append("product_id", productId);
    form.append("stock_status", stockStatus);
    if (imageFile) form.append("image", imageFile);

    try {
      const res = await fetch(`${API}/variants`, { method: "POST", body: form });
      if (!res.ok) throw new Error("No se pudo crear la variante");
      setSku(""); setPrice(""); setStock("available"); setImageFile(null);
      showToast("Variante creada");
      onCreated();
    } catch (err) {
      showToast(err.message || "Error al crear variante", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-dashed border-slate-200 mt-1">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Nueva variante</span>
      <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-24 focus:outline-none focus:ring-2 focus:ring-orange-300" />
      <input placeholder="Precio €" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-orange-300" />
      <select value={stockStatus} onChange={(e) => setStock(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300">
        {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <label className="cursor-pointer text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg px-2 py-1 hover:border-orange-400 hover:text-orange-500 transition">
        {imageFile ? imageFile.name.slice(0, 12) + "…" : "+ Imagen"}
        <input type="file" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
      </label>
      <button onClick={handleCreate} disabled={busy || !price} className="bg-orange-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-orange-600 transition disabled:opacity-40 font-medium">
        {busy ? "…" : "+ Añadir"}
      </button>
    </div>
  );
}

/* ─── PRODUCT CARD ───────────────────────────────────────────── */

function ProductCard({ product, onReload, showToast }) {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(false);

  async function toggle() {
    try {
      const res = await fetch(`${API}/products/${product.active ? "disable" : "enable"}/${product.id}`, { method: "POST" });
      if (!res.ok) throw new Error("No se pudo actualizar el estado del producto");
      showToast(product.active ? "Producto desactivado" : "Producto activado");
      onReload();
    } catch (err) {
      showToast(err.message || "Error al cambiar estado", "error");
    }
  }

  async function remove() {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      const res = await fetch(`${API}/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el producto");
      showToast("Producto eliminado");
      onReload();
    } catch (err) {
      showToast(err.message || "Error al eliminar producto", "error");
    }
  }

  // ── CORRECCIÓN CLAVE: enviamos todos los campos con tipos correctos ──
  async function save(payload) {
    try {
      const res = await fetch(`${API}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:               payload.name,
          description:        payload.description ?? null,
          manufacturer:       payload.manufacturer ?? null,
          shipping_price:     payload.shipping_price,
          installation_price: payload.installation_price,
          stock_status:       payload.stock_status,
          has_extra_keys:     payload.has_extra_keys,   // true/false
          extra_key_price:    payload.extra_key_price,  // number o null
        }),
      });

      if (!res.ok) throw new Error("No se pudo guardar el producto");
      setEditing(false);
      showToast("Producto actualizado");
      onReload();
    } catch (err) {
      showToast(err.message || "Error al guardar producto", "error");
    }
  }

  async function toggleVariant(id) {
    try {
      const res = await fetch(`${API}/variants/${id}/toggle`, { method: "POST" });
      if (!res.ok) throw new Error("No se pudo cambiar el estado de la variante");
      showToast("Estado de variante actualizado");
      onReload();
    } catch (err) {
      showToast(err.message || "Error al actualizar variante", "error");
    }
  }

  async function toggleFeatured(id) {
    try {
      const res = await fetch(`${API}/variants/${id}/toggle-featured`, { method: "POST" });
      if (!res.ok) throw new Error("No se pudo cambiar el estado de destacado");
      showToast("Variante destacada actualizada");
      onReload();
    } catch (err) {
      showToast(err.message || "Error al destacar variante", "error");
    }
  }

  async function deleteVariant(id) {
    if (!confirm("¿Eliminar esta variante?")) return;
    try {
      const res = await fetch(`${API}/variants/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la variante");
      showToast("Variante eliminada");
      onReload();
    } catch (err) {
      showToast(err.message || "Error al eliminar variante", "error");
    }
  }

  async function updateVariant(id, data) {
    try {
      const form = new FormData();
      form.append("_method", "PUT");
      form.append("sku", data.sku ?? "");
      form.append("price", data.price ?? "");
    form.append("stock_status", data.stock_status ?? "available");
      if (data.image instanceof File) form.append("image", data.image);
      const res = await fetch(`${API}/variants/${id}`, { method: "POST", body: form });
      if (!res.ok) throw new Error("No se pudo actualizar la variante");
      showToast("Variante guardada");
      onReload();
    } catch (err) {
      showToast(err.message || "Error al actualizar variante", "error");
    }
  }

  async function updateVariantStock(id, stock_status) {
    try {
      const res = await fetch(`${API}/variants/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_status }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el stock");
      showToast("Stock de variante actualizado");
      onReload();
    } catch (err) {
      showToast(err.message || "Error al actualizar stock", "error");
    }
  }

  const firstVariantImage = product.variants?.find((v) => v.image)?.image;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${open ? "border-orange-200 shadow-md shadow-orange-50" : "border-slate-100 shadow-sm hover:border-orange-100 hover:shadow"}`}>
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <ImageSlot src={img(firstVariantImage)} size="lg" />

        <div className="flex-1 min-w-0">
          {editing ? (
            <EditProductForm product={product} onSave={save} onCancel={() => setEditing(false)} />
          ) : (
            <>
              <div className="flex items-start gap-2 mb-0.5 flex-wrap">
                <h2 className="text-base font-semibold text-slate-800 leading-tight">{product.name}</h2>
                <Badge active={product.active} />
                <StockBadge status={product.stock_status} />
              </div>
              <p className="text-sm text-slate-400 leading-snug line-clamp-1">{product.description}</p>
              <p className="text-xs text-slate-300 mt-0.5">
                {product.manufacturer && <span>{product.manufacturer} · </span>}
                {product.category?.name ?? `Cat. ${product.category_id}`}
              </p>
              <ProductMeta product={product} />
            </>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            <IconBtn onClick={toggle} title={product.active ? "Desactivar" : "Activar"}>
              {product.active ? "Off" : "On"}
            </IconBtn>
            <IconBtn onClick={() => setEditing(true)} variant="ghost" title="Editar">✎</IconBtn>
            <IconBtn onClick={remove} variant="red" title="Eliminar">✕</IconBtn>
            <button
              onClick={() => setOpen((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${open ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-500"}`}
            >
              {open ? "▲ Cerrar" : `▼ Variantes${product.variants?.length ? ` (${product.variants.length})` : ""}`}
            </button>
          </div>
        )}
      </div>

      {/* Variants panel */}
      {open && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-2 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Variantes · {product.variants?.length ?? 0}
          </p>
          {product.variants?.length ? (
            product.variants.map((v) => (
              <VariantRow
                key={v.id}
                variant={v}
                onToggle={toggleVariant}
                onDelete={deleteVariant}
                onUpdate={updateVariant}
                onToggleFeatured={toggleFeatured}
                onUpdateStock={updateVariantStock}
              />
            ))
          ) : (
            <p className="text-sm text-slate-300 text-center py-4">Sin variantes aún</p>
          )}
          <NewVariantForm productId={product.id} onCreated={onReload} showToast={showToast} />
        </div>
      )}
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */

export default function ShowProducts({ refreshSignal }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [refresh, setRefresh]   = useState(false);
  const { showToast } = useAdminToast();

  const [search, setSearch]           = useState("");
  const [activeFilter, setActive]     = useState("");
  const [stockFilter, setStock]       = useState("");
  const [categoryFilter, setCategory] = useState("");

  const reload = () => setRefresh((p) => !p);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search)         params.set("search", search);
        if (activeFilter)   params.set("active", activeFilter);
        if (stockFilter)    params.set("stock_status", stockFilter);
        if (categoryFilter) params.set("category_id", categoryFilter);

        const res = await fetch(`${API}/products?${params.toString()}`);
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh, refreshSignal, search, activeFilter, stockFilter, categoryFilter]);

  const categories = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.category) map[p.category.id] = p.category.name;
    });
    return Object.entries(map).map(([id, name]) => ({ value: id, label: name }));
  }, [products]);

  const hasFilters = activeFilter || stockFilter || categoryFilter || search;

  function clearFilters() {
    setSearch(""); setActive(""); setStock(""); setCategory("");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Productos</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading ? "Cargando…" : `${products.length} producto${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={search} onChange={setSearch} />
          <FilterChip value={activeFilter} onChange={setActive} placeholder="Estado"
            options={[{ value: "1", label: "Activos" }, { value: "0", label: "Inactivos" }]} />
          <FilterChip value={stockFilter} onChange={setStock} placeholder="Stock" options={STOCK_OPTIONS} />
          {categories.length > 0 && (
            <FilterChip value={categoryFilter} onChange={setCategory} placeholder="Categoría" options={categories} />
          )}
          {hasFilters && (
            <button onClick={clearFilters} className="h-[42px] px-3.5 flex items-center gap-1.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:text-orange-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Limpiar
            </button>
          )}
        </div>

        {/* Chips filtros activos */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {search && (
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
                "{search}"
                <button onClick={() => setSearch("")} className="hover:text-orange-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            )}
            {activeFilter && (
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
                {activeFilter === "1" ? "Activos" : "Inactivos"}
                <button onClick={() => setActive("")} className="hover:text-orange-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            )}
            {stockFilter && (
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
                {STOCK_OPTIONS.find((o) => o.value === stockFilter)?.label}
                <button onClick={() => setStock("")} className="hover:text-orange-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            )}
            {categoryFilter && (
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
                {categories.find((c) => c.value === categoryFilter)?.label}
                <button onClick={() => setCategory("")} className="hover:text-orange-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="max-w-3xl mx-auto space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-5 py-4">{error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-slate-300">
            <svg className="w-10 h-10 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm font-medium">No hay productos{hasFilters ? " con estos filtros" : " todavía"}</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-2 text-xs text-orange-400 hover:text-orange-600 font-semibold transition">
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.map((p) => (
          <ProductCard key={p.id} product={p} onReload={reload} showToast={showToast} />
        ))}
      </div>
    </div>
  );
}
