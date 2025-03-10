import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import ProfileEditPage from '../features/admin/pages/ProfileEditPage';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../features/auth/context/AuthContext';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      }
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute requireAdmin={true} />,
    children: [
      {
        path: '/admin',
        element: <DashboardPage />
      },
      {
        path: '/admin/dashboard',
        element: <DashboardPage />
      },
      {
        path: '/admin/user/edit/:id',
        element: <ProfileEditPage />
      }
    ]
  }
]);

export default function Routes() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}