/**
 * Auto-Protection Engine Service Module
 * Simulation logic for automated risk protection and debt management
 */

// Interfaces
export interface AutoProtectionInputs {
  currentHealthFactor: number;
  threshold: number;
  debtValue: number;
  repayPercentage: number;
  collateralValue?: number;
  liquidationThreshold?: number;
}

export interface AutoProtectionResult {
  triggered: boolean;
  repaymentAmount?: number;
  newDebt?: number;
  newHealthFactor?: number;
  timestamp: Date;
  reason?: string;
  action?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface AutoProtectionConfig {
  enabled: boolean;
  threshold: number;
  repayPercentage: number;
  maxRepaymentAmount?: number;
  minHealthFactorTarget?: number;
  emergencyThreshold?: number;
  emergencyRepayPercentage?: number;
}

export interface AutoProtectionAuditLog {
  id: string;
  timestamp: Date;
  action: 'protection_triggered' | 'protection_executed' | 'config_updated' | 'system_check';
  inputs: AutoProtectionInputs;
  result: AutoProtectionResult;
  userId?: string;
  transactionHash?: string;
  gasUsed?: number;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

// Constants
const DEFAULT_LIQUIDATION_THRESHOLD = 0.8;
const DEFAULT_THRESHOLD = 1.2;
const DEFAULT_REPAY_PERCENTAGE = 20;
const EMERGENCY_THRESHOLD = 1.05;
const EMERGENCY_REPAY_PERCENTAGE = 50;

// In-memory audit log storage
let auditLogs: AutoProtectionAuditLog[] = [];
let logIdCounter = 1;

/**
 * Generate unique audit log ID
 */
function generateLogId(): string {
  return `auto_protection_${Date.now()}_${logIdCounter++}`;
}

/**
 * Core Auto-Protection Engine Logic
 * Simulates automated debt repayment when health factor drops below threshold
 */
export function executeAutoProtection(inputs: AutoProtectionInputs): AutoProtectionResult {
  const {
    currentHealthFactor,
    threshold,
    debtValue,
    repayPercentage,
    collateralValue = 0,
    liquidationThreshold = DEFAULT_LIQUIDATION_THRESHOLD
  } = inputs;

  const timestamp = new Date();

  // Input validation
  if (currentHealthFactor < 0 || threshold <= 0 || debtValue < 0 || repayPercentage < 0 || repayPercentage > 100) {
    throw new Error('Invalid input: health factor and debt must be non-negative, threshold must be positive, repay percentage must be 0-100');
  }

  // Check if protection should be triggered
  if (currentHealthFactor >= threshold) {
    const result: AutoProtectionResult = {
      triggered: false,
      timestamp,
      reason: `Health factor ${currentHealthFactor.toFixed(3)} is above threshold ${threshold.toFixed(3)}`,
      action: 'No action required'
    };

    // Log the check
    logAuditEvent('system_check', inputs, result, 'success');
    
    return result;
  }

  // Protection triggered - calculate repayment
  const repaymentAmount = debtValue * (repayPercentage / 100);
  const newDebt = debtValue - repaymentAmount;

  // Recalculate health factor after repayment
  let newHealthFactor: number;
  if (newDebt <= 0) {
    newHealthFactor = Infinity;
  } else if (collateralValue <= 0) {
    newHealthFactor = 0;
  } else {
    newHealthFactor = (collateralValue * liquidationThreshold) / newDebt;
  }

  // Determine severity based on original health factor
  let severity: AutoProtectionResult['severity'];
  if (currentHealthFactor < 1.0) severity = 'Critical';
  else if (currentHealthFactor < 1.1) severity = 'High';
  else if (currentHealthFactor < 1.2) severity = 'Medium';
  else severity = 'Low';

  // Determine action description
  let action: string;
  if (currentHealthFactor < 1.0) {
    action = 'Emergency liquidation protection activated';
  } else if (currentHealthFactor < 1.1) {
    action = 'High-risk debt reduction executed';
  } else {
    action = 'Preventive debt repayment executed';
  }

  const result: AutoProtectionResult = {
    triggered: true,
    repaymentAmount: Number(repaymentAmount.toFixed(2)),
    newDebt: Number(newDebt.toFixed(2)),
    newHealthFactor: Number.isFinite(newHealthFactor) ? Number(newHealthFactor.toFixed(6)) : newHealthFactor,
    timestamp,
    reason: `Health factor ${currentHealthFactor.toFixed(3)} dropped below threshold ${threshold.toFixed(3)}`,
    action,
    severity
  };

  // Log the protection event
  logAuditEvent('protection_triggered', inputs, result, 'success');

  return result;
}

/**
 * Execute auto-protection with advanced configuration
 */
export function executeAdvancedAutoProtection(
  inputs: AutoProtectionInputs,
  config: AutoProtectionConfig
): AutoProtectionResult {
  if (!config.enabled) {
    const result: AutoProtectionResult = {
      triggered: false,
      timestamp: new Date(),
      reason: 'Auto-protection is disabled',
      action: 'System disabled'
    };
    
    logAuditEvent('system_check', inputs, result, 'success');
    return result;
  }

  // Check for emergency conditions
  const isEmergency = inputs.currentHealthFactor < (config.emergencyThreshold || EMERGENCY_THRESHOLD);
  
  const effectiveInputs = {
    ...inputs,
    threshold: isEmergency ? (config.emergencyThreshold || EMERGENCY_THRESHOLD) : config.threshold,
    repayPercentage: isEmergency ? (config.emergencyRepayPercentage || EMERGENCY_REPAY_PERCENTAGE) : config.repayPercentage
  };

  const result = executeAutoProtection(effectiveInputs);

  // Apply maximum repayment limit if configured
  if (result.triggered && config.maxRepaymentAmount && result.repaymentAmount && result.repaymentAmount > config.maxRepaymentAmount) {
    const limitedRepayment = config.maxRepaymentAmount;
    const newDebt = inputs.debtValue - limitedRepayment;
    const newHealthFactor = newDebt <= 0 ? Infinity : 
      (inputs.collateralValue || 0) * (inputs.liquidationThreshold || DEFAULT_LIQUIDATION_THRESHOLD) / newDebt;

    return {
      ...result,
      repaymentAmount: limitedRepayment,
      newDebt: Number(newDebt.toFixed(2)),
      newHealthFactor: Number.isFinite(newHealthFactor) ? Number(newHealthFactor.toFixed(6)) : newHealthFactor,
      reason: `${result.reason} (Limited to max repayment: $${limitedRepayment.toLocaleString()})`
    };
  }

  return result;
}

/**
 * Simulate multiple auto-protection scenarios
 */
export function simulateAutoProtectionScenarios(
  baseInputs: Omit<AutoProtectionInputs, 'currentHealthFactor'>,
  healthFactorScenarios: number[]
): AutoProtectionResult[] {
  return healthFactorScenarios.map(hf => 
    executeAutoProtection({ ...baseInputs, currentHealthFactor: hf })
  );
}

/**
 * Log audit event for compliance and monitoring
 */
function logAuditEvent(
  action: AutoProtectionAuditLog['action'],
  inputs: AutoProtectionInputs,
  result: AutoProtectionResult,
  status: AutoProtectionAuditLog['status'],
  errorMessage?: string,
  transactionHash?: string,
  gasUsed?: number
): void {
  const auditLog: AutoProtectionAuditLog = {
    id: generateLogId(),
    timestamp: new Date(),
    action,
    inputs: { ...inputs },
    result: { ...result },
    status,
    errorMessage,
    transactionHash,
    gasUsed
  };

  auditLogs.push(auditLog);

  // Keep only last 1000 logs to prevent memory issues
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(-1000);
  }
}

/**
 * Get audit logs with optional filtering
 */
export function getAuditLogs(
  filters?: {
    action?: AutoProtectionAuditLog['action'];
    status?: AutoProtectionAuditLog['status'];
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
  }
): AutoProtectionAuditLog[] {
  let filteredLogs = [...auditLogs];

  if (filters) {
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }
    
    if (filters.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }
    
    if (filters.fromDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.fromDate!);
    }
    
