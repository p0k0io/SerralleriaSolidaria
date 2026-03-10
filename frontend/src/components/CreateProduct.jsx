import { useState } from "react";

export default function CreateProduct() {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState(true);

  const [variants, setVariants] = useState([{ sku: "", price: "", active: true }]);

  const [message, setMessage] = useState("");

  // Agregar nueva fila de variante
  function addVariant() {
    setVariants([...variants, { sku: "", price: "", active: true }]);
  }

  // Eliminar fila de variante
  function removeVariant(index) {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  }

  // Cambiar valor de variante
  function handleVariantChange(index, field, value) {
    const newVariants = [...variants];
    newVariants[index][field] = field === "active" ? value : value;
    setVariants(newVariants);
  }

  // Crear producto + variantes
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      // Crear producto
      const productRes = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, manufacturer, category_id: categoryId, active }),
      });

      if (!productRes.ok) throw new Error("Error al crear producto");
      const productData = await productRes.json();

      // Crear variantes
      for (let variant of variants) {
        if (variant.price === "") continue; // omitir vacíos
        await fetch("http://localhost:8000/api/variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productData.data.id,
            sku: variant.sku,
            price: parseFloat(variant.price),
            active: variant.active,
          }),
        });
      }

      setMessage("Producto y variantes creados con éxito!");

      setName(""); setDescription(""); setManufacturer(""); setCategoryId(""); setActive(true);
      setVariants([{ sku: "", price: "", active: true }]);

    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {message && <p className="text-center text-orange-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">

        {/* Producto */}
        <h2 className="text-lg font-semibold text-slate-800">Crear Producto</h2>
        <input
          className="w-full p-2 border rounded-md"
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded-md"
          placeholder="Descripción"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded-md"
          placeholder="Fabricante"
          value={manufacturer}
          onChange={e => setManufacturer(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded-md"
          placeholder="ID de categoría"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
          />
          <span className="text-slate-700">Activo</span>
        </div>

        {/* Variantes */}
        <h3 className="text-md font-semibold text-slate-800 mt-4">Variantes</h3>
        {variants.map((variant, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">

            <input
              className="flex-1 p-2 border rounded-md"
              placeholder="SKU"
              value={variant.sku}
              onChange={e => handleVariantChange(index, "sku", e.target.value)}
            />
            <input
              className="w-24 p-2 border rounded-md"
              placeholder="Precio"
              type="number"
              step="0.01"
              value={variant.price}
              onChange={e => handleVariantChange(index, "price", e.target.value)}
            />
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={variant.active}
                onChange={e => handleVariantChange(index, "active", e.target.checked)}
              />
              <span className="text-slate-700 text-sm">Activo</span>
            </label>
            {variants.length > 1 && (
              <button type="button" className="text-red-600" onClick={() => removeVariant(index)}>Eliminar</button>
            )}
          </div>
        ))}
        <button type="button" className="text-orange-600 font-medium" onClick={addVariant}>
          + Agregar Variante
        </button>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded-lg mt-4 hover:bg-orange-500 transition"
        >
          Crear Producto
        </button>
      </form>
    </div>
  );
}