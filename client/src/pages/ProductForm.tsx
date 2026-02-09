import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const productSchema = z.object({
  name: z.string().min(2, 'Magacu waa inuu ka badnaadaa 2 xaraf'),
  description: z.string().optional(),
  sku: z.string().optional(),
  category_id: z.string().min(1, 'Fadlan dooro category'),
  price: z.number().min(0),
  cost_price: z.number().min(0).optional(),
  stock_quantity: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0).optional(),
  is_active: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', price: 0, stock_quantity: 0, is_active: true, low_stock_threshold: 5
    },
  });

  useEffect(() => {
    // Role Guard: Haddii uusan manager ahayn, dib u celi
    if (!isManager) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'Awood uma lihid inaad alaab darto.' });
      navigate('/products');
      return;
    }

    const fetchData = async () => {
      try {
        const catRes = await fetch('http://localhost:5000/api/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('pos_token')}` }
        });
        const catData = await catRes.json();
        setCategories(catData);

        if (id) {
           // Haddii ay tahay Edit, halkan ku soo rido xogta alaabta (GET by ID)
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id, isManager, navigate, toast]);

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);
    try {
      const url = id ? `http://localhost:5000/api/products/${id}` : 'http://localhost:5000/api/products';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pos_token')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Action failed');

      toast({ title: 'Success', description: `Alaabta waa la ${id ? 'cusboonaysiiyay' : 'diiwangeliyey'}` });
      navigate('/products');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isManager) return null;

  return (
    <div className="p-6">
      <PageHeader title={id ? "Edit Product" : "Add New Product"} showBackButton />
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input {...form.register('name')} placeholder="Tusaale: iPhone 15" />
              </div>
              <div className="space-y-2">
                <Label>SKU / Barcode</Label>
                <Input {...form.register('sku')} placeholder="Onhand Code" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select onValueChange={(v) => form.setValue('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Dooro Nooca" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Selling Price ($) *</Label>
                <Input type="number" {...form.register('price', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity *</Label>
                <Input type="number" {...form.register('stock_quantity', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <Label>Active for Sale</Label>
              <Switch checked={form.watch('is_active')} onCheckedChange={(v) => form.setValue('is_active', v)} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Product
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/products')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}