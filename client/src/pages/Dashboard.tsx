import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  todaySales: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
}

// ... interfaces kale waa sidiisii

export default function Dashboard() {
  const { user, isManager } = useAuth(); // Waxaan soo qaadnay isManager
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0, totalRevenue: 0, totalExpenses: 0, profit: 0,
    totalProducts: 0, lowStockProducts: 0, totalCustomers: 0,
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('pos_token'); 
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data && data.stats) {
        setStats({
          todaySales: Number(data.stats.todaySales || 0),
          totalRevenue: Number(data.stats.totalRevenue || 0),
          totalExpenses: Number(data.stats.totalExpenses || 0),
          profit: Number(data.stats.totalRevenue || 0) - Number(data.stats.totalExpenses || 0),
          totalProducts: Number(data.stats.totalProducts || 0),
          lowStockProducts: Number(data.stats.lowStockCount || 0),
          totalCustomers: Number(data.stats.totalCustomers || 0),
        });
      }
      setRecentSales(data.recentSales || []);
      setSalesData(data.salesChart || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.fullName}!</h1>
          <p className="text-muted-foreground">Role: <span className="capitalize font-semibold">{user?.role}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Qof walba wuxuu arkaa Today's Sales */}
        <StatCard title="Today's Sales" value={formatCurrency(stats.todaySales)} icon={ShoppingCart} variant="blue" />
        
        {/* KALIYA Manager-ka ayaa arki kara Revenue, Expenses, iyo Profit */}
        {isManager && (
          <>
            <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} variant="green" />
            <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpenses)} icon={DollarSign} variant="amber" />
            <StatCard title="Net Profit" value={formatCurrency(stats.profit)} icon={TrendingUp} variant={stats.profit >= 0 ? 'cyan' : 'red'} />
          </>
        )}
      </div>

      {/* Haddii uu yahay Cashier, waxaa loo tusaayaa xog kale oo isaga khuseysa */}
      {!isManager && (
         <div className="p-10 border-2 border-dashed rounded-xl text-center">
            <h2 className="text-xl font-medium">Cashier Mode Active</h2>
            <p className="text-muted-foreground">Financial reports are restricted to management only.</p>
         </div>
      )}

      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart iyo Recent Sales halkan ku dhex jiraan oo Manager kaliya arko */}
            <Card><CardHeader><CardTitle>Sales Chart</CardTitle></CardHeader>
            <CardContent><div className="h-[300px]"><ResponsiveContainer>
                <AreaChart data={salesData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Area type="monotone" dataKey="amount" fill="#3b82f6"/></AreaChart>
            </ResponsiveContainer></div></CardContent></Card>
            
            <Card><CardHeader><CardTitle>Recent Sales</CardTitle></CardHeader>
            <CardContent>
                {recentSales.map((sale: any) => (
                    <div key={sale.id} className="flex justify-between border-b py-2 text-sm">
                        <span>{sale.invoice_number}</span>
                        <span className="font-bold">{formatCurrency(sale.total_amount)}</span>
                    </div>
                ))}
            </CardContent></Card>
        </div>
      )}
    </div>
  );
}