import { useEffect, useState } from "react";

export default function ShowPacks() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPack, setOpenPack] = useState(null);

  // Obtener packs
  async function getPacks() {
    try {
      const res = await fetch("http://localhost:8000/api/packs");
      if (!res.ok) throw new Error("Error al obtener packs");
      const data = await res.json();
      setPacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { getPacks(); }, []);

  // Mostrar / ocultar variantes del pack
  function togglePack(id) {
    setOpenPack(openPack === id ? null : id);
  }

  if (loading) return <p className="p-6 text-slate-500">Cargando packs...</p>;
  if (error) return <p className="p-6 text-orange-600">Error: {error}</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Listado de Packs</h2>

      {packs.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No hay packs disponibles</p>
      ) : (
        packs.map(pack => (
          <div key={pack.id} className="bg-white rounded-xl shadow p-4">

            {/* Pack */}
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-800 text-lg">{pack.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    pack.active 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {pack.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                
                {pack.description && (
                  <p className="text-slate-600 mt-1">{pack.description}</p>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>Total variantes: {pack.items?.length || 0}</span>
                  <span>Precio total: {pack.total_price?.toFixed(2) || '0.00'} €</span>
                </div>
              </div>

              {/* Botón desplegable */}
              <button
                onClick={() => togglePack(pack.id)}
                className="text-white bg-orange-600 rounded-full px-4 py-1 hover:bg-orange-500 transition text-sm font-medium"
              >
                {openPack === pack.id ? "Ocultar" : "Ver variantes"}
              </button>
            </div>

            {/* Variantes del pack */}
            {openPack === pack.id && (
              <div className="mt-4 bg-slate-50 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Variantes incluidas:</h4>
                
                {pack.items?.length > 0 ? (
                  pack.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white rounded-md p-3 shadow-sm">
                      <div className="flex-1">
                        <p className="text-slate-800 font-medium">
                          {item.variant?.product?.name || 'Producto'}
                        </p>
                        <div className="flex items-center gap-3 text-sm mt-1">
                          <span className="text-slate-600">SKU: {item.variant?.sku || 'N/A'}</span>
                          <span className="text-slate-600">Cantidad: {item.quantity}</span>
                          <span className="text-orange-600 font-medium">
                            {item.variant?.price ? (item.variant.price * item.quantity).toFixed(2) : '0.00'} €
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.variant?.active 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.variant?.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">Este pack no tiene variantes</p>
                )}

                {/* Resumen del pack */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Total variantes:</span>
                    <span className="font-medium text-slate-800">{pack.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-slate-600">Precio total:</span>
                    <span className="font-medium text-orange-600">
                      {pack.total_price?.toFixed(2) || '0.00'} €
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        ))
      )}
    </div>
  );
}