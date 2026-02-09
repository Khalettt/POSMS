import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Trash2, 
  MoreVertical, 
  UserCheck, 
  Loader2, 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function UsersPage() {
  const { toast } = useToast();
  const { isManager, user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'cashier',
    phone: ''
  });

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('pos_token')}`
  }), []);

  // 1. Soo qaado dhamaan isticmaalayaasha
  const fetchUsers = useCallback(async () => {
    if (!isManager) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'Manager kaliya ayaa boggan geli kara' });
      return navigate('/dashboard');
    }

    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/users', {
        headers: getHeaders()
      });
      
      if (res.status === 403) throw new Error('Awood uma lihid');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, isManager, navigate, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Ku dar shaqaale cusub (Signup manual)
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cillad ayaa dhacday');

      toast({ title: "Guul", description: "Shaqaale cusub ayaa la diwaangeliyey, fadlan aqbal" });
      setIsDialogOpen(false);
      setFormData({ full_name: '', email: '', password: '', role: 'cashier', phone: '' });
      fetchUsers();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Cillad', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Aqbal shaqaalaha (Approve Action)
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/approve`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      if (res.ok) {
        toast({ title: "Guul", description: "Shaqaalaha hadda waa la aqbalay (Active)" });
        fetchUsers();
      } else {
        throw new Error('Aqbalaadda waa fashilantay');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  // 4. Tirtir shaqaalaha
  const deleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      return toast({ variant: 'destructive', title: 'Error', description: 'Naftaada ma tirtiri kartid!' });
    }
    
    if (!confirm('Ma hubtaa inaad tirtirto qofkan shaqada?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Tirtirista waa fashilantay');
      
      setUsers(prev => prev.filter((u: any) => u.id !== id));
      toast({ title: "La tirtiray", description: "Shaqaalaha waa laga saaray nidaamka" });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const columns = [
    { 
      key: 'full_name', 
      header: 'Staff Name', 
      render: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
            {u.full_name.charAt(0)}
          </div>
          <span className="font-medium">{u.full_name}</span>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Role', 
      render: (u: any) => (
        <Badge variant={u.role === 'manager' ? 'default' : 'secondary'}>
          {u.role.toUpperCase()}
        </Badge>
      )
    },
    { key: 'email', header: 'Email' },
    { 
      key: 'is_approved', 
      header: 'Status', 
      render: (u: any) => u.is_approved ? (
        <Badge className="bg-green-600 border-none">
          <UserCheck className="w-3 h-3 mr-1" /> Active
        </Badge>
      ) : (
        <Badge variant="outline" className="text-red-500 border-red-500 animate-pulse">
          Pending Approval
        </Badge>
      ) 
    },
    {
      key: 'actions',
      header: '',
      render: (u: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!u.is_approved && (
              <DropdownMenuItem onClick={() => handleApprove(u.id)} className="text-green-600 font-bold">
                <UserCheck className="w-4 h-4 mr-2" /> Approve Staff
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => deleteUser(u.id)} 
              className="text-destructive focus:text-destructive"
              disabled={u.id === currentUser?.id}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Remove Staff
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  if (!isManager) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">Staff Management</h1>
          <p className="text-muted-foreground">Manage roles, permissions and account approvals</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="mr-2 h-4 w-4" /> Add New Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register New Staff Member</DialogTitle></DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 pt-4">
              <Input placeholder="Full Name" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Email Address" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <Input placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <Input placeholder="Password" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <div className="space-y-2">
                <label className="text-sm font-medium">System Role</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="cashier">Cashier (Sales Only)</option>
                  <option value="manager">Manager (Full Access)</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Create Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        isLoading={isLoading} 
        searchKeys={['full_name', 'email']} 
      />
    </div>
  );
}