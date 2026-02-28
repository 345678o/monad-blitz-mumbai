'use client';

import { useCurrency } from '@/components/top-bar';
import { formatCurrency } from '@/lib/currency';
import { useState, useEffect } from 'react';
import { analyzeRisk } from '@/lib/riskEngine';
import { runShockSimulation, runMultipleShockScenarios, getShockSeverity, getTimeToLiquidation, generateShockSummary } from '@/lib/shockSimulator';
import { runStressTest, getSeverityColor as getStressTestSeverityColor, getSeverityIcon as getStressTestSeverityIcon, getPredefinedScenarios, StressTestResults } from '@/lib/stressTestService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { AlertTriangle, TrendingDown, Zap, Shield, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const { currency } = useCurrency();
  const [shockPercent, setShockPercent] = useState(10);
  const [stressTestResults, setStressTestResults] = useState<StressTestResults | null>(null);

  // Initialize stress test on component mount
  useEffect(() => {
    const portfolio = {
      totalCollateral: 150000,
      totalDebt: 85000,
      collateralAssets: [],
      debtAssets: [],
      currentPrice: 3000,
    };

    const results = runStressTest({
      collateralValue: portfolio.totalCollateral,
      debtValue: portfolio.totalDebt,
      liquidationThreshold: 0.8
    });
    setStressTestResults(results);
  }, []);

  const portfolio = {
    totalCollateral: 150000,
    totalDebt: 85000,
    collateralAssets: [],
    debtAssets: [],
    currentPrice: 3000,
  };

  const currentRisk = analyzeRisk(portfolio);
  
  // Use new shock simulator
  const shockSimulation = runShockSimulation({
    collateralValue: portfolio.totalCollateral,
    debtValue: portfolio.totalDebt,
    liquidationThreshold: 0.8,
    priceDropPercent: shockPercent
  });

  // Generate simulation data for chart using new shock simulator
  const simulationData: Array<{ drop: number; hf: number; collateral: number }> = [];
  const priceDrops = [];
  for (let i = 0; i <= 30; i += 2) {
    priceDrops.push(i);
  }
  
  const multipleScenarios = runMultipleShockScenarios({
    collateralValue: portfolio.totalCollateral,
    debtValue: portfolio.totalDebt,
    liquidationThreshold: 0.8
  }, priceDrops);
  
  multipleScenarios.forEach((sim, index) => {
    simulationData.push({
      drop: sim.priceDropPercent,
      hf: sim.newHealthFactor === Infinity ? 10 : sim.newHealthFactor, // Cap infinity for chart display
      collateral: sim.newCollateral / 1000,
    });
  });

  const getOutcomeColor = (liquidationTriggered: boolean, riskLevel: string) => {
    if (liquidationTriggered) return 'text-red-500 bg-red-500/10 border-red-500/20';
    switch (riskLevel) {
      case 'Low Risk': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Moderate Risk': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'High Risk': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low Risk': return 'text-green-500';
      case 'Moderate Risk': return 'text-yellow-500';
      case 'High Risk': return 'text-orange-500';
      case 'Critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Advanced Risk Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time stress testing and predictive risk modeling
          </p>
        </div>

        {/* Current Position Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="metric-card">
            <p className="metric-label">Current Health Factor</p>
            <p className="metric-value">{currentRisk.healthFactor.toFixed(3)}</p>
            <p className="metric-change">{currentRisk.riskLevel}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Total Collateral</p>
            <p className="metric-value">{formatCurrency(portfolio.totalCollateral / 1000, currency, { compact: true })}</p>
            <p className="metric-change">Across 3 assets</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Total Debt</p>
            <p className="metric-value">{formatCurrency(portfolio.totalDebt / 1000, currency, { compact: true })}</p>
            <p className="metric-change">2 positions</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Liquidation Price</p>
            <p className="metric-value text-red-500">{formatCurrency(currentRisk.liquidationPrice, currency)}</p>
            <p className="metric-change">Current: {formatCurrency(3000, currency)}</p>
          </div>
        </div>

        {/* Main Shock Simulator */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Simulator Controls */}
          <div className="col-span-2 panel p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Liquidation Shock Simulator
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Real-time stress engine - Predict future risk scenarios
                </p>
              </div>
            </div>

            {/* Slider Control */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Market Price Drop Simulation
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-500 text-financial">
                    -{shockPercent}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={shockPercent}
                onChange={(e) => setShockPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-muted appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${(shockPercent / 30) * 100}%, #1E293B ${(shockPercent / 30) * 100}%, #1E293B 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>0% (No Change)</span>
                <span>15% (Moderate)</span>
                <span>30% (Severe)</span>
              </div>
            </div>

            {/* Warning Banner */}
            <div className={`p-4 border-l-2 mb-6 ${
              shockSimulation.liquidationTriggered 
                ? 'border-red-500 bg-red-500/5'
                : shockSimulation.newRiskLevel === 'High Risk' || shockSimulation.newRiskLevel === 'Critical'
                ? 'border-yellow-500 bg-yellow-500/5'
                : 'border-green-500 bg-green-500/5'
            }`}>
              <div className="flex items-start gap-3">
                {shockSimulation.liquidationTriggered ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : shockSimulation.newRiskLevel === 'High Risk' || shockSimulation.newRiskLevel === 'Critical' ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-xs font-semibold mb-1 ${
                    shockSimulation.liquidationTriggered ? 'text-red-500' :
                    shockSimulation.newRiskLevel === 'High Risk' || shockSimulation.newRiskLevel === 'Critical' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {shockSimulation.liquidationTriggered ? 'CRITICAL RISK' :
                     shockSimulation.newRiskLevel === 'High Risk' || shockSimulation.newRiskLevel === 'Critical' ? 'HIGH RISK' :
                     'POSITION SAFE'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {generateShockSummary(shockSimulation)}
                  </p>
                </div>
              </div>
            </div>

            {/* Simulation Results Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  New Health Factor
                </p>
                <p className={`text-2xl font-bold text-financial ${getRiskColor(shockSimulation.newRiskLevel)}`}>
                  {shockSimulation.newHealthFactor === Infinity ? '∞' : shockSimulation.newHealthFactor.toFixed(3)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Current: {currentRisk.healthFactor === Infinity ? '∞' : currentRisk.healthFactor.toFixed(3)}
                </p>
              </div>

              <div className="p-4 bg-muted/30 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  New Collateral Value
                </p>
                <p className="text-2xl font-bold text-foreground text-financial">
                  {formatCurrency(shockSimulation.newCollateral, currency, { compact: true })}
                </p>
                <p className="text-[10px] text-red-500 mt-1">
                  -{formatCurrency(portfolio.totalCollateral - shockSimulation.newCollateral, currency, { compact: true })} loss
                </p>
              </div>

              <div className="p-4 bg-muted/30 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Time to Liquidation
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <p className="text-xl font-bold text-yellow-500 text-financial">
                    {getTimeToLiquidation(shockSimulation.newHealthFactor)}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Estimated timeline
                </p>
              </div>
            </div>
          </div>

          {/* Recovery Actions */}
          <div className="panel p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Recovery Actions
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Required Collateral
                </p>
                <p className="text-xl font-bold text-green-500 text-financial mb-1">
                  {formatCurrency(shockSimulation.requiredRepayment, currency, { compact: true })}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  To restore HF to 1.500
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Required Repayment
                </p>
                <p className="text-xl font-bold text-blue-500 text-financial mb-1">
                  {formatCurrency(shockSimulation.requiredRepayment, currency, { compact: true })}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Alternative to adding collateral
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Risk Classification
                </p>
                <span className={`badge ${getOutcomeColor(shockSimulation.liquidationTriggered, shockSimulation.newRiskLevel)}`}>
                  {shockSimulation.liquidationTriggered ? 'LIQUIDATION' : shockSimulation.newRiskLevel.toUpperCase()}
                </span>
              </div>

              <div className="pt-4 border-t border-border">
                <button className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                  Enable Auto-Protection
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Chart */}
        <div className="panel p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Health Factor Sensitivity Analysis
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">
              Impact of market price drops on position health
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={simulationData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="colorHFSim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis 
                dataKey="drop" 
                stroke="#94A3B8" 
                style={{ fontSize: '10px' }}
                tick={{ fill: '#94A3B8' }}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
                label={{ value: 'Price Drop %', position: 'insideBottom', offset: -5, style: { fontSize: '10px', fill: '#94A3B8' } }}
              />
              <YAxis 
                stroke="#94A3B8" 
                style={{ fontSize: '10px' }}
                tick={{ fill: '#94A3B8' }}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
                label={{ value: 'Health Factor', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#94A3B8' } }}
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
              {/* Critical threshold line */}
              <Line 
                type="monotone" 
                dataKey={() => 1.0} 
                stroke="#EF4444" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              {/* Moderate threshold line */}
              <Line 
                type="monotone" 
                dataKey={() => 1.5} 
                stroke="#F59E0B" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="hf" 
                stroke="#EF4444" 
                strokeWidth={2}
                fill="url(#colorHFSim)"
                name="Health Factor"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-muted-foreground">Critical (HF = 1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span className="text-muted-foreground">Moderate Risk (HF = 1.5)</span>
            </div>
          </div>
        </div>

        {/* Stress Test Results */}
        {stressTestResults && (
          <div className="panel p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Enterprise Stress Test Results
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Comprehensive scenario analysis across predefined market conditions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-primary font-semibold">ENTERPRISE</span>
              </div>
            </div>

            {/* Stress Test Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-500/5 border border-green-500/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Safe Scenarios
                </p>
                <p className="text-2xl font-bold text-green-500 text-financial">
                  {stressTestResults.summary.safeScenariosCount}
                </p>
                <p className="text-[10px] text-green-500 mt-1">
                  Position stable
                </p>
              </div>
              
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Warning Scenarios
                </p>
                <p className="text-2xl font-bold text-yellow-500 text-financial">
                  {stressTestResults.summary.warningScenariosCount}
                </p>
                <p className="text-[10px] text-yellow-500 mt-1">
                  Monitor closely
                </p>
              </div>

              <div className="p-4 bg-orange-500/5 border border-orange-500/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Danger Scenarios
                </p>
                <p className="text-2xl font-bold text-orange-500 text-financial">
                  {stressTestResults.summary.dangerScenariosCount}
                </p>
                <p className="text-[10px] text-orange-500 mt-1">
                  High risk
                </p>
              </div>

              <div className="p-4 bg-red-500/5 border border-red-500/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Critical Scenarios
                </p>
                <p className="text-2xl font-bold text-red-500 text-financial">
                  {stressTestResults.summary.criticalScenariosCount}
                </p>
                <p className="text-[10px] text-red-500 mt-1">
                  Liquidation risk
                </p>
              </div>
            </div>

            {/* Detailed Scenario Results */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                  Scenario Analysis
                </h4>
                <div className="space-y-3">
                  {stressTestResults.scenarios.map((scenario, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-foreground">
                          {getStressTestSeverityIcon(scenario.severity)}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {scenario.scenarioName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            -{scenario.priceDropPercent}% price drop
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-foreground text-financial">
                          HF: {scenario.newHealthFactor === Infinity ? '∞' : scenario.newHealthFactor.toFixed(3)}
                        </p>
                        <span className={`text-[9px] font-semibold px-2 py-1 border rounded-sm ${getStressTestSeverityColor(scenario.severity)}`}>
                          {scenario.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                  Risk Assessment
                </h4>
                
                {/* Worst Case Scenario */}
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-sm mb-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                    Worst Case Scenario
                  </p>
                  <p className="text-sm font-semibold text-red-500 mb-1">
                    {stressTestResults.summary.worstCaseScenario.scenarioName}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Health Factor:</span>
                      <span className="text-red-500 font-semibold ml-1">
                        {stressTestResults.summary.worstCaseScenario.newHealthFactor === Infinity ? '∞' : stressTestResults.summary.worstCaseScenario.newHealthFactor.toFixed(3)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time to Liq:</span>
                      <span className="text-red-500 font-semibold ml-1">
                        {stressTestResults.summary.worstCaseScenario.timeToLiquidation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Recommended Actions
                  </p>
                  {stressTestResults.summary.recommendedActions.map((action, index) => (
                    <div key={index} className="p-3 bg-muted/30 border border-border rounded-sm">
                      <p className="text-xs text-foreground leading-relaxed">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Scenarios */}
        <div className="grid grid-cols-4 gap-4">
          {[5, 10, 15, 20].map((percent) => {
            const scenario = runShockSimulation({
              collateralValue: portfolio.totalCollateral,
              debtValue: portfolio.totalDebt,
              liquidationThreshold: 0.8,
              priceDropPercent: percent
            });
            return (
              <button
                key={percent}
                onClick={() => setShockPercent(percent)}
                className={`panel p-4 text-left hover:border-primary/50 transition-colors ${
                  shockPercent === percent ? 'border-primary' : ''
                }`}
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  ETH -{percent}% Scenario
                </p>
                <p className={`text-lg font-bold text-financial mb-1 ${getRiskColor(scenario.newRiskLevel)}`}>
                  HF: {scenario.newHealthFactor === Infinity ? '∞' : scenario.newHealthFactor.toFixed(3)}
                </p>
                <span className={`badge text-[9px] ${getOutcomeColor(scenario.liquidationTriggered, scenario.newRiskLevel)}`}>
                  {scenario.liquidationTriggered ? 'LIQUIDATION' : scenario.newRiskLevel.toUpperCase()}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
