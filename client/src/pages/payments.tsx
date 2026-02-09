import { useEffect, useState, useCallback } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PaymentsPage() {
  const { toast } = useToast();
  const { isManager } = useAuth();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/payments', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('pos_token')}` 
        }
      });
      
      if (!res.ok) throw new Error('Xogta lama soo xeri karo');
      
      const data = await res.json();
      setPayments(data.map((p: any) => ({
        ...p,
        amount: Number(p.amount)
      })));
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: err.message 
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const columns = [
    { 
      key: 'invoice_number', 
      header: 'Invoice', 
      render: (p: any) => (
        <span className="font-mono font-bold text-blue-600">
          {p.invoice_number || 'N/A'}
        </span>
      )
    },
    { 
      key: 'amount', 
      header: 'Amount Paid', 
      render: (p: any) => (
        <span className="text-green-600 font-black">
          ${p.amount.toFixed(2)}
        </span>
      ) 
    },
    { 
      key: 'payment_method', 
      header: 'Method', 
      render: (p: any) => (
        <Badge variant="secondary" className="capitalize px-3 py-1">
          {p.payment_method}
        </Badge>
      ) 
    },
    { 
      key: 'reference_number', 
      header: 'Ref / Mobile No.',
      render: (p: any) => (
        <span className="text-muted-foreground text-sm">
          {p.reference_number || '---'}
        </span>
      )
    },
    { 
      key: 'payment_date', 
      header: 'Date & Time', 
      render: (p: any) => (
        <div className="text-xs text-slate-500">
          {new Date(p.payment_date).toLocaleString('en-GB')}
        </div>
      )
    }
  ];

  const totalReceived = payments.reduce((sum, p: any) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-primary" /> Payment History
          </h1>
          <p className="text-muted-foreground">Monitoring all incoming store transactions</p>
        </div>
      </div>

      {/* --- STAT CARDS (Visible to Managers) --- */}
      {isManager && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Total Received</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-green-600">
                ${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={payments} 
          isLoading={isLoading} 
          searchKeys={['invoice_number', 'reference_number', 'payment_method']} 
        />
      </div>
    </div>
  );
}