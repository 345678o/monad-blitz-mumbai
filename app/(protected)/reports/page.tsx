'use client';

import { analyzeRisk } from '@/lib/riskEngine';
import { 
  getHistoricalData, 
  getHistoricalStats, 
  getChartData, 
  generateSampleHistoricalData, 
  getDataCounts, 
  exportHistoricalData,
  TimeRange 
} from '@/lib/historicalTrackingService';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30D');
  const [historicalStats, setHistoricalStats] = useState<{
    count: number;
    avgHealthFactor: number;
    minHealthFactor: number;
    maxHealthFactor: number;
    avgCollateral: number;
    avgDebt: number;
    healthFactorTrend: 'up' | 'down' | 'stable';
  } | null>(null);
  const [chartData, setChartData] = useState<Array<{
    date: string;
    timestamp: number;
    hf: number;
    collateral: number;
    debt: number;
    utilization: number;
  }>>([]);
  const [dataCounts, setDataCounts] = useState<Record<TimeRange, number>>({ '1D': 0, '7D': 0, '30D': 0, '90D': 0 });

  useEffect(() => {
    // Initialize sample historical data
    generateSampleHistoricalData();
    
    // Load data for selected range
    loadHistoricalData(selectedRange);
    
    // Get data counts for all ranges
    setDataCounts(getDataCounts());
  }, [selectedRange]);

  const loadHistoricalData = (range: TimeRange) => {
    const stats = getHistoricalStats(range);
    const data = getChartData(range);
    setHistoricalStats(stats);
    setChartData(data);
  };

  const portfolio = {
    totalCollateral: 150000,
    totalDebt: 85000,
    collateralAssets: [
      { asset: 'ETH', value: 90000, amount: 30, price: 3000 },
      { asset: 'WBTC', value: 40000, amount: 1, price: 40000 },
      { asset: 'USDC', value: 20000, amount: 20000, price: 1 },
    ],
    debtAssets: [
      { asset: 'USDC', value: 60000, amount: 60000, price: 1 },
      { asset: 'DAI', value: 25000, amount: 25000, price: 1 },
    ],
    currentPrice: 3000,
  };

  const riskMetrics = analyzeRisk(portfolio);

  const handleExport = (format: 'json' | 'csv') => {
    const data = exportHistoricalData(selectedRange, format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historical-data-${selectedRange}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Historical Risk Analysis Report
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Time-series analysis and portfolio performance tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 h-8 text-xs"
              onClick={() => handleExport('json')}
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 h-8 text-xs"
              onClick={() => handleExport('csv')}
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 panel p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Time Range Analysis</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Select time period for historical analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Generated: {new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {(['1D', '7D', '30D', '90D'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-2 text-xs font-semibold border rounded-sm transition-colors ${
                  selectedRange === range
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {range} ({dataCounts[range]} points)
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl space-y-6">
          {/* Historical Statistics Summary */}
          {historicalStats && (
            <div className="grid grid-cols-6 gap-4">
              <div className="panel p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Data Points
                </p>
                <p className="text-2xl font-semibold text-foreground text-financial">
                  {historicalStats.count}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {selectedRange} period
                </p>
              </div>
              
              <div className="panel p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Avg Health Factor
                </p>
                <p className="text-2xl font-semibold text-foreground text-financial">
                  {historicalStats.avgHealthFactor}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(historicalStats.healthFactorTrend)}
                  <span className={`text-[10px] font-semibold ${getTrendColor(historicalStats.healthFactorTrend)}`}>
                    {historicalStats.healthFactorTrend.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="panel p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Min Health Factor
                </p>
                <p className="text-2xl font-semibold text-red-500 text-financial">
                  {historicalStats.minHealthFactor}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Lowest point
                </p>
              </div>

              <div className="panel p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Max Health Factor
                </p>
                <p className="text-2xl font-semibold text-green-500 text-financial">
                  {historicalStats.maxHealthFactor}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Peak value
                </p>
              </div>

              <div className="panel p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Avg Collateral
                </p>
                <p className="text-2xl font-semibold text-foreground text-financial">
                  ${(historicalStats.avgCollateral / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Average value
                </p>
              </div>

              <div className="panel p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Avg Debt
                </p>
                <p className="text-2xl font-semibold text-foreground text-financial">
                  ${(historicalStats.avgDebt / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Average value
                </p>
              </div>
            </div>
          )}

          {/* Historical Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="panel p-5">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Health Factor History
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {selectedRange} time-series data
                </p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorHFHistory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="date" 
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
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hf" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    fill="url(#colorHFHistory)" 
                    name="Health Factor" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="panel p-5">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Portfolio Value History
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Collateral vs Debt over time
                </p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCollateralHistory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDebtHistory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="date" 
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
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collateral" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    fill="url(#colorCollateralHistory)" 
                    name="Collateral (K)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="debt" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    fill="url(#colorDebtHistory)" 
                    name="Debt (K)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Utilization History */}
          <div className="panel p-5">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Utilization Rate History
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">
                Debt-to-collateral ratio over {selectedRange}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="date" 
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
                  domain={[0, 100]}
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
                  formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Utilization']}
                />
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  dot={false}
                  name="Utilization %" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Executive Summary */}
          <div className="panel p-6">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Executive Summary
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">
                AI-generated risk analysis based on historical data
              </p>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Portfolio Performance:</strong> Over the {selectedRange} period, 
                your portfolio maintained an average health factor of {historicalStats?.avgHealthFactor || 'N/A'}, 
                indicating {(historicalStats?.avgHealthFactor || 0) >= 1.5 ? 'strong' : (historicalStats?.avgHealthFactor || 0) >= 1.2 ? 'moderate' : 'elevated'} risk levels.
              </p>
              
              <p>
                <strong className="text-foreground">Risk Trend:</strong> The health factor trend is currently 
                <span className={`font-semibold ${getTrendColor(historicalStats?.healthFactorTrend || 'stable')}`}>
                  {' '}{historicalStats?.healthFactorTrend || 'stable'}
                </span>, with a range from {historicalStats?.minHealthFactor || 'N/A'} to {historicalStats?.maxHealthFactor || 'N/A'}.
                {(historicalStats?.minHealthFactor || 2) < 1.2 && ' Warning: Your portfolio experienced high-risk periods during this timeframe.'}
              </p>
              
              <p>
                <strong className="text-foreground">Recommendations:</strong> 
                {(historicalStats?.avgHealthFactor || 0) >= 1.5 
                  ? ' Your portfolio demonstrates strong risk management. Continue monitoring for market volatility.'
                  : (historicalStats?.avgHealthFactor || 0) >= 1.2
                  ? ' Consider increasing collateral or reducing debt to improve your safety buffer.'
                  : ' Immediate action recommended: Your portfolio has operated in high-risk territory. Review position sizing and implement risk controls.'
                }
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}