    if (filters.toDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.toDate!);
    }
  }

  // Sort by timestamp (newest first)
  filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit
  if (filters?.limit) {
    filteredLogs = filteredLogs.slice(0, filters.limit);
  }

  return filteredLogs;
}

/**
 * Get audit log statistics
 */
export function getAuditLogStats(): {
  totalLogs: number;
  protectionTriggered: number;
  protectionExecuted: number;
  systemChecks: number;
  successRate: number;
  averageRepaymentAmount: number;
  lastActivity: Date | null;
} {
  const totalLogs = auditLogs.length;
  const protectionTriggered = auditLogs.filter(log => log.action === 'protection_triggered').length;
  const protectionExecuted = auditLogs.filter(log => log.action === 'protection_executed').length;
  const systemChecks = auditLogs.filter(log => log.action === 'system_check').length;
  const successfulLogs = auditLogs.filter(log => log.status === 'success').length;
  const successRate = totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0;

  const repaymentAmounts = auditLogs
    .filter(log => log.result.triggered && log.result.repaymentAmount)
    .map(log => log.result.repaymentAmount!);
  
  const averageRepaymentAmount = repaymentAmounts.length > 0 
    ? repaymentAmounts.reduce((sum, amount) => sum + amount, 0) / repaymentAmounts.length
    : 0;

  const lastActivity = auditLogs.length > 0 
    ? auditLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
    : null;

  return {
    totalLogs,
    protectionTriggered,
    protectionExecuted,
    systemChecks,
    successRate: Number(successRate.toFixed(2)),
    averageRepaymentAmount: Number(averageRepaymentAmount.toFixed(2)),
    lastActivity
  };
}

