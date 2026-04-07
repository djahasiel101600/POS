import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/login'
import { PosPage } from '@/pages/pos'
import { ProductsPage } from '@/pages/products'
import { CategoriesPage } from '@/pages/categories'
import { InventoryPage } from '@/pages/inventory'
import { ReportsPage } from '@/pages/reports'
import { UsersPage } from '@/pages/users'
import { SettingsPage } from '@/pages/settings'
import { SalesHistoryPage } from '@/pages/sales-history'
import { AuthGuard } from '@/features/auth/ui/AuthGuard'
import { AdminGuard } from '@/features/auth/ui/AdminGuard'
import { AppLayout } from '@/widgets/layout/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/pos" replace /> },
      { path: 'pos', element: <PosPage /> },
      { path: 'sales', element: <SalesHistoryPage /> },
      {
        path: 'products',
        element: (
          <AdminGuard>
            <ProductsPage />
          </AdminGuard>
        ),
      },
      {
        path: 'categories',
        element: (
          <AdminGuard>
            <CategoriesPage />
          </AdminGuard>
        ),
      },
      {
        path: 'inventory',
        element: (
          <AdminGuard>
            <InventoryPage />
          </AdminGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <AdminGuard>
            <ReportsPage />
          </AdminGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <AdminGuard>
            <UsersPage />
          </AdminGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <AdminGuard>
            <SettingsPage />
          </AdminGuard>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
