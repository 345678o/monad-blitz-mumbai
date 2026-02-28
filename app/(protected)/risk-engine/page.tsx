'use client';

import { useState } from 'react';
import { useCurrency } from '@/components/top-bar';
import { analyzeRisk, calculateRiskMetrics, testRiskEngine } from '@/lib/riskEngine';
import { formatCurrency } from '@/lib/currency';
import { AlertTriangle, CheckCircle, XCircle, Calculator, Play, RotateCcw } from 'lucide-react';

export default function RiskEnginePage() {
  const { currency } = useCurrency();
  
  // Interactive calculator state
  const [inputs, setInputs] = useState({
    collateralValue: 150000,
    debtValue: 85000,
    assetPrice: 3000,
    liquidationThreshold: 0.8
  });

  const [calculationResult, setCalculationResult] = useState(
    calculateRiskMetrics(inputs)
  );

  const portfolio = {
    totalCollateral: inputs.collateralValue,
    totalDebt: inputs.debtValue,
    collateralAssets: [],
    debtAssets: [],
    currentPrice: inputs.assetPrice,
  };

  const riskMetrics = analyzeRisk(portfolio);

  const handleInputChange = (field: string, value: number) => {
    const newInputs = { ...inputs, [field]: value };
    setInputs(newInputs);
    try {
      const result = calculateRiskMetrics(newInputs);
      setCalculationResult(result);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  const runTests = () => {
    testRiskEngine();
  };

  const resetToDefaults = () => {
    const defaultInputs = {
      collateralValue: 150000,
      debtValue: 85000,
      assetPrice: 3000,
      liquidationThreshold: 0.8
    };
    setInputs(defaultInputs);
    setCalculationResult(calculateRiskMetrics(defaultInputs));
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Safe': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'At Risk': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
      case 'Liquidation': return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      default: return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low Risk': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Moderate Risk': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'High Risk': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Risk Engine - Core Financial Logic
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Interactive risk calculation and stress testing platform
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Interactive Calculator */}
          <div className="space-y-6">
            {/* Input Controls */}
            <div className="panel p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Risk Calculator
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                    Collateral Value
                  </label>
                  <input
                    type="number"
                    value={inputs.collateralValue}
                    onChange={(e) => handleInputChange('collateralValue', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {formatCurrency(inputs.collateralValue, currency)}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                    Debt Value
                  </label>
                  <input
                    type="number"
                    value={inputs.debtValue}
                    onChange={(e) => handleInputChange('debtValue', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {formatCurrency(inputs.debtValue, currency)}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                    Asset Price
                  </label>
                  <input
                    type="number"
                    value={inputs.assetPrice}
                    onChange={(e) => handleInputChange('assetPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {formatCurrency(inputs.assetPrice, currency)}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
                    Liquidation Threshold
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1.0"
                    value={inputs.liquidationThreshold}
                    onChange={(e) => handleInputChange('liquidationThreshold', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-muted border border-border text-xs text-foreground rounded-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {(inputs.liquidationThreshold * 100).toFixed(0)}% LTV
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetToDefaults}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted border border-border text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                  <button
                    onClick={runTests}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Test
                  </button>
                </div>
              </div>
            </div>

            {/* Calculation Results */}
            <div className="panel p-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                Calculation Results
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Health Factor
                  </p>
                  <p className="text-2xl font-semibold text-foreground text-financial">
                    {calculationResult.healthFactor === Infinity ? '∞' : calculationResult.healthFactor.toFixed(6)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Risk Level
                  </p>
                  <span className={`inline-block px-2 py-1 text-[9px] font-semibold border rounded-sm ${getRiskColor(calculationResult.riskLevel)}`}>
                    {calculationResult.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Liquidation Price
                  </p>
                  <p className="text-lg font-semibold text-red-500 text-financial">
                    {formatCurrency(calculationResult.liquidationPrice, currency)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Recommended Repayment
                  </p>
                  <p className="text-lg font-semibold text-orange-500 text-financial">
                    {formatCurrency(calculationResult.recommendedRepayment, currency)}
                  </p>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                    Recommended Action
                  </p>
                  <div className="p-3 bg-muted/30 border border-border rounded-sm">
                    <p className="text-xs text-foreground leading-relaxed">
                      {calculationResult.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Stress Tests */}
          <div className="space-y-6">
            {/* Stress Test Results */}
            <div className="panel p-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                Stress Test Scenarios
              </h3>
              <div className="space-y-3">
                {riskMetrics.stressTestResults.map((test, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-sm"
                  >
                    <div className="flex items-center gap-2">
                      {getOutcomeIcon(test.outcome)}
                      <span className="text-xs font-medium text-foreground">
                        {test.scenario}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Health Factor</p>
                        <p className="text-xs font-semibold text-foreground text-financial">
                          {test.resultingHealthFactor.toFixed(3)}
                        </p>
                      </div>
                      <span className={`text-[9px] font-semibold px-2 py-1 border rounded-sm ${
                        test.outcome === 'Safe' 
                          ? 'text-green-500 bg-green-500/10 border-green-500/20'
                          : test.outcome === 'At Risk'
                          ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                          : 'text-red-500 bg-red-500/10 border-red-500/20'
                      }`}>
                        {test.outcome.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Formulas */}
            <div className="panel p-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                Risk Calculation Formulas
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 border border-border rounded-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Health Factor
                  </p>
                  <code className="text-xs text-primary font-mono">
                    HF = (Collateral × LTV) / Debt
                  </code>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    Current: ({inputs.collateralValue.toLocaleString()} × {inputs.liquidationThreshold}) / {inputs.debtValue.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-muted/30 border border-border rounded-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Liquidation Price
                  </p>
                  <code className="text-xs text-primary font-mono">
                    LP = Debt / LTV
                  </code>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    Current: {inputs.debtValue.toLocaleString()} / {inputs.liquidationThreshold}
                  </p>
                </div>

                <div className="p-3 bg-muted/30 border border-border rounded-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Risk Classification
                  </p>
                  <div className="text-[9px] text-muted-foreground space-y-1">
                    <div>≥ 1.5 → Low Risk</div>
                    <div>1.2-1.5 → Moderate Risk</div>
                    <div>1.0-1.2 → High Risk</div>
                    <div>&lt; 1.0 → Critical</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Analysis */}
          <div className="space-y-6">
            {/* Current Analysis */}
            <div className="panel p-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                Position Analysis
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Utilization Rate</span>
                    <span className="text-xs font-semibold text-foreground text-financial">
                      {riskMetrics.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted overflow-hidden rounded-sm">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(riskMetrics.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Safety Buffer</span>
                    <span className="text-xs font-semibold text-green-500 text-financial">
                      {riskMetrics.safetyBuffer.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted overflow-hidden rounded-sm">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${Math.min(riskMetrics.safetyBuffer, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Distance to Liquidation</span>
                    <span className="text-xs font-semibold text-green-500 text-financial">
                      {((1 - calculationResult.liquidationPrice / inputs.assetPrice) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="panel p-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {riskMetrics.recommendedActions.map((action, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-muted/30 border border-border rounded-sm"
                  >
                    <p className="text-xs text-foreground leading-relaxed">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Parameters */}
            <div className="panel p-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                Risk Parameters
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-[10px] text-muted-foreground">Current LTV</span>
                  <span className="text-xs font-semibold text-foreground text-financial">
                    {(inputs.liquidationThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-[10px] text-muted-foreground">Min Health Factor</span>
                  <span className="text-xs font-semibold text-foreground text-financial">1.00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-[10px] text-muted-foreground">Safe Health Factor</span>
                  <span className="text-xs font-semibold text-foreground text-financial">1.50</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] text-muted-foreground">Target Health Factor</span>
                  <span className="text-xs font-semibold text-foreground text-financial">2.00</span>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}