import { Outlet, Link } from "react-router-dom"

export default function ClientLayout() {
  return (
    <div>
      <nav className=" text-white p-1 flex justify-around">
        <div className=" flex justify-around lg:w-4/5 w-full items-center">
        <h2 className="text-orange-600 font-bold" >Tienda</h2>
        <div className="space-x-4">
            <Link className="text-slate-900 font font-light text-sm hover:text-orange-600 hover:font-bold" to="/">Inicio</Link>
            <Link className="text-slate-900 font font-light text-sm" to="/">Productos</Link>
            <Link className="text-slate-900 font font-light text-sm" to="/">Seguimiento</Link>
            <Link className="text-slate-900 font font-light text-sm" to="/">Informacion</Link>
            <Link className="text-slate-900 font font-light text-sm" to="/">Preguntas Frecuentes</Link>
        </div>
        <div className="space-x-4  flex items-center  px-4 py-1 rounded-3xl">
          <div className=" w-7 h-7 rounded-md border-2 border-orange-600 items-center justify-center flex">
            <svg className="text-orange-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart-icon lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <Link className="text-orange-600 font-bold" to="/register">Register</Link>
        </div>
        </div>
      </nav>
      

      <div className="p-6">
        <Outlet />
      </div>
    </div>
  )
}