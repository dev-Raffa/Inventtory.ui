import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { protectedLoader, publicLoader } from './guards/auth-loader';
import { AuthLayout } from '../layouts/auth/auth-layout';
import { SystemLayout } from '../layouts/system/system-layout';
import { SignInPage } from '../features/auth/pages/sign-in';
import { SignUpPage } from '../features/auth/pages/sign-up';
import { ProductsListPage } from '../features/products/pages/product-list';
import { CreateProductPage } from '../features/products/pages/create-product';
import { EditProductPage } from '../features/products/pages/edit-product';
import { ProductDetailsPage } from '../features/products/pages/product-detail';
import { MovementsListPage } from '../features/movements/pages/movements-list';
import { NewStockMovementPage } from '../features/movements/pages/new-movement';
import { PlaceholderPage } from '../components/shared/placeholder-page';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    loader: publicLoader,
    children: [
      {
        path: 'login',
        element: <SignInPage />
      },
      {
        path: 'register',
        element: <SignUpPage />
      },
      {
        path: 'forgot-password',
        element: <PlaceholderPage />
      }
    ]
  },
  {
    path: '/',
    element: <SystemLayout />,
    loader: protectedLoader,
    children: [
      {
        index: true,
        element: <Navigate to="/products" replace />
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductsListPage />
          },
          {
            path: 'create',
            element: <CreateProductPage />
          },
          {
            path: ':productId',
            element: <ProductDetailsPage />
          },
          {
            path: ':productId/edit',
            element: <EditProductPage />
          }
        ]
      },
      {
        path: 'movements',
        children: [
          {
            index: true,
            element: <MovementsListPage />
          },
          {
            path: 'new',
            element: <NewStockMovementPage />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export function AppRouters() {
  return <RouterProvider router={router} />;
}
