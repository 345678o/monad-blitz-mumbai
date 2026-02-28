import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Types
interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  chainId: number | null;
  balance: string | null;
}

interface WalletHook extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  getSigner: () => Promise<ethers.Signer | null>;
  getProvider: () => ethers.BrowserProvider | null;
}

// Error messages
const ERROR_MESSAGES = {
  NO_METAMASK: 'MetaMask is not installed. Please install MetaMask to continue.',
  USER_REJECTED: 'Connection request was rejected by the user.',
  NETWORK_ERROR: 'Failed to connect to the network.',
  ACCOUNT_ACCESS_DENIED: 'Access to accounts was denied.',
  UNKNOWN_ERROR: 'An unknown error occurred while connecting to the wallet.',
  SWITCH_NETWORK_FAILED: 'Failed to switch network.',
} as const;

// Network configurations
const NETWORKS = {
  1: { name: 'Ethereum Mainnet', rpcUrl: 'https://mainnet.infura.io/v3/' },
  5: { name: 'Goerli Testnet', rpcUrl: 'https://goerli.infura.io/v3/' },
  11155111: { name: 'Sepolia Testnet', rpcUrl: 'https://sepolia.infura.io/v3/' },
  137: { name: 'Polygon Mainnet', rpcUrl: 'https://polygon-rpc.com/' },
  80001: { name: 'Polygon Mumbai', rpcUrl: 'https://rpc-mumbai.maticvigil.com/' },
} as const;

// Check if MetaMask is installed
const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).ethereum?.isMetaMask;
};

// Get ethereum provider
const getEthereumProvider = () => {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum;
};

export const useWallet = (): WalletHook => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    chainId: null,
    balance: null,
  });

  // Get provider instance
  const getProvider = useCallback((): ethers.BrowserProvider | null => {
    const ethereum = getEthereumProvider();
    if (!ethereum) return null;
    return new ethers.BrowserProvider(ethereum);
  }, []);

  // Get signer instance
  const getSigner = useCallback(async (): Promise<ethers.Signer | null> => {
    const provider = getProvider();
    if (!provider) return null;
    try {
      return await provider.getSigner();
    } catch (error) {
      console.error('Failed to get signer:', error);
      return null;
    }
  }, [getProvider]);

  // Update wallet balance
  const updateBalance = useCallback(async (address: string) => {
    try {
      const provider = getProvider();
      if (!provider) return;

      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      
      setWalletState(prev => ({
        ...prev,
        balance: parseFloat(balanceInEth).toFixed(4)
      }));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [getProvider]);

  // Connect wallet function
  const connectWallet = useCallback(async (): Promise<void> => {
    // Check if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.NO_METAMASK,
        isConnecting: false,
      }));
      return;
    }

    setWalletState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const ethereum = getEthereumProvider();
      if (!ethereum) {
        throw new Error(ERROR_MESSAGES.NO_METAMASK);
      }

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(ERROR_MESSAGES.ACCOUNT_ACCESS_DENIED);
      }

      const address = accounts[0];
      
      // Get network information
      const provider = getProvider();
      if (!provider) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Update state
      setWalletState(prev => ({
        ...prev,
        address,
        isConnected: true,
        isConnecting: false,
        chainId,
        error: null,
      }));

      // Update balance
      await updateBalance(address);

      // Store connection in localStorage for persistence
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);

    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      let errorMessage: string = ERROR_MESSAGES.UNKNOWN_ERROR;
      
      if (error.code === 4001) {
        errorMessage = ERROR_MESSAGES.USER_REJECTED;
      } else if (error.code === -32002) {
        errorMessage = 'Connection request is already pending. Please check MetaMask.';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = ERROR_MESSAGES.USER_REJECTED;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
        isConnected: false,
        address: null,
      }));
    }
  }, [getProvider, updateBalance]);

  // Disconnect wallet function
  const disconnectWallet = useCallback((): void => {
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      chainId: null,
      balance: null,
    });

    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  }, []);

  // Switch network function
  const switchNetwork = useCallback(async (targetChainId: number): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.NO_METAMASK,
      }));
      return;
    }

    try {
      const ethereum = getEthereumProvider();
      if (!ethereum) return;

      const chainIdHex = `0x${targetChainId.toString(16)}`;

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });

      // Update chain ID in state
      setWalletState(prev => ({
        ...prev,
        chainId: targetChainId,
        error: null,
      }));

    } catch (error: any) {
      console.error('Network switch error:', error);
      
      // If network doesn't exist, try to add it
      if (error.code === 4902) {
        try {
          const networkConfig = NETWORKS[targetChainId as keyof typeof NETWORKS];
          if (networkConfig) {
            await getEthereumProvider()?.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: networkConfig.name,
                rpcUrls: [networkConfig.rpcUrl],
              }],
            });
          }
        } catch (addError) {
          console.error('Failed to add network:', addError);
          setWalletState(prev => ({
            ...prev,
            error: ERROR_MESSAGES.SWITCH_NETWORK_FAILED,
          }));
        }
      } else {
        setWalletState(prev => ({
          ...prev,
          error: ERROR_MESSAGES.SWITCH_NETWORK_FAILED,
        }));
      }
    }
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== walletState.address) {
      setWalletState(prev => ({
        ...prev,
        address: accounts[0],
        error: null,
      }));
      updateBalance(accounts[0]);
    }
  }, [walletState.address, disconnectWallet, updateBalance]);

  // Handle chain changes
  const handleChainChanged = useCallback((chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    setWalletState(prev => ({
      ...prev,
      chainId: newChainId,
      error: null,
    }));
    
    // Update balance for new network
    if (walletState.address) {
      updateBalance(walletState.address);
    }
  }, [walletState.address, updateBalance]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    disconnectWallet();
  }, [disconnectWallet]);

  // Set up event listeners
  useEffect(() => {
    const ethereum = getEthereumProvider();
    if (!ethereum) return;

    // Add event listeners
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('disconnect', handleDisconnect);

    // Cleanup function
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [handleAccountsChanged, handleChainChanged, handleDisconnect]);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      const savedAddress = localStorage.getItem('walletAddress');
      
      if (wasConnected === 'true' && savedAddress && isMetaMaskInstalled()) {
        try {
          const ethereum = getEthereumProvider();
          if (!ethereum) return;

          const accounts = await ethereum.request({ method: 'eth_accounts' });
          
          if (accounts && accounts.length > 0 && accounts[0] === savedAddress) {
            const provider = getProvider();
            if (provider) {
              const network = await provider.getNetwork();
              const chainId = Number(network.chainId);

              setWalletState(prev => ({
                ...prev,
                address: accounts[0],
                isConnected: true,
                chainId,
                error: null,
              }));

              await updateBalance(accounts[0]);
            }
          } else {
            // Clear invalid stored data
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
        }
      }
    };

    autoConnect();
  }, [getProvider, updateBalance]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getSigner,
    getProvider,
  };
};