/**
 * Clear audit logs (for testing/maintenance)
 */
export function clearAuditLogs(): void {
  auditLogs = [];
  logIdCounter = 1;
}

/**
 * Export audit logs for compliance
 */
export function exportAuditLogs(format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    const headers = 'id,timestamp,action,currentHealthFactor,threshold,debtValue,repayPercentage,triggered,repaymentAmount,newDebt,newHealthFactor,status\n';
    const rows = auditLogs.map(log => 
      `${log.id},${log.timestamp.toISOString()},${log.action},${log.inputs.currentHealthFactor},${log.inputs.threshold},${log.inputs.debtValue},${log.inputs.repayPercentage},${log.result.triggered},${log.result.repaymentAmount || ''},${log.result.newDebt || ''},${log.result.newHealthFactor || ''},${log.status}`
    ).join('\n');
    return headers + rows;
  }

  return JSON.stringify(auditLogs, null, 2);
}

/**
 * Calculate optimal repayment percentage to reach target health factor
 */
export function calculateOptimalRepayment(
  currentHealthFactor: number,
  targetHealthFactor: number,
  collateralValue: number,
  debtValue: number,
  liquidationThreshold: number = DEFAULT_LIQUIDATION_THRESHOLD
): {
  requiredRepaymentAmount: number;
  requiredRepaymentPercentage: number;
  newHealthFactor: number;
  feasible: boolean;
} {
  // Input validation
  if (debtValue <= 0) {
    return {
      requiredRepaymentAmount: 0,
      requiredRepaymentPercentage: 0,
      newHealthFactor: Infinity,
      feasible: true
    };
  }

  // Calculate required new debt to achieve target health factor
  const requiredNewDebt = (collateralValue * liquidationThreshold) / targetHealthFactor;
  const requiredRepaymentAmount = Math.max(0, debtValue - requiredNewDebt);
  const requiredRepaymentPercentage = (requiredRepaymentAmount / debtValue) * 100;

  // Check if it's feasible (can't repay more than 100% of debt)
  const feasible = requiredRepaymentPercentage <= 100;

  const actualRepaymentAmount = feasible ? requiredRepaymentAmount : debtValue;
  const actualNewDebt = debtValue - actualRepaymentAmount;
  const actualNewHealthFactor = actualNewDebt <= 0 ? Infinity : (collateralValue * liquidationThreshold) / actualNewDebt;

  return {
    requiredRepaymentAmount: Number(actualRepaymentAmount.toFixed(2)),
    requiredRepaymentPercentage: Number((feasible ? requiredRepaymentPercentage : 100).toFixed(2)),
    newHealthFactor: Number.isFinite(actualNewHealthFactor) ? Number(actualNewHealthFactor.toFixed(6)) : actualNewHealthFactor,
    feasible
  };
}

/**
 * Test function to validate auto-protection service
 */
