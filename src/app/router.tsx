import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AdminIdeasPage } from '../features/admin/AdminIdeasPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { MyIdeasPage } from '../features/ideas/MyIdeasPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <MyIdeasPage />
      },
      {
        path: 'admin',
        element: <AdminIdeasPage />
      }
    ]
  }
]);
