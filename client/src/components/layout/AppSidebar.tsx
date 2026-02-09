import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, DollarSign, Truck, 
  FolderTree, ClipboardList, Settings, ChevronLeft, ChevronRight, 
  BarChart3, Receipt, UserCog, FileText, BadgeDollarSign
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function AppSidebar({ collapsed, setCollapsed }: any) {
  const { isManager } = useAuth();

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Categories', path: '/categories', icon: FolderTree },
    { title: 'Products', path: '/products', icon: Package },
    { title: 'Sales', path: '/sales', icon: Receipt },
    { title: 'Customers', path: '/customers', icon: Users },
    { title: 'Suppliers', path: '/suppliers', icon: Truck, managerOnly: true },
    { title: 'Payments', path: '/payments', icon: DollarSign, managerOnly: true },
    { title: 'Expenses', path: '/expenses', icon: BadgeDollarSign },
    { title: 'Inventory', path: '/inventory', icon: ClipboardList, managerOnly: true },
    { title: 'Reports', path: '/reports', icon: BarChart3, managerOnly: true },
    { title: 'Users', path: '/users', icon: UserCog, managerOnly: true },
    { title: 'Audit Logs', path: '/audit-logs', icon: FileText, managerOnly: true },
    { title: 'Settings', path: '/settings', icon: Settings },
  ];

  // Halkan ayaan ku sifeynaa (Filter) menu-ga
  const filteredItems = navItems.filter(item => !item.managerOnly || isManager);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-card border-r z-50 flex flex-col shadow-sm"
    >
      <div className="h-16 flex items-center px-4 border-b">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-primary-foreground" />
        </div>
        {!collapsed && <span className="ml-3 font-bold text-lg tracking-tight">POS System</span>}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "hover:bg-accent text-muted-foreground hover:text-accent-foreground",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? item.title : ""}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", collapsed && "w-6 h-6")} />
            {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <button 
        onClick={() => setCollapsed(!collapsed)} 
        className="p-4 border-t flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
      >
        {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2"><ChevronLeft size={20} /> <span className="text-xs uppercase font-semibold">Collapse</span></div>}
      </button>
    </motion.aside>
  );
}