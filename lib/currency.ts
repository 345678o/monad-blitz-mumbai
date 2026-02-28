export type Currency = 'USD' | 'INR';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  rate: number; // Rate relative to USD
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    symbol: '$',
    code: 'USD',
    rate: 1,
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    rate: 83.5, // 1 USD = 83.5 INR (approximate)
  },
};

export function formatCurrency(
  amount: number,
  currency: Currency = 'USD',
  options: {
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const { compact = false, decimals = 2 } = options;
  const config = CURRENCIES[currency];
  const convertedAmount = amount * config.rate;

  if (compact && convertedAmount >= 1000) {
    if (convertedAmount >= 10000000) { // 10M+
      return `${config.symbol}${(convertedAmount / 10000000).toFixed(1)}Cr`;
    } else if (convertedAmount >= 100000) { // 1L+
      return `${config.symbol}${(convertedAmount / 100000).toFixed(1)}L`;
    } else if (convertedAmount >= 1000) { // 1K+
      return `${config.symbol}${(convertedAmount / 1000).toFixed(1)}K`;
    }
  }

  return `${config.symbol}${convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / CURRENCIES[fromCurrency].rate;
  return usdAmount * CURRENCIES[toCurrency].rate;
}