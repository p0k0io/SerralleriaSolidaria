import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import UrgentsOrders from "../../components/dashboard/UrgentOrders";
import LowStock from "../../components/dashboard/LowStock";
import TopProducts from "../../components/dashboard/TopProducts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading dashboard:", err);
        setError("No se pudieron cargar los datos del dashboard");
        setLoading(false);
      });
  }, []);

  // Mensaje si alguna lista está vacía
  const renderEmptyMessage = (list, message) => {
    return list && list.length === 0 ? <p>{message}</p> : null;
  };

  return (
    <DashboardLayout>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            {renderEmptyMessage(data?.urgent_orders, "No hay pedidos urgentes")}
            <UrgentsOrders orders={data?.urgent_orders || []} />

            {renderEmptyMessage(data?.low_stock, "No hay productos con bajo stock")}
            <LowStock products={data?.low_stock || []} />
          </div>

          <div className="mt-6">
            {renderEmptyMessage(data?.top_products, "No hay productos destacados")}
            <TopProducts products={data?.top_products || []} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}