import { Navigate, Route, Routes } from 'react-router';
//import { AuthLayout } from '../layouts/auth/auth-layout';
import { SystemLayout } from '../layouts/system/system-layout';
import { ProductsListPage } from '../features/products/pages/product-list';
import { CreateProductPage } from '../features/products/pages/create-product';
import { EditProductPage } from '../features/products/pages/edit-product';
import { ProductDetailsPage } from '../features/products/pages/product-detail';
import { PlaceholderPage } from '../components/shared/placeholder-page';
import { MovementsListPage } from '../features/movements/pages/movements-list';
import { NewStockMovementPage } from '../features/movements/pages/new-movement';

export const AppRouters = () => {
  return (
    <Routes>
      <Route index element={<Navigate to={'/products'} />}></Route>
      <Route element={<SystemLayout />}>
        <Route path="/users" element={<PlaceholderPage />}></Route>
        <Route path="/products">
          <Route index element={<ProductsListPage />} />
          <Route path="create" element={<CreateProductPage />}></Route>
          <Route path=":productId/edit" element={<EditProductPage />}></Route>
          <Route path=":productId" element={<ProductDetailsPage />}></Route>
        </Route>
        <Route path="/movements">
          <Route index element={<MovementsListPage />} />
          <Route path="new" element={<NewStockMovementPage />}></Route>
        </Route>
        <Route path="/catalogs" element={<PlaceholderPage />}></Route>
      </Route>
    </Routes>
  );
};
