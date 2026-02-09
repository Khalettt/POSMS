import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Trash2, Plus, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';

export default function SalesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isManager } = useAuth();
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null); // Xogta iibka la rabo in la daabaco

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sales', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
      });
      const data = await res.json();
      setSales(data);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error fetching sales', description: err.message || 'Failed to fetch sales data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (sale: any) => {
    setSelectedSale(sale);
    setTimeout(() => {
      window.print();
      setSelectedSale(null);
    }, 300);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ma hubtaa inaad tirtirto iibkan?')) return;
    try {
      await fetch(`http://localhost:5000/api/sales/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
      });
      toast({ title: "La tirtiray" });
      fetchSales();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Error deleting sale' });
    }
  };

  const columns = [
    { key: 'invoice_number', header: 'Invoice', render: (s:any) => <span className="font-mono font-bold text-blue-600">{s.invoice_number}</span> },
    { key: 'seller_name', header: 'Cashier', render: (s:any) => <span className="capitalize">{s.seller_name}</span> },
    { key: 'total_amount', header: 'Total', render: (s:any) => <span className="font-bold text-green-600">${Number(s.total_amount).toFixed(2)}</span> },
    { key: 'sale_date', header: 'Date', render: (s:any) => new Date(s.sale_date).toLocaleString() },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (s: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePrint(s)}>
            <Printer className="w-4 h-4" />
          </Button>
          {isManager && (
            <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2 text-slate-900 uppercase">
            <ShoppingBag className="w-8 h-8 text-primary" /> Sales History
          </h1>
          <p className="text-muted-foreground italic text-sm">Review and reprint store invoices</p>
        </div>
        <Button onClick={() => navigate('/pos')} className="bg-primary h-12 px-8 font-bold shadow-lg">
          <Plus className="mr-2 w-5 h-5" /> NEW SALE
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden print:hidden">
        <DataTable columns={columns} data={sales} isLoading={isLoading} />
      </div>

      {/* HISTORY REPRINT TEMPLATE - Hidden during browsing */}
      {selectedSale && (
        <div className="hidden print:block w-[75mm] p-2 font-mono text-[11px] text-black mx-auto">
          <div className="text-center border-b-2 border-dashed pb-3 mb-3 uppercase">
            <h2 className="text-lg font-bold">KHALID UPDY SHOP</h2>
            <p className="text-[9px]">Reprinted Invoice</p>
            <div className="mt-2 text-left space-y-1">
              <p>Invoice: {selectedSale.invoice_number}</p>
              <p>Cashier: {selectedSale.seller_name}</p>
              <p>Date: {new Date(selectedSale.sale_date).toLocaleString()}</p>
            </div>
          </div>
          <div className="border-b border-dashed py-4 mb-4">
             <div className="flex justify-between text-sm font-black">
                <span>TOTAL AMOUNT:</span>
                <span>${Number(selectedSale.total_amount).toFixed(2)}</span>
             </div>
          </div>
          <p className="text-center mt-10 text-[9px]">OFFICIAL STORE RECEIPT</p>
        </div>
      )}
    </div>
  );
}