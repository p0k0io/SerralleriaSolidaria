import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";
const STORAGE = "http://localhost:8000/storage";

const img = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE}/${path}`;
};

function ImageSlot({ src, size = "md" }) {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };
  return (
    <div
      className={`${sizes[size]} rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100`}
    >
      {src ? (
        <img src={src} className="w-full h-full object-cover" alt="" />
      ) : (
        <svg className="w-5 h-5 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )}
    </div>
  );
}

function Badge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
        active
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-300"}`} />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function IconBtn({ onClick, title, variant = "default", children }) {
  const variants = {
    default: "bg-slate-100 text-slate-500 hover:bg-slate-200",
    orange: "bg-orange-500 text-white hover:bg-orange-600",
    red: "bg-red-50 text-red-500 hover:bg-red-100",
    ghost: "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

function EditProductForm({ product, onSave, onCancel }) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);

  return (
    <div className="space-y-2 mt-1">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del producto"
        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave({ name, description })}
          className="bg-orange-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-orange-600 transition font-medium"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="text-slate-500 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function VariantRow({ variant, onToggle, onDelete, onUpdate, onToggleFeatured }) {
  const [editing, setEditing] = useState(false);
  const [sku, setSku] = useState(variant.sku);
  const [price, setPrice] = useState(variant.price);
  const [imageFile, setImageFile] = useState(null);

  function handleSave() {
    onUpdate(variant.id, { sku, price, image: imageFile ?? variant.image });
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-orange-50/40 transition group">
      <ImageSlot src={img(variant.image)} size="sm" />

      {editing ? (
        <div className="flex flex-wrap gap-2 flex-1 items-center">
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU"
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio"
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <label className="cursor-pointer text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg px-2 py-1 hover:border-orange-400 hover:text-orange-500 transition">
            {imageFile ? imageFile.name.slice(0, 12) + "…" : "Imagen"}
            <input type="file" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
          <button onClick={handleSave} className="bg-orange-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-orange-600 transition">
            OK
          </button>
          <button onClick={() => setEditing(false)} className="text-slate-400 text-xs hover:text-slate-600">
            ✕
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{variant.sku}</p>
          </div>
          <p className="text-sm font-semibold text-orange-500 tabular-nums">{variant.price} €</p>
          <Badge active={variant.active} />
        </>
      )}

      {!editing && (
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <IconBtn onClick={() => onToggleFeatured(variant.id, variant.featured)} title={variant.featured ? "Desmarcar destacado" : "Destacar"} variant={variant.featured ? "orange" : "default"}>
            ★
          </IconBtn>
          <IconBtn onClick={() => onToggle(variant.id, variant.active)} title={variant.active ? "Desactivar" : "Activar"}>
            {variant.active ? "Off" : "On"}
          </IconBtn>
          <IconBtn onClick={() => setEditing(true)} variant="ghost" title="Editar">
            ✎
          </IconBtn>
          <IconBtn onClick={() => onDelete(variant.id)} variant="red" title="Eliminar">
            ✕
          </IconBtn>
        </div>
      )}
    </div>
  );
}

function NewVariantForm({ productId, onCreated }) {
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!sku || !price) return;
    setBusy(true);
    const form = new FormData();
    form.append("sku", sku);
    form.append("price", price);
    form.append("product_id", productId);
    if (imageFile) form.append("image", imageFile);
    await fetch(`${API}/variants`, { method: "POST", body: form });
    setSku(""); setPrice(""); setImageFile(null);
    setBusy(false);
    onCreated();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-slate-200 mt-1">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Nueva variante</span>
      <input
        placeholder="SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      <input
        placeholder="Precio €"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      <label className="cursor-pointer text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg px-2 py-1 hover:border-orange-400 hover:text-orange-500 transition">
        {imageFile ? imageFile.name.slice(0, 12) + "…" : "+ Imagen"}
        <input type="file" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
      </label>
      <button
        onClick={handleCreate}
        disabled={busy || !sku || !price}
        className="bg-orange-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-orange-600 transition disabled:opacity-40 font-medium"
      >
        {busy ? "…" : "+ Añadir"}
      </button>
    </div>
  );
}

