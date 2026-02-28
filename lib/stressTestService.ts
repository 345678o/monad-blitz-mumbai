/**
 * Stress Test Service Module
 * Advanced enterprise feature for comprehensive risk scenario analysis
 */

// Interfaces
export interface StressTestInputs {
  collateralValue: number;
  debtValue: number;
  liquidationThreshold?: number;
}

export interface StressTestScenario {
  scenarioName: string;
  priceDropPercent: number;
  newCollateralValue: number;
  newHealthFactor: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical';
  timeToLiquidation: string;
  liquidationTriggered: boolean;
  requiredAction: string;
  severity: 'Safe' | 'Warning' | 'Danger' | 'Critical';
}

export interface StressTestResults {
  originalHealthFactor: number;
  originalRiskLevel: string;
  scenarios: StressTestScenario[];
  summary: {
    safeScenariosCount: number;
    warningScenariosCount: number;
    dangerScenariosCount: number;
    criticalScenariosCount: number;
    worstCaseScenario: StressTestScenario;
    recommendedActions: string[];
  };
  timestamp: Date;
}

// Constants
const DEFAULT_LIQUIDATION_THRESHOLD = 0.8;
const CRITICAL_HF = 1.0;
const HIGH_RISK_HF = 1.2;
const MODERATE_RISK_HF = 1.5;
const TARGET_HF = 1.5;

// Predefined stress test scenarios
const PREDEFINED_SCENARIOS = [
  { name: 'Minor Correction', dropPercent: 5 },
  { name: 'Market Dip', dropPercent: 10 },
  { name: 'Significant Drop', dropPercent: 20 },
  { name: 'Market Crash', dropPercent: 30 }
];

/**
 * Classify risk level based on health factor
 */
function classifyRiskLevel(healthFactor: number): StressTestScenario['riskLevel'] {
  if (healthFactor >= MODERATE_RISK_HF) return 'Low Risk';
  if (healthFactor >= HIGH_RISK_HF) return 'Moderate Risk';
  if (healthFactor >= CRITICAL_HF) return 'High Risk';
  return 'Critical';
}

/**
 * Estimate time to liquidation based on health factor
 * Mock calculation for enterprise demonstration
 */
function estimateTimeToLiquidation(healthFactor: number): string {
  if (healthFactor < CRITICAL_HF) return 'IMMEDIATE';
  if (healthFactor < 1.05) return '< 1 hour';
  if (healthFactor < 1.1) return '1-6 hours';
  if (healthFactor < 1.2) return '6-24 hours';
  if (healthFactor < 1.3) return '1-3 days';
  if (healthFactor < 1.5) return '3-7 days';
  return '> 7 days';
}

/**
 * Determine scenario severity
 */
function getScenarioSeverity(healthFactor: number, liquidationTriggered: boolean): StressTestScenario['severity'] {
  if (liquidationTriggered) return 'Critical';
  if (healthFactor < HIGH_RISK_HF) return 'Danger';
  if (healthFactor < MODERATE_RISK_HF) return 'Warning';
  return 'Safe';
}

/**
 * Generate required action recommendation
 */
function getRequiredAction(
  healthFactor: number, 
  collateralValue: number, 
  debtValue: number, 
  liquidationThreshold: number
): string {
  if (healthFactor < CRITICAL_HF) {
    const requiredCollateral = (debtValue / liquidationThreshold) - collateralValue;
    const requiredRepayment = debtValue - (collateralValue * liquidationThreshold);
    return `URGENT: Add $${requiredCollateral.toFixed(0)} collateral OR repay $${requiredRepayment.toFixed(0)} debt immediately`;
  }
  
  if (healthFactor < HIGH_RISK_HF) {
    const targetCollateral = (debtValue * TARGET_HF) / liquidationThreshold;
    const additionalCollateral = targetCollateral - collateralValue;
    return `Add $${additionalCollateral.toFixed(0)} collateral to restore safe health factor`;
  }
  
  if (healthFactor < MODERATE_RISK_HF) {
    return 'Monitor position closely and consider adding collateral buffer';
  }
  
  return 'Position remains safe under this scenario';
}

/**
 * Run comprehensive stress test scenarios
 */
