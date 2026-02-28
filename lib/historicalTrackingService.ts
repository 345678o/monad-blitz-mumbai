/**
 * Historical Tracking Service Module
 * Maintains time-series data for health factor, collateral, and debt tracking
 */

// Interfaces
export interface HistoricalSnapshot {
  timestamp: Date;
  healthFactor: number;
  collateralValue: number;
  debtValue: number;
}

export interface SnapshotInputs {
  healthFactor: number;
  collateralValue: number;
  debtValue: number;
}

export type TimeRange = '1D' | '7D' | '30D' | '90D';

// In-memory historical data storage
let historicalData: HistoricalSnapshot[] = [];

/**
 * Record a new snapshot of portfolio data
 * Pushes data into array with current timestamp
 */
export function recordSnapshot(inputs: SnapshotInputs): HistoricalSnapshot {
  const { healthFactor, collateralValue, debtValue } = inputs;

  // Input validation
  if (healthFactor < 0 || collateralValue < 0 || debtValue < 0) {
    throw new Error('Invalid input: values must be non-negative');
  }

  const snapshot: HistoricalSnapshot = {
    timestamp: new Date(),
    healthFactor: Number(healthFactor.toFixed(6)),
    collateralValue: Number(collateralValue.toFixed(2)),
    debtValue: Number(debtValue.toFixed(2))
  };

  // Add to historical data array
  historicalData.push(snapshot);

  // Keep only last 90 days of data to prevent memory issues
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  historicalData = historicalData.filter(snapshot => snapshot.timestamp >= ninetyDaysAgo);

  return snapshot;
}

/**
 * Get historical data filtered by time range
 */
