import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        collapsed ? "pl-20" : "pl-[260px]"
      )}>
        <Header />
        <main className="p-6 flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}