import { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, Info, Activity, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
  const { toast } = useToast();
  const { isManager } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!isManager) return;

    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/audit-logs', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('pos_token')}` 
        }
      });
      
      if (!res.ok) {
        if (res.status === 403) throw new Error('Awood uma lihid boggan');
        throw new Error('Logs-ka lama soo heli karo');
      }

      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Cillad', 
        description: err.message 
      });
    } finally {
      setIsLoading(false);
    }
  }, [isManager, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionColor = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200';
    if (a.includes('UPDATE')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (a.includes('CREATE') || a.includes('SALE')) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const columns = [
    { 
      key: 'created_at', 
      header: 'Time', 
      render: (log: any) => (
        <div className="flex items-center gap-2 text-[11px]">
          <Clock className="w-3 h-3 text-muted-foreground" />
          {new Date(log.created_at).toLocaleString('en-GB')}
        </div>
      )
    },
    { 
      key: 'user_name', 
      header: 'User', 
      render: (log: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{log.user_name || 'System'}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold">{log.user_role}</span>
        </div>
      )
    },
    { 
      key: 'action', 
      header: 'Action', 
      render: (log: any) => (
        <Badge variant="outline" className={`${getActionColor(log.action)} text-[10px]`}>
          {log.action}
        </Badge>
      )
    },
    { key: 'target_table', header: 'Module' },
    { key: 'ip_address', header: 'IP Address' },
    {
      key: 'details',
      header: 'Details',
      render: (log: any) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Info className="h-4 w-4 text-blue-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Log Details - <span className="text-sm font-normal text-muted-foreground">{log.action}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="bg-slate-950 p-4 rounded-md overflow-auto max-h-[500px] border border-slate-800">
              <pre className="text-[11px] text-green-400 font-mono leading-relaxed">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  ];

  if (!isManager) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive/50" />
        <h2 className="text-xl font-bold">Lama oggola (Access Denied)</h2>
        <p className="text-muted-foreground">Boggan waxaa geli kara oo kaliya maamulayaasha sare.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" /> System Audit Logs
          </h1>
          <p className="text-muted-foreground text-sm">Monitoring security trail and user activity</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchLogs} 
          disabled={isLoading}
          className="shadow-sm"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
          Refresh Logs
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={logs} 
          isLoading={isLoading} 
          searchKeys={['user_name', 'action', 'target_table']} 
        />
      </div>
    </div>
  );
}