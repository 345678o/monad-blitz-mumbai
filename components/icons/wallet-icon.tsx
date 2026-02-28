import React from 'react';

interface WalletIconProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'metamask' | 'generic' | 'connected';
}

export function WalletIcon({ 
  className = '', 
  size = 24, 
  variant = 'default' 
}: WalletIconProps) {
  const baseClasses = `inline-block ${className}`;

  if (variant === 'metamask') {
    return (
      <svg
        className={baseClasses}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* MetaMask-inspired fox logo */}
        <path
          d="M20.5 4.5L13.5 9.5L15 6L20.5 4.5Z"
          fill="#E17726"
          stroke="#E17726"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 4.5L10.4 9.6L9 6L3.5 4.5Z"
          fill="#E27625"
          stroke="#E27625"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 16.5L15.5 19.5L20 20.5L21 16.6L17.5 16.5Z"
          fill="#E27625"
          stroke="#E27625"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
        <path
          d="M3 16.6L4 20.5L8.5 19.5L6.5 16.5L3 16.6Z"
          fill="#E27625"
          stroke="#E27625"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
        <path
          d="M8.2 11.5L7 13.5L11.4 13.7L11.3 8.8L8.2 11.5Z"
          fill="#E27625"
          stroke="#E27625"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
        <path
          d="M15.8 11.5L12.6 8.7L12.6 13.7L17 13.5L15.8 11.5Z"
          fill="#E27625"
          stroke="#E27625"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 19.5L11.2 18.2L8.8 16.6L8.5 19.5Z"
          fill="#D5BFB2"
          stroke="#D5BFB2"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
        <path
          d="M12.8 18.2L15.5 19.5L15.2 16.6L12.8 18.2Z"
          fill="#D5BFB2"
          stroke="#D5BFB2"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'connected') {
    return (
      <svg
        className={baseClasses}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Wallet with checkmark */}
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M7 6V4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="15" cy="12" r="2" fill="currentColor" />
        {/* Checkmark */}
        <circle cx="18" cy="6" r="3" fill="#10B981" />
        <path
          d="M16.5 6L17.5 7L19.5 5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'generic') {
    return (
      <svg
        className={baseClasses}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Generic crypto wallet */}
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  // Default wallet icon
  return (
    <svg
      className={baseClasses}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M7 6V4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// Animated wallet connection logo
export function AnimatedWalletLogo({ 
  className = '', 
  size = 48,
  isConnecting = false 
}: {
  className?: string;
  size?: number;
  isConnecting?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <WalletIcon size={size} className="text-primary" />
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-full w-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}

// Wallet status indicator
export function WalletStatusIcon({ 
  isConnected, 
  className = '', 
  size = 20 
}: {
  isConnected: boolean;
  className?: string;
  size?: number;
}) {
  if (isConnected) {
    return (
      <div className={`relative ${className}`}>
        <WalletIcon variant="connected" size={size} className="text-green-500" />
      </div>
    );
  }

  return (
    <WalletIcon 
      size={size} 
      className={`text-muted-foreground ${className}`} 
    />
  );
}