import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ReportsPage() {
  const { toast } = useToast();
  const { isManager } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/reports/dashboard-summary', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
      });
      
      if (!res.ok) throw new Error('Ma heli karo xogta warbixinta');
      
      const result = await res.json();
      setData(result);
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isManager) fetchReportData();
  }, [isManager, fetchReportData]);

  if (!isManager) {
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4">
        <TrendingDown className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>Reports-ka waxaa geli kara oo kaliya Manager-ka.</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="ml-3 font-medium">Loading Analytics...</span>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Analytics</h1>
          <p className="text-muted-foreground italic">Financial summary and performance tracking</p>
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" amount={data.revenue} color="blue" icon={<DollarSign className="w-4 h-4" />} />
        <StatsCard title="Total Expenses" amount={data.expenses} color="red" negative />
        <StatsCard title="VAT Collected" amount={data.tax} color="orange" />
        <StatsCard 
          title="Net Profit" 
          amount={data.profit} 
          color={data.profit >= 0 ? "green" : "red"} 
          showTrend 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- SALES CHART (2/3 width) --- */}
        <Card className="lg:col-span-2 shadow-sm border-none">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2 font-bold uppercase tracking-wider text-slate-600">
              <DollarSign className="w-4 h-4" /> Monthly Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* --- TOP PRODUCTS (1/3 width) --- */}
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2 font-bold uppercase tracking-wider text-slate-600">
              <Package className="w-4 h-4" /> Best Sellers
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topProducts}
                  dataKey="total_qty"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {data.topProducts.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '10px'}} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- PROFIT & LOSS SUMMARY --- */}
      <Card className="shadow-sm border-none bg-white">
        <CardHeader className="bg-slate-900 rounded-t-xl text-white">
          <CardTitle className="text-md flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" /> Profit & Loss Statement (P&L)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <ReportLine label="Total Sales Income" value={data.revenue} color="text-green-600" />
            <ReportLine label="Cost of Goods Sold (COGS)" value={0} />
            <ReportLine label="Operating Expenses" value={data.expenses} color="text-red-600" isExpense />
            <div className="border-t-2 border-slate-900 mt-4 pt-4 flex justify-between items-center font-black text-2xl">
              <span>NET MARGIN</span>
              <span className={data.profit >= 0 ? "text-green-600" : "text-red-600"}>
                ${data.profit.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function StatsCard({ title, amount, color, negative, showTrend, icon }: any) {
  const colors: any = {
    blue: "border-l-blue-500",
    red: "border-l-red-500",
    green: "border-l-green-500",
    orange: "border-l-orange-500"
  };
  return (
    <Card className={`border-l-4 ${colors[color]} shadow-sm`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className="text-slate-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-black ${negative ? 'text-red-600' : ''}`}>
          {negative ? '-' : ''}${Math.abs(amount).toLocaleString()}
          {showTrend && (
            <span className="text-xs ml-2">
              {amount >= 0 ? <TrendingUp className="inline w-4 h-4" /> : <TrendingDown className="inline w-4 h-4" />}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportLine({ label, value, color, isExpense }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className={`font-bold ${color || 'text-slate-900'}`}>
        {isExpense ? '-' : ''}${value.toLocaleString()}
      </span>
    </div>
  );
}