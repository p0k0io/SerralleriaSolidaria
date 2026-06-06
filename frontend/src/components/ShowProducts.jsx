import { useEffect, useState, useMemo } from "react";
import { useAdminToast } from "../context/AdminToastContext";

const API = "http://localhost:8000/api";

/*
|--------------------------------------------------------------------------
| Helper — construir URL de imagen
|--------------------------------------------------------------------------
| El backend ya devuelve image_url (URL absoluta).
| Esta función es el único punto donde se construye la URL de imagen.
|--------------------------------------------------------------------------
*/
const imgUrl = (variant) => {
  if (!variant) return null;
  if (variant.image_url) return variant.image_url;
  if (variant.image) {
    if (variant.image.startsWith("http")) return variant.image;
    return `http://localhost:8000/storage/${variant.image}`;
  }
  return null;
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
  const [error, setError] = useState(false);
  const sizes = { sm: "w-10 h-10", md: "w-16 h-16", lg: "w-20 h-20" };

  return (
    <div className={`${sizes[size]} rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100`}>
      {src && !error ? (
        <img
          src={src}
          className="w-full h-full object-cover"
          alt=""
          onError={() => setError(true)}
        />
      ) : (
        <svg className="w-5 h-5 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
    <button onClick={onClick} title={title}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${variants[variant]}`}>
      {children}
    </button>
  );
}

/* ─── SEARCH / FILTER BAR ─────────────────────────────────────── */

function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar producto, SKU, fabricante…"
        className="w-full h-[42px] pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
      />
      {value && (
        <button onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
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
        value={value} onChange={(e) => onChange(e.target.value)}
        className={`appearance-none h-[42px] pl-3 pr-8 text-sm rounded-xl border transition-all outline-none cursor-pointer
          ${active ? "bg-orange-500 border-orange-500 text-white font-semibold" : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      <div className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${active ? "text-white" : "text-slate-400"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
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
    onSave({
      name:               form.name,
      description:        form.description,
      manufacturer:       form.manufacturer,
      shipping_price:     parseFloat(form.shipping_price) || 0,
      installation_price: parseFloat(form.installation_price) || 0,
      stock_status:       form.stock_status,
      has_extra_keys:     form.has_extra_keys,
      extra_key_price:    form.has_extra_keys && form.extra_key_price !== ""
                            ? parseFloat(form.extra_key_price)
                            : null,
    });
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
          <input type="number" min="0" step="0.01" value={form.shipping_price}
            onChange={(e) => set("shipping_price", e.target.value)} placeholder="0.00" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Precio instalación (€)</label>
          <input type="number" min="0" step="0.01" value={form.installation_price}
            onChange={(e) => set("installation_price", e.target.value)} placeholder="0.00" className={inputCls} />
        </div>
      </div>

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
            <input type="number" min="0" step="0.01" value={form.extra_key_price}
              onChange={(e) => set("extra_key_price", e.target.value)} placeholder="5.00"
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            <span className="text-xs text-slate-400">€</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave}
          className="bg-orange-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-orange-600 transition font-medium">
          Guardar
        </button>
        <button onClick={onCancel}
          className="text-slate-500 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ─── PRODUCT META ───────────────────────────────────────────── */

function ProductMeta({ product }) {
  const hasShipping = parseFloat(product.shipping_price) > 0;
  const hasInstall  = parseFloat(product.installation_price) > 0;
  const hasKeys     = product.has_extra_keys;
  if (!hasShipping && !hasInstall && !hasKeys) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {hasShipping && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">
          Envío {parseFloat(product.shipping_price).toFixed(2)} €
        </span>
      )}
      {hasInstall && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-100">
          Instalación {parseFloat(product.installation_price).toFixed(2)} €
        </span>
      )}
      {hasKeys && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
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
  const [preview, setPreview]     = useState(null);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function handleImageChange(file) {
    setImageFile(file);
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSave() {
    onUpdate(variant.id, { sku, price, image: imageFile });
    setEditing(false);
    setImageFile(null);
    setPreview(null);
  }

  const stockCfg   = STOCK_CONFIG[variant.stock_status] ?? STOCK_CONFIG.available;
  const currentImg = preview || imgUrl(variant);

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-orange-50/40 transition group">

      <ImageSlot src={currentImg} size="sm" />

      {editing ? (
        <div className="flex flex-wrap gap-2 flex-1 items-center">
          <input value={sku} onChange={(e) => setSku(e.target.value)}
            placeholder="SKU"
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          <input value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio" type="number" min="0" step="0.01"
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-orange-300" />

          <label className="cursor-pointer text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg px-2 py-1 hover:border-orange-400 hover:text-orange-500 transition">
            {imageFile ? imageFile.name.slice(0, 12) + "…" : preview ? "✓ Nueva imagen" : "Cambiar imagen"}
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => handleImageChange(e.target.files[0])} />
          </label>

          <button onClick={handleSave}
            className="bg-orange-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-orange-600 transition">
            OK
          </button>
          <button onClick={() => { setEditing(false); setImageFile(null); setPreview(null); }}
            className="text-slate-400 text-xs hover:text-slate-600">✕</button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{variant.sku ?? "—"}</p>
          </div>
          <p className="text-sm font-semibold text-orange-500 tabular-nums shrink-0">
            {parseFloat(variant.price).toFixed(2)} €
          </p>
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
          <IconBtn onClick={() => onToggleFeatured(variant.id)}
            title={variant.featured ? "Desmarcar destacado" : "Destacar"}
            variant={variant.featured ? "orange" : "default"}>★</IconBtn>
          <IconBtn onClick={() => onToggle(variant.id)}
            title={variant.active ? "Desactivar" : "Activar"}>
            {variant.active ? "Off" : "On"}
          </IconBtn>
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
  const [preview, setPreview]     = useState(null);
  const [busy, setBusy]           = useState(false);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function handleImageChange(file) {
    setImageFile(file);
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  async function handleCreate() {
    if (!price) return;
    setBusy(true);

    const token = localStorage.getItem("token");
    const fd = new FormData();
    if (sku) fd.append("sku", sku);
    fd.append("price",        price);
    fd.append("product_id",   productId);
    fd.append("stock_status", stockStatus);
    if (imageFile) fd.append("image", imageFile);

    try {
      // ✅ RUTA CORRECTA: POST /api/variants
      const res = await fetch(`${API}/variants`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      if (!res.ok) throw new Error("No se pudo crear la variante");
      setSku(""); setPrice(""); setStock("available");
      setImageFile(null); setPreview(null);
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
      <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-24 focus:outline-none focus:ring-2 focus:ring-orange-300" />
      <input placeholder="Precio €" type="number" min="0" step="0.01" value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-orange-300" />
      <select value={stockStatus} onChange={(e) => setStock(e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300">
        {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <label className="cursor-pointer text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg px-2 py-1 hover:border-orange-400 hover:text-orange-500 transition flex items-center gap-1.5">
        {preview ? (
          <img src={preview} alt="preview" className="w-6 h-6 rounded object-cover" />
        ) : null}
        {imageFile ? imageFile.name.slice(0, 10) + "…" : "+ Imagen"}
        <input type="file" accept="image/*" className="hidden"
          onChange={(e) => handleImageChange(e.target.files[0])} />
      </label>

      <button onClick={handleCreate} disabled={busy || !price}
        className="bg-orange-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-orange-600 transition disabled:opacity-40 font-medium">
        {busy ? "…" : "+ Añadir"}
      </button>
    </div>
  );
}

/* ─── PRODUCT CARD ───────────────────────────────────────────── */

function ProductCard({ product, onReload, showToast }) {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(false);

  const token = localStorage.getItem("token");

  async function toggle() {
    try {
      const res = await fetch(
        `${API}/products/${product.active ? "disable" : "enable"}/${product.id}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("No se pudo actualizar el estado del producto");
      showToast(product.active ? "Producto desactivado" : "Producto activado");
      onReload();
    } catch (err) { showToast(err.message || "Error al cambiar estado", "error"); }
  }

  async function remove() {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      const res = await fetch(`${API}/products/${product.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("No se pudo eliminar el producto");
      showToast("Producto eliminado");
      onReload();
    } catch (err) { showToast(err.message || "Error al eliminar producto", "error"); }
  }

  async function save(payload) {
    try {
      const res = await fetch(`${API}/products/${product.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar el producto");
      setEditing(false);
      showToast("Producto actualizado");
      onReload();
    } catch (err) { showToast(err.message || "Error al guardar producto", "error"); }
  }

  async function toggleVariant(id) {
    try {
      // ✅ RUTA CORRECTA: POST /api/variants/{id}/toggle
      const res = await fetch(`${API}/variants/${id}/toggle`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      showToast("Estado de variante actualizado");
      onReload();
    } catch { showToast("Error al actualizar variante", "error"); }
  }

  async function toggleFeatured(id) {
    try {
      // ✅ RUTA CORRECTA: POST /api/variants/{id}/toggle-featured
      const res = await fetch(`${API}/variants/${id}/toggle-featured`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      showToast("Variante destacada actualizada");
      onReload();
    } catch { showToast("Error al destacar variante", "error"); }
  }

  async function deleteVariant(id) {
    if (!confirm("¿Eliminar esta variante?")) return;
    try {
      // ✅ RUTA CORRECTA: DELETE /api/variants/{id}
      const res = await fetch(`${API}/variants/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      showToast("Variante eliminada");
      onReload();
    } catch { showToast("Error al eliminar variante", "error"); }
  }

  async function updateVariant(id, data) {
    try {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("sku",          data.sku ?? "");
      fd.append("price",        data.price ?? "");
      fd.append("stock_status", data.stock_status ?? "available");
      if (data.image instanceof File) fd.append("image", data.image);

      // ✅ RUTA CORRECTA: POST /api/variants/{id} con _method=PUT (Laravel method spoofing)
      const res = await fetch(`${API}/variants/${id}`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      if (!res.ok) throw new Error();
      showToast("Variante guardada");
      onReload();
    } catch { showToast("Error al actualizar variante", "error"); }
  }

  async function updateVariantStock(id, stock_status) {
    try {
      // ✅ RUTA CORRECTA: PATCH /api/variants/{id}/stock
      const res = await fetch(`${API}/variants/${id}/stock`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ stock_status }),
      });
      if (!res.ok) throw new Error();
      showToast("Stock de variante actualizado");
      onReload();
    } catch { showToast("Error al actualizar stock", "error"); }
  }

  // Imagen principal: primera variante que tenga imagen
  const firstVariantImage = (() => {
    const first = product.variants?.find((v) => v.image_url || v.image);
    return first ? imgUrl(first) : null;
  })();

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${open ? "border-orange-200 shadow-md shadow-orange-50" : "border-slate-100 shadow-sm hover:border-orange-100 hover:shadow"}`}>
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <ImageSlot src={firstVariantImage} size="lg" />

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
  const { showToast }           = useAdminToast();

  const [search, setSearch]           = useState("");
  const [activeFilter, setActive]     = useState("");
  const [stockFilter, setStock]       = useState("");
  const [categoryFilter, setCategory] = useState("");

  const reload = () => setRefresh((p) => !p);
  const token  = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search)         params.set("search", search);
        if (activeFilter)   params.set("active", activeFilter);
        if (stockFilter)    params.set("stock_status", stockFilter);
        if (categoryFilter) params.set("category_id", categoryFilter);

        // ✅ RUTA CORRECTA: GET /api/products
        const res = await fetch(`${API}/products?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
  function clearFilters() { setSearch(""); setActive(""); setStock(""); setCategory(""); }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
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

        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={search} onChange={setSearch} />
          <FilterChip value={activeFilter} onChange={setActive} placeholder="Estado"
            options={[{ value: "1", label: "Activos" }, { value: "0", label: "Inactivos" }]} />
          <FilterChip value={stockFilter} onChange={setStock} placeholder="Stock" options={STOCK_OPTIONS} />
          {categories.length > 0 && (
            <FilterChip value={categoryFilter} onChange={setCategory} placeholder="Categoría" options={categories} />
          )}
          {hasFilters && (
            <button onClick={clearFilters}
              className="h-[42px] px-3.5 flex items-center gap-1.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:text-orange-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Limpiar
            </button>
          )}
        </div>
      </div>

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
            <p className="text-sm font-medium">No hay productos{hasFilters ? " con estos filtros" : " todavía"}</p>
            {hasFilters && (
              <button onClick={clearFilters}
                className="mt-2 text-xs text-orange-400 hover:text-orange-600 font-semibold transition">
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