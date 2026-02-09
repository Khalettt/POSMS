import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' | 'default';
  className?: string;
}

const variantStyles = {
  blue: 'stat-card-blue text-white',
  green: 'stat-card-green text-white',
  amber: 'stat-card-amber text-white',
  red: 'stat-card-red text-white',
  purple: 'stat-card-purple text-white',
  cyan: 'stat-card-cyan text-white',
  default: 'bg-card text-card-foreground border border-border',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const isColored = variant !== 'default';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl p-5 shadow-soft',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            'text-sm font-medium mb-1',
            isColored ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-xs mt-1',
              isColored ? 'text-white/70' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.isPositive
                ? isColored ? 'text-white' : 'text-success'
                : isColored ? 'text-white' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className={isColored ? 'text-white/70' : 'text-muted-foreground'}>
                vs last period
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          isColored ? 'bg-white/20' : 'bg-primary/10'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            isColored ? 'text-white' : 'text-primary'
          )} />
        </div>
      </div>
    </motion.div>
  );
}
