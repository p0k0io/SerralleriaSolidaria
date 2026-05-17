import { useEffect, useState, useRef } from "react";
import { useAdminToast } from "../context/AdminToastContext";

const API = "http://localhost:8000/api";

const STOCK_OPTIONS = [
  { value: "available",    label: "Disponible" },
  { value: "out_of_stock", label: "Sin stock" },
  { value: "next_batch",   label: "Lote próximo" },
];

// ── ICONS ──────────────────────────────────────────────────────────────────────
const PlusIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CloseIcon = ({ size = 11 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ── SHARED STYLES ──────────────────────────────────────────────────────────────
const inputBase =
  "w-full px-3 py-2 rounded-lg border text-[13px] text-stone-800 placeholder-stone-300 " +
  "bg-white border-stone-200 transition-all duration-150 ease-out " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400/25 focus:border-amber-400 " +
  "hover:border-stone-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]";

// ── FIELD ──────────────────────────────────────────────────────────────────────
function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">
          {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-stone-300">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── SECTION ────────────────────────────────────────────────────────────────────
function Section({ label, badge, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">{label}</p>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ── DIVIDER ────────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="border-t border-stone-100" />;
}

// ── IMAGE SLOT ─────────────────────────────────────────────────────────────────
function ImageSlotWithEnhance({ image, enhancedUrl, enhanceStatus, onFileChange, onEnhance }) {
  const previewSrc = enhancedUrl || (image ? URL.createObjectURL(image) : null);
  const isEnhancing = enhanceStatus === "loading";
  const isError     = typeof enhanceStatus === "string" && enhanceStatus.startsWith("error:");
  const errorMsg    = isError ? enhanceStatus.replace("error:", "") : null;

  return (
    <div className="space-y-2">
      <label className="block border border-dashed border-stone-200 hover:border-amber-400 rounded-lg overflow-hidden cursor-pointer transition-all duration-150 group">
        <input type="file" accept="image/*" className="hidden"
          onChange={(e) => onFileChange(e.target.files[0])} />
        {previewSrc ? (
          <div className="relative">
            <img src={previewSrc} alt="preview" className="w-full h-28 object-cover" />
            {enhancedUrl && (
              <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <CheckIcon size={10} /> IA aplicada
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-150 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-[11px] font-medium bg-black/50 px-2 py-1 rounded-md transition-all duration-150">
                Cambiar imagen
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 py-6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d1c4b4" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-[11px] text-stone-300 font-medium">Arrastra o haz clic</span>
          </div>
        )}
      </label>

      {image && !enhancedUrl && (
        <button type="button" onClick={onEnhance} disabled={isEnhancing}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-amber-200 text-amber-600 text-[11px] font-semibold hover:bg-amber-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
          {isEnhancing
            ? <><SpinnerIcon /> Procesando… (20-40 s)</>
            : <>✦ Mejorar foto con IA</>}
        </button>
      )}

      {isError && (
        <p className="text-[11px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          ⚠ {errorMsg}
        </p>
      )}

      {enhancedUrl && (
        <button type="button" onClick={() => onFileChange(image)}
          className="w-full text-[11px] text-stone-400 hover:text-stone-600 transition-colors duration-150 py-0.5">
          ← Volver a original
        </button>
      )}
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
export default function CreateProduct({ onCreated }) {
  const [open, setOpen] = useState(false);

  const emptyVariant = () => ({
    sku: "", price: "", active: true, stock_status: "available",
    image: null, enhancedUrl: null, enhanceStatus: "idle", attributes: {},
  });

  const [form, setForm] = useState({
    name: "", description: "", manufacturer: "", categoryId: "",
    active: true, shipping_price: "", installation_price: "",
    stock_status: "available", has_extra_keys: false, extra_key_price: "",
    variants: [emptyVariant()],
  });

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const timer = useRef(null);
  const { showToast } = useAdminToast();

  useEffect(() => {
    fetch(`${API}/categories`).then((r) => r.json()).then((d) => setCategories(d.categories));
    fetch(`${API}/attributes`).then((r) => r.json()).then(setAttributes);
  }, []);

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
      vars[vi]   = { ...vars[vi], attributes: { ...vars[vi].attributes, [aid]: cur.includes(vid) ? cur.filter((x) => x !== vid) : [...cur, vid] } };
      return { ...p, variants: vars };
    });

  const addVariant    = () => setForm((p) => ({ ...p, variants: [...p.variants, emptyVariant()] }));
  const removeVariant = (i) => setForm((p) => ({ ...p, variants: p.variants.filter((_, j) => j !== i) }));

  async function handleEnhanceImage(variantIndex) {
    const variant = form.variants[variantIndex];
    if (!variant.image) return;
    setVar(variantIndex, { enhanceStatus: "loading" });
    try {
      const token = localStorage.getItem("token");
      const fd    = new FormData();
      fd.append("image", variant.image);
      const res  = await fetch(`${API}/enhance-image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      if (!data?.enhanced_url) throw new Error("El backend no devolvió enhanced_url");
      setVar(variantIndex, { enhancedUrl: data.enhanced_url, enhanceStatus: "idle" });
      setMessage("success:Imagen mejorada correctamente");
    } catch (err) {
      setVar(variantIndex, { enhanceStatus: `error:${err.message}` });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
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
      if (form.has_extra_keys && form.extra_key_price) fd.append("extra_key_price", parseFloat(form.extra_key_price));

      form.variants.forEach((v, i) => {
        fd.append(`variants[${i}][sku]`, v.sku);
        fd.append(`variants[${i}][price]`, Number(v.price));
        fd.append(`variants[${i}][active]`, v.active ? 1 : 0);
        fd.append(`variants[${i}][stock_status]`, v.stock_status);
        if (v.enhancedUrl) fd.append(`variants[${i}][enhanced_image_url]`, v.enhancedUrl);
        else if (v.image) fd.append(`variants[${i}][image]`, v.image);
        Object.entries(v.attributes).forEach(([a, vals]) =>
          vals.forEach((vId, j) => fd.append(`variants[${i}][attributes][${a}][${j}]`, vId)));
      });

      const res  = await fetch(`${API}/products/products-with-variants`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear el producto");

      showToast("Producto creado correctamente");
      setMessage(`success:${form.name}`);
      setForm({ name: "", description: "", manufacturer: "", categoryId: "", active: true, shipping_price: "", installation_price: "", stock_status: "available", has_extra_keys: false, extra_key_price: "", variants: [emptyVariant()] });
      if (onCreated) onCreated();
      setTimeout(() => { setOpen(false); setMessage(""); }, 1800);
    } catch (err) {
      setMessage(`error:${err.message}`);
      showToast(err.message, "error");
    }
    setLoading(false);
  }

  const isSuccess  = message.startsWith("success:");
  const isError    = message.startsWith("error:");
  const successName = isSuccess ? message.replace("success:", "") : "";
  const errorText   = isError ? message.replace("error:", "") : message;

  return (
    <div className={`
      rounded-xl border overflow-hidden transition-all duration-200 ease-out
      ${open
        ? "border-stone-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]"
        : "border-stone-150 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.07)] hover:border-stone-200"
      }
    `}>

      {/* TOGGLE HEADER */}
      <button type="button"
        onClick={() => { setOpen((p) => !p); setMessage(""); }}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left group focus:outline-none">
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
          transition-all duration-200 ease-out
          ${open
            ? "bg-amber-500 text-white shadow-[0_1px_3px_rgba(245,158,11,0.35)]"
            : "bg-stone-100 text-stone-400 group-hover:bg-stone-150 group-hover:text-stone-500"
          }
        `}>
          <div style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)" }}>
            <PlusIcon size={13} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-medium transition-colors duration-150 ${open ? "text-stone-900" : "text-stone-600 group-hover:text-stone-800"}`}>
            Crear producto
          </p>
          {!open && (
            <p className="text-[11px] text-stone-400 mt-0 leading-tight">
              Nombre, precios, variantes · mejora IA de imágenes
            </p>
          )}
        </div>
        <span className={`transition-colors duration-150 ${open ? "text-stone-400" : "text-stone-300 group-hover:text-stone-400"}`}>
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* FORM */}
      {open && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-4 space-y-4"
          style={{ animation: "slideDown 0.18s cubic-bezier(0.4,0,0.2,1)" }}>
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Feedback */}
          {(isSuccess || isError) && (
            <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-[12px] font-medium border
              ${isSuccess ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
              <span className="mt-0.5 flex-shrink-0 opacity-80">{isSuccess ? <CheckIcon /> : <AlertIcon />}</span>
              <span className="leading-snug">
                {isSuccess
                  ? <>Producto <strong className="font-semibold">"{successName}"</strong> creado con éxito</>
                  : errorText
                }
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* INFO GENERAL */}
            <Section label="Información general">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre" required>
                  <input className={inputBase} placeholder="Ej. Bombín de seguridad"
                    value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </Field>
                <Field label="Fabricante">
                  <input className={inputBase} placeholder="Ej. Yale"
                    value={form.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} />
                </Field>
              </div>
              <Field label="Descripción">
                <textarea className={`${inputBase} resize-none leading-relaxed`} rows="3"
                  placeholder="Descripción breve…"
                  value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoría" required>
                  <select className={`${inputBase} appearance-none`}
                    value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
                    <option value="">Seleccionar…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Stock">
                  <select className={`${inputBase} appearance-none`}
                    value={form.stock_status} onChange={(e) => set("stock_status", e.target.value)}>
                    {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>
            </Section>

            <Divider />

            {/* PRECIOS */}
            <Section label="Precios y servicios">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Envío (€)">
                  <input className={inputBase} type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.shipping_price} onChange={(e) => set("shipping_price", e.target.value)} />
                </Field>
                <Field label="Instalación (€)">
                  <input className={inputBase} type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.installation_price} onChange={(e) => set("installation_price", e.target.value)} />
                </Field>
              </div>

              {/* Llaves extra */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-stone-700">Llaves extra disponibles</p>
                  {form.has_extra_keys && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-stone-400">Precio / llave</span>
                      <input type="number" min="0" step="0.01" placeholder="5.00"
                        value={form.extra_key_price} onChange={(e) => set("extra_key_price", e.target.value)}
                        className="border border-stone-200 rounded-md px-2 py-1 text-[13px] w-20 focus:outline-none focus:ring-2 focus:ring-amber-400/25 focus:border-amber-400 transition-all duration-150" />
                      <span className="text-[11px] text-stone-400">€</span>
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => set("has_extra_keys", !form.has_extra_keys)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-out focus:outline-none ${form.has_extra_keys ? "bg-amber-500" : "bg-stone-200"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-out ${form.has_extra_keys ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>

              {/* Producto activo */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-stone-700">Producto activo</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Visible en la tienda</p>
                </div>
                <button type="button" onClick={() => set("active", !form.active)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-out focus:outline-none ${form.active ? "bg-amber-500" : "bg-stone-200"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-out ${form.active ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </Section>

            <Divider />

            {/* VARIANTES */}
            <Section label={`Variantes (${form.variants.length})`}
              badge={<span className="text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md">✦ Mejora IA</span>}>
              <div className="space-y-3">
                {form.variants.map((v, i) => (
                  <div key={i} className="border border-stone-200 rounded-lg overflow-hidden">
                    {/* Variant header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-b border-stone-100">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">
                        Variante {i + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setVar(i, { active: !v.active })}
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all duration-150
                            ${v.active ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-stone-200 text-stone-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.active ? "bg-white" : "bg-stone-300"}`} />
                          {v.active ? "Activa" : "Inactiva"}
                        </button>
                        {form.variants.length > 1 && (
                          <button type="button" onClick={() => removeVariant(i)}
                            className="p-1 rounded-md text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all duration-150">
                            <CloseIcon size={11} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Variant body */}
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="SKU">
                          <input className={inputBase} placeholder="BOM-SEC-001"
                            value={v.sku} onChange={(e) => setVar(i, { sku: e.target.value })} />
                        </Field>
                        <Field label="Precio (€)">
                          <input className={inputBase} type="number" placeholder="0.00" min="0" step="0.01"
                            value={v.price} onChange={(e) => setVar(i, { price: e.target.value })} />
                        </Field>
                        <Field label="Stock">
                          <select className={`${inputBase} appearance-none`}
                            value={v.stock_status} onChange={(e) => setVar(i, { stock_status: e.target.value })}>
                            {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </Field>
                      </div>

                      <Field label="Imagen">
                        <ImageSlotWithEnhance
                          image={v.image} enhancedUrl={v.enhancedUrl} enhanceStatus={v.enhanceStatus}
                          onFileChange={(file) => setVar(i, { image: file, enhancedUrl: null, enhanceStatus: "idle" })}
                          onEnhance={() => handleEnhanceImage(i)}
                        />
                      </Field>

                      {attributes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">Atributos</p>
                          {attributes.map((attr) => (
                            <div key={attr.id}>
                              <p className="text-[11px] font-medium text-stone-500 mb-1.5">{attr.name}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {attr.values?.map((val) => {
                                  const sel = v.attributes[attr.id]?.includes(val.id);
                                  return (
                                    <button key={val.id} type="button" onClick={() => toggleAttr(i, attr.id, val.id)}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all duration-150
                                        ${sel ? "bg-amber-500 text-white border-amber-500" : "bg-white text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-600"}`}>
                                      {val.value}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addVariant}
                className="flex items-center gap-1.5 mt-1 text-[12px] font-medium text-amber-600 hover:text-amber-700 transition-colors duration-150">
                <PlusIcon size={12} /> Añadir variante
              </button>
            </Section>

            <Divider />

            {/* ACTIONS */}
            <div className="flex items-center gap-2 pt-0.5">
              <button type="button" onClick={() => { setOpen(false); setMessage(""); }}
                className="px-3.5 py-2 rounded-lg border border-stone-200 bg-white text-[12px] font-medium text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 active:bg-stone-100 active:scale-[0.98] transition-all duration-150">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold text-white bg-amber-500 hover:bg-amber-500/90 active:bg-amber-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_1px_3px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-150">
                {loading ? <><SpinnerIcon /><span>Creando…</span></> : <><PlusIcon size={12} /><span>Crear producto</span></>}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}