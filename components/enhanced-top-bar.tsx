'use client';

import { useEffect, useState } from 'react';
import { Activity, DollarSign } from 'lucide-react';
import { Currency, CURRENCIES } from '@/lib/currency';
import { WalletButton } from '@/components/wallet-button';
import { useCurrency } from '@/components/top-bar';

export function EnhancedTopBar() {
  const [currentTime, setCurrentTime] = useState('');
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'INR' : 'USD');
  };

  return (
    <div className="h-14 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            DeFi Health Monitor
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Currency Toggle */}
        <button
          onClick={toggleCurrency}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border hover:bg-muted/80 transition-colors"
          title={`Switch to ${currency === 'USD' ? 'INR' : 'USD'}`}
        >
          <DollarSign className="w-3.5 h-3.5 text-foreground" />
          <span className="text-[11px] font-semibold text-foreground">
            {CURRENCIES[currency].code}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {CURRENCIES[currency].symbol}
          </span>
          <span className="text-[8px] text-blue-500">
            (Rate: {CURRENCIES[currency].rate})
          </span>
        </button>

        {/* Wallet Connection */}
        <WalletButton showBalance className="text-xs" />
        
        <div className="text-[11px] text-muted-foreground font-mono text-financial">
          {currentTime}
        </div>
        <div className="w-8 h-8 bg-muted border border-border flex items-center justify-center">
          <span className="text-[11px] font-semibold text-foreground">U</span>
        </div>
      </div>
    </div>
  );
}