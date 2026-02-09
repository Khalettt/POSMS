import { useEffect, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card,CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InventoryPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Adjustment Form States
  const [selectedProduct, setSelectedProduct] = useState('');
  const [changeType, setChangeType] = useState('adjustment');
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    fetchLogs();
    fetchProducts();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch('http://localhost:5000/api/inventory/logs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
    });
    const data = await res.json();
    setLogs(data);
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:5000/api/products', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
    });
    const data = await res.json();
    setProducts(data);
  };

  const handleAdjustment = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/inventory/adjust', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pos_token')}`
        },
        body: JSON.stringify({
          product_id: selectedProduct,
          quantity_change: changeType === 'out' ? -Math.abs(quantity) : Math.abs(quantity),
          change_type: changeType,
          notes: 'Manual Adjustment'
        })
      });

      if (!res.ok) throw new Error('Cillad ayaa dhacday');
      
      toast({ title: "Guul", description: "Stock-ga waa la cusboonaysiiyey" });
      fetchLogs();
      fetchProducts();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const columns = [
    { key: 'product_name', header: 'Product' },
    { 
      key: 'change_type', 
      header: 'Type', 
      render: (log: any) => (
        <Badge variant={log.change_type === 'in' || log.change_type === 'sale' ? 'default' : 'outline'}>
          {log.change_type.toUpperCase()}
        </Badge>
      ) 
    },
    { 
      key: 'quantity_change', 
      header: 'Change', 
      render: (log: any) => (
        <span className={log.quantity_change > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
          {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
        </span>
      )
    },
    { key: 'new_quantity', header: 'Balance' },
    { key: 'operator_name', header: 'By' },
    { key: 'created_at', header: 'Time', render: (log: any) => new Date(log.created_at).toLocaleString() }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6" /> Inventory Control
          </h1>
          <p className="text-muted-foreground">Monitor every single stock movement</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600"><RefreshCw className="mr-2 h-4 w-4" /> Adjust Stock</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Manual Stock Adjustment</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Select onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Current: {p.stock_quantity})</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select onValueChange={(v: any) => setChangeType(v)} defaultValue="adjustment">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In (Purchased)</SelectItem>
                  <SelectItem value="out">Stock Out (Damaged/Expired)</SelectItem>
                  <SelectItem value="adjustment">General Adjustment</SelectItem>
                </SelectContent>
              </Select>

              <Input type="number" placeholder="Quantity Change" onChange={(e) => setQuantity(parseInt(e.target.value))} />
              
              <Button onClick={handleAdjustment} className="w-full">Update Inventory</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Recent Stock In</p>
                <p className="text-2xl font-bold">{logs.filter((l:any) => l.change_type === 'in').length} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ArrowDownCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium">Recent Stock Out</p>
                <p className="text-2xl font-bold">{logs.filter((l:any) => l.change_type === 'out' || l.change_type === 'sale').length} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={logs} isLoading={isLoading} searchKeys={['product_name']} />
    </div>
  );
}