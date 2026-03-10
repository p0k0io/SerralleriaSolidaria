import { useState, useEffect } from "react";

export default function CreatePack() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [variants, setVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([
    { variant_id: "", quantity: 1 }
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para las categorías del pack
  const [categoryInput, setCategoryInput] = useState("");
  const [packCategories, setPackCategories] = useState([]);

  // Cargar variantes disponibles al montar el componente
  useEffect(() => {
    fetch("http://localhost:8000/api/variants")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Variantes recibidas:", data);
        const variantsWithDisplay = data.map(variant => ({
          ...variant,
          display: variant.display || 
            `${variant.product?.name || 'Producto sin nombre'} - SKU: ${variant.sku || 'N/A'} - $${variant.price}`
        }));
        setVariants(variantsWithDisplay);
      })
      .catch(err => {
        console.error("Error cargando variantes:", err);
        setMessage("Error al cargar las variantes");
      });
  }, []);

  // Agregar nueva fila de variante
  function addVariantRow() {
    setSelectedVariants([...selectedVariants, { variant_id: "", quantity: 1 }]);
  }

  // Eliminar fila
  function removeVariantRow(index) {
    const newVariants = selectedVariants.filter((_, i) => i !== index);
    setSelectedVariants(newVariants);
  }

  // Cambiar valores en las filas
  function handleVariantChange(index, field, value) {
    const newVariants = [...selectedVariants];
    newVariants[index][field] = value;
    setSelectedVariants(newVariants);
  }

  // Funciones para manejar categorías
  function handleAddCategory() {
    const trimmed = categoryInput.trim();
    if (trimmed && !packCategories.includes(trimmed)) {
      setPackCategories([...packCategories, trimmed]);
      setCategoryInput("");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  }

  function removeCategory(catToRemove) {
    setPackCategories(packCategories.filter(cat => cat !== catToRemove));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Filtrar filas que no tengan variante seleccionada
    const items = selectedVariants.filter(v => v.variant_id !== "");

    if (items.length === 0) {
      setMessage("Debes seleccionar al menos una variante");
      setLoading(false);
      return;
    }

    // Validar que todos los campos necesarios estén llenos
    if (!name.trim()) {
      setMessage("El nombre del pack es obligatorio");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/packs", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          active,
          categories: packCategories, // <-- Aquí enviamos las categorías
          items: items.map(item => ({
            variant_id: parseInt(item.variant_id),
            quantity: parseInt(item.quantity) || 1
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al crear el pack");
      }

      setMessage(`Pack "${data.name || name}" creado con éxito!`);

      // Resetear formulario
      setName("");
      setDescription("");
      setActive(true);
      setSelectedVariants([{ variant_id: "", quantity: 1 }]);
      setPackCategories([]); // Limpiar categorías

    } catch (err) {
      console.error("Error en submit:", err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Crear Nuevo Pack</h1>

      {message && (
        <div className={`text-center p-3 rounded ${
          message.includes("éxito") || message.includes("éxito") 
            ? "bg-green-100 text-green-700 border border-green-400" 
            : "bg-red-100 text-red-700 border border-red-400"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">

        {/* Datos del pack */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre del Pack *
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Ej: Pack de herramientas básico"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descripción
          </label>
          <textarea
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Descripción del pack..."
            rows="3"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="text-sm text-slate-700">
            Pack activo (visible en tienda)
          </label>
        </div>

        {/* Sección de categorías del pack */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Categorías del Pack
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Ej: escudos, morado, oferta..."
              value={categoryInput}
              onChange={e => setCategoryInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-500 transition"
            >
              +
            </button>
          </div>

          {/* Mostrar categorías como chips */}
          {packCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {packCategories.map(cat => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="ml-1 text-orange-600 hover:text-orange-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Selección de variantes */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Variantes incluidas en el pack
          </h2>

          {variants.length === 0 && (
            <p className="text-sm text-gray-500 mb-3">
              Cargando variantes...
            </p>
          )}

          {selectedVariants.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-3">
              <select
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                value={item.variant_id}
                onChange={e => handleVariantChange(index, "variant_id", e.target.value)}
                required
              >
                <option value="">Seleccionar variante...</option>
                {variants.map(variant => (
                  <option key={variant.id} value={variant.id}>
                    {variant.display}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                step="1"
                className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Cant."
                value={item.quantity}
                onChange={e => handleVariantChange(index, "quantity", parseInt(e.target.value) || 1)}
                required
              />

              {selectedVariants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariantRow(index)}
                  className="text-red-600 hover:text-red-800 px-2 font-bold text-lg"
                  title="Eliminar variante"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addVariantRow}
            className="text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 mt-2"
          >
            <span className="text-xl">+</span> Agregar otra variante
          </button>
        </div>

        {/* Botón submit */}
        <button
          type="submit"
          disabled={loading || variants.length === 0}
          className={`w-full py-2 rounded-lg mt-6 transition font-medium ${
            loading || variants.length === 0
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-orange-600 hover:bg-orange-500 text-white"
          }`}
        >
          {loading ? "Creando..." : variants.length === 0 ? "Cargando..." : "Crear Pack"}
        </button>
      </form>
    </div>
  );
}