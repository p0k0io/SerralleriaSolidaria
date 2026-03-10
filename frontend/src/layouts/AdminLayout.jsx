import { Outlet, Link } from "react-router-dom"

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-800 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
        <nav className="space-y-3">
          <Link to="/admin/dashboard" className="block">
            Dashboard
          </Link>
          <Link to="/admin/products" className="block">
          Gestion Producto
          </Link>
          <Link to="/admin/packs" className="block">
          Gestion Packs
          </Link>
          <Link to="/admin/categories" className="block">
            Gestión Categorías
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-gray-100">
        <Outlet />
      </main>
    </div>
  )
}