import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import ProductEdit from './pages/admin/ProductEdit';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Settings from './pages/admin/Settings';

export default function App() {
  return (
    <Routes>
      {/* ---------- shop ---------- */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:orderNumber" element={<OrderSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ---------- admin ---------- */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductEdit />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
