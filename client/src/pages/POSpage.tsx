import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CreditCard, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

export default function POSPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [lastSale, setLastSale] = useState<any>(null); // State-ka xogta daabacaadda

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:5000/api/products', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
    });
    const data = await res.json();
    setProducts(data.filter((p: any) => p.stock_quantity > 0));
  };

  const addToCart = (product: any) => {
    const exists = cart.find(item => item.id === product.id);
    if (exists) {
      if (exists.quantity >= product.stock_quantity) {
        return toast({ variant: "destructive", title: "Stock Limit", description: "Bakhaarka intaas ka badan ma yaalo" });
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; 
    return { subtotal, tax, total: subtotal + tax };
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
      setCart([]); // Cart-ka sifee daabacaadda ka dib
      setLastSale(null);
    }, 500);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    const { subtotal, tax, total } = calculateTotals();

    try {
      const saleRes = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` },
        body: JSON.stringify({ items: cart, subtotal, tax_amount: tax, total_amount: total })
      });
      const saleData = await saleRes.json();
      if (!saleRes.ok) throw new Error(saleData.message);

      await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` },
        body: JSON.stringify({ sale_id: saleData.id, amount: total, payment_method: paymentMethod })
      });

      // Kaydi xogta daabacaadda ka hor intaanan cart-ka sifayn
      setLastSale({
        invoice_number: saleData.invoice_number || 'INV-TEMP',
        items: [...cart],
        total: total,
        tax: tax,
        subtotal: subtotal
      });

      toast({ title: "Iibku waa guulaystay", description: "Receipt-ga waa la daabacayaa..." });
      handlePrint();

    } catch (err: any) {
      toast({ variant: "destructive", title: "Cillad iibka", description: err.message });
    } finally {
      setLoading(false);
      fetchProducts();
    }
  };

  const totals = calculateTotals();

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* UI SIDE - Hidden during print */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => navigate('/sales')} className="text-white hover:bg-slate-800">
          <ArrowLeft className="w-4 h-4 mr-2" /> History
        </Button>
        <h1 className="text-xl font-black italic">KHALID POS</h1>
        <div className="flex items-center gap-4">
          <Button onClick={handleCheckout} disabled={loading || cart.length === 0} className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />} Checkout
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 gap-4 print:hidden">
        <div className="flex-1 space-y-4 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input placeholder="Search items..." className="pl-10 h-12" onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
              <Card key={p.id} className="p-3 cursor-pointer hover:ring-2 ring-primary transition-all bg-white" onClick={() => addToCart(p)}>
                <p className="font-bold truncate uppercase text-sm">{p.name}</p>
                <p className="text-blue-600 font-black text-lg">${p.price}</p>
                <p className="text-[10px] text-slate-400">Stock: {p.stock_quantity}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="w-[380px] flex flex-col shadow-xl">
          <div className="p-4 border-b font-bold bg-slate-50 flex justify-between uppercase text-xs tracking-widest">
            <span>Current Order</span>
            <Badge variant="secondary">{cart.length} Items</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-start border-b pb-2">
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase">{item.name}</p>
                  <p className="text-xs text-slate-500">${item.price} x {item.quantity}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50 border-t space-y-3">
            <Select defaultValue="cash" onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash Payment</SelectItem>
                <SelectItem value="evc">EVC Plus / Zaad</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-1 text-sm font-bold">
              <div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-blue-600"><span>VAT (5%)</span><span>${totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-black border-t pt-2 text-slate-900">
                <span>TOTAL</span><span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full h-14 text-lg font-black" onClick={handleCheckout} disabled={loading || cart.length === 0}>
              SAVE & PRINT
            </Button>
          </div>
        </Card>
      </main>

      {/* PRINT RECEIPT TEMPLATE - Visible only during print */}
      <div className="hidden print:block w-[75mm] p-2 font-mono text-[11px] text-black mx-auto">
        <div className="text-center border-b-2 border-dashed pb-3 mb-3">
          <h2 className="text-lg font-bold">KHALID UPDY SHOP</h2>
          <p>Mogadishu, Somalia</p>
          <p>Tel: 612657715</p>
          <div className="mt-2 text-[10px]">
            <p>Invoice: {lastSale?.invoice_number}</p>
            <p>Date: {new Date().toLocaleString()}</p>
          </div>
        </div>
        <table className="w-full mb-4">
          <thead>
            <tr className="border-b border-dashed text-left">
              <th className="pb-1">Item</th>
              <th className="pb-1 text-center">Qty</th>
              <th className="pb-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(lastSale?.items || cart).map((i: any) => (
              <tr key={i.id}>
                <td className="py-1 uppercase truncate max-w-[40mm]">{i.name}</td>
                <td className="py-1 text-center">{i.quantity}</td>
                <td className="py-1 text-right">${(i.price * i.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t-2 border-dashed pt-2 space-y-1 font-bold">
          <div className="flex justify-between"><span>SUBTOTAL:</span><span>${lastSale?.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>TAX (5%):</span><span>${lastSale?.tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm border-t border-black pt-1">
            <span>TOTAL:</span><span>${lastSale?.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between uppercase mt-2">
            <span>PAID BY:</span><span>{paymentMethod}</span>
          </div>
        </div>
        <p className="text-center mt-8 italic">*** MAHADSANID MACMIIL ***</p>
      </div>
    </div>
  );
}