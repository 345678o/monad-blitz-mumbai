'use client';

import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { WalletProviderLogo, ConnectionStatusBadge } from '@/components/wallet-logo';
import { ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface WalletButtonProps {
  className?: string;
  showBalance?: boolean;
}

export function WalletButton({ className = '', showBalance = false }: WalletButtonProps) {
  const {
    address,
    isConnected,
    isConnecting,
    balance,
    chainId,
    connectWallet,
    disconnectWallet,
    error
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format address for display
  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get network name
  const getNetworkName = (id: number | null): string => {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai',
    };
    return networks[id || 1] || `Chain ${id}`;
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setIsOpen(false);
      // You could add a toast notification here
    }
  };

  // Open address in block explorer
  const openInExplorer = () => {
    if (!address || !chainId) return;
    
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      5: 'https://goerli.etherscan.io',
      11155111: 'https://sepolia.etherscan.io',
      137: 'https://polygonscan.com',
      80001: 'https://mumbai.polygonscan.com',
    };

    const explorerUrl = explorers[chainId];
    if (explorerUrl) {
      window.open(`${explorerUrl}/address/${address}`, '_blank');
      setIsOpen(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsOpen(false);
  };

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`gap-2 ${className}`}
        size="sm"
      >
        <WalletProviderLogo provider="metamask" size={16} />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="gap-2 min-w-[140px] justify-between"
        size="sm"
      >
        <div className="flex items-center gap-2">
          <WalletProviderLogo provider="metamask" size={16} />
          <span className="font-medium">
            {address ? formatAddress(address) : ''}
          </span>
        </div>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between mb-3">
              <ConnectionStatusBadge isConnected={isConnected} />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-muted-foreground">
                  {getNetworkName(chainId)}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Address
              </p>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                <span className="text-sm font-mono text-foreground">
                  {address ? formatAddress(address) : ''}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={copyAddress}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="Copy address"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={openInExplorer}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="View in explorer"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Balance */}
            {showBalance && balance && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Balance
                </p>
                <div className="p-2 bg-muted/30 rounded-md">
                  <span className="text-sm font-semibold text-foreground">
                    {balance} ETH
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-border">
              <Button
                onClick={handleDisconnect}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-red-500/10 border border-red-500/20 rounded-lg shadow-lg z-50">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}