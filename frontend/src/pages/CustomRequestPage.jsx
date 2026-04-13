import CustomRequestForm from "../components/CustomRequests/CustomRequestForm";

export default function CustomRequestPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
        Solicitud personalizada
      </h1>

      <p className="text-slate-500 mb-6">
        Cuéntanos qué necesitas y te responderemos lo antes posible.
      </p>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <CustomRequestForm />
      </div>
    </div>
  );
}