export function runStressTest(inputs: StressTestInputs): StressTestResults {
  const {
    collateralValue,
    debtValue,
    liquidationThreshold = DEFAULT_LIQUIDATION_THRESHOLD
  } = inputs;

  // Input validation
  if (collateralValue < 0 || debtValue < 0 || liquidationThreshold <= 0) {
    throw new Error('Invalid input: collateralValue and debtValue must be non-negative, liquidationThreshold must be positive');
  }

  // Calculate original health factor
  const originalHealthFactor = debtValue <= 0 ? Infinity : (collateralValue * liquidationThreshold) / debtValue;
  const originalRiskLevel = classifyRiskLevel(originalHealthFactor);

  // Run predefined scenarios
  const scenarios: StressTestScenario[] = PREDEFINED_SCENARIOS.map(scenario => {
    // Calculate new collateral value after price drop
    const newCollateralValue = collateralValue * (1 - scenario.dropPercent / 100);
    
    // Calculate new health factor
    const newHealthFactor = debtValue <= 0 ? Infinity : (newCollateralValue * liquidationThreshold) / debtValue;
    
    // Classify risk and determine other metrics
    const riskLevel = classifyRiskLevel(newHealthFactor);
    const timeToLiquidation = estimateTimeToLiquidation(newHealthFactor);
    const liquidationTriggered = newHealthFactor < CRITICAL_HF;
    const severity = getScenarioSeverity(newHealthFactor, liquidationTriggered);
    const requiredAction = getRequiredAction(newHealthFactor, newCollateralValue, debtValue, liquidationThreshold);

    return {
      scenarioName: scenario.name,
      priceDropPercent: scenario.dropPercent,
      newCollateralValue: Number(newCollateralValue.toFixed(2)),
      newHealthFactor: Number.isFinite(newHealthFactor) ? Number(newHealthFactor.toFixed(6)) : newHealthFactor,
      riskLevel,
      timeToLiquidation,
      liquidationTriggered,
      requiredAction,
      severity
    };
  });

  // Generate summary statistics
  const safeScenariosCount = scenarios.filter(s => s.severity === 'Safe').length;
  const warningScenariosCount = scenarios.filter(s => s.severity === 'Warning').length;
  const dangerScenariosCount = scenarios.filter(s => s.severity === 'Danger').length;
  const criticalScenariosCount = scenarios.filter(s => s.severity === 'Critical').length;

  // Find worst case scenario (lowest health factor)
  const worstCaseScenario = scenarios.reduce((worst, current) => {
    if (current.newHealthFactor === Infinity) return worst;
    if (worst.newHealthFactor === Infinity) return current;
    return current.newHealthFactor < worst.newHealthFactor ? current : worst;
  });

  // Generate recommended actions
  const recommendedActions: string[] = [];
  
  if (criticalScenariosCount > 0) {
    recommendedActions.push('CRITICAL: Position vulnerable to liquidation in severe market conditions');
    recommendedActions.push('Immediately increase collateral or reduce debt exposure');
    recommendedActions.push('Enable auto-protection mechanisms');
  } else if (dangerScenariosCount > 0) {
    recommendedActions.push('HIGH RISK: Position at risk in major market downturns');
    recommendedActions.push('Consider increasing safety buffer');
    recommendedActions.push('Monitor market conditions closely');
  } else if (warningScenariosCount > 0) {
    recommendedActions.push('MODERATE RISK: Position stable but could benefit from optimization');
    recommendedActions.push('Consider minor collateral additions for extra safety');
  } else {
    recommendedActions.push('SAFE: Position well-protected against market volatility');
    recommendedActions.push('Maintain current risk management strategy');
  }

  return {
    originalHealthFactor: Number.isFinite(originalHealthFactor) ? Number(originalHealthFactor.toFixed(6)) : originalHealthFactor,
    originalRiskLevel,
    scenarios,
    summary: {
      safeScenariosCount,
      warningScenariosCount,
      dangerScenariosCount,
      criticalScenariosCount,
      worstCaseScenario,
      recommendedActions
    },
    timestamp: new Date()
  };
}

/**
 * Run custom stress test with user-defined scenarios
 */
