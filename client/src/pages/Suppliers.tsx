import { useEffect, useState, useCallback } from 'react';
import { Plus, Phone, Mail, MoreHorizontal, Trash2, Truck, MapPin, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SuppliersPage() {
  const { toast } = useToast();
  const { isManager } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/suppliers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
      });
      const data = await res.json();
      setSuppliers(data);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Xogta lama soo heli karo' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/suppliers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pos_token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Waa la daryahay kaydinta');

      toast({ title: "Guul", description: "Supplier-ka waa la daray" });
      setIsOpen(false);
      setFormData({ name: '', contact_person: '', email: '', phone: '', address: '', notes: '' });
      fetchSuppliers();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Cillad', description: err.message });
    }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm('Ma hubtaa inaad tirtirto supplier-kan?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      fetchSuppliers();
      toast({ title: "La tirtiray", description: "Supplier-ka waa laga saaray nidaamka" });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Supplier / Company', 
      render: (s: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{s.name}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <User className="w-2 h-2" /> {s.contact_person || 'No Contact'}
          </span>
        </div>
      )
    },
    { 
      key: 'phone', 
      header: 'Phone', 
      render: (s: any) => (
        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
          <Phone className="w-3 h-3" /> {s.phone || 'N/A'}
        </div>
      ) 
    },
    { 
      key: 'email', 
      header: 'Email', 
      render: (s: any) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Mail className="w-3 h-3" /> {s.email || 'N/A'}
        </div>
      ) 
    },
    {
      key: 'address',
      header: 'Location',
      render: (s: any) => (
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-3 h-3 text-red-400" /> {s.address || 'Local'}
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (s: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => deleteSupplier(s.id)} 
              disabled={!isManager}
              className="text-destructive font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Supplier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-slate-900">
            <Truck className="w-8 h-8 text-primary" /> Supplier Directory
          </h1>
          <p className="text-muted-foreground italic">Manage your vendor relationships and contacts</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 font-bold shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> Add New Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Register Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-slate-500">Company Information</label>
                <Input 
                  placeholder="Supplier/Company Name" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                <Input 
                  placeholder="Contact Person Name" 
                  value={formData.contact_person} 
                  onChange={e => setFormData({...formData, contact_person: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-slate-500">Contact Details</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Email Address" 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                  <Input 
                    placeholder="Phone Number" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
                <Input 
                  placeholder="Physical Address / City" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>

              <Textarea 
                placeholder="Additional notes (terms, delivery time, etc.)" 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />

              <Button type="submit" className="w-full h-12 text-lg font-bold">
                Save Vendor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable 
          columns={columns} 
          data={suppliers} 
          isLoading={isLoading} 
          searchKeys={['name', 'contact_person', 'phone']} 
        />
      </div>
    </div>
  );
}