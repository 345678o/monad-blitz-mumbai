/**
 * Alerts Service Module
 * Generates dynamic risk alerts based on health factor changes and system events
 */

import { ShockSimulationResult } from './shockSimulator';
import { AutoProtectionResult } from './autoProtectionService';

// Alert Interfaces
export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  type: string;
  message: string;
  resolved: boolean;
}

export interface AlertGenerationInputs {
  previousHealthFactor: number;
  currentHealthFactor: number;
  shockResult?: ShockSimulationResult;
  autoProtectionResult?: AutoProtectionResult;
}

// In-memory alert storage
let alertsStore: Alert[] = [];

// Alert ID counter for unique IDs
let alertIdCounter = 1;

/**
 * Generate unique alert ID
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${alertIdCounter++}`;
}

/**
 * Core Alert Generation Function
 * Generates alerts based on health factor changes and system events
 */
export function generateAlerts(inputs: AlertGenerationInputs): Alert[] {
  const {
    previousHealthFactor,
    currentHealthFactor,
    shockResult,
    autoProtectionResult
  } = inputs;

  const newAlerts: Alert[] = [];

  // Rule 1: High Risk Alert (currentHF < 1.2)
  if (currentHealthFactor < 1.2 && currentHealthFactor >= 1.0) {
    const alert: Alert = {
      id: generateAlertId(),
      timestamp: new Date(),
      severity: 'High',
      type: 'High Risk Position',
      message: `Health Factor dropped to ${currentHealthFactor.toFixed(3)}. Position is at high risk. Consider adding collateral or repaying debt to restore safety buffer.`,
      resolved: false
    };
    newAlerts.push(alert);
  }

  // Rule 2: Critical Liquidation Alert (currentHF < 1.0)
  if (currentHealthFactor < 1.0) {
    const alert: Alert = {
      id: generateAlertId(),
      timestamp: new Date(),
      severity: 'Critical',
      type: 'Liquidation Risk',
      message: `CRITICAL: Health Factor is ${currentHealthFactor.toFixed(3)} - below liquidation threshold! Immediate action required to avoid liquidation.`,
      resolved: false
    };
    newAlerts.push(alert);
  }

  // Rule 3: Shock Alert (shockResult.liquidationTriggered)
  if (shockResult && shockResult.liquidationTriggered) {
    const alert: Alert = {
      id: generateAlertId(),
      timestamp: new Date(),
      severity: 'Critical',
      type: 'Shock Simulation Alert',
      message: `Stress test shows ${shockResult.priceDropPercent}% price drop would trigger liquidation. New HF would be ${shockResult.newHealthFactor.toFixed(3)}. Required repayment: $${shockResult.requiredRepayment.toLocaleString()}.`,
      resolved: false
    };
    newAlerts.push(alert);
  }

  // Rule 4: Protection Activated Alert (autoProtectionResult.triggered)
  if (autoProtectionResult && autoProtectionResult.triggered) {
    const alert: Alert = {
      id: generateAlertId(),
      timestamp: new Date(),
      severity: 'Moderate',
      type: 'Auto-Protection Activated',
      message: `Auto-protection system activated: ${autoProtectionResult.action || 'Debt repayment executed'}. Amount: $${(autoProtectionResult.repaymentAmount || 0).toLocaleString()}. Reason: ${autoProtectionResult.reason || 'Health factor protection'}`,
      resolved: false
    };
    newAlerts.push(alert);
  }

  // Additional Alert: Health Factor Improvement
  if (previousHealthFactor < 1.2 && currentHealthFactor >= 1.5) {
    const alert: Alert = {
      id: generateAlertId(),
      timestamp: new Date(),
      severity: 'Low',
      type: 'Position Recovered',
      message: `Health Factor improved from ${previousHealthFactor.toFixed(3)} to ${currentHealthFactor.toFixed(3)}. Position is now in safe range.`,
      resolved: false
    };
    newAlerts.push(alert);
  }

  // Additional Alert: Significant Health Factor Drop
  if (previousHealthFactor - currentHealthFactor > 0.3) {
    const alert: Alert = {
      id: generateAlertId(),
      timestamp: new Date(),
      severity: 'Moderate',
      type: 'Health Factor Drop',
      message: `Significant health factor decline detected: ${previousHealthFactor.toFixed(3)} → ${currentHealthFactor.toFixed(3)} (${((previousHealthFactor - currentHealthFactor) / previousHealthFactor * 100).toFixed(1)}% decrease).`,
      resolved: false
    };
    newAlerts.push(alert);
  }

  // Store new alerts in memory
  alertsStore.push(...newAlerts);

  return newAlerts;
}

/**
 * Get all alerts from memory store
 */
export function getAllAlerts(): Alert[] {
  return [...alertsStore].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get alerts by severity
 */
export function getAlertsBySeverity(severity: Alert['severity']): Alert[] {
  return alertsStore.filter(alert => alert.severity === severity);
}

/**
 * Get unresolved alerts
 */
export function getUnresolvedAlerts(): Alert[] {
  return alertsStore.filter(alert => !alert.resolved);
}

/**
 * Resolve an alert by ID
 */
export function resolveAlert(alertId: string): boolean {
  const alert = alertsStore.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    return true;
  }
  return false;
}

/**
 * Clear all resolved alerts
 */
export function clearResolvedAlerts(): number {
  const resolvedCount = alertsStore.filter(a => a.resolved).length;
  alertsStore = alertsStore.filter(a => !a.resolved);
  return resolvedCount;
}

/**
 * Clear all alerts (for testing/reset)
 */
