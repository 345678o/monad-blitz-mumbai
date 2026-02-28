'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';

// Context type
interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  chainId: number | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  getSigner: () => Promise<ethers.Signer | null>;
  getProvider: () => ethers.BrowserProvider | null;
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const wallet = useWallet();

  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook to use wallet context
export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  
  return context;
}

// HOC for components that require wallet connection
interface WithWalletProps {
  fallback?: ReactNode;
}

export function withWallet<P extends object>(
  Component: React.ComponentType<P>,
  options: WithWalletProps = {}
) {
  return function WithWalletComponent(props: P) {
    const { isConnected } = useWalletContext();
    
    if (!isConnected) {
      return options.fallback || (
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Please connect your wallet to access this feature.
          </p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}