import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./components/auth/Login"
import Register from "./components/auth/Register"

import Home from "./pages/Home"
import CustomRequestPage from "./pages/CustomRequestPage"
import Information from "./pages/Information"
import FAQ from "./pages/FAQ"
import Categories from "./pages/Categories"
import Profile from "./pages/Profile"

import Dashboard from "./pages/admin/Dashboard"
import Products from "./pages/admin/Products"
import Packs from "./pages/admin/Packs"
import CategoryAdmin from "./pages/admin/Categories"
import Carrito from "./pages/admin/Carrito"
import AttributeManager from "./pages/admin/Attributes"
import RequestsList from "./pages/admin/RequestsList"
import Orders from "./pages/admin/OrdersBoards"

import ClientLayout from "./layouts/ClientLayout"
import AdminLayout from "./layouts/AdminLayout"
import AdminRoute from "./components/auth/AdminRoute"   // ← NUEVO

import Success from "./pages/Success"
import { CartProvider } from "./components/shoppingCart/CartContext"
import OrderTracking from "./components/orders/Ordertracking"
import MyOrders from "./components/orders/MyOrder"

function App() {
  const authToken = localStorage.getItem("token")

  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>

          {/* ── CLIENTE ───────────────────────────────────────────────── */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="informacion" element={<Information />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="carrito" element={<Carrito />} />
            <Route path="solicitud" element={<CustomRequestPage />} />
            <Route path="seguimiento" element={<OrderTracking />} />
            <Route path="seguimiento/:tracking" element={<OrderTracking />} />
            <Route path="mis-pedidos" element={<MyOrders token={authToken} />} />
            <Route path="perfil" element={<Profile />} />
          </Route>

          {/* ── AUTH ──────────────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── ADMIN — protegido por AdminRoute ──────────────────────── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard"  element={<Dashboard />} />
              <Route path="products"   element={<Products />} />
              <Route path="packs"      element={<Packs />} />
              <Route path="categories" element={<CategoryAdmin />} />
              <Route path="cart"       element={<Carrito />} />
              <Route path="attributes" element={<AttributeManager />} />
              <Route path="requests"   element={<RequestsList />} />
              <Route path="orders"     element={<Orders />} />
            </Route>
          </Route>

          {/* ── SUCCESS ───────────────────────────────────────────────── */}
          <Route path="/success" element={<Success />} />

        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App