function ProductCard({ product, onReload }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  async function toggle() {
    await fetch(`${API}/products/${product.active ? "disable" : "enable"}/${product.id}`, { method: "POST" });
    onReload();
  }

  async function remove() {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    await fetch(`${API}/products/${product.id}`, { method: "DELETE" });
    onReload();
  }

  async function save(data) {
    await fetch(`${API}/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, ...data }),
    });
    setEditing(false);
    onReload();
  }

  async function toggleVariant(id) {
    await fetch(`${API}/variants/${id}/toggle`, { method: "POST" });
    onReload();
  }

  async function toggleFeatured(id, currentFeatured) {
    await fetch(`${API}/variants/${id}/toggle-featured`, { method: "POST" });
    onReload();
  }

  async function deleteVariant(id) {
    if (!confirm("¿Eliminar esta variante?")) return;
    await fetch(`${API}/variants/${id}`, { method: "DELETE" });
    onReload();
  }

  async function updateVariant(id, data) {
    const form = new FormData();
    form.append("_method", "PUT"); // Laravel method spoofing
    form.append("sku", data.sku || "");
    form.append("price", data.price || "");
    if (data.image instanceof File) form.append("image", data.image);
    await fetch(`${API}/variants/${id}`, { method: "POST", body: form });
    onReload();
  }

  const firstVariantImage = product.variants?.find((v) => v.image)?.image;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${open ? "border-orange-200 shadow-md shadow-orange-50" : "border-slate-100 shadow-sm hover:border-orange-100 hover:shadow"}`}>
      {/* Card header */}
      <div className="flex items-start gap-4 p-5">
        <ImageSlot src={img(firstVariantImage)} size="lg" />

        <div className="flex-1 min-w-0">
          {editing ? (
            <EditProductForm product={product} onSave={save} onCancel={() => setEditing(false)} />
          ) : (
            <>
              <div className="flex items-start gap-2 mb-0.5">
                <h2 className="text-base font-semibold text-slate-800 leading-tight">{product.name}</h2>
                <Badge active={product.active} />
              </div>
              <p className="text-sm text-slate-400 leading-snug line-clamp-1">{product.description}</p>
              <p className="text-xs text-slate-300 mt-1">{product.manufacturer} · Cat {product.category_id}</p>
            </>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <IconBtn onClick={toggle} title={product.active ? "Desactivar" : "Activar"}>
              {product.active ? "Off" : "On"}
            </IconBtn>
            <IconBtn onClick={() => setEditing(true)} variant="ghost" title="Editar">
              ✎
            </IconBtn>
            <IconBtn onClick={remove} variant="red" title="Eliminar">
              ✕
            </IconBtn>
            <button
              onClick={() => setOpen((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                open
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-500"
              }`}
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
              />
            ))
          ) : (
            <p className="text-sm text-slate-300 text-center py-4">Sin variantes aún</p>
          )}

          <NewVariantForm productId={product.id} onCreated={onReload} />
        </div>
      )}
    </div>
  );
}

export default function ShowProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const reload = () => setRefresh((p) => !p);

  useEffect(() => {
    console.log("ShowProducts: useEffect triggered");
    (async () => {
      try {
        setLoading(true);
        console.log("ShowProducts: fetching products");
        const res = await fetch(`${API}/products`);
        console.log("ShowProducts: fetch response", res);
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        console.log("ShowProducts: data received", data);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Productos</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Cargando…" : `${products.length} productos`}
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
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
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-slate-300 text-sm">
            No hay productos todavía.
          </div>
        )}

        {!loading && !error && products.map((p) => (
          <ProductCard key={p.id} product={p} onReload={reload} />
        ))}
      </div>
    </div>
  );
}
