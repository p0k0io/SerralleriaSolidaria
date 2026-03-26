import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"

import Dashboard from "./pages/admin/Dashboard"
import Products from "./pages/admin/Products" 
import Packs from "./pages/admin/Packs"
import Categories from "./pages/admin/Categories"
import CartPage from "./pages/admin/CartPage"

import ClientLayout from "./layouts/ClientLayout"
import AdminLayout from "./layouts/AdminLayout"
import DashboardLayout from "./layouts/DashboardLayout"


import { CartProvider } from "./components/shoppingCart/CartContext"

function App() {
  return (
    <BrowserRouter>

      <CartProvider>

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
            <Route path="products" element={<Products />} />
            <Route path="packs" element={<Packs />} />
            <Route path="categories" element={<Categories />} />
            <Route path="cart" element={<CartPage />} />
          </Route>

        </Routes>

      </CartProvider>

    </BrowserRouter>
  )
}

export default App