export function getHistoricalData(range: TimeRange): HistoricalSnapshot[] {
  const now = new Date();
  let cutoffDate: Date;

  // Calculate cutoff date based on range
  switch (range) {
    case '1D':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      break;
    case '7D':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      break;
    case '30D':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      break;
    case '90D':
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      break;
    default:
      throw new Error('Invalid range: must be "1D", "7D", "30D", or "90D"');
  }

  // Filter data by timestamp and sort by timestamp (oldest first)
  return historicalData
    .filter(snapshot => snapshot.timestamp >= cutoffDate)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Get all historical data (no filtering)
 */
export function getAllHistoricalData(): HistoricalSnapshot[] {
  return [...historicalData].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Get the latest snapshot
 */
export function getLatestSnapshot(): HistoricalSnapshot | null {
  if (historicalData.length === 0) return null;
  return historicalData[historicalData.length - 1];
}

/**
 * Get historical data statistics for a given range
 */
export function getHistoricalStats(range: TimeRange): {
  count: number;
  avgHealthFactor: number;
  minHealthFactor: number;
  maxHealthFactor: number;
  avgCollateral: number;
  avgDebt: number;
  healthFactorTrend: 'up' | 'down' | 'stable';
} {
  const data = getHistoricalData(range);
  
  if (data.length === 0) {
    return {
      count: 0,
      avgHealthFactor: 0,
      minHealthFactor: 0,
      maxHealthFactor: 0,
      avgCollateral: 0,
      avgDebt: 0,
      healthFactorTrend: 'stable'
    };
  }

  const healthFactors = data.map(d => d.healthFactor);
  const collaterals = data.map(d => d.collateralValue);
  const debts = data.map(d => d.debtValue);

  const avgHealthFactor = healthFactors.reduce((sum, hf) => sum + hf, 0) / healthFactors.length;
  const minHealthFactor = Math.min(...healthFactors);
  const maxHealthFactor = Math.max(...healthFactors);
  const avgCollateral = collaterals.reduce((sum, c) => sum + c, 0) / collaterals.length;
  const avgDebt = debts.reduce((sum, d) => sum + d, 0) / debts.length;

  // Calculate trend (compare first and last values)
  let healthFactorTrend: 'up' | 'down' | 'stable' = 'stable';
  if (data.length >= 2) {
    const first = data[0].healthFactor;
    const last = data[data.length - 1].healthFactor;
    const change = (last - first) / first;
    
    if (change > 0.05) healthFactorTrend = 'up';
    else if (change < -0.05) healthFactorTrend = 'down';
  }

  return {
    count: data.length,
    avgHealthFactor: Number(avgHealthFactor.toFixed(3)),
    minHealthFactor: Number(minHealthFactor.toFixed(3)),
    maxHealthFactor: Number(maxHealthFactor.toFixed(3)),
    avgCollateral: Number(avgCollateral.toFixed(2)),
    avgDebt: Number(avgDebt.toFixed(2)),
    healthFactorTrend
  };
}

/**
 * Clear all historical data (for testing/reset)
 */
export function clearHistoricalData(): void {
  historicalData = [];
}

/**
 * Get data count for each time range
 */
export function getDataCounts(): Record<TimeRange, number> {
  return {
    '1D': getHistoricalData('1D').length,
    '7D': getHistoricalData('7D').length,
    '30D': getHistoricalData('30D').length,
    '90D': getHistoricalData('90D').length
  };
}

/**
 * Record multiple snapshots at once (for bulk import)
 */
export function recordMultipleSnapshots(snapshots: (SnapshotInputs & { timestamp?: Date })[]): HistoricalSnapshot[] {
  const recordedSnapshots: HistoricalSnapshot[] = [];

  for (const snapshot of snapshots) {
    const record: HistoricalSnapshot = {
      timestamp: snapshot.timestamp || new Date(),
      healthFactor: Number(snapshot.healthFactor.toFixed(6)),
      collateralValue: Number(snapshot.collateralValue.toFixed(2)),
      debtValue: Number(snapshot.debtValue.toFixed(2))
    };

    historicalData.push(record);
    recordedSnapshots.push(record);
  }

  // Sort by timestamp after bulk insert
  historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return recordedSnapshots;
}

/**
 * Generate sample historical data for demo purposes
 */
export function generateSampleHistoricalData(): HistoricalSnapshot[] {
  clearHistoricalData();

  const now = new Date();
  const sampleData: (SnapshotInputs & { timestamp: Date })[] = [];

  // Generate 90 days of sample data (1 snapshot per day)
  for (let i = 89; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Simulate realistic portfolio changes over time
    const baseCollateral = 150000;
    const baseDebt = 85000;
    
    // Add some volatility and trends
    const volatility = Math.sin(i / 10) * 0.1 + Math.random() * 0.05 - 0.025;
    const trend = (90 - i) / 90 * 0.05; // Slight upward trend over time
    
    const collateralValue = baseCollateral * (1 + volatility + trend);
    const debtValue = baseDebt * (1 + volatility * 0.3); // Debt changes less
    const healthFactor = (collateralValue * 0.8) / debtValue;

    sampleData.push({
      timestamp,
      healthFactor,
      collateralValue,
      debtValue
    });
  }

  return recordMultipleSnapshots(sampleData);
}

/**
 * Test function to validate historical tracking service
 */
export function testHistoricalTrackingService(): void {
  console.log('🧪 Testing Historical Tracking Service...\n');

  // Clear existing data
  clearHistoricalData();

  // Test Case 1: Record single snapshot
  console.log('Test 1 - Record Single Snapshot:');
  const snapshot1 = recordSnapshot({
    healthFactor: 1.45,
    collateralValue: 150000,
    debtValue: 85000
  });
  console.log(snapshot1);

  // Test Case 2: Record multiple snapshots
  console.log('\nTest 2 - Record Multiple Snapshots:');
  const now = new Date();
  const multipleSnapshots = recordMultipleSnapshots([
    {
      healthFactor: 1.50,
      collateralValue: 155000,
      debtValue: 85000,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      healthFactor: 1.40,
      collateralValue: 145000,
      debtValue: 85000,
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000) // 1 hour ago
    }
  ]);
  console.log(multipleSnapshots);

  // Test Case 3: Get historical data by range
  console.log('\nTest 3 - Get Historical Data (1D):');
  const oneDayData = getHistoricalData('1D');
  console.log(oneDayData);

  // Test Case 4: Get historical statistics
  console.log('\nTest 4 - Historical Statistics (1D):');
  const stats = getHistoricalStats('1D');
  console.log(stats);

  // Test Case 5: Generate sample data
  console.log('\nTest 5 - Generate Sample Data:');
  const sampleData = generateSampleHistoricalData();
  console.log(`Generated ${sampleData.length} sample snapshots`);

  // Test Case 6: Data counts by range
  console.log('\nTest 6 - Data Counts by Range:');
  const counts = getDataCounts();
  console.log(counts);

  // Test Case 7: Get latest snapshot
  console.log('\nTest 7 - Latest Snapshot:');
  const latest = getLatestSnapshot();
  console.log(latest);

  // Test Case 8: Historical stats for different ranges
  console.log('\nTest 8 - Historical Stats for All Ranges:');
  ['1D', '7D', '30D', '90D'].forEach(range => {
    const rangeStats = getHistoricalStats(range as TimeRange);
    console.log(`${range}:`, rangeStats);
  });

  console.log('\n✅ Historical Tracking Service Tests Complete!');
}

/**
 * Export data for external use (e.g., charts, reports)
 */
export function exportHistoricalData(range: TimeRange, format: 'json' | 'csv' = 'json'): string {
  const data = getHistoricalData(range);

  if (format === 'csv') {
    const headers = 'timestamp,healthFactor,collateralValue,debtValue\n';
    const rows = data.map(d => 
      `${d.timestamp.toISOString()},${d.healthFactor},${d.collateralValue},${d.debtValue}`
    ).join('\n');
    return headers + rows;
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Get time-series data formatted for charts
 */
export function getChartData(range: TimeRange): Array<{
  date: string;
  timestamp: number;
  hf: number;
  collateral: number;
  debt: number;
  utilization: number;
}> {
  const data = getHistoricalData(range);
  
  return data.map(snapshot => ({
    date: snapshot.timestamp.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: range === '1D' ? 'numeric' : undefined
    }),
    timestamp: snapshot.timestamp.getTime(),
    hf: snapshot.healthFactor,
    collateral: snapshot.collateralValue / 1000, // Convert to K for charts
    debt: snapshot.debtValue / 1000, // Convert to K for charts
    utilization: (snapshot.debtValue / snapshot.collateralValue) * 100
  }));
}