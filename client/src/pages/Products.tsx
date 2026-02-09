import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
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

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  is_active: boolean;
  category_name: string | null;
  created_at: string;
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('pos_token')}` 
        }
      });
      if (!response.ok) throw new Error('Xogta lama soo heli karo');
      const data = await response.json();
      
      const formattedData = data.map((p: any) => ({
        ...p,
        price: Number(p.price),
        cost_price: p.cost_price ? Number(p.cost_price) : null,
        stock_quantity: Number(p.stock_quantity),
      }));

      setProducts(formattedData);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Cillad ayaa ka dhacday soo qaadista xogta' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
      });

      if (!response.ok) throw new Error('Delete failed');

      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      toast({ title: 'Success', description: 'Alaabta waa la tirtiray' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Ma tirtirmi karo alaabtan' });
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      render: (product) => (
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          {product.sku && <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>}
        </div>
      ),
    },
    {
      key: 'category_name',
      header: 'Category',
      render: (product) => <Badge variant="secondary">{product.category_name || 'Uncategorized'}</Badge>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (product) => `$${product.price.toFixed(2)}`,
    },
    {
      key: 'stock_quantity',
      header: 'Stock',
      render: (product) => {
        const isLow = product.stock_quantity <= (product.low_stock_threshold || 10);
        return (
          <Badge variant={product.stock_quantity === 0 ? 'destructive' : isLow ? 'outline' : 'default'}>
            {product.stock_quantity}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
              <Eye className="w-4 h-4 mr-2" /> View
            </DropdownMenuItem>
            {isManager && (
              <>
                <DropdownMenuItem onClick={() => navigate(`/products/${product.id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteId(product.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Products"
        description="Maamul alaabta bakhaarka"
        action={isManager ? { label: 'Add Product', onClick: () => navigate('/products/new') } : undefined}
      />

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        searchKeys={['name', 'sku']}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ma hubtaa?</AlertDialogTitle>
            <AlertDialogDescription>Alaabtan dib looma soo celin karo haddaad tirtirto.</AlertDialogDescription>
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