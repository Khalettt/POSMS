import { useState, useEffect } from 'react';
import { Save, Store, MapPin, Percent, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { toast } = useToast();
  const { isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    store_name: '',
    address: '',
    phone: '',
    email: '',
    currency: '$',
    vat_percent: 0,
    receipt_footer: 'Mahadsanid, mar kale soo iibso!'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      const data = await res.json();
      if (data.id) setSettings(data);
    } catch (err) {
      console.error("Settings fetch error", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pos_token')}` // Token-kaaga cusub
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error('Cillad ayaa dhacday');

      toast({ title: "La kaydiyey", description: "Xogta dukaanka waa la cusboonaysiiyey" });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Ma suuroobin kaydinta xogta' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Configure your business details and receipt info</p>
        </div>
        {isManager && (
          <Button onClick={handleSave} disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- STORE INFO --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase">
              <Store className="w-5 h-5 text-primary" /> Store Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s_name">Store Name</Label>
              <Input 
                id="s_name"
                disabled={!isManager}
                value={settings.store_name} 
                onChange={e => setSettings({...settings, store_name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  disabled={!isManager}
                  value={settings.address} 
                  onChange={e => setSettings({...settings, address: e.target.value})} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  disabled={!isManager}
                  value={settings.phone} 
                  onChange={e => setSettings({...settings, phone: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  disabled={!isManager}
                  value={settings.email} 
                  onChange={e => setSettings({...settings, email: e.target.value})} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- SYSTEM & TAX --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase">
              <Percent className="w-5 h-5 text-primary" /> Finance & Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency Symbol</Label>
                <Input 
                  placeholder="$" 
                  disabled={!isManager}
                  value={settings.currency} 
                  onChange={e => setSettings({...settings, currency: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>VAT / Tax (%)</Label>
                <Input 
                  type="number" 
                  disabled={!isManager}
                  value={settings.vat_percent} 
                  onChange={e => setSettings({...settings, vat_percent: Number(e.target.value)})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Receipt Footer Message</Label>
              <Input 
                disabled={!isManager}
                value={settings.receipt_footer} 
                onChange={e => setSettings({...settings, receipt_footer: e.target.value})} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- PREVIEW --- */}
      <Card className="bg-slate-50 border-dashed border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase text-muted-foreground tracking-widest text-center">Receipt Header Preview</CardTitle>
        </CardHeader>
        <CardContent className="text-center font-mono text-xs max-w-xs mx-auto space-y-1">
          <p className="font-bold text-lg uppercase leading-tight">{settings.store_name || 'MY STORE NAME'}</p>
          <p className="text-muted-foreground">{settings.address || '123 Street, City, Country'}</p>
          <p className="text-muted-foreground italic text-[10px]">Tel: {settings.phone || '+252 6x xxxxxx'}</p>
          <div className="border-t border-slate-300 my-3"></div>
          <p className="text-slate-400">--- Items List Preview ---</p>
          <div className="border-t border-slate-300 my-3"></div>
          <p className="italic text-slate-500">{settings.receipt_footer}</p>
        </CardContent>
      </Card>
    </div>
  );
}