export function runCustomStressTest(
  inputs: StressTestInputs,
  customScenarios: Array<{ name: string; dropPercent: number }>
): StressTestResults {
  const {
    collateralValue,
    debtValue,
    liquidationThreshold = DEFAULT_LIQUIDATION_THRESHOLD
  } = inputs;

  // Calculate original health factor
  const originalHealthFactor = debtValue <= 0 ? Infinity : (collateralValue * liquidationThreshold) / debtValue;
  const originalRiskLevel = classifyRiskLevel(originalHealthFactor);

  // Run custom scenarios
  const scenarios: StressTestScenario[] = customScenarios.map(scenario => {
    const newCollateralValue = collateralValue * (1 - scenario.dropPercent / 100);
    const newHealthFactor = debtValue <= 0 ? Infinity : (newCollateralValue * liquidationThreshold) / debtValue;
    
    const riskLevel = classifyRiskLevel(newHealthFactor);
    const timeToLiquidation = estimateTimeToLiquidation(newHealthFactor);
    const liquidationTriggered = newHealthFactor < CRITICAL_HF;
    const severity = getScenarioSeverity(newHealthFactor, liquidationTriggered);
    const requiredAction = getRequiredAction(newHealthFactor, newCollateralValue, debtValue, liquidationThreshold);

    return {
      scenarioName: scenario.name,
      priceDropPercent: scenario.dropPercent,
      newCollateralValue: Number(newCollateralValue.toFixed(2)),
      newHealthFactor: Number.isFinite(newHealthFactor) ? Number(newHealthFactor.toFixed(6)) : newHealthFactor,
      riskLevel,
      timeToLiquidation,
      liquidationTriggered,
      requiredAction,
      severity
    };
  });

  // Generate summary (same logic as runStressTest)
  const safeScenariosCount = scenarios.filter(s => s.severity === 'Safe').length;
  const warningScenariosCount = scenarios.filter(s => s.severity === 'Warning').length;
  const dangerScenariosCount = scenarios.filter(s => s.severity === 'Danger').length;
  const criticalScenariosCount = scenarios.filter(s => s.severity === 'Critical').length;

  const worstCaseScenario = scenarios.reduce((worst, current) => {
    if (current.newHealthFactor === Infinity) return worst;
    if (worst.newHealthFactor === Infinity) return current;
    return current.newHealthFactor < worst.newHealthFactor ? current : worst;
  });

  const recommendedActions: string[] = [];
  if (criticalScenariosCount > 0) {
    recommendedActions.push('CRITICAL: Position vulnerable to liquidation');
    recommendedActions.push('Immediately increase collateral or reduce debt');
  } else if (dangerScenariosCount > 0) {
    recommendedActions.push('HIGH RISK: Position at risk in major downturns');
    recommendedActions.push('Consider increasing safety buffer');
  } else if (warningScenariosCount > 0) {
    recommendedActions.push('MODERATE RISK: Position could benefit from optimization');
  } else {
    recommendedActions.push('SAFE: Position well-protected');
  }

  return {
    originalHealthFactor: Number.isFinite(originalHealthFactor) ? Number(originalHealthFactor.toFixed(6)) : originalHealthFactor,
    originalRiskLevel,
    scenarios,
    summary: {
      safeScenariosCount,
      warningScenariosCount,
      dangerScenariosCount,
      criticalScenariosCount,
      worstCaseScenario,
      recommendedActions
    },
    timestamp: new Date()
  };
}

/**
 * Get stress test severity color for UI
 */
export function getSeverityColor(severity: StressTestScenario['severity']): string {
  switch (severity) {
    case 'Safe': return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'Warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'Danger': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
    default: return 'text-muted-foreground bg-muted border-border';
  }
}

/**
 * Get stress test severity icon for UI
 */
export function getSeverityIcon(severity: StressTestScenario['severity']): string {
  switch (severity) {
    case 'Safe': return '✓';
    case 'Warning': return '⚠';
    case 'Danger': return '⚠';
    case 'Critical': return '🚨';
    default: return '•';
  }
}

/**
 * Generate stress test report summary
 */
export function generateStressTestReport(results: StressTestResults): string {
  const { summary, originalHealthFactor, scenarios } = results;
  
  let report = `STRESS TEST REPORT\n`;
  report += `Generated: ${results.timestamp.toLocaleString()}\n\n`;
  report += `Original Health Factor: ${originalHealthFactor === Infinity ? '∞' : originalHealthFactor.toFixed(3)}\n`;
  report += `Original Risk Level: ${results.originalRiskLevel}\n\n`;
  
  report += `SCENARIO RESULTS:\n`;
  scenarios.forEach(scenario => {
    report += `• ${scenario.scenarioName} (-${scenario.priceDropPercent}%): `;
    report += `HF ${scenario.newHealthFactor === Infinity ? '∞' : scenario.newHealthFactor.toFixed(3)} `;
    report += `[${scenario.severity.toUpperCase()}]\n`;
  });
  
  report += `\nSUMMARY:\n`;
  report += `Safe Scenarios: ${summary.safeScenariosCount}\n`;
  report += `Warning Scenarios: ${summary.warningScenariosCount}\n`;
  report += `Danger Scenarios: ${summary.dangerScenariosCount}\n`;
  report += `Critical Scenarios: ${summary.criticalScenariosCount}\n`;
  
  report += `\nWORST CASE: ${summary.worstCaseScenario.scenarioName}\n`;
  report += `Health Factor: ${summary.worstCaseScenario.newHealthFactor === Infinity ? '∞' : summary.worstCaseScenario.newHealthFactor.toFixed(3)}\n`;
  report += `Time to Liquidation: ${summary.worstCaseScenario.timeToLiquidation}\n`;
  
  report += `\nRECOMMENDATIONS:\n`;
  summary.recommendedActions.forEach(action => {
    report += `• ${action}\n`;
  });
  
  return report;
}

