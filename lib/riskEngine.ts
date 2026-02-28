// Core Risk Calculation Interfaces
export interface RiskCalculationInputs {
  collateralValue: number;
  debtValue: number;
  assetPrice: number;
  liquidationThreshold?: number;
}

export interface RiskCalculationResult {
  healthFactor: number;
  liquidationPrice: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical';
  recommendedRepayment: number;
  recommendedAction: string;
}

export interface RiskMetrics {
  healthFactor: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical';
  liquidationPrice: number;
  stressTestResults: StressTestResult[];
  recommendedActions: string[];
  utilizationRate: number;
  safetyBuffer: number;
}

export interface StressTestResult {
  scenario: string;
  priceChange: number;
  resultingHealthFactor: number;
  outcome: 'Safe' | 'At Risk' | 'Liquidation';
}

export interface ShockSimulation {
  priceDropPercent: number;
  newCollateralValue: number;
  newHealthFactor: number;
  newLiquidationPrice: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical';
  timeToLiquidation: string;
  requiredCollateral: number;
  requiredRepayment: number;
  outcome: 'Safe' | 'At Risk' | 'Liquidation';
  warning: string;
}

export interface PortfolioData {
  totalCollateral: number;
  totalDebt: number;
  collateralAssets: AssetPosition[];
  debtAssets: AssetPosition[];
  currentPrice: number;
}

export interface AssetPosition {
  asset: string;
  value: number;
  amount: number;
  price: number;
  interestRate?: number;
}

const LIQUIDATION_THRESHOLD = 0.8; // 80% LTV
const CRITICAL_HF = 1.0;
const HIGH_RISK_HF = 1.2;
const MODERATE_RISK_HF = 1.5;
const TARGET_HF = 1.5; // Target health factor for recommendations

/**
 * Core Risk Calculation Function
 * Calculates real-time liquidation risk based on collateral, debt, and asset price
 */
export function calculateRiskMetrics(inputs: RiskCalculationInputs): RiskCalculationResult {
  const {
    collateralValue,
    debtValue,
    assetPrice,
    liquidationThreshold = LIQUIDATION_THRESHOLD
  } = inputs;

  // Input validation
  if (collateralValue < 0 || debtValue < 0 || assetPrice <= 0 || liquidationThreshold <= 0) {
    throw new Error('Invalid input: values must be non-negative and liquidationThreshold must be positive');
  }

  // Handle edge cases
  let healthFactor: number;
  if (debtValue <= 0) {
    healthFactor = Infinity;
  } else if (collateralValue <= 0) {
    healthFactor = 0;
  } else {
    // Core calculation: HF = (collateralValue × liquidationThreshold) / debtValue
    healthFactor = (collateralValue * liquidationThreshold) / debtValue;
  }

  // Calculate liquidation price
  let liquidationPrice: number;
  if (debtValue <= 0 || liquidationThreshold <= 0) {
    liquidationPrice = 0;
  } else {
    // Liquidation Price = debtValue / liquidationThreshold
    liquidationPrice = debtValue / liquidationThreshold;
  }

  // Risk classification
  let riskLevel: RiskCalculationResult['riskLevel'];
  if (healthFactor >= MODERATE_RISK_HF) {
    riskLevel = 'Low Risk';
  } else if (healthFactor >= HIGH_RISK_HF) {
    riskLevel = 'Moderate Risk';
  } else if (healthFactor >= CRITICAL_HF) {
    riskLevel = 'High Risk';
  } else {
    riskLevel = 'Critical';
  }

  // Calculate recommended repayment and action
  let recommendedRepayment = 0;
  let recommendedAction = 'Position Stable';

  if (healthFactor < HIGH_RISK_HF && debtValue > 0) {
    // Calculate repayment needed to restore HF to 1.5
    const targetDebt = (collateralValue * liquidationThreshold) / TARGET_HF;
    recommendedRepayment = Math.max(0, debtValue - targetDebt);
    
    if (healthFactor < CRITICAL_HF) {
      recommendedAction = `URGENT: Repay ${recommendedRepayment.toFixed(2)} immediately to avoid liquidation`;
    } else {
      recommendedAction = `Repay ${recommendedRepayment.toFixed(2)} to restore safe health factor of ${TARGET_HF}`;
    }
  }

  return {
    healthFactor: Number.isFinite(healthFactor) ? Number(healthFactor.toFixed(6)) : healthFactor,
    liquidationPrice: Number(liquidationPrice.toFixed(2)),
    riskLevel,
    recommendedRepayment: Number(recommendedRepayment.toFixed(2)),
    recommendedAction
  };
}

