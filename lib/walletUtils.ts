import { ethers } from 'ethers';

// Types
export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

export interface TransactionOptions {
  gasLimit?: string;
  gasPrice?: string;
  value?: string;
}

// Common ERC-20 ABI for token operations
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// Wallet utility functions
export class WalletUtils {
  private provider: ethers.BrowserProvider;
  private signer: ethers.Signer;

  constructor(provider: ethers.BrowserProvider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Get ETH balance for an address
   */
  async getETHBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw new Error('Failed to get ETH balance');
    }
  }

  /**
   * Get ERC-20 token balance
   */
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals: Number(decimals)
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw new Error('Failed to get token information');
    }
  }

  /**
   * Send ETH transaction
   */
  async sendETH(
    to: string, 
    amount: string, 
    options: TransactionOptions = {}
  ): Promise<ethers.TransactionResponse> {
    try {
      const tx = {
        to,
        value: ethers.parseEther(amount),
        gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
        gasPrice: options.gasPrice ? BigInt(options.gasPrice) : undefined,
      };

      return await this.signer.sendTransaction(tx);
    } catch (error) {
      console.error('Error sending ETH:', error);
      throw new Error('Failed to send ETH transaction');
    }
  }

  /**
   * Send ERC-20 token transaction
   */
  async sendToken(
    tokenAddress: string,
    to: string,
    amount: string,
    options: TransactionOptions = {}
  ): Promise<ethers.TransactionResponse> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await contract.transfer(to, parsedAmount, {
        gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
        gasPrice: options.gasPrice ? BigInt(options.gasPrice) : undefined,
      });

      return tx;
    } catch (error) {
      console.error('Error sending token:', error);
      throw new Error('Failed to send token transaction');
    }
  }

  /**
   * Approve token spending
   */
  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: string,
    options: TransactionOptions = {}
  ): Promise<ethers.TransactionResponse> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await contract.approve(spender, parsedAmount, {
        gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
        gasPrice: options.gasPrice ? BigInt(options.gasPrice) : undefined,
      });

      return tx;
    } catch (error) {
      console.error('Error approving token:', error);
      throw new Error('Failed to approve token');
    }
  }

  /**
   * Check token allowance
   */
  async getTokenAllowance(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<string> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const allowance = await contract.allowance(owner, spender);
      const decimals = await contract.decimals();
      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      console.error('Error getting token allowance:', error);
      throw new Error('Failed to get token allowance');
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(
    to: string,
    data?: string,
    value?: string
  ): Promise<string> {
    try {
      const tx = {
        to,
        data: data || '0x',
        value: value ? ethers.parseEther(value) : 0,
      };

      const gasEstimate = await this.provider.estimateGas(tx);
      return gasEstimate.toString();
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice?.toString() || '0';
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw new Error('Failed to get gas price');
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw new Error('Failed to wait for transaction confirmation');
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      throw new Error('Failed to get transaction receipt');
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    try {
      return await this.signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign message');
    }
  }

  /**
   * Verify a signed message
   */
  static verifyMessage(message: string, signature: string): string {
    try {
      return ethers.verifyMessage(message, signature);
    } catch (error) {
      console.error('Error verifying message:', error);
      throw new Error('Failed to verify message');
    }
  }
}

// Utility functions
export const walletUtils = {
  /**
   * Format address for display
   */
  formatAddress: (address: string, chars: number = 4): string => {
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  },

  /**
   * Validate Ethereum address
   */
  isValidAddress: (address: string): boolean => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  },

  /**
   * Convert Wei to Ether
   */
  weiToEther: (wei: string): string => {
    return ethers.formatEther(wei);
  },

  /**
   * Convert Ether to Wei
   */
  etherToWei: (ether: string): string => {
    return ethers.parseEther(ether).toString();
  },

  /**
   * Format token amount with proper decimals
   */
  formatTokenAmount: (amount: string, decimals: number, displayDecimals: number = 4): string => {
    const formatted = ethers.formatUnits(amount, decimals);
    const num = parseFloat(formatted);
    return num.toFixed(displayDecimals);
  },

  /**
   * Parse token amount to proper units
   */
  parseTokenAmount: (amount: string, decimals: number): string => {
    return ethers.parseUnits(amount, decimals).toString();
  },

  /**
   * Check if transaction was successful
   */
  isTransactionSuccessful: (receipt: ethers.TransactionReceipt): boolean => {
    return receipt.status === 1;
  },

  /**
   * Get network name by chain ID
   */
  getNetworkName: (chainId: number): string => {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      43114: 'Avalanche Mainnet',
      43113: 'Avalanche Fuji',
      250: 'Fantom Mainnet',
      4002: 'Fantom Testnet',
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  },

  /**
   * Get block explorer URL
   */
  getExplorerUrl: (chainId: number, type: 'tx' | 'address' | 'token', hash: string): string => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      5: 'https://goerli.etherscan.io',
      11155111: 'https://sepolia.etherscan.io',
      137: 'https://polygonscan.com',
      80001: 'https://mumbai.polygonscan.com',
      56: 'https://bscscan.com',
      97: 'https://testnet.bscscan.com',
      43114: 'https://snowtrace.io',
      43113: 'https://testnet.snowtrace.io',
      250: 'https://ftmscan.com',
      4002: 'https://testnet.ftmscan.com',
    };

    const baseUrl = explorers[chainId];
    if (!baseUrl) return '';

    switch (type) {
      case 'tx':
        return `${baseUrl}/tx/${hash}`;
      case 'address':
        return `${baseUrl}/address/${hash}`;
      case 'token':
        return `${baseUrl}/token/${hash}`;
      default:
        return baseUrl;
    }
  },
};