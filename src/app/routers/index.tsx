import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { protectedLoader, publicLoader } from './guards/auth-loader';

import { AuthLayout } from '../layouts/auth/auth-layout';
import { SystemLayout } from '../layouts/system/system-layout';

const SignInPage = lazy(() =>
  import('../features/auth/pages/sign-in').then((m) => ({
    default: m.SignInPage
  }))
);

const SignUpPage = lazy(() =>
  import('../features/auth/pages/sign-up').then((m) => ({
    default: m.SignUpPage
  }))
);

const ProductsListPage = lazy(() =>
  import('../features/products/pages/product-list').then((m) => ({
    default: m.ProductsListPage
  }))
);

const CreateProductPage = lazy(() =>
  import('../features/products/pages/create-product').then((m) => ({
    default: m.CreateProductPage
  }))
);

const EditProductPage = lazy(() =>
  import('../features/products/pages/edit-product').then((m) => ({
    default: m.EditProductPage
  }))
);

const ProductDetailsPage = lazy(() =>
  import('../features/products/pages/product-detail').then((m) => ({
    default: m.ProductDetailsPage
  }))
);

const MovementsListPage = lazy(() =>
  import('../features/movements/pages/movements-list').then((m) => ({
    default: m.MovementsListPage
  }))
);

const NewStockMovementPage = lazy(() =>
  import('../features/movements/pages/new-movement').then((m) => ({
    default: m.NewStockMovementPage
  }))
);

const PlaceholderPage = lazy(() =>
  import('../components/shared/placeholder-page').then((m) => ({
    default: m.PlaceholderPage
  }))
);

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthLayout />
      </Suspense>
    ),
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
    element: (
      <Suspense fallback={<PageLoader />}>
        <SystemLayout />
      </Suspense>
    ),
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
