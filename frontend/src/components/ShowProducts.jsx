import { useEffect, useState } from "react";

export default function ShowProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openProduct, setOpenProduct] = useState(null);

  // Obtener productos
  async function getProducts() {
    try {
      const res = await fetch("http://localhost:8000/api/products");
      if (!res.ok) throw new Error("Error al obtener productos");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { getProducts(); }, []);

  // Mostrar / ocultar variantes
  function toggleVariants(id) {
    setOpenProduct(openProduct === id ? null : id);
  }

  if (loading) return <p className="p-6 text-slate-500">Cargando productos...</p>;
  if (error) return <p className="p-6 text-orange-600">Error: {error}</p>;

  return (
    <div className="p-6 space-y-4">

      {products.map(product => (
        <div key={product.name} className="bg-white rounded-xl shadow p-4">

          {/* Producto */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800">{product.name}</h3>
              <p className="text-slate-600">{product.description}</p>
              <p className="text-slate-500">{product.manufacturer} | Categoría: {product.category_id}</p>
              <p className={`mt-1 font-medium ${product.active ? "text-orange-600" : "text-slate-400"}`}>
                {product.active ? "Activo" : "Inactivo"}
              </p>
            </div>

            {/* Botón desplegable */}
            <button
              onClick={() => toggleVariants(product.name)}
              className="text-white bg-orange-600 rounded-full px-4 py-1 hover:bg-orange-500 transition"
            >
              {openProduct === product.name ? "Ocultar" : "Ver"}
            </button>
          </div>

          {/* Variantes */}
          {openProduct === product.name && (
            <div className="mt-4 bg-slate-50 rounded-lg p-3 space-y-2">
              {product.variants?.length > 0 ? (
                product.variants.map(variant => (
                  <div key={variant.sku} className="flex justify-between items-center bg-white rounded-md p-2 shadow-sm">
                    <p className="text-slate-700 font-medium">{variant.sku}</p>
                    <p className="text-slate-600">{variant.price} €</p>
                    <p className={`font-medium ${variant.active ? "text-orange-600" : "text-slate-400"}`}>
                      {variant.active ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center">Sin variantes</p>
              )}
            </div>
          )}

        </div>
      ))}

    </div>
  );
}