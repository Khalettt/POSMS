import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/Products";
import SalesPage from "./pages/Sales";
import CategoriesPage from "./pages/Categories";
import CustomersPage from "./pages/Customers";
import ExpensesPage from "./pages/Expenses";
import SuppliersPage from "./pages/Suppliers";
import POSpage from "./pages/POSpage";
import PaymentsPage from "./pages/payments";
import InventoryPage from "./pages/inventoryPage";
import ReportsPage from "./pages/Reports";
import AuditLogsPage from "./pages/AuditLogs";
import UsersPage from "./pages/Users";
import SettingsPage from "./pages/settings";
import NotFound from "./pages/NotFound";
import { RequireManager } from "./components/RequireManager";
import ProductFormPage from "./pages/ProductForm";
import ProductForm from "./pages/ProductForm";
import ExpenseFormPage from "./pages/ExpenseForm";
const queryClient = new QueryClient();

// Xanibaadda Bogagga Manager-ka oo kaliya
const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isManager, isLoading, user } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  
  return isManager ? children : <Navigate to="/dashboard" replace />;
};

// Xanibaadda Dadka aan gashanayn (Not Logged In)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pos" element={<POSpage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/products/:id/edit" element={<ProductFormPage />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/expenses/new" element={<ExpenseFormPage />} />


                {/* Restricted Routes (Manager Only) */}
                <Route path="/users" element={<ManagerRoute>
                  <RequireManager><UsersPage /></RequireManager></ManagerRoute>} />
                <Route path="/suppliers" element={<ManagerRoute><SuppliersPage /></ManagerRoute>} />
                <Route path="/inventory" element={<ManagerRoute><InventoryPage /></ManagerRoute>} />
                <Route path="/reports" element={<ManagerRoute><ReportsPage /></ManagerRoute>} />
                <Route path="/audit-logs" element={<ManagerRoute><AuditLogsPage /></ManagerRoute>} />
                <Route path="/payments" element={<ManagerRoute><PaymentsPage /></ManagerRoute>} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;