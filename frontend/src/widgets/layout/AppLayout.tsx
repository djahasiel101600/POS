import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store/authStore'
import { authApi } from '@/features/auth/api/authApi'
import { REFRESH_TOKEN_KEY } from '@/shared/config'
import {
  ShoppingCart, Package, Tag, ArchiveX, BarChart3,
  Users, Settings, LogOut, LayoutGrid,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const allNavItems = [
  { to: '/pos', label: 'POS', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
  { to: '/sales', label: 'Sales', icon: LayoutGrid, roles: ['admin', 'manager', 'cashier'] },
  { to: '/products', label: 'Products', icon: Package, roles: ['admin', 'manager'] },
  { to: '/categories', label: 'Categories', icon: Tag, roles: ['admin', 'manager'] },
  { to: '/inventory', label: 'Inventory', icon: ArchiveX, roles: ['admin', 'manager'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
]

export function AppLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const navItems = allNavItems.filter((item) => user && item.roles.includes(user.role))

  const handleLogout = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (refresh) {
      try { await authApi.logout(refresh) } catch { /* ignore */ }
    }
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 bg-card border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h1 className="hidden md:block text-lg font-bold text-primary">POS System</h1>
          <div className="md:hidden text-center text-primary font-bold text-lg">P</div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon size={20} />
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="hidden md:block mb-2">
            <p className="text-xs font-semibold truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