export function testAutoProtectionService(): void {
  console.log('🧪 Testing Auto-Protection Service...\n');

  // Clear existing logs
  clearAuditLogs();

  // Test Case 1: Protection not triggered (healthy position)
  console.log('Test 1 - Healthy Position (No Protection):');
  const test1 = executeAutoProtection({
    currentHealthFactor: 1.8,
    threshold: 1.2,
    debtValue: 85000,
    repayPercentage: 20,
    collateralValue: 150000
  });
  console.log(`Triggered: ${test1.triggered}, Reason: ${test1.reason}`);

  // Test Case 2: Protection triggered (risky position)
  console.log('\nTest 2 - Risky Position (Protection Triggered):');
  const test2 = executeAutoProtection({
    currentHealthFactor: 1.1,
    threshold: 1.2,
    debtValue: 85000,
    repayPercentage: 20,
    collateralValue: 150000
  });
  console.log(`Triggered: ${test2.triggered}`);
  console.log(`Repayment: $${test2.repaymentAmount?.toLocaleString()}`);
  console.log(`New Debt: $${test2.newDebt?.toLocaleString()}`);
  console.log(`New HF: ${test2.newHealthFactor?.toFixed(3)}`);
  console.log(`Severity: ${test2.severity}`);

  // Test Case 3: Emergency protection (critical position)
  console.log('\nTest 3 - Critical Position (Emergency Protection):');
  const test3 = executeAutoProtection({
    currentHealthFactor: 0.95,
    threshold: 1.0,
    debtValue: 85000,
    repayPercentage: 50,
    collateralValue: 150000
  });
  console.log(`Triggered: ${test3.triggered}`);
  console.log(`Repayment: $${test3.repaymentAmount?.toLocaleString()}`);
  console.log(`New HF: ${test3.newHealthFactor?.toFixed(3)}`);
  console.log(`Action: ${test3.action}`);

  // Test Case 4: Multiple scenarios simulation
  console.log('\nTest 4 - Multiple Scenarios:');
  const scenarios = simulateAutoProtectionScenarios({
    threshold: 1.2,
    debtValue: 85000,
    repayPercentage: 20,
    collateralValue: 150000
  }, [1.5, 1.3, 1.1, 0.9]);
  
  scenarios.forEach((result, index) => {
    const hf = [1.5, 1.3, 1.1, 0.9][index];
    console.log(`  HF ${hf}: Triggered=${result.triggered}, Repayment=$${result.repaymentAmount?.toLocaleString() || '0'}`);
  });

  // Test Case 5: Optimal repayment calculation
  console.log('\nTest 5 - Optimal Repayment Calculation:');
  const optimal = calculateOptimalRepayment(1.1, 1.5, 150000, 85000, 0.8);
  console.log(`Required repayment: $${optimal.requiredRepaymentAmount.toLocaleString()} (${optimal.requiredRepaymentPercentage}%)`);
  console.log(`Target HF: ${optimal.newHealthFactor.toFixed(3)}, Feasible: ${optimal.feasible}`);

  // Test Case 6: Audit log statistics
  console.log('\nTest 6 - Audit Log Statistics:');
  const stats = getAuditLogStats();
  console.log(`Total logs: ${stats.totalLogs}`);
  console.log(`Protection triggered: ${stats.protectionTriggered}`);
  console.log(`Success rate: ${stats.successRate}%`);
  console.log(`Average repayment: $${stats.averageRepaymentAmount.toLocaleString()}`);

  // Test Case 7: Advanced configuration
  console.log('\nTest 7 - Advanced Configuration:');
  const advancedConfig: AutoProtectionConfig = {
    enabled: true,
    threshold: 1.2,
    repayPercentage: 15,
    maxRepaymentAmount: 10000,
    emergencyThreshold: 1.05,
    emergencyRepayPercentage: 30
  };
  
  const test7 = executeAdvancedAutoProtection({
    currentHealthFactor: 1.0,
    threshold: 1.2,
    debtValue: 85000,
    repayPercentage: 20,
    collateralValue: 150000
  }, advancedConfig);
  
  console.log(`Emergency triggered: ${test7.triggered}`);
  console.log(`Repayment (limited): $${test7.repaymentAmount?.toLocaleString()}`);

  console.log('\n✅ Auto-Protection Service Tests Complete!');
}

/**
 * Generate sample audit logs for demo purposes
 */
export function generateSampleAuditLogs(): AutoProtectionAuditLog[] {
  clearAuditLogs();

  const sampleEvents = [
    { hf: 1.8, triggered: false, action: 'system_check' as const },
    { hf: 1.15, triggered: true, action: 'protection_triggered' as const },
    { hf: 1.05, triggered: true, action: 'protection_triggered' as const },
    { hf: 0.95, triggered: true, action: 'protection_triggered' as const },
    { hf: 1.6, triggered: false, action: 'system_check' as const },
    { hf: 1.1, triggered: true, action: 'protection_triggered' as const },
  ];

  sampleEvents.forEach((event, index) => {
    const timestamp = new Date(Date.now() - (sampleEvents.length - index) * 2 * 60 * 60 * 1000); // 2 hours apart
    
    const inputs: AutoProtectionInputs = {
      currentHealthFactor: event.hf,
      threshold: 1.2,
      debtValue: 85000,
      repayPercentage: 20,
      collateralValue: 150000
    };

    const result = executeAutoProtection(inputs);
    result.timestamp = timestamp;

    // Override the logged event with custom timestamp
    if (auditLogs.length > 0) {
      auditLogs[auditLogs.length - 1].timestamp = timestamp;
    }
  });

  return auditLogs;
}