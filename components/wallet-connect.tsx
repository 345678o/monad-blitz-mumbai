'use client';

import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { WalletLogo, WalletConnectionCard, ConnectionStatusBadge, WalletProviderLogo } from '@/components/wallet-logo';
import { useState } from 'react';

interface WalletConnectProps {
  className?: string;
  showBalance?: boolean;
  showNetwork?: boolean;
  compact?: boolean;
}

// Network names mapping
const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum',
  5: 'Goerli',
  11155111: 'Sepolia',
  137: 'Polygon',
  80001: 'Mumbai',
};

export function WalletConnect({ 
  className = '', 
  showBalance = true, 
  showNetwork = true,
  compact = false 
}: WalletConnectProps) {
  const {
    address,
    isConnected,
    isConnecting,
    error,
    chainId,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWallet();

  const [showNetworkSwitcher, setShowNetworkSwitcher] = useState(false);

  // Format address for display
  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get network name
  const getNetworkName = (id: number | null): string => {
    if (!id) return 'Unknown';
    return NETWORK_NAMES[id] || `Chain ${id}`;
  };

  // Handle network switch
  const handleNetworkSwitch = async (targetChainId: number) => {
    await switchNetwork(targetChainId);
    setShowNetworkSwitcher(false);
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
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
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {!isConnected ? (
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            size="sm"
            className="gap-2"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <WalletProviderLogo provider="metamask" size={16} />
            )}
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-md">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground">
                {formatAddress(address!)}
              </span>
            </div>
            <Button
              onClick={disconnectWallet}
              variant="outline"
              size="sm"
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`wallet-connect ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-500">Connection Error</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected ? (
        <WalletConnectionCard
          title="Connect Your Wallet"
          description="Connect your MetaMask wallet to access DeFi features"
          isConnecting={isConnecting}
          onConnect={connectWallet}
        />
      ) : (
        <div className="space-y-4">
          {/* Connected Status */}
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <WalletProviderLogo provider="metamask" size={20} />
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Wallet Connected</p>
                <p className="text-xs text-muted-foreground">
                  {formatAddress(address!)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={copyAddress}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Copy address"
              >
                📋
              </Button>
              <Button
                onClick={openInExplorer}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="View in explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Balance */}
            {showBalance && balance && (
              <div className="p-3 bg-muted/30 border border-border rounded-md">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Balance
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {balance} ETH
                </p>
              </div>
            )}

            {/* Network */}
            {showNetwork && chainId && (
              <div className="p-3 bg-muted/30 border border-border rounded-md">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Network
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {getNetworkName(chainId)}
                  </p>
                  <Button
                    onClick={() => setShowNetworkSwitcher(!showNetworkSwitcher)}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                  >
                    Switch
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Network Switcher */}
          {showNetworkSwitcher && (
            <div className="p-4 bg-muted/30 border border-border rounded-md">
              <p className="text-sm font-medium text-foreground mb-3">
                Switch Network
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(NETWORK_NAMES).map(([id, name]) => (
                  <Button
                    key={id}
                    onClick={() => handleNetworkSwitch(Number(id))}
                    variant={chainId === Number(id) ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    disabled={chainId === Number(id)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Disconnect Button */}
          <div className="flex justify-center">
            <Button
              onClick={disconnectWallet}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Disconnect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}