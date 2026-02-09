import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { ArrowLeft, Plus, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  showBackButton,
  action,
  children,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const ActionIcon = action?.icon || Plus;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
    >
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          <Button
            onClick={() => {
              if (action.href) {
                navigate(action.href);
              } else if (action.onClick) {
                action.onClick();
              }
            }}
          >
            <ActionIcon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
