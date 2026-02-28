import { ReactNode } from 'react';
import { useCurrency } from './top-bar';
import { formatCurrency } from '@/lib/currency';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  suffix?: string;
  status?: 'positive' | 'negative' | 'neutral';
  badge?: ReactNode;
  subtext?: string;
  isAmount?: boolean; // New prop to indicate if value should be currency formatted
  rawAmount?: number; // Raw USD amount for conversion
}

export function MetricCard({ 
  label, 
  value, 
  change, 
  suffix, 
  status, 
  badge, 
  subtext, 
  isAmount = false, 
  rawAmount 
}: MetricCardProps) {
  const { currency } = useCurrency();
  
  const getChangeColor = () => {
    if (!change) return '';
    if (status === 'positive') return change > 0 ? 'text-green-500' : 'text-red-500';
    if (status === 'negative') return change > 0 ? 'text-red-500' : 'text-green-500';
    return 'text-muted-foreground';
  };

  // Format value if it's an amount
  const displayValue = isAmount && rawAmount !== undefined 
    ? formatCurrency(rawAmount, currency, { compact: true })
    : value;

  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <p className="metric-label">
          {label}
        </p>
        {badge}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <p className="metric-value">
          {displayValue}
          {suffix && <span className="text-base text-muted-foreground ml-1">{suffix}</span>}
        </p>
        {change !== undefined && (
          <span className={`text-[11px] font-semibold ${getChangeColor()}`}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>
      {subtext && (
        <p className="metric-change">{subtext}</p>
      )}
    </div>
  );
}
