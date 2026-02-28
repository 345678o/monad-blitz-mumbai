# Wallet Connection Module

A comprehensive, reusable wallet connection module for Next.js applications using ethers.js v6. This module provides TypeScript support, error handling, and a clean React hook interface for connecting to MetaMask and other Ethereum wallets.

## Features

✅ **MetaMask Detection** - Automatically detects if MetaMask is installed  
✅ **Account Access** - Requests account access using `eth_requestAccounts`  
✅ **Signer & Provider** - Provides ethers.js signer and provider instances  
✅ **React State Management** - Stores wallet state in React hooks  
✅ **Error Handling** - Comprehensive error handling with user-friendly messages  
✅ **Network Switching** - Support for switching between different networks  
✅ **Auto-reconnection** - Automatically reconnects on page refresh  
✅ **TypeScript Support** - Full TypeScript support with proper types  
✅ **Event Listeners** - Handles account and network changes  
✅ **Utility Functions** - Common wallet operations and utilities  

## Installation

The module uses ethers.js v6, which is already included in the project dependencies:

```json
{
  "dependencies": {
    "ethers": "^6.16.0"
  }
}
```

## Core Files

### 1. `hooks/useWallet.ts`
The main React hook that provides wallet connection functionality.

### 2. `components/wallet-connect.tsx`
A ready-to-use React component for wallet connection UI.

### 3. `contexts/wallet-context.tsx`
Context provider for global wallet state management.

### 4. `lib/walletUtils.ts`
Utility functions for common wallet operations.

## Basic Usage

### Using the Hook Directly

```typescript
import { useWallet } from '@/hooks/useWallet';

function MyComponent() {
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
    getSigner,
    getProvider
  } = useWallet();

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleSign = async () => {
    const signer = await getSigner();
    if (signer) {
      const signature = await signer.signMessage("Hello World!");
      console.log(signature);
    }
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <p>Network: {chainId}</p>
          <p>Balance: {balance} ETH</p>
          <button onClick={handleSign}>Sign Message</button>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### Using the Context Provider

```typescript
// In your app root (layout.tsx or _app.tsx)
import { WalletProvider } from '@/contexts/wallet-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}

// In any child component
import { useWalletContext } from '@/contexts/wallet-context';

