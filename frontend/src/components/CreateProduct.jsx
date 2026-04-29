import { useEffect, useState, useRef } from "react";

// ── ICONOS ────────────────────────────────────────────────────────────────────
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

// ── SPINNER ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── FIELD WRAPPER ─────────────────────────────────────────────────────────────
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

// ── CARD WRAPPER ─────────────────────────────────────────────────────────────
function Card({ titulo, children }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-stone-800 mb-4">{titulo}</h3>
      {children}
    </div>
  );
}

export default function CreateProduct() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", manufacturer: "", categoryId: "", active: true, 
    variants: [{ sku: "", price: "", active: true, image: null, attributes: {} }],
  });
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/categories").then(r => r.json()).then(data => setCategories(data.categories));
    fetch("http://localhost:8000/api/attributes").then(r => r.json()).then(setAttributes);
  }, []);

  const showToast = (ok, msg) => {
    clearTimeout(timer.current);
    setToast({ ok, msg });
    timer.current = setTimeout(() => setToast(null), 3200);
  };

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const setVar = (i, f, v) =>
    setForm(p => { const vars = [...p.variants]; vars[i] = { ...vars[i], [f]: v }; return { ...p, variants: vars }; });

  const toggleAttr = (vi, aid, vid) =>
    setForm(p => {
      const vars = [...p.variants];
      const cur = vars[vi].attributes[aid] || [];
      vars[vi] = { ...vars[vi], attributes: { ...vars[vi].attributes, [aid]: cur.includes(vid) ? cur.filter(x => x !== vid) : [...cur, vid] } };
      return { ...p, variants: vars };
    });

  const addVariant = () => setForm(p => ({ ...p, variants: [...p.variants, { sku: "", price: "", active: true, image: null, attributes: {} }] }));
  const removeVariant = (i) => setForm(p => ({ ...p, variants: p.variants.filter((_, j) => j !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name); fd.append("description", form.description);
      fd.append("manufacturer", form.manufacturer); fd.append("category_id", form.categoryId);
      fd.append("active", form.active ? 1 : 0);
      form.variants.forEach((v, i) => {
        fd.append(`variants[${i}][sku]`, v.sku);
        fd.append(`variants[${i}][price]`, Number(v.price));
        fd.append(`variants[${i}][active]`, v.active ? 1 : 0);
        if (v.image) fd.append(`variants[${i}][image]`, v.image);
        Object.entries(v.attributes).forEach(([a, vals]) =>
          vals.forEach((vId, j) => fd.append(`variants[${i}][attributes][${a}][${j}]`, vId)));
      });
      const res = await fetch("http://localhost:8000/api/products/products-with-variants", { method: "POST", body: fd });
      if (!res.ok) throw new Error("No se pudo crear el producto");
      showToast(true, "Producto creado correctamente");
      setForm({ name: "", description: "", manufacturer: "", categoryId: "", active: true, variants: [{ sku: "", price: "", active: true, image: null, attributes: {} }] });
    } catch (err) { showToast(false, err.message); }
    setLoading(false);
  };

  const isSuccess = toast?.ok;
  const isError = toast && !toast.ok;

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
        open
          ? "border-orange-200 shadow-lg shadow-orange-50"
          : "border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200"
      }`}
      style={{ boxShadow: open ? "0 4px 24px rgba(251,146,60,0.10), 0 1px 4px rgba(0,0,0,0.04)" : undefined }}
    >
      {/* ── HEADER TOGGLE ── */}
      <button
        type="button"
        onClick={() => { setOpen(!open); if (open) setToast(null); }}
        className="w-full flex items-center gap-4 px-5 py-4 text-left group"
      >
        {/* Accent strip */}
        <div
          className={`w-1 h-10 rounded-full transition-all duration-300 ${
            open ? "bg-gradient-to-b from-orange-400 to-orange-500" : "bg-stone-200 group-hover:bg-stone-300"
          }`}
        />

        {/* Icon badge */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            open
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-stone-100 text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-500"
          }`}
        >
          <PlusIcon />
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className={`font-semibold text-sm transition-colors ${open ? "text-stone-900" : "text-stone-700"}`}>
            Crear producto
          </p>
          <p className="text-stone-400 text-xs mt-0.5">Nombre, descripción, variantes y atributos</p>
        </div>

        {/* Chevron */}
        <span className="text-stone-300 group-hover:text-stone-400 transition-colors">
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* ── FORM ── */}
      {open && (
        <div className="border-t border-stone-100 px-5 py-5 space-y-4">

          {/* Feedback */}
          {(isSuccess || isError) && (
            <div
              className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              <span className="mt-0.5 flex-shrink-0">
                {isSuccess ? <CheckIcon /> : <AlertIcon />}
              </span>
              <span>
                {isSuccess
                  ? <>Producto creado correctamente</>
                  : toast.msg}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Info general */}
            <Card titulo="Información general">
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Nombre" required>
                  <input className={inp} placeholder="Ej. Bombín de seguridad" value={form.name} onChange={e => set("name", e.target.value)} required />
                </Campo>
                <Campo label="Fabricante">
                  <input className={inp} placeholder="Ej. Yale" value={form.manufacturer} onChange={e => set("manufacturer", e.target.value)} />
                </Campo>
              </div>
              <Campo label="Descripción">
                <textarea className={`${inp} resize-none h-20`} placeholder="Descripción breve…" value={form.description} onChange={e => set("description", e.target.value)} />
              </Campo>
              <Campo label="Categoría" required>
                <select className={`${inp} appearance-none`} value={form.categoryId} onChange={e => set("categoryId", e.target.value)} required>
                  <option value="">Seleccionar categoría…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Campo>
            </Card>

            {/* Variantes */}
            <Card titulo={`Variantes (${form.variants.length})`}>
              <div className="space-y-3">
                {form.variants.map((v, i) => (
                  <div key={i} className="bg-slate-50 border border-orange-200 rounded-xl p-5 space-y-4">

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
                        <input className={inp} placeholder="BOM-SEC-001" value={v.sku} onChange={e => setVar(i, "sku", e.target.value)} />
                      </Campo>
                      <Campo label="Precio (€)">
                        <input className={inp} type="number" placeholder="0.00" min="0" step="0.01" value={v.price} onChange={e => setVar(i, "price", e.target.value)} />
                      </Campo>
                      <Campo label="Estado">
                        <button type="button" onClick={() => setVar(i, "active", !v.active)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${v.active ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-orange-200 text-orange-400"}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${v.active ? "bg-white" : "bg-orange-300"}`} />
                          {v.active ? "Activo" : "Inactivo"}
                        </button>
                      </Campo>
                    </div>

                    {/* Imagen */}
                    <Campo label="Imagen">
                      <label className="block border-2 border-dashed border-orange-200 rounded-xl overflow-hidden cursor-pointer hover:border-orange-400 transition">
                        <input type="file" accept="image/*" className="hidden" onChange={e => setVar(i, "image", e.target.files[0])} />
                        {v.image
                          ? <img src={URL.createObjectURL(v.image)} alt="" className="w-full h-28 object-cover" />
                          : <div className="flex flex-col items-center justify-center gap-2 py-7">
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fdba74" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              <span className="text-xs font-medium text-orange-300">Arrastra o haz clic</span>
                            </div>
                        }
                      </label>
                    </Campo>

                    {/* Atributos */}
                    {attributes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Atributos</p>
                        <div className="space-y-3">
                          {attributes.map(attr => (
                            <div key={attr.id}>
                              <p className="text-xs font-semibold text-gray-500 mb-1.5">{attr.name}</p>
                              <div className="flex flex-wrap gap-2">
                                {attr.values?.map(val => {
                                  const sel = v.attributes[attr.id]?.includes(val.id);
                                  return (
                                    <button key={val.id} type="button" onClick={() => toggleAttr(i, attr.id, val.id)}
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
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-orange-300 text-orange-500 text-sm font-semibold hover:bg-orange-100 transition">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Añadir variante
              </button>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setToast(null); }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600
                  hover:bg-stone-50 hover:border-stone-300 transition-colors duration-150"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-orange-500
                  hover:bg-orange-400
                  active:bg-orange-600
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-sm shadow-orange-200 transition-all duration-150"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Creando…
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Crear producto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ——— helpers ——— */