/**
 * Test function to validate stress test service
 */
export function testStressTestService(): void {
  console.log('🧪 Testing Stress Test Service...\n');

  // Test Case 1: Healthy position
  console.log('Test 1 - Healthy Position:');
  const test1 = runStressTest({
    collateralValue: 150000,
    debtValue: 85000,
    liquidationThreshold: 0.8
  });
  console.log(`Original HF: ${test1.originalHealthFactor.toFixed(3)}`);
  console.log(`Scenarios: ${test1.scenarios.length}`);
  console.log(`Critical scenarios: ${test1.summary.criticalScenariosCount}`);
  console.log(`Worst case: ${test1.summary.worstCaseScenario.scenarioName} (HF: ${test1.summary.worstCaseScenario.newHealthFactor.toFixed(3)})`);

  // Test Case 2: High risk position
  console.log('\nTest 2 - High Risk Position:');
  const test2 = runStressTest({
    collateralValue: 100000,
    debtValue: 90000,
    liquidationThreshold: 0.8
  });
  console.log(`Original HF: ${test2.originalHealthFactor.toFixed(3)}`);
  console.log(`Critical scenarios: ${test2.summary.criticalScenariosCount}`);
  console.log(`Danger scenarios: ${test2.summary.dangerScenariosCount}`);

  // Test Case 3: Custom scenarios
  console.log('\nTest 3 - Custom Scenarios:');
  const test3 = runCustomStressTest({
    collateralValue: 150000,
    debtValue: 85000
  }, [
    { name: 'Flash Crash', dropPercent: 40 },
    { name: 'Black Swan', dropPercent: 50 },
    { name: 'Minor Dip', dropPercent: 3 }
  ]);
  console.log(`Custom scenarios: ${test3.scenarios.length}`);
  test3.scenarios.forEach(s => {
    console.log(`  ${s.scenarioName}: HF ${s.newHealthFactor.toFixed(3)} [${s.severity}]`);
  });

  // Test Case 4: Edge case - No debt
  console.log('\nTest 4 - No Debt Position:');
  const test4 = runStressTest({
    collateralValue: 150000,
    debtValue: 0
  });
  console.log(`Original HF: ${test4.originalHealthFactor === Infinity ? '∞' : test4.originalHealthFactor}`);
  console.log(`All scenarios safe: ${test4.summary.safeScenariosCount === test4.scenarios.length}`);

  // Test Case 5: Generate report
  console.log('\nTest 5 - Stress Test Report:');
  const report = generateStressTestReport(test1);
  console.log(report.substring(0, 200) + '...');

  console.log('\n✅ Stress Test Service Tests Complete!');
}

/**
 * Export stress test results for external use
 */
export function exportStressTestResults(results: StressTestResults, format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    const headers = 'scenarioName,priceDropPercent,newCollateralValue,newHealthFactor,riskLevel,timeToLiquidation,liquidationTriggered,severity\n';
    const rows = results.scenarios.map(s => 
      `${s.scenarioName},${s.priceDropPercent},${s.newCollateralValue},${s.newHealthFactor},${s.riskLevel},${s.timeToLiquidation},${s.liquidationTriggered},${s.severity}`
    ).join('\n');
    return headers + rows;
  }

  return JSON.stringify(results, null, 2);
}

/**
 * Get predefined scenario names and percentages
 */
export function getPredefinedScenarios(): Array<{ name: string; dropPercent: number }> {
  return PREDEFINED_SCENARIOS.map(s => ({ name: s.name, dropPercent: s.dropPercent }));
}