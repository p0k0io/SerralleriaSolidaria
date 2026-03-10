import { useState } from "react";

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    manufacturer: "",
    categoryId: "",
    active: true,
    variants: [{ sku: "", price: "", active: true }],
  });
  const [message, setMessage] = useState("");

  // Cambiar valor del producto
  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  // Cambiar valor de variante
  const handleVariantChange = (index, field, value) => {
    const variants = [...form.variants];
    variants[index][field] = value;
    setForm({ ...form, variants });
  };

  // Agregar/eliminar variantes
  const addVariant = () =>
    setForm({ ...form, variants: [...form.variants, { sku: "", price: "", active: true }] });
  const removeVariant = (index) =>
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/api/products-with-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          manufacturer: form.manufacturer,
          category_id: form.categoryId,
          active: form.active,
          variants: form.variants.filter(v => v.price !== ""),
        }),
      });
      if (!res.ok) throw new Error("Error al crear producto");
      await res.json();
      
      setForm({
        name: "",
        description: "",
        manufacturer: "",
        categoryId: "",
        active: true,
        variants: [{ sku: "", price: "", active: true }],
      });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {message && <p className="text-center text-orange-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-slate-800">Crear Producto</h2>

        {["name","description","manufacturer","categoryId"].map((field, i) => (
          <input
            key={i}
            className="w-full p-2 border rounded-md"
            placeholder={field === "categoryId" ? "ID de categoría" : field.charAt(0).toUpperCase()+field.slice(1)}
            value={form[field]}
            onChange={e => handleChange(field, e.target.value)}
            required={field==="name" || field==="categoryId"}
          />
        ))}

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.active} onChange={e => handleChange("active", e.target.checked)} />
          <span className="text-slate-700">Activo</span>
        </label>

        <h3 className="text-md font-semibold text-slate-800 mt-4">Variantes</h3>
        {form.variants.map((v, i) => (
          <div key={i} className="flex items-center space-x-2 mb-2">
            <input
              className="flex-1 p-2 border rounded-md"
              placeholder="SKU"
              value={v.sku}
              onChange={e => handleVariantChange(i, "sku", e.target.value)}
            />
            <input
              className="w-24 p-2 border rounded-md"
              placeholder="Precio"
              type="number"
              step="0.01"
              value={v.price}
              onChange={e => handleVariantChange(i, "price", e.target.value)}
            />
            <label className="flex items-center space-x-1">
              <input type="checkbox" checked={v.active} onChange={e => handleVariantChange(i, "active", e.target.checked)} />
              <span className="text-slate-700 text-sm">Activo</span>
            </label>
            {form.variants.length > 1 && (
              <button type="button" className="text-red-600" onClick={() => removeVariant(i)}>Eliminar</button>
            )}
          </div>
        ))}
        <button type="button" className="text-orange-600 font-medium" onClick={addVariant}>+ Agregar Variante</button>

        <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg mt-4 hover:bg-orange-500 transition">
          Crear Producto
        </button>
      </form>
    </div>
  );
}