import { NextRequest, NextResponse } from 'next/server';
import { convertAmount, formatCurrency, CURRENCIES } from '@/lib/currency';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, fromCurrency, toCurrency, options } = body;

    // Validate required inputs
    if (typeof amount !== 'number' || !fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: 'Invalid input: amount must be a number, fromCurrency and toCurrency are required' },
        { status: 400 }
      );
    }

    // Validate supported currencies
    const supportedCurrencies = Object.keys(CURRENCIES);
    if (!supportedCurrencies.includes(fromCurrency) || !supportedCurrencies.includes(toCurrency)) {
      return NextResponse.json(
        { error: `Unsupported currency. Supported currencies: ${supportedCurrencies.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert currency
    const convertedAmount = convertAmount(amount, fromCurrency as any, toCurrency as any);
    const formattedAmount = formatCurrency(convertedAmount, toCurrency as any, options);

    return NextResponse.json({
      success: true,
      data: {
        originalAmount: amount,
        fromCurrency,
        toCurrency,
        convertedAmount,
        formattedAmount,
        exchangeRate: CURRENCIES[toCurrency as keyof typeof CURRENCIES].rate / CURRENCIES[fromCurrency as keyof typeof CURRENCIES].rate
      }
    });

  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        supportedCurrencies: Object.keys(CURRENCIES),
        exchangeRates: CURRENCIES,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Currency data error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve currency data' },
      { status: 500 }
    );
  }
}