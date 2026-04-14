import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPayment = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:8000/api/stripe/session/${sessionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // si usas Sanctum con token:
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Error verificando pago");
        }

        setStatus(data.status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      checkPayment();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        <h2>Verificando pago...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-500 text-center">
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="p-10 text-center">
      {status === "paid" ? (
        <>
          <h1 className="text-2xl font-bold text-green-600">
            ¡Pago completado!
          </h1>
          <p>Tu pedido ha sido confirmado correctamente.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-yellow-600">
            Pago pendiente
          </h1>
          <p>Estamos verificando tu transacción...</p>
        </>
      )}
    </div>
  );
}