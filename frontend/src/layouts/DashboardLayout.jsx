export default function DashboardLayout({ children }) {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Bienvenido <span className="text-orange-500">ADMIN</span>
      </h1>
      {children}
    </div>
  );
}