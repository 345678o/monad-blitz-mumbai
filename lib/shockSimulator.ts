/**
 * Shock Simulator Module
 * Simulates market price drops and calculates impact on DeFi positions
 */

// Interfaces
export interface ShockSimulationInputs {
  collateralValue: number;
  debtValue: number;
  liquidationThreshold: number;
  priceDropPercent: number; // 0-50%
}

export interface ShockSimulationResult {
  priceDropPercent: number;
  newCollateral: number;
  newHealthFactor: number;
  newRiskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical';
  requiredRepayment: number;
  liquidationTriggered: boolean;
}

// Risk classification constants
const CRITICAL_HF = 1.0;
const HIGH_RISK_HF = 1.2;
const MODERATE_RISK_HF = 1.5;
const TARGET_HF = 1.5;

/**
 * Classifies risk level based on health factor
 */
function classifyRiskLevel(healthFactor: number): ShockSimulationResult['newRiskLevel'] {
  if (healthFactor >= MODERATE_RISK_HF) return 'Low Risk';
  if (healthFactor >= HIGH_RISK_HF) return 'Moderate Risk';
  if (healthFactor >= CRITICAL_HF) return 'High Risk';
  return 'Critical';
}

/**
 * Core Shock Simulation Function
 * Simulates market price drops and calculates liquidation risk
 */
export function runShockSimulation(inputs: ShockSimulationInputs): ShockSimulationResult {
  const {
    collateralValue,
    debtValue,
    liquidationThreshold,
    priceDropPercent
  } = inputs;

  // Input validation
  if (collateralValue < 0 || debtValue < 0 || liquidationThreshold <= 0) {
    throw new Error('Invalid input: collateralValue and debtValue must be non-negative, liquidationThreshold must be positive');
  }

  if (priceDropPercent < 0 || priceDropPercent > 50) {
    throw new Error('Invalid priceDropPercent: must be between 0 and 50');
  }

  // Calculate new collateral after price drop
  const newCollateral = collateralValue * (1 - priceDropPercent / 100);

  // Calculate new health factor
  let newHealthFactor: number;
  if (debtValue <= 0) {
    newHealthFactor = Infinity;
  } else {
    newHealthFactor = (newCollateral * liquidationThreshold) / debtValue;
  }

  // Classify new risk level
  const newRiskLevel = classifyRiskLevel(newHealthFactor);

  // Calculate required repayment to restore HF = 1.5
  let requiredRepayment = 0;
  if (debtValue > 0 && newHealthFactor < TARGET_HF) {
    // Calculate target debt that would give HF = 1.5
    const targetDebt = (newCollateral * liquidationThreshold) / TARGET_HF;
    requiredRepayment = Math.max(0, debtValue - targetDebt);
  }

  // Check if liquidation is triggered
  const liquidationTriggered = newHealthFactor < CRITICAL_HF;

  return {
    priceDropPercent,
    newCollateral: Number(newCollateral.toFixed(2)),
    newHealthFactor: Number.isFinite(newHealthFactor) ? Number(newHealthFactor.toFixed(6)) : newHealthFactor,
    newRiskLevel,
    requiredRepayment: Number(requiredRepayment.toFixed(2)),
    liquidationTriggered
  };
}

/**
 * Run multiple shock scenarios at once
 */
export function runMultipleShockScenarios(
  baseInputs: Omit<ShockSimulationInputs, 'priceDropPercent'>,
  priceDrops: number[]
): ShockSimulationResult[] {
  return priceDrops.map(priceDropPercent => 
    runShockSimulation({ ...baseInputs, priceDropPercent })
  );
}

/**
 * Test function to validate shock simulator implementation
 */
export function testShockSimulator(): void {
  console.log('🧪 Testing Shock Simulator Implementation...\n');

  const baseInputs = {
    collateralValue: 150000,
    debtValue: 85000,
    liquidationThreshold: 0.8
  };

  // Test Case 1: No price drop (0%)
  const test1 = runShockSimulation({ ...baseInputs, priceDropPercent: 0 });
  console.log('Test 1 - No Price Drop (0%):', test1);

  // Test Case 2: Moderate drop (10%)
  const test2 = runShockSimulation({ ...baseInputs, priceDropPercent: 10 });
  console.log('Test 2 - Moderate Drop (10%):', test2);

  // Test Case 3: Severe drop (25%)
  const test3 = runShockSimulation({ ...baseInputs, priceDropPercent: 25 });
  console.log('Test 3 - Severe Drop (25%):', test3);

  // Test Case 4: Maximum drop (50%)
  const test4 = runShockSimulation({ ...baseInputs, priceDropPercent: 50 });
  console.log('Test 4 - Maximum Drop (50%):', test4);

  // Test Case 5: Edge case - No debt
  const test5 = runShockSimulation({
    collateralValue: 150000,
    debtValue: 0,
    liquidationThreshold: 0.8,
    priceDropPercent: 30
  });
  console.log('Test 5 - No Debt:', test5);

  // Test Case 6: Multiple scenarios
  const multipleTests = runMultipleShockScenarios(baseInputs, [5, 10, 15, 20, 25, 30]);
  console.log('Test 6 - Multiple Scenarios:', multipleTests);

  // Test validation errors
  try {
    runShockSimulation({ ...baseInputs, priceDropPercent: 60 }); // Should throw error
  } catch (error) {
    console.log('Test 7 - Validation Error (Expected):', (error as Error).message);
  }

  try {
    runShockSimulation({ ...baseInputs, priceDropPercent: -10 }); // Should throw error
  } catch (error) {
    console.log('Test 8 - Validation Error (Expected):', (error as Error).message);
  }

  console.log('\n✅ Shock Simulator Tests Complete!');
}

/**
 * Utility function to get shock severity description
 */
export function getShockSeverity(priceDropPercent: number): string {
  if (priceDropPercent === 0) return 'No Impact';
  if (priceDropPercent <= 5) return 'Minor Shock';
  if (priceDropPercent <= 10) return 'Moderate Shock';
  if (priceDropPercent <= 20) return 'Major Shock';
  if (priceDropPercent <= 35) return 'Severe Shock';
  return 'Extreme Shock';
}

/**
 * Utility function to get time estimate for liquidation risk
 */
export function getTimeToLiquidation(healthFactor: number): string {
  if (healthFactor < 1.0) return 'IMMEDIATE';
  if (healthFactor < 1.1) return '< 1 hour';
  if (healthFactor < 1.2) return '1-6 hours';
  if (healthFactor < 1.3) return '6-24 hours';
  if (healthFactor < 1.5) return '1-3 days';
  return '> 7 days';
}

/**
 * Generate shock simulation summary
 */
export function generateShockSummary(result: ShockSimulationResult): string {
  const { priceDropPercent, newHealthFactor, liquidationTriggered, requiredRepayment } = result;
  
  if (liquidationTriggered) {
    return `🚨 CRITICAL: ${priceDropPercent}% price drop triggers liquidation (HF: ${newHealthFactor.toFixed(3)})`;
  }
  
  if (requiredRepayment > 0) {
    return `⚠️ RISK: ${priceDropPercent}% drop requires $${requiredRepayment.toLocaleString()} repayment (HF: ${newHealthFactor.toFixed(3)})`;
  }
  
  return `✅ SAFE: ${priceDropPercent}% drop maintains healthy position (HF: ${newHealthFactor.toFixed(3)})`;
}