export function clearAllAlerts(): void {
  alertsStore = [];
  alertIdCounter = 1;
}

/**
 * Get alert statistics
 */
export function getAlertStats(): {
  total: number;
  unresolved: number;
  bySeverity: Record<Alert['severity'], number>;
} {
  const total = alertsStore.length;
  const unresolved = alertsStore.filter(a => !a.resolved).length;
  
  const bySeverity = {
    Low: alertsStore.filter(a => a.severity === 'Low').length,
    Moderate: alertsStore.filter(a => a.severity === 'Moderate').length,
    High: alertsStore.filter(a => a.severity === 'High').length,
    Critical: alertsStore.filter(a => a.severity === 'Critical').length,
  };

  return { total, unresolved, bySeverity };
}

/**
 * Get severity color for UI
 */
export function getSeverityColor(severity: Alert['severity']): string {
  switch (severity) {
    case 'Low': return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'Moderate': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'High': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
    default: return 'text-muted-foreground bg-muted border-border';
  }
}

/**
 * Get severity icon for UI
 */
export function getSeverityIcon(severity: Alert['severity']): string {
  switch (severity) {
    case 'Low': return '✓';
    case 'Moderate': return '⚠';
    case 'High': return '⚠';
    case 'Critical': return '🚨';
    default: return '•';
  }
}

/**
 * Test function to validate alerts service
 */
export function testAlertsService(): void {
  console.log('🧪 Testing Alerts Service...\n');

  // Clear existing alerts
  clearAllAlerts();

  // Test Case 1: High Risk Alert
  console.log('Test 1 - High Risk Alert:');
  const alerts1 = generateAlerts({
    previousHealthFactor: 1.5,
    currentHealthFactor: 1.1
  });
  console.log(alerts1);

  // Test Case 2: Critical Liquidation Alert
  console.log('\nTest 2 - Critical Liquidation Alert:');
  const alerts2 = generateAlerts({
    previousHealthFactor: 1.1,
    currentHealthFactor: 0.9
  });
  console.log(alerts2);

  // Test Case 3: Shock Alert
  console.log('\nTest 3 - Shock Alert:');
  const alerts3 = generateAlerts({
    previousHealthFactor: 1.4,
    currentHealthFactor: 1.3,
    shockResult: {
      priceDropPercent: 25,
      newCollateral: 112500,
      newHealthFactor: 0.8,
      newRiskLevel: 'Critical',
      requiredRepayment: 25000,
      liquidationTriggered: true
    }
  });
  console.log(alerts3);

  // Test Case 4: Auto-Protection Alert
  console.log('\nTest 4 - Auto-Protection Alert:');
  const alerts4 = generateAlerts({
    previousHealthFactor: 1.0,
    currentHealthFactor: 1.6,
    autoProtectionResult: {
      triggered: true,
      action: 'Emergency Collateral Addition',
      repaymentAmount: 50000,
      reason: 'Health factor dropped below 1.1',
      timestamp: new Date()
    }
  });
  console.log(alerts4);

  // Test Case 5: Position Recovery
  console.log('\nTest 5 - Position Recovery:');
  const alerts5 = generateAlerts({
    previousHealthFactor: 1.0,
    currentHealthFactor: 1.6
  });
  console.log(alerts5);

  // Show alert statistics
  console.log('\nAlert Statistics:');
  console.log(getAlertStats());

  // Show all alerts
  console.log('\nAll Alerts:');
  console.log(getAllAlerts().map(a => ({
    id: a.id,
    severity: a.severity,
    type: a.type,
    message: a.message.substring(0, 80) + '...'
  })));

  console.log('\n✅ Alerts Service Tests Complete!');
}

/**
 * Generate sample alerts for demo purposes
 */
export function generateSampleAlerts(): Alert[] {
  clearAllAlerts();
  
  const sampleAlerts: Omit<Alert, 'id' | 'timestamp'>[] = [
    {
      severity: 'Critical',
      type: 'Liquidation Risk',
      message: 'CRITICAL: Health Factor is 0.95 - below liquidation threshold! Immediate action required.',
      resolved: false
    },
    {
      severity: 'High',
      type: 'High Risk Position',
      message: 'Health Factor dropped to 1.15. Position is at high risk. Consider adding collateral.',
      resolved: false
    },
    {
      severity: 'Critical',
      type: 'Shock Simulation Alert',
      message: 'Stress test shows 20% price drop would trigger liquidation. Required repayment: $35,000.',
      resolved: false
    },
    {
      severity: 'Moderate',
      type: 'Auto-Protection Activated',
      message: 'Auto-protection system activated: Emergency Collateral Addition. Amount: $25,000.',
      resolved: true
    },
    {
      severity: 'High',
      type: 'Health Factor Drop',
      message: 'Significant health factor decline: 1.8 → 1.2 (33.3% decrease).',
      resolved: false
    },
    {
      severity: 'Low',
      type: 'Position Recovered',
      message: 'Health Factor improved from 1.1 to 1.6. Position is now in safe range.',
      resolved: true
    },
    {
      severity: 'Moderate',
      type: 'Market Volatility',
      message: 'High market volatility detected. Monitor positions closely.',
      resolved: false
    },
    {
      severity: 'High',
      type: 'Collateral Price Drop',
      message: 'ETH price dropped 12% in last hour. Health factor affected.',
      resolved: false
    }
  ];

  const alerts = sampleAlerts.map(alert => ({
    ...alert,
    id: generateAlertId(),
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h
  }));

  alertsStore.push(...alerts);
  return alerts;
}