import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"

import Dashboard from "./pages/admin/Dashboard"
import Products from "./pages/admin/Products" 
import Packs from "./pages/admin/Packs"

import ClientLayout from "./layouts/ClientLayout"
import AdminLayout from "./layouts/AdminLayout"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* CLIENTE */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products/>} />
          <Route path ="packs" element ={<Packs/>}/>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App