'use client';

import { useCurrency } from '@/components/top-bar';
import { formatCurrency } from '@/lib/currency';
import { 
  executeAutoProtection, 
  executeAdvancedAutoProtection,
  simulateAutoProtectionScenarios,
  calculateOptimalRepayment,
  getAuditLogs,
  getAuditLogStats,
  generateSampleAuditLogs,
  exportAuditLogs,
  AutoProtectionConfig,
  AutoProtectionResult,
  AutoProtectionAuditLog
} from '@/lib/autoProtectionService';
import { analyzeRisk } from '@/lib/riskEngine';
import { Button } from '@/components/ui/button';
import { Shield, Power, Settings as SettingsIcon, Play, Download, History, Target, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AutoProtectionPage() {
  const { currency } = useCurrency();
  const [isEnabled, setIsEnabled] = useState(true);
  const [config, setConfig] = useState<AutoProtectionConfig>({
    enabled: true,
    threshold: 1.2,
    repayPercentage: 20,
    maxRepaymentAmount: 50000,
    minHealthFactorTarget: 1.5,
    emergencyThreshold: 1.05,
    emergencyRepayPercentage: 40
  });
  const [simulationResult, setSimulationResult] = useState<AutoProtectionResult | null>(null);
  const [auditStats, setAuditStats] = useState<ReturnType<typeof getAuditLogStats> | null>(null);
  const [recentLogs, setRecentLogs] = useState<AutoProtectionAuditLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const portfolio = {
    totalCollateral: 150000,
    totalDebt: 85000,
    collateralAssets: [
      { asset: 'ETH', value: 90000, amount: 30, price: 3000, interestRate: 0 },
      { asset: 'WBTC', value: 40000, amount: 1, price: 40000, interestRate: 0 },
      { asset: 'USDC', value: 20000, amount: 20000, price: 1, interestRate: 0 },
    ],
    debtAssets: [
      { asset: 'USDC', value: 60000, amount: 60000, price: 1, interestRate: 4.5 },
      { asset: 'DAI', value: 25000, amount: 25000, price: 1, interestRate: 3.8 },
    ],
    currentPrice: 3000,
  };

  const currentRisk = analyzeRisk(portfolio);

  // Initialize sample data
  useEffect(() => {
    generateSampleAuditLogs();
    refreshAuditData();
  }, []);

  const refreshAuditData = () => {
    const stats = getAuditLogStats();
    const logs = getAuditLogs({ limit: 10 });
    setAuditStats(stats);
    setRecentLogs(logs);
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = executeAdvancedAutoProtection({
      currentHealthFactor: currentRisk.healthFactor,
      threshold: config.threshold,
      debtValue: portfolio.totalDebt,
      repayPercentage: config.repayPercentage,
      collateralValue: portfolio.totalCollateral,
      liquidationThreshold: 0.8
    }, config);
    
    setSimulationResult(result);
    setIsSimulating(false);
    refreshAuditData();
  };

  const runStressTestSimulation = async () => {
    setIsSimulating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test with a risky health factor
    const result = executeAdvancedAutoProtection({
      currentHealthFactor: 1.1, // Risky scenario
      threshold: config.threshold,
      debtValue: portfolio.totalDebt,
      repayPercentage: config.repayPercentage,
      collateralValue: portfolio.totalCollateral,
      liquidationThreshold: 0.8
    }, config);
    
    setSimulationResult(result);
    setIsSimulating(false);
    refreshAuditData();
  };

  const updateConfig = (field: keyof AutoProtectionConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = (format: 'json' | 'csv') => {
    const data = exportAuditLogs(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-protection-audit.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate optimal repayment for current position
  const optimalRepayment = calculateOptimalRepayment(
    currentRisk.healthFactor,
    1.5, // Target health factor
    portfolio.totalCollateral,
    portfolio.totalDebt,
    0.8
  );

  // Prepare chart data for scenarios
  const scenarioData = [1.8, 1.5, 1.3, 1.2, 1.1, 1.0, 0.9].map(hf => {
    const result = executeAutoProtection({
      currentHealthFactor: hf,
      threshold: config.threshold,
      debtValue: portfolio.totalDebt,
      repayPercentage: config.repayPercentage,
      collateralValue: portfolio.totalCollateral
    });
    
    return {
      hf: hf.toFixed(1),
      triggered: result.triggered ? 1 : 0,
      repayment: result.repaymentAmount || 0,
      newHf: result.newHealthFactor === Infinity ? 5 : result.newHealthFactor || hf
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-orange-500';
      case 'Critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Auto-Protection Engine
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Automated risk management and liquidation prevention system
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-semibold ${isEnabled ? 'text-green-500' : 'text-red-500'}`}>
                  {isEnabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <Button
                onClick={() => setIsEnabled(!isEnabled)}
                variant={isEnabled ? "destructive" : "default"}
                size="sm"
                className="gap-2 h-8 text-xs"
              >
                <Power className="w-3.5 h-3.5" />
                {isEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>

          {/* Current Position Status */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="metric-card">
              <p className="metric-label">Current Health Factor</p>
              <p className="metric-value">{currentRisk.healthFactor.toFixed(3)}</p>
              <p className="metric-change">{currentRisk.riskLevel}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Protection Threshold</p>
              <p className="metric-value">{config.threshold.toFixed(2)}</p>
              <p className="metric-change">
                {currentRisk.healthFactor < config.threshold ? 'TRIGGERED' : 'Safe'}
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Repay Percentage</p>
              <p className="metric-value">{config.repayPercentage}%</p>
              <p className="metric-change">
                {formatCurrency(portfolio.totalDebt * (config.repayPercentage / 100), currency, { compact: true })}
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-label">System Status</p>
              <p className="metric-value">
                {isEnabled ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                )}
              </p>
              <p className="metric-change">
                {isEnabled ? 'Monitoring' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Configuration Panel */}
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <SettingsIcon className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Configuration
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                  Health Factor Threshold
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="2.0"
                  value={config.threshold}
                  onChange={(e) => updateConfig('threshold', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  Trigger protection when HF drops below this value
                </p>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                  Repayment Percentage
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.repayPercentage}
                  onChange={(e) => updateConfig('repayPercentage', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  Percentage of debt to repay when triggered
                </p>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                  Max Repayment Amount
                </label>
                <input
                  type="number"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={config.maxRepaymentAmount}
                  onChange={(e) => updateConfig('maxRepaymentAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  Maximum amount to repay in a single transaction
                </p>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                  Emergency Threshold
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="1.2"
                  value={config.emergencyThreshold}
                  onChange={(e) => updateConfig('emergencyThreshold', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  Emergency protection threshold (higher repayment %)
                </p>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                  Emergency Repayment %
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={config.emergencyRepayPercentage}
                  onChange={(e) => updateConfig('emergencyRepayPercentage', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  Higher repayment % for emergency situations
                </p>
              </div>
            </div>
          </div>

          {/* Simulation Panel */}
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-4 h-4 text-green-500" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Simulation Engine
              </h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <Button 
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-full h-8 text-xs"
              >
                {isSimulating ? 'Simulating...' : 'Test Current Position'}
              </Button>
              
              <Button 
                onClick={runStressTestSimulation}
                disabled={isSimulating}
                variant="outline"
                className="w-full h-8 text-xs"
              >
                {isSimulating ? 'Simulating...' : 'Test Risk Scenario'}
              </Button>
            </div>

            {simulationResult && (
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 border border-border rounded-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {simulationResult.triggered ? (
                      <Zap className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <p className="text-xs font-semibold text-foreground">
                      {simulationResult.triggered ? 'Protection Triggered' : 'No Action Required'}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {simulationResult.reason}
                  </p>
                </div>

                {simulationResult.triggered && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/30 border border-border rounded-sm">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                          Repayment Amount
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(simulationResult.repaymentAmount || 0, currency)}
                        </p>
                      </div>
                      <div className="p-3 bg-muted/30 border border-border rounded-sm">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                          New Health Factor
                        </p>
                        <p className="text-sm font-semibold text-green-500">
                          {simulationResult.newHealthFactor === Infinity ? '∞' : simulationResult.newHealthFactor?.toFixed(3)}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/30 border border-border rounded-sm">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Action Taken
                      </p>
                      <p className="text-xs text-foreground">
                        {simulationResult.action}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-muted-foreground">Severity:</span>
                        <span className={`text-[9px] font-semibold ${getSeverityColor(simulationResult.severity || 'Low')}`}>
                          {simulationResult.severity?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Optimal Repayment Analysis */}
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Optimal Analysis
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 border border-border rounded-sm">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  To Reach HF 1.5
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Required Repayment:</span>
                    <span className="text-xs font-semibold text-foreground">
                      {formatCurrency(optimalRepayment.requiredRepaymentAmount, currency, { compact: true })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Percentage:</span>
                    <span className="text-xs font-semibold text-foreground">
                      {optimalRepayment.requiredRepaymentPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Feasible:</span>
                    <span className={`text-xs font-semibold ${optimalRepayment.feasible ? 'text-green-500' : 'text-red-500'}`}>
                      {optimalRepayment.feasible ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {auditStats && (
                <div className="space-y-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    System Statistics
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Events:</span>
                      <span className="text-foreground font-semibold">{auditStats.totalLogs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Triggered:</span>
                      <span className="text-foreground font-semibold">{auditStats.protectionTriggered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="text-green-500 font-semibold">{auditStats.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Repayment:</span>
                      <span className="text-foreground font-semibold">
                        {formatCurrency(auditStats.averageRepaymentAmount, currency, { compact: true })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="panel p-5">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Protection Trigger Analysis
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">
                Repayment amounts across different health factor scenarios
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scenarioData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="hf" 
                  stroke="#94A3B8" 
                  style={{ fontSize: '10px' }} 
                  tick={{ fill: '#94A3B8' }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E293B' }} 
                />
                <YAxis 
                  stroke="#94A3B8" 
                  style={{ fontSize: '10px' }} 
                  tick={{ fill: '#94A3B8' }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E293B' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F1419', 
                    border: '1px solid #1E293B', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    padding: '8px 12px' 
                  }} 
                  labelStyle={{ color: '#94A3B8', marginBottom: '4px' }} 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Repayment']}
                />
                <Bar 
                  dataKey="repayment" 
                  fill="#F59E0B" 
                  radius={[2, 2, 0, 0]}
                  name="Repayment Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel p-5">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Health Factor Recovery
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">
                Health factor improvement after protection activation
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scenarioData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="hf" 
                  stroke="#94A3B8" 
                  style={{ fontSize: '10px' }} 
                  tick={{ fill: '#94A3B8' }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E293B' }} 
                />
                <YAxis 
                  stroke="#94A3B8" 
                  style={{ fontSize: '10px' }} 
                  tick={{ fill: '#94A3B8' }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E293B' }} 
                  domain={[0.8, 3]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F1419', 
                    border: '1px solid #1E293B', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    padding: '8px 12px' 
                  }} 
                  labelStyle={{ color: '#94A3B8', marginBottom: '4px' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="newHf" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="New Health Factor"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Log */}
        <div className="panel p-0 overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Audit Log
                </h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleExport('json')}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-7 text-[10px]"
                >
                  <Download className="w-3 h-3" />
                  JSON
                </Button>
                <Button 
                  onClick={() => handleExport('csv')}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-7 text-[10px]"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </Button>
              </div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Health Factor</th>
                <th>Triggered</th>
                <th>Repayment</th>
                <th>New HF</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No audit logs available
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="font-mono text-[11px]">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="font-medium text-foreground">
                      {log.action.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="font-mono text-foreground">
                      {log.inputs.currentHealthFactor.toFixed(3)}
                    </td>
                    <td>
                      {log.result.triggered ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </td>
                    <td className="font-mono text-foreground">
                      {log.result.repaymentAmount 
                        ? formatCurrency(log.result.repaymentAmount, currency, { compact: true })
                        : '-'
                      }
                    </td>
                    <td className="font-mono text-foreground">
                      {log.result.newHealthFactor 
                        ? (log.result.newHealthFactor === Infinity ? '∞' : log.result.newHealthFactor.toFixed(3))
                        : '-'
                      }
                    </td>
                    <td>
                      <span className={`text-[9px] font-semibold px-2 py-1 border rounded-sm ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}