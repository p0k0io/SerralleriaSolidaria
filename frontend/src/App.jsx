import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./components/auth/Login"
import Register from "./components/auth/Register"


import Home from "./pages/Home"
import CustomRequestPage from "./pages/CustomRequestPage";
import Information from "./pages/Information"
import FAQ from "./pages/FAQ"
import Categories from "./pages/Categories"

import Dashboard from "./pages/admin/Dashboard"
import Products from "./pages/admin/Products" 
import Packs from "./pages/admin/Packs"
import CategoryAdmin from "./pages/admin/Categories"


import ClientLayout from "./layouts/ClientLayout"
import AdminLayout from "./layouts/AdminLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import Carrito from "./pages/admin/Carrito"
import AttributeManager from "./components/AttributeManager"


import RequestsList from "./pages/admin/RequestsList";
import Orders from "./pages/admin/OrdersBoards"


import Success from "./pages/Success"
import { CartProvider } from "./components/shoppingCart/CartContext"
import OrderTracking from "./components/orders/Ordertracking";
import OrdersPage from "./components/orders/Orderspage";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* CLIENTE */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="informacion" element={<Information />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="carrito" element={<Carrito />} />
            <Route path="atr" element={<AttributeManager />} />
            <Route path="solicitud" element={<CustomRequestPage />} />
            <Route path="/seguimiento" element={<OrderTracking />} />
            <Route path="mis-pedidos" element={<OrdersPage />} />

          </Route>

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="packs" element={<Packs />} />
            <Route path="categories" element={<CategoryAdmin />} />
            <Route path="cart" element={<Carrito />} />
            <Route path="requests" element={<RequestsList />} />
            <Route path="orders" element={<Orders />} />
          </Route>
          <Route path="/success" element={<Success />} />

        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;