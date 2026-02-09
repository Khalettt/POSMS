import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MoreHorizontal, Receipt } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ExpensesPage() {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/expenses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setExpenses(data.map((e: any) => ({ ...e, amount: Number(e.amount) })));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
      });
      if (!res.ok) throw new Error('Action denied or server error');
      setExpenses(prev => prev.filter(e => e.id !== deleteId));
      toast({ title: 'Success', description: 'Expense record deleted' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setDeleteId(null);
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const columns = [
    { key: 'title', header: 'Title', render: (e: any) => <span className="font-bold">{e.title}</span> },
    { key: 'category', header: 'Category', render: (e: any) => <Badge variant="outline" className="bg-slate-50">{e.category}</Badge> },
    { key: 'amount', header: 'Amount', render: (e: any) => <span className="font-black text-red-600">${e.amount.toFixed(2)}</span> },
    { key: 'expense_date', header: 'Date', render: (e: any) => new Date(e.expense_date).toLocaleDateString() },
    {
      key: 'actions',
      header: '',
      render: (e: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/expenses/${e.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            {isManager && (
              <DropdownMenuItem onClick={() => setDeleteId(e.id)} className="text-destructive font-bold">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <Receipt className="w-8 h-8 text-red-500" /> Business Expenses
          </h1>
          <p className="text-muted-foreground italic">Track where your money is going</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <p className="text-xs font-bold text-slate-500 uppercase">Total Outflow</p>
             <p className="text-2xl font-black text-red-600">${totalAmount.toFixed(2)}</p>
          </div>
          <Button onClick={() => navigate('/expenses/new')} className="h-12 px-6 font-bold shadow-lg">
            Add Expense
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable columns={columns} data={expenses} isLoading={isLoading} searchKeys={['title', 'category']} />
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this expense record from the financial history.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-bold">Delete Record</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}