import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RequireManager({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || user.role !== 'manager')
    return <Navigate to="/dashboard" replace />;

  return children;
}
