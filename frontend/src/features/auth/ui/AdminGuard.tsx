import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store/authStore'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const user = useAuthStore((s) => s.user)
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return <Navigate to="/pos" replace />
  }
  return <>{children}</>
}
