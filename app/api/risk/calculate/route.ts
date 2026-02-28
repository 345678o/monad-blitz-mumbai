import { NextRequest, NextResponse } from 'next/server';
import { calculateRiskMetrics, testRiskEngine } from '@/lib/riskEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collateralValue, debtValue, assetPrice, liquidationThreshold } = body;

    // Validate required inputs
    if (typeof collateralValue !== 'number' || typeof debtValue !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input: collateralValue and debtValue must be numbers' },
        { status: 400 }
      );
    }

    // Calculate risk metrics
    const result = calculateRiskMetrics({
      collateralValue,
      debtValue,
      assetPrice: assetPrice || 1,
      liquidationThreshold: liquidationThreshold || 0.8
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Risk calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during risk calculation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Run test suite and return results
    testRiskEngine();
    
    return NextResponse.json({
      success: true,
      message: 'Risk engine test completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Risk engine test error:', error);
    return NextResponse.json(
      { error: 'Risk engine test failed' },
      { status: 500 }
    );
  }
}