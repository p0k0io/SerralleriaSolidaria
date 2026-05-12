import { useEffect, useState, useRef } from "react";
import { useAdminToast } from "../context/AdminToastContext";

const API = "http://localhost:8000/api";

const STOCK_OPTIONS = [
  { value: "available",    label: "Disponible" },
  { value: "out_of_stock", label: "Sin stock" },
  { value: "next_batch",   label: "Lote próximo" },
];

// ── ICONOS ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function Spinner({ size = 14 }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── UI HELPERS ─────────────────────────────────────────────────────────────────
function Campo({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp =
  "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder-stone-300 " +
  "focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 focus:bg-white transition-all duration-150";

function Card({ titulo, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-stone-800">{titulo}</h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className="relative" onClick={() => onChange(!checked)}>
        <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-orange-500" : "bg-slate-200"}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-4" : ""}`} />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

// ── SLOT IMAGEN + MEJORA IA ────────────────────────────────────────────────────
// Flujo:
//   1. Usuario sube imagen → preview local (URL.createObjectURL)
//   2. Pulsa "Mejorar" → POST /api/enhance-image (multipart, solo el archivo)
//   3. Laravel sube imagen a storage → obtiene URL pública → llama ModelsLab → hace polling → devuelve enhanced_url
//   4. Frontend muestra imagen mejorada
function ImageSlotWithEnhance({ image, enhancedUrl, enhanceStatus, onFileChange, onEnhance }) {
  const previewSrc = enhancedUrl || (image ? URL.createObjectURL(image) : null);
  const isEnhancing = enhanceStatus === "loading";
  const isError     = typeof enhanceStatus === "string" && enhanceStatus.startsWith("error:");
  const errorMsg    = isError ? enhanceStatus.replace("error:", "") : null;

  return (
    <div className="space-y-2">
      <label className="block border-2 border-dashed border-orange-200 rounded-xl overflow-hidden cursor-pointer hover:border-orange-400 transition group">
        <input type="file" accept="image/*" className="hidden"
          onChange={(e) => onFileChange(e.target.files[0])} />
        {previewSrc ? (
          <div className="relative">
            <img src={previewSrc} alt="preview" className="w-full h-36 object-cover" />
            {enhancedUrl && (
              <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <CheckIcon /> IA aplicada
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded-lg transition">
                Cambiar imagen
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fdba74" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-xs font-medium text-orange-300">Arrastra o haz clic</span>
          </div>
        )}
      </label>

      {image && !enhancedUrl && (
        <button type="button" onClick={onEnhance} disabled={isEnhancing}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-orange-300 text-orange-500 text-xs font-semibold hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {isEnhancing
            ? <><Spinner size={12} /> Procesando en servidor… (20-40 s)</>
            : <>✦ Mejorar foto con IA — fondo blanco, estudio</>}
        </button>
      )}

      {isError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          ⚠ {errorMsg}
        </p>
      )}

      {enhancedUrl && (
        <button type="button"
          onClick={() => onFileChange(image)}
          className="w-full text-xs text-slate-400 hover:text-slate-600 transition py-1">
          ← Volver a imagen original
        </button>
      )}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────
export default function CreateProduct({ onCreated }) {
  const [open, setOpen] = useState(false);

  const emptyVariant = () => ({
    sku: "",
    price: "",
    active: true,
    stock_status: "available",
    image: null,
    enhancedUrl: null,
    enhanceStatus: "idle", // idle | loading | error:<mensaje>
    attributes: {},
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    manufacturer: "",
    categoryId: "",
    active: true,
    shipping_price: "",
    installation_price: "",
    stock_status: "available",
    has_extra_keys: false,
    extra_key_price: "",
    variants: [emptyVariant()],
  });

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const { showToast } = useAdminToast();

  useEffect(() => {
    fetch(`${API}/categories`).then((r) => r.json()).then((d) => setCategories(d.categories));
    fetch(`${API}/attributes`).then((r) => r.json()).then(setAttributes);
  }, []);

  const showLocalToast = (ok, msg) => {
    clearTimeout(timer.current);
    setToast({ ok, msg });
    timer.current = setTimeout(() => setToast(null), 3500);
  };

  const set    = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const setVar = (i, updates) =>
    setForm((p) => {
      const vars = [...p.variants];
      vars[i] = { ...vars[i], ...updates };
      return { ...p, variants: vars };
    });

  const toggleAttr = (vi, aid, vid) =>
    setForm((p) => {
      const vars = [...p.variants];
      const cur  = vars[vi].attributes[aid] || [];
      vars[vi]   = {
        ...vars[vi],
        attributes: {
          ...vars[vi].attributes,
          [aid]: cur.includes(vid) ? cur.filter((x) => x !== vid) : [...cur, vid],
        },
      };
      return { ...p, variants: vars };
    });

  const addVariant    = () => setForm((p) => ({ ...p, variants: [...p.variants, emptyVariant()] }));
  const removeVariant = (i) => setForm((p) => ({ ...p, variants: p.variants.filter((_, j) => j !== i) }));

  // ── Mejorar imagen: el archivo va al backend, el backend llama a ModelsLab ─
  async function handleEnhanceImage(variantIndex) {
  const variant = form.variants[variantIndex];
  if (!variant.image) return;

  setVar(variantIndex, { enhanceStatus: "loading" });
  console.log(`[Enhance] Variante ${variantIndex}: enviando imagen al backend`, {
    name: variant.image.name,
    size: variant.image.size,
    type: variant.image.type,
  });

  try {
    const token = localStorage.getItem("token");
    const fd    = new FormData();
    fd.append("image", variant.image);

    console.log(`[Enhance] POST ${API}/enhance-image`);

    const res  = await fetch(`${API}/enhance-image`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}` },
      body:    fd,
    });

    const data = await res.json();
    console.log("[Enhance] Respuesta del backend:", data);

    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    if (!data?.enhanced_url) throw new Error("El backend no devolvió enhanced_url");

    console.log("[Enhance] URL mejorada:", data.enhanced_url);
    setVar(variantIndex, { enhancedUrl: data.enhanced_url, enhanceStatus: "idle" });
    showLocalToast(true, "✓ Imagen mejorada correctamente");

  } catch (err) {
    console.error("[Enhance] Error:", err.message);
    setVar(variantIndex, { enhanceStatus: `error:${err.message}` });
  }
}

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const fd    = new FormData();

      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("manufacturer", form.manufacturer);
      fd.append("category_id", form.categoryId);
      fd.append("active", form.active ? 1 : 0);
      fd.append("shipping_price", parseFloat(form.shipping_price) || 0);
      fd.append("installation_price", parseFloat(form.installation_price) || 0);
      fd.append("stock_status", form.stock_status);
      fd.append("has_extra_keys", form.has_extra_keys ? 1 : 0);
      if (form.has_extra_keys && form.extra_key_price) {
        fd.append("extra_key_price", parseFloat(form.extra_key_price));
      }

      form.variants.forEach((v, i) => {
        fd.append(`variants[${i}][sku]`, v.sku);
        fd.append(`variants[${i}][price]`, Number(v.price));
        fd.append(`variants[${i}][active]`, v.active ? 1 : 0);
        fd.append(`variants[${i}][stock_status]`, v.stock_status);

        if (v.enhancedUrl) {
          // Imagen ya procesada: el backend la descargará y guardará
          fd.append(`variants[${i}][enhanced_image_url]`, v.enhancedUrl);
        } else if (v.image) {
          fd.append(`variants[${i}][image]`, v.image);
        }

        Object.entries(v.attributes).forEach(([a, vals]) =>
          vals.forEach((vId, j) => fd.append(`variants[${i}][attributes][${a}][${j}]`, vId))
        );
      });

      console.log("[CreateProduct] Enviando producto...");

      const res  = await fetch(`${API}/products/products-with-variants`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();

      console.log("[CreateProduct] Respuesta:", data);
      if (!res.ok) throw new Error(data?.message || "No se pudo crear el producto");

      showToast("Producto creado correctamente");
      showLocalToast(true, "Producto creado correctamente");
      setForm({
        name: "", description: "", manufacturer: "", categoryId: "",
        active: true, shipping_price: "", installation_price: "",
        stock_status: "available", has_extra_keys: false, extra_key_price: "",
        variants: [emptyVariant()],
      });
      if (onCreated) onCreated();
    } catch (err) {
      console.error("[CreateProduct] Error:", err);
      showToast(err.message, "error");
      showLocalToast(false, err.message);
    }

    setLoading(false);
  }

  const isSuccess = toast?.ok;
  const isError   = toast && !toast.ok;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${open ? "border-orange-200 shadow-lg shadow-orange-50" : "border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200"}`}>

      {/* TOGGLE */}
      <button type="button"
        onClick={() => { setOpen(!open); if (open) setToast(null); }}
        className="w-full flex items-center gap-4 px-5 py-4 text-left group">
        <div className={`w-1 h-10 rounded-full transition-all duration-300 ${open ? "bg-gradient-to-b from-orange-400 to-orange-500" : "bg-stone-200 group-hover:bg-stone-300"}`} />
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${open ? "bg-orange-500 text-white shadow-sm" : "bg-stone-100 text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-500"}`}>
          <PlusIcon />
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-sm transition-colors ${open ? "text-stone-900" : "text-stone-700"}`}>Crear producto</p>
          <p className="text-stone-400 text-xs mt-0.5">Nombre, precios, envío, variantes · mejora IA de imágenes</p>
        </div>
        <span className="text-stone-300 group-hover:text-stone-400 transition-colors"><ChevronIcon open={open} /></span>
      </button>

      {/* FORM */}
      {open && (
        <div className="border-t border-stone-100 px-5 py-5 space-y-4">

          {(isSuccess || isError) && (
            <div className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs font-medium border ${isSuccess ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-100"}`}>
              <span className="mt-0.5 flex-shrink-0">{isSuccess ? <CheckIcon /> : <AlertIcon />}</span>
              <span>{toast.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* INFO GENERAL */}
            <Card titulo="Información general">
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Nombre" required>
                  <input className={inp} placeholder="Ej. Bombín de seguridad"
                    value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </Campo>
                <Campo label="Fabricante">
                  <input className={inp} placeholder="Ej. Yale"
                    value={form.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} />
                </Campo>
              </div>
              <div className="mt-3">
                <Campo label="Descripción">
                  <textarea className={`${inp} resize-none h-20`} placeholder="Descripción breve…"
                    value={form.description} onChange={(e) => set("description", e.target.value)} />
                </Campo>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Campo label="Categoría" required>
                  <select className={`${inp} appearance-none`}
                    value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
                    <option value="">Seleccionar…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Campo>
                <Campo label="Stock del producto">
                  <select className={`${inp} appearance-none`}
                    value={form.stock_status} onChange={(e) => set("stock_status", e.target.value)}>
                    {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Campo>
              </div>
            </Card>

            {/* PRECIOS */}
            <Card titulo="Precios y servicios">
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Precio de envío (€)">
                  <input className={inp} type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.shipping_price} onChange={(e) => set("shipping_price", e.target.value)} />
                </Campo>
                <Campo label="Precio de instalación (€)">
                  <input className={inp} type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.installation_price} onChange={(e) => set("installation_price", e.target.value)} />
                </Campo>
              </div>
              <div className="mt-3 flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                <Toggle checked={form.has_extra_keys} onChange={(v) => set("has_extra_keys", v)} label="Llaves extra disponibles" />
                {form.has_extra_keys && (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-slate-400 whitespace-nowrap">Precio / llave</span>
                    <input type="number" min="0" step="0.01" placeholder="5.00"
                      value={form.extra_key_price} onChange={(e) => set("extra_key_price", e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    <span className="text-xs text-slate-400">€</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Producto activo" />
              </div>
            </Card>

            {/* VARIANTES */}
            <Card titulo={`Variantes (${form.variants.length})`}
              badge={<span className="text-[10px] font-semibold bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">✦ Mejora IA</span>}>
              <div className="space-y-4">
                {form.variants.map((v, i) => (
                  <div key={i} className="bg-slate-50 border border-orange-200 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Variante {i + 1}</span>
                      {form.variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(i)}
                          className="text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Campo label="SKU">
                        <input className={inp} placeholder="BOM-SEC-001"
                          value={v.sku} onChange={(e) => setVar(i, { sku: e.target.value })} />
                      </Campo>
                      <Campo label="Precio (€)">
                        <input className={inp} type="number" placeholder="0.00" min="0" step="0.01"
                          value={v.price} onChange={(e) => setVar(i, { price: e.target.value })} />
                      </Campo>
                      <Campo label="Stock">
                        <select className={`${inp} appearance-none`}
                          value={v.stock_status} onChange={(e) => setVar(i, { stock_status: e.target.value })}>
                          {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </Campo>
                    </div>

                    <button type="button" onClick={() => setVar(i, { active: !v.active })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${v.active ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-orange-200 text-orange-400"}`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${v.active ? "bg-white" : "bg-orange-300"}`} />
                      {v.active ? "Variante activa" : "Variante inactiva"}
                    </button>

                    <Campo label="Imagen del producto">
                      <ImageSlotWithEnhance
                        image={v.image}
                        enhancedUrl={v.enhancedUrl}
                        enhanceStatus={v.enhanceStatus}
                        onFileChange={(file) => setVar(i, { image: file, enhancedUrl: null, enhanceStatus: "idle" })}
                        onEnhance={() => handleEnhanceImage(i)}
                      />
                    </Campo>

                    {attributes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Atributos</p>
                        <div className="space-y-3">
                          {attributes.map((attr) => (
                            <div key={attr.id}>
                              <p className="text-xs font-semibold text-gray-500 mb-1.5">{attr.name}</p>
                              <div className="flex flex-wrap gap-2">
                                {attr.values?.map((val) => {
                                  const sel = v.attributes[attr.id]?.includes(val.id);
                                  return (
                                    <button key={val.id} type="button"
                                      onClick={() => toggleAttr(i, attr.id, val.id)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${sel ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-orange-200 hover:border-orange-400"}`}>
                                      {val.value}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" onClick={addVariant}
                className="w-full flex items-center justify-center gap-2 py-3 mt-3 rounded-xl border-2 border-dashed border-orange-300 text-orange-500 text-sm font-semibold hover:bg-orange-50 transition">
                <PlusIcon /> Añadir variante
              </button>
            </Card>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 pt-1">
              <button type="button" onClick={() => { setOpen(false); setToast(null); }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-orange-200 transition-all">
                {loading ? <><Spinner /> Creando…</> : <><PlusIcon /> Crear producto</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