/**
 * Test function to validate calculateRiskMetrics implementation
 */
export function testRiskEngine(): void {
  console.log('🧪 Testing Risk Engine Implementation...\n');

  // Test Case 1: Normal healthy position
  const test1 = calculateRiskMetrics({
    collateralValue: 150000,
    debtValue: 85000,
    assetPrice: 3000,
    liquidationThreshold: 0.8
  });
  console.log('Test 1 - Healthy Position:', test1);

  // Test Case 2: High risk position
  const test2 = calculateRiskMetrics({
    collateralValue: 100000,
    debtValue: 90000,
    assetPrice: 3000,
    liquidationThreshold: 0.8
  });
  console.log('Test 2 - High Risk Position:', test2);

  // Test Case 3: Critical position
  const test3 = calculateRiskMetrics({
    collateralValue: 80000,
    debtValue: 90000,
    assetPrice: 3000,
    liquidationThreshold: 0.8
  });
  console.log('Test 3 - Critical Position:', test3);

  // Test Case 4: No debt (infinite health factor)
  const test4 = calculateRiskMetrics({
    collateralValue: 150000,
    debtValue: 0,
    assetPrice: 3000,
    liquidationThreshold: 0.8
  });
  console.log('Test 4 - No Debt:', test4);

  // Test Case 5: No collateral (zero health factor)
  const test5 = calculateRiskMetrics({
    collateralValue: 0,
    debtValue: 85000,
    assetPrice: 3000,
    liquidationThreshold: 0.8
  });
  console.log('Test 5 - No Collateral:', test5);

  console.log('\n✅ Risk Engine Tests Complete!');
}

export function calculateHealthFactor(collateral: number, debt: number): number {
  if (debt === 0) return Infinity;
  return (collateral * LIQUIDATION_THRESHOLD) / debt;
}

export function getRiskLevel(healthFactor: number): RiskMetrics['riskLevel'] {
  if (healthFactor >= MODERATE_RISK_HF) return 'Low Risk';
  if (healthFactor >= HIGH_RISK_HF) return 'Moderate Risk';
  if (healthFactor >= CRITICAL_HF) return 'High Risk';
  return 'Critical';
}

export function calculateLiquidationPrice(
  collateral: number,
  debt: number,
  currentPrice: number
): number {
  // Price at which HF = 1.0
  const liquidationCollateral = debt / LIQUIDATION_THRESHOLD;
  return (liquidationCollateral / collateral) * currentPrice;
}

export function runStressTests(
  collateral: number,
  debt: number
): StressTestResult[] {
  const scenarios = [
    { label: 'ETH -5%', change: -0.05 },
    { label: 'ETH -10%', change: -0.10 },
    { label: 'ETH -15%', change: -0.15 },
    { label: 'ETH -20%', change: -0.20 },
    { label: 'ETH -25%', change: -0.25 },
  ];

  return scenarios.map(({ label, change }) => {
    const newCollateral = collateral * (1 + change);
    const newHF = calculateHealthFactor(newCollateral, debt);
    
    let outcome: StressTestResult['outcome'];
    if (newHF < CRITICAL_HF) outcome = 'Liquidation';
    else if (newHF < HIGH_RISK_HF) outcome = 'At Risk';
    else outcome = 'Safe';

    return {
      scenario: label,
      priceChange: change * 100,
      resultingHealthFactor: newHF,
      outcome,
    };
  });
}

