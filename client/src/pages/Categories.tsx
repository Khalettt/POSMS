import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Category {
  id: string;
  name: string;
  description: string | null;
  product_count: number;
  created_at: string;
}

export default function CategoriesPage() {
  const { isManager } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function si fudud loogu helo headers-ka
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('pos_token')}`
  }), []);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: getHeaders()
      });
      if (response.status === 401) return navigate('/login');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCategories(data);
    } catch (error : any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to load categories' });
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, navigate, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    const url = editCategory 
      ? `http://localhost:5000/api/categories/${editCategory.id}` 
      : 'http://localhost:5000/api/categories';
    const method = editCategory ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Action failed');
      toast({ title: 'Success', description: 'Category saved successfully' });
      fetchCategories();
      setShowAddDialog(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save category' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${deleteId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Delete failed');
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      toast({ title: 'Success', description: 'Category deleted' });
    } catch (error :any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete category' });
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Category Name', sortable: true, render: (cat) => <span className="font-medium">{cat.name}</span> },
    { key: 'description', header: 'Description', render: (cat) => <span className="text-muted-foreground">{cat.description || '-'}</span> },
    { key: 'product_count', header: 'Products', sortable: true, render: (cat) => cat.product_count },
    { key: 'created_at', header: 'Created', render: (cat) => new Date(cat.created_at).toLocaleDateString() },
    {
      key: 'actions',
      header: '',
      render: (cat) => isManager && ( // Kaliya u muuji Manager-ka
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditCategory(cat); setFormData({name: cat.name, description: cat.description || ''}); setShowAddDialog(true); }}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteId(cat.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Categories"
        description="Organize your products"
        action={isManager ? { label: 'Add Category', onClick: () => { setEditCategory(null); setFormData({name:'', description:''}); setShowAddDialog(true); } } : undefined}
      />
      <DataTable columns={columns} data={categories} isLoading={isLoading} />

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCategory ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}