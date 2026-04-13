import { useState, useEffect } from "react";

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    manufacturer: "",
    categoryId: "",
    active: true,
    variants: [{ sku: "", price: "", active: true, image: null }],
  });
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);

  // Traer categorías al cargar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/categories");
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleVariantChange = (index, field, value) => {
    const variants = [...form.variants];
    variants[index][field] = value;
    setForm({ ...form, variants });
  };

  const addVariant = () =>
    setForm({
      ...form,
      variants: [...form.variants, { sku: "", price: "", active: true, image: null }],
    });

  const removeVariant = (index) =>
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("manufacturer", form.manufacturer);
      formData.append("category_id", form.categoryId);
      formData.append("active", form.active ? 1 : 0);

      form.variants.forEach((v, i) => {
        formData.append(`variants[${i}][sku]`, v.sku || "");
        formData.append(`variants[${i}][price]`, Number(v.price));
        formData.append(`variants[${i}][active]`, v.active ? 1 : 0);
        if (v.image) formData.append(`variants[${i}][image]`, v.image);
      });

      const res = await fetch("http://localhost:8000/api/products-with-variants", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        console.log(data);
        throw new Error("Error al crear producto");
      }

      await res.json();

      // Limpiar formulario
      setForm({
        name: "",
        description: "",
        manufacturer: "",
        categoryId: "",
        active: true,
        variants: [{ sku: "", price: "", active: true, image: null }],
      });
      setMessage("Producto creado correctamente");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {message && <p className="text-center text-orange-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-slate-800">Crear Producto</h2>

        {/* Inputs normales */}
        {["name", "description", "manufacturer"].map((field, i) => (
          <input
            key={i}
            className="w-full p-2 border rounded-md"
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            required={field === "name"}
          />
        ))}

        {/* Pestañas de categorías */}
        <div className="mt-2">
        <label className="block mb-1 text-sm">Categoría</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`px-4 py-2 rounded-xl border ${
                form.categoryId === cat.id
                  ? "bg-orange-200 text-orange-800 border-orange-300"
                  : "bg-orange-50 text-gray-700 border-orange-200"
              }`}
              onClick={() => handleChange("categoryId", cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        </div>

        <label className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => handleChange("active", e.target.checked)}
          />
          <span className="text-slate-700">Activo</span>
        </label>

        <h3 className="text-md font-semibold text-slate-800 mt-4">Variantes</h3>
        {form.variants.map((v, i) => (
          <div key={i} className="flex items-center space-x-2 mb-2">
            <input
              className="flex-1 p-2 border rounded-md"
              placeholder="SKU"
              value={v.sku}
              onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
            />
            <input
              className="w-24 p-2 border rounded-md"
              placeholder="Precio"
              type="number"
              step="0.01"
              value={v.price}
              onChange={(e) => handleVariantChange(i, "price", e.target.value)}
            />
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={v.active}
                onChange={(e) => handleVariantChange(i, "active", e.target.checked)}
              />
              <span className="text-slate-700 text-sm">Activo</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleVariantChange(i, "image", e.target.files[0])}
            />
            {form.variants.length > 1 && (
              <button type="button" className="text-red-600" onClick={() => removeVariant(i)}>
                Eliminar
              </button>
            )}
          </div>
        ))}
        <button type="button" className="text-orange-600 font-medium" onClick={addVariant}>
          + Agregar Variante
        </button>

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