import { NextRequest, NextResponse } from 'next/server';
import { 
  executeAutoProtection,
  executeAdvancedAutoProtection,
  calculateOptimalRepayment,
  simulateAutoProtectionScenarios,
  testAutoProtectionService,
  AutoProtectionConfig
} from '@/lib/autoProtectionService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      currentHealthFactor,
      threshold,
      debtValue,
      repayPercentage,
      collateralValue,
      liquidationThreshold,
      config,
      scenarios,
      action
    } = body;

    // Validate required inputs
    if (typeof currentHealthFactor !== 'number' || typeof threshold !== 'number' || 
        typeof debtValue !== 'number' || typeof repayPercentage !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input: currentHealthFactor, threshold, debtValue, and repayPercentage must be numbers' },
        { status: 400 }
      );
    }

    const inputs = {
      currentHealthFactor,
      threshold,
      debtValue,
      repayPercentage,
      collateralValue: collateralValue || 0,
      liquidationThreshold: liquidationThreshold || 0.8
    };

    // Handle different actions
    switch (action) {
      case 'simulate_scenarios':
        if (!scenarios || !Array.isArray(scenarios)) {
          return NextResponse.json(
            { error: 'Scenarios array is required for scenario simulation' },
            { status: 400 }
          );
        }
        
        const scenarioResults = simulateAutoProtectionScenarios(
          { threshold, debtValue, repayPercentage, collateralValue, liquidationThreshold },
          scenarios
        );
        
        return NextResponse.json({
          success: true,
          data: scenarioResults
        });

      case 'calculate_optimal':
        if (typeof collateralValue !== 'number') {
          return NextResponse.json(
            { error: 'collateralValue is required for optimal calculation' },
            { status: 400 }
          );
        }

        const targetHealthFactor = body.targetHealthFactor || 1.5;
        const optimal = calculateOptimalRepayment(
          currentHealthFactor,
          targetHealthFactor,
          collateralValue,
          debtValue,
          liquidationThreshold || 0.8
        );

        return NextResponse.json({
          success: true,
          data: optimal
        });

      case 'advanced':
        if (!config) {
          return NextResponse.json(
            { error: 'Configuration is required for advanced execution' },
            { status: 400 }
          );
        }

        const advancedResult = executeAdvancedAutoProtection(inputs, config as AutoProtectionConfig);
        
        return NextResponse.json({
          success: true,
          data: advancedResult
        });

      default:
        // Standard execution
        const result = executeAutoProtection(inputs);
        
        return NextResponse.json({
          success: true,
          data: result
        });
    }

  } catch (error) {
    console.error('Auto-protection execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Run test suite
    testAutoProtectionService();
    
    return NextResponse.json({
      success: true,
      message: 'Auto-protection service test completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auto-protection test error:', error);
    return NextResponse.json(
      { error: 'Auto-protection test failed' },
      { status: 500 }
    );
  }
}