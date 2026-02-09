import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MoreHorizontal, Mail, Phone } from 'lucide-react';
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

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  },[]);

  // Qaybaha muhiimka ah ee isbeddelay:

const fetchCustomers = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/customers');
    if (!response.ok) throw new Error('Xogta lama soo helin');
    
    
    const data = await response.json();
    setCustomers(data);
  } catch (error) {
    console.error('Error:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to fetch customers from API',
    });
  } finally {
    setIsLoading(false);
  }
};

const handleDelete = async () => {
  if (!deleteId) return;

  try {
    const response = await fetch(`http://localhost:5000/api/customers/${deleteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Delete failed');

    setCustomers((prev) => prev.filter((c) => c.id !== deleteId));
    toast({
      title: 'Success',
      description: 'Customer deleted successfully',
    });
  } catch (error :any) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message || 'Failed to delete customer',
    });
  } finally {
    setDeleteId(null);
  }
};

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (customer) => <span className="font-medium">{customer.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (customer) =>
        customer.email ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            {customer.email}
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (customer) =>
        customer.phone ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            {customer.phone}
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (customer) => (
        <span className="text-muted-foreground truncate max-w-xs block">
          {customer.address || '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Added',
      sortable: true,
      render: (customer) => new Date(customer.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      render: (customer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {isManager && (
              <DropdownMenuItem
                onClick={() => setDeleteId(customer.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        action={{ label: 'Add Customer', href: '/customers/new' }}
      />

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        searchPlaceholder="Search customers..."
        searchKeys={['name', 'email', 'phone']}
        emptyMessage="No customers found"
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