function MyDApp() {
  const { address, isConnected, connectWallet } = useWalletContext();
  
  return (
    <div>
      {isConnected ? (
        <p>Welcome {address}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Using the Pre-built Component

```typescript
import { WalletConnect } from '@/components/wallet-connect';

function MyApp() {
  return (
    <div>
      {/* Full featured wallet component */}
      <WalletConnect showBalance showNetwork />
      
      {/* Compact version */}
      <WalletConnect compact />
    </div>
  );
}
```

## Advanced Usage

### Protected Routes with HOC

```typescript
import { withWallet } from '@/contexts/wallet-context';

const ProtectedComponent = withWallet(() => {
  return <div>This component requires wallet connection</div>;
});

// With custom fallback
const ProtectedWithFallback = withWallet(() => {
  return <div>Protected content</div>;
}, {
  fallback: <div>Please connect your wallet to continue</div>
});
```

### Using Wallet Utilities

```typescript
import { WalletUtils, walletUtils } from '@/lib/walletUtils';
import { useWalletContext } from '@/contexts/wallet-context';

function TokenOperations() {
  const { getProvider, getSigner, address } = useWalletContext();

  const handleTokenTransfer = async () => {
    const provider = getProvider();
    const signer = await getSigner();
    
    if (provider && signer) {
      const utils = new WalletUtils(provider, signer);
      
      // Get token balance
      const balance = await utils.getTokenBalance(
        '0xTokenAddress',
        address!
      );
      
      // Send tokens
      const tx = await utils.sendToken(
        '0xTokenAddress',
        '0xRecipientAddress',
        '10.0'
      );
      
      // Wait for confirmation
      const receipt = await utils.waitForTransaction(tx.hash);
      console.log('Transaction confirmed:', receipt);
    }
  };

  return (
    <button onClick={handleTokenTransfer}>
      Send Tokens
    </button>
  );
}
```

### Network Switching

```typescript
function NetworkSwitcher() {
  const { chainId, switchNetwork } = useWallet();

  const networks = [
    { id: 1, name: 'Ethereum Mainnet' },
    { id: 137, name: 'Polygon' },
    { id: 5, name: 'Goerli Testnet' }
  ];

  return (
    <div>
      <p>Current Network: {chainId}</p>
      {networks.map(network => (
        <button
          key={network.id}
          onClick={() => switchNetwork(network.id)}
          disabled={chainId === network.id}
        >
          {network.name}
        </button>
      ))}
    </div>
  );
}
```

## API Reference

### useWallet Hook

#### Returns

```typescript
interface WalletHook {
  // State
  address: string | null;           // Connected wallet address
  isConnected: boolean;             // Connection status
  isConnecting: boolean;            // Loading state during connection
  error: string | null;             // Error message if any
  chainId: number | null;           // Current network chain ID
  balance: string | null;           // ETH balance in Ether

  // Methods
  connectWallet: () => Promise<void>;              // Connect to wallet
  disconnectWallet: () => void;                    // Disconnect wallet
  switchNetwork: (chainId: number) => Promise<void>; // Switch network
  getSigner: () => Promise<ethers.Signer | null>;  // Get ethers signer
  getProvider: () => ethers.BrowserProvider | null; // Get ethers provider
}
```

### WalletConnect Component Props

```typescript
interface WalletConnectProps {
  className?: string;     // Additional CSS classes
  showBalance?: boolean;  // Show ETH balance (default: true)
  showNetwork?: boolean;  // Show network info (default: true)
  compact?: boolean;      // Use compact layout (default: false)
}
```

### WalletUtils Class

```typescript
class WalletUtils {
  // Token operations
  getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string>
  getTokenInfo(tokenAddress: string): Promise<TokenInfo>
  sendToken(tokenAddress: string, to: string, amount: string): Promise<TransactionResponse>
  approveToken(tokenAddress: string, spender: string, amount: string): Promise<TransactionResponse>
  getTokenAllowance(owner: string, spender: string): Promise<string>

  // ETH operations
  getETHBalance(address: string): Promise<string>
  sendETH(to: string, amount: string): Promise<TransactionResponse>

  // Transaction utilities
  estimateGas(to: string, data?: string, value?: string): Promise<string>
  getGasPrice(): Promise<string>
  waitForTransaction(txHash: string, confirmations?: number): Promise<TransactionReceipt>
  getTransactionReceipt(txHash: string): Promise<TransactionReceipt>

  // Signing
  signMessage(message: string): Promise<string>
  static verifyMessage(message: string, signature: string): string
}
```

## Error Handling

The module provides comprehensive error handling for common scenarios:

- **MetaMask not installed**: Displays installation prompt
- **User rejection**: User-friendly message when connection is rejected
- **Network errors**: Handles network connection issues
- **Transaction failures**: Proper error messages for failed transactions

```typescript
const { error } = useWallet();

if (error) {
  // Handle different error types
  if (error.includes('MetaMask')) {
    // Show MetaMask installation guide
  } else if (error.includes('rejected')) {
    // Show user rejection message
  } else {
    // Show generic error
  }
}
```

## Supported Networks

The module includes configurations for popular networks:

- Ethereum Mainnet (1)
- Goerli Testnet (5)
- Sepolia Testnet (11155111)
- Polygon Mainnet (137)
- Polygon Mumbai (80001)
- BSC Mainnet (56)
- BSC Testnet (97)
- Avalanche Mainnet (43114)
- Avalanche Fuji (43113)
- Fantom Mainnet (250)
- Fantom Testnet (4002)

## Demo

Visit `/wallet-demo` to see a complete demonstration of all features including:

- Basic wallet connection
- Message signing
- Network information
- Balance checking
- Utility functions
- Error handling

## Best Practices

1. **Always check connection status** before performing wallet operations
2. **Handle errors gracefully** with user-friendly messages
3. **Use the context provider** for global wallet state management
4. **Implement loading states** for better user experience
5. **Validate addresses** before sending transactions
6. **Wait for transaction confirmations** before updating UI
7. **Use proper gas estimation** for transactions

## Security Considerations

- Never store private keys or sensitive data
- Always validate user inputs before transactions
- Use proper error boundaries to catch wallet errors
- Implement proper access controls for protected features
- Validate contract addresses and transaction parameters

## Troubleshooting

### Common Issues

1. **"MetaMask not detected"**
   - Ensure MetaMask extension is installed and enabled
   - Check if running in a browser environment

2. **"User rejected connection"**
   - User declined the connection request in MetaMask
   - Provide clear instructions to accept the connection

3. **"Network mismatch"**
   - Use the `switchNetwork` function to change networks
   - Provide network switching UI for better UX

4. **"Transaction failed"**
   - Check gas limits and prices
   - Ensure sufficient balance for transactions
   - Validate contract addresses and parameters

### Development Tips

- Use browser developer tools to debug wallet interactions
- Test with different networks and account states
- Implement proper loading and error states
- Use TypeScript for better development experience
- Test wallet disconnection and reconnection scenarios

## License

This wallet connection module is part of the Financial Analytics Platform and follows the same licensing terms.