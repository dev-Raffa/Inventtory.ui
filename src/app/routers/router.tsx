import { Navigate, Route, Routes } from 'react-router';
//import { AuthLayout } from '../layouts/auth/auth-layout';
import { SystemLayout } from '../layouts/system/system-layout';
import { ProductsListPage } from '../features/products/pages/product-list';
import { CreateProductPage } from '../features/products/pages/create-product';
import { EditProductPage } from '../features/products/pages/edit-product';
import { ProductDetailsPage } from '../features/products/pages/product-detail';
import { PlaceholderPage } from '../components/shared/placeholder-page';

export const AppRouters = () => {
  return (
    <Routes>
      <Route index element={<Navigate to={'/products'} />}></Route>
      <Route element={<SystemLayout />}>
        <Route path="/dashboard" element={<PlaceholderPage />}></Route>
        <Route path="/products">
          <Route index element={<ProductsListPage />} />
          <Route path="create" element={<CreateProductPage />}></Route>
          <Route path=":productId/edit" element={<EditProductPage />}></Route>
          <Route path=":productId" element={<ProductDetailsPage />}></Route>
        </Route>
        <Route path="/inventory" element={<PlaceholderPage />}></Route>
        <Route path="/reports" element={<PlaceholderPage />}></Route>
      </Route>
    </Routes>
  );
};
