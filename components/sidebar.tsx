'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/wallet-connect';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Shield, 
  Bell, 
  FileText, 
  Settings, 
  LogOut,
  Activity,
  Zap
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/positions', label: 'Positions', icon: Wallet },
    { href: '/risk-engine', label: 'Risk Engine', icon: Activity },
    { href: '/auto-protection', label: 'Auto-Protection', icon: Shield },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sidebar-foreground tracking-tight">DeFi Health</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Wallet Connection */}
        <div className="mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-3">Wallet</p>
          <WalletConnect compact />
        </div>

        <div className="px-3 py-2 bg-sidebar-accent border border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Account</p>
          <p className="text-xs text-sidebar-foreground truncate font-medium">{user?.email}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-9 text-xs text-muted-foreground hover:text-sidebar-foreground"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
