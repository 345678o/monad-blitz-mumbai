'use client';

import React from 'react';
import { WalletIcon, AnimatedWalletLogo } from './icons/wallet-icon';

interface WalletLogoProps {
  variant?: 'default' | 'branded' | 'minimal' | 'hero';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  isConnecting?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 20, text: 'text-sm' },
  md: { icon: 32, text: 'text-base' },
  lg: { icon: 48, text: 'text-lg' },
  xl: { icon: 64, text: 'text-xl' }
};

export function WalletLogo({
  variant = 'default',
  size = 'md',
  showText = true,
  isConnecting = false,
  className = ''
}: WalletLogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size];

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center space-y-4 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-full">
            <AnimatedWalletLogo 
              size={iconSize * 1.5} 
              isConnecting={isConnecting}
              className="text-white"
            />
          </div>
        </div>
        {showText && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground">
              Secure connection to the decentralized web
            </p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'branded') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm" />
          <div className="relative bg-primary/10 p-2 rounded-lg border border-primary/20">
            <AnimatedWalletLogo 
              size={iconSize} 
              isConnecting={isConnecting}
              className="text-primary"
            />
          </div>
        </div>
        {showText && (
          <div>
            <h3 className={`font-semibold text-foreground ${textSize}`}>
              DeFi Wallet
            </h3>
            <p className="text-xs text-muted-foreground">
              Powered by MetaMask
            </p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AnimatedWalletLogo 
          size={iconSize} 
          isConnecting={isConnecting}
          className="text-primary"
        />
        {showText && (
          <span className={`font-medium text-foreground ${textSize}`}>
            Wallet
          </span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="p-2 bg-muted/30 rounded-lg border border-border">
        <AnimatedWalletLogo 
          size={iconSize} 
          isConnecting={isConnecting}
          className="text-primary"
        />
      </div>
      {showText && (
        <div>
          <h3 className={`font-semibold text-foreground ${textSize}`}>
            Connect Wallet
          </h3>
          <p className="text-xs text-muted-foreground">
            {isConnecting ? 'Connecting...' : 'Not connected'}
          </p>
        </div>
      )}
    </div>
  );
}

// Wallet provider logos
export function WalletProviderLogo({ 
  provider, 
  size = 24, 
  className = '' 
}: {
  provider: 'metamask' | 'walletconnect' | 'coinbase' | 'generic';
  size?: number;
  className?: string;
}) {
  const logos = {
    metamask: (
      <WalletIcon 
        variant="metamask" 
        size={size} 
        className={className}
      />
    ),
    walletconnect: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <path
          d="M5.5 9.5C8.5 6.5 13.5 6.5 16.5 9.5L17.5 10.5C17.8 10.8 17.8 11.2 17.5 11.5L16.5 12.5C16.2 12.8 15.8 12.8 15.5 12.5L14.8 11.8C13.2 10.2 10.8 10.2 9.2 11.8L8.5 12.5C8.2 12.8 7.8 12.8 7.5 12.5L6.5 11.5C6.2 11.2 6.2 10.8 6.5 10.5L5.5 9.5Z"
          fill="#3B99FC"
        />
        <circle cx="12" cy="16" r="2" fill="#3B99FC" />
      </svg>
    ),
    coinbase: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          fill="#0052FF"
        />
        <rect
          x="8"
          y="8"
          width="8"
          height="8"
          rx="2"
          fill="white"
        />
      </svg>
    ),
    generic: (
      <WalletIcon 
        variant="generic" 
        size={size} 
        className={className}
      />
    )
  };

  return logos[provider];
}

// Connection status badge
export function ConnectionStatusBadge({ 
  isConnected, 
  className = '' 
}: {
  isConnected: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className={`text-xs font-medium ${
        isConnected ? 'text-green-500' : 'text-red-500'
      }`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

// Wallet connection card with logo
export function WalletConnectionCard({
  title = "Connect Your Wallet",
  description = "Connect with one of our available wallet providers.",
  isConnecting = false,
  onConnect,
  className = ''
}: {
  title?: string;
  description?: string;
  isConnecting?: boolean;
  onConnect?: () => void;
  className?: string;
}) {
  return (
    <div className={`p-6 bg-muted/30 border border-border rounded-lg text-center ${className}`}>
      <WalletLogo 
        variant="hero" 
        size="lg" 
        isConnecting={isConnecting}
        className="mb-6"
      />
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6">
        {description}
      </p>

      <div className="space-y-3">
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full flex items-center justify-center space-x-3 p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <WalletProviderLogo provider="metamask" size={20} />
          <span className="font-medium">
            {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
          </span>
        </button>

        <button
          disabled
          className="w-full flex items-center justify-center space-x-3 p-3 bg-muted text-muted-foreground rounded-lg cursor-not-allowed"
        >
          <WalletProviderLogo provider="walletconnect" size={20} />
          <span className="font-medium">WalletConnect (Coming Soon)</span>
        </button>

        <button
          disabled
          className="w-full flex items-center justify-center space-x-3 p-3 bg-muted text-muted-foreground rounded-lg cursor-not-allowed"
        >
          <WalletProviderLogo provider="coinbase" size={20} />
          <span className="font-medium">Coinbase Wallet (Coming Soon)</span>
        </button>
      </div>
    </div>
  );
}