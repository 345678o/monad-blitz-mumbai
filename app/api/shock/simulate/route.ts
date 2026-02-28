import { NextRequest, NextResponse } from 'next/server';
import { 
  runShockSimulation, 
  runMultipleShockScenarios, 
  testShockSimulator,
  generateShockSummary 
} from '@/lib/shockSimulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      collateralValue, 
      debtValue, 
      liquidationThreshold, 
      priceDropPercent,
      scenarios 
    } = body;

    // Validate required inputs
    if (typeof collateralValue !== 'number' || typeof debtValue !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input: collateralValue and debtValue must be numbers' },
        { status: 400 }
      );
    }

    // Handle multiple scenarios
    if (scenarios && Array.isArray(scenarios)) {
      const results = runMultipleShockScenarios({
        collateralValue,
        debtValue,
        liquidationThreshold: liquidationThreshold || 0.8
      }, scenarios);

      // Generate summary for the worst-case scenario
      const worstCase = results.reduce((worst, current) => 
        current.newHealthFactor < worst.newHealthFactor ? current : worst
      );
      const summary = generateShockSummary(worstCase);

      return NextResponse.json({
        success: true,
        data: {
          scenarios: results,
          summary,
          worstCase
        }
      });
    }

    // Single scenario simulation
    if (typeof priceDropPercent !== 'number' || priceDropPercent < 0 || priceDropPercent > 50) {
      return NextResponse.json(
        { error: 'Invalid priceDropPercent: must be between 0 and 50' },
        { status: 400 }
      );
    }

    const result = runShockSimulation({
      collateralValue,
      debtValue,
      liquidationThreshold: liquidationThreshold || 0.8,
      priceDropPercent
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Shock simulation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Run test suite
    testShockSimulator();
    
    return NextResponse.json({
      success: true,
      message: 'Shock simulator test completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Shock simulator test error:', error);
    return NextResponse.json(
      { error: 'Shock simulator test failed' },
      { status: 500 }
    );
  }
}