export function simulateMarketShock(
  collateral: number,
  debt: number,
  currentPrice: number,
  priceDropPercent: number
): ShockSimulation {
  // Calculate new values after price drop
  const priceMultiplier = 1 - (priceDropPercent / 100);
  const newCollateralValue = collateral * priceMultiplier;
  const newHealthFactor = calculateHealthFactor(newCollateralValue, debt);
  const newLiquidationPrice = calculateLiquidationPrice(newCollateralValue, debt, currentPrice * priceMultiplier);
  
  // Determine risk level
  const riskLevel = getRiskLevel(newHealthFactor);
  
  // Calculate time to liquidation (simplified - assumes linear price decline)
  let timeToLiquidation = 'N/A';
  if (newHealthFactor < CRITICAL_HF) {
    timeToLiquidation = 'IMMEDIATE';
  } else if (newHealthFactor < HIGH_RISK_HF) {
    const priceToLiquidation = ((newHealthFactor - 1.0) / newHealthFactor) * 100;
    if (priceToLiquidation < 5) {
      timeToLiquidation = '< 1 hour';
    } else if (priceToLiquidation < 10) {
      timeToLiquidation = '1-6 hours';
    } else {
      timeToLiquidation = '6-24 hours';
    }
  } else if (newHealthFactor < MODERATE_RISK_HF) {
    timeToLiquidation = '1-3 days';
  } else {
    timeToLiquidation = '> 7 days';
  }
  
  // Calculate required collateral to restore HF to 1.5
  const targetHF = 1.5;
  const requiredCollateralValue = (debt * targetHF) / LIQUIDATION_THRESHOLD;
  const requiredCollateral = Math.max(0, requiredCollateralValue - newCollateralValue);
  
  // Calculate required repayment to restore HF to 1.5
  const requiredDebt = (newCollateralValue * LIQUIDATION_THRESHOLD) / targetHF;
  const requiredRepayment = Math.max(0, debt - requiredDebt);
  
  // Determine outcome
  let outcome: ShockSimulation['outcome'];
  if (newHealthFactor < CRITICAL_HF) outcome = 'Liquidation';
  else if (newHealthFactor < HIGH_RISK_HF) outcome = 'At Risk';
  else outcome = 'Safe';
  
  // Generate warning message
  let warning = '';
  if (outcome === 'Liquidation') {
    warning = '🚨 CRITICAL: Position will be liquidated. Immediate action required!';
  } else if (outcome === 'At Risk') {
    warning = '⚠️ HIGH RISK: Liquidation likely if volatility continues. Add collateral or repay debt.';
  } else if (newHealthFactor < MODERATE_RISK_HF) {
    warning = '⚡ MODERATE RISK: Position vulnerable to further price drops. Monitor closely.';
  } else {
    warning = '✓ Position remains safe under this scenario.';
  }
  
  return {
    priceDropPercent,
    newCollateralValue,
    newHealthFactor,
    newLiquidationPrice,
    riskLevel,
    timeToLiquidation,
    requiredCollateral,
    requiredRepayment,
    outcome,
    warning,
  };
}

export function getRecommendedActions(
  healthFactor: number,
  collateral: number,
  debt: number
): string[] {
  const actions: string[] = [];

  if (healthFactor < CRITICAL_HF) {
    actions.push('URGENT: Add collateral immediately to avoid liquidation');
    actions.push(`Repay at least $${(debt * 0.2).toLocaleString()} to restore health`);
    actions.push('Enable auto-protection bot for emergency response');
  } else if (healthFactor < HIGH_RISK_HF) {
    actions.push('Add collateral to increase safety buffer');
    actions.push(`Consider repaying $${(debt * 0.15).toLocaleString()} of debt`);
    actions.push('Monitor position closely for market volatility');
  } else if (healthFactor < MODERATE_RISK_HF) {
    actions.push(`Increase collateral by $${(collateral * 0.1).toLocaleString()} for optimal safety`);
    actions.push('Review debt positions for optimization opportunities');
    actions.push('Set up price alerts for key liquidation levels');
  } else {
    actions.push('Position is healthy - maintain current strategy');
    actions.push('Consider rebalancing to optimize capital efficiency');
    actions.push('Review interest rates for potential savings');
  }

  return actions;
}

export function analyzeRisk(portfolio: PortfolioData): RiskMetrics {
  const { totalCollateral, totalDebt, currentPrice } = portfolio;
  
  const healthFactor = calculateHealthFactor(totalCollateral, totalDebt);
  const riskLevel = getRiskLevel(healthFactor);
  const liquidationPrice = calculateLiquidationPrice(
    totalCollateral,
    totalDebt,
    currentPrice
  );
  const stressTestResults = runStressTests(totalCollateral, totalDebt);
  const recommendedActions = getRecommendedActions(
    healthFactor,
    totalCollateral,
    totalDebt
  );
  
  const utilizationRate = (totalDebt / totalCollateral) * 100;
  const safetyBuffer = ((healthFactor - 1) / healthFactor) * 100;

  return {
    healthFactor,
    riskLevel,
    liquidationPrice,
    stressTestResults,
    recommendedActions,
    utilizationRate,
    safetyBuffer,
  };
}

export function calculateAssetConcentration(
  assets: AssetPosition[]
): { asset: string; percentage: number }[] {
  const total = assets.reduce((sum, a) => sum + a.value, 0);
  return assets.map(a => ({
    asset: a.asset,
    percentage: (a.value / total) * 100,
  }));
}
