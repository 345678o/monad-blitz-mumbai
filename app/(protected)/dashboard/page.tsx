'use client';

import { TopBar } from '@/components/top-bar';
import { MetricCard } from '@/components/metric-card';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { analyzeRisk } from '@/lib/riskEngine';
import { AlertTriangle, Activity } from 'lucide-react';

export default function DashboardPage() {
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

  const riskMetrics = analyzeRisk(portfolio);
  const netExposure = portfolio.totalCollateral - portfolio.totalDebt;

  const timeSeriesData = [
    { date: 'Mon', hf: 1.52, collateral: 148000, debt: 85000, utilization: 57.4 },
    { date: 'Tue', hf: 1.48, collateral: 146000, debt: 85000, utilization: 58.2 },
    { date: 'Wed', hf: 1.45, collateral: 145000, debt: 85000, utilization: 58.6 },
    { date: 'Thu', hf: 1.41, collateral: 143000, debt: 85000, utilization: 59.4 },
    { date: 'Fri', hf: 1.44, collateral: 147000, debt: 85000, utilization: 57.8 },
    { date: 'Sat', hf: 1.47, collateral: 149000, debt: 85000, utilization: 57.0 },
    { date: 'Sun', hf: 1.45, collateral: 150000, debt: 85000, utilization: 56.7 },
  ];

  const assetAllocation = [
    { asset: 'ETH', collateral: 90000, debt: 0, net: 90000 },
    { asset: 'WBTC', collateral: 40000, debt: 0, net: 40000 },
    { asset: 'USDC', collateral: 20000, debt: 60000, net: -40000 },
    { asset: 'DAI', collateral: 0, debt: 25000, net: -25000 },
  ];

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
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex-1 overflow-auto bg-background p-6">
        {riskMetrics.healthFactor < 1.5 && (
          <div className="mb-6 panel p-4 border-l-2 border-yellow-500 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-500 mb-1">Risk Alert</p>
                <p className="text-xs text-muted-foreground">
                  Health factor below recommended threshold. Review position immediately.
                </p>
              </div>
              <button className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold">
                View Details →
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <MetricCard label="Total Collateral" value={`${(portfolio.totalCollateral / 1000).toFixed(1)}K`} change={2.5} status="positive" subtext="3 assets" />
          <MetricCard label="Total Debt" value={`${(portfolio.totalDebt / 1000).toFixed(1)}K`} change={-1.2} status="negative" subtext="2 positions" />
          <MetricCard label="Net Exposure" value={`${(netExposure / 1000).toFixed(1)}K`} change={5.8} status="positive" subtext={`${((netExposure / portfolio.totalCollateral) * 100).toFixed(1)}% equity`} />
          <MetricCard label="Health Factor" value={riskMetrics.healthFactor.toFixed(3)} badge={<span className={`badge ${getRiskColor(riskMetrics.riskLevel)}`}>{riskMetrics.riskLevel.toUpperCase()}</span>} subtext="Min: 1.500" />
          <MetricCard label="Utilization" value={`${riskMetrics.utilizationRate.toFixed(1)}%`} subtext="Max: 80%" />
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Health Factor Trend</h3>
                <p className="text-[10px] text-muted-foreground mt-1">7-day historical data</p>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-primary font-semibold">LIVE</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorHF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" style={{ fontSize: '10px' }} tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: '10px' }} tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={{ stroke: '#1E293B' }} domain={[1.0, 2.0]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1419', border: '1px solid #1E293B', borderRadius: '4px', fontSize: '11px', padding: '8px 12px' }} labelStyle={{ color: '#94A3B8', marginBottom: '4px' }} />
                <Area type="monotone" dataKey="hf" stroke="#3B82F6" strokeWidth={2} fill="url(#colorHF)" name="Health Factor" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Portfolio Composition</h3>
                <p className="text-[10px] text-muted-foreground mt-1">Collateral vs Debt</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCollateral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" style={{ fontSize: '10px' }} tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: '10px' }} tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1419', border: '1px solid #1E293B', borderRadius: '4px', fontSize: '11px', padding: '8px 12px' }} labelStyle={{ color: '#94A3B8', marginBottom: '4px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }} iconSize={10} />
                <Area type="monotone" dataKey="collateral" stroke="#10B981" strokeWidth={2} fill="url(#colorCollateral)" name="Collateral" />
                <Area type="monotone" dataKey="debt" stroke="#EF4444" strokeWidth={2} fill="url(#colorDebt)" name="Debt" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="panel p-5">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Asset Allocation</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Net position by asset</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={assetAllocation} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="asset" stroke="#94A3B8" style={{ fontSize: '10px' }} tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: '10px' }} tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1419', border: '1px solid #1E293B', borderRadius: '4px', fontSize: '11px', padding: '8px 12px' }} />
                <Bar dataKey="net" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="panel p-5">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Risk Metrics</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Current position analysis</p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Utilization Rate</span>
                  <span className="text-xs font-semibold text-foreground text-financial">{riskMetrics.utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(riskMetrics.utilizationRate, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Safety Buffer</span>
                  <span className="text-xs font-semibold text-green-500 text-financial">{riskMetrics.safetyBuffer.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-muted overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${Math.min(riskMetrics.safetyBuffer, 100)}%` }} />
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Liq. Price</p>
                    <p className="text-sm font-semibold text-red-500 text-financial">${riskMetrics.liquidationPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current</p>
                    <p className="text-sm font-semibold text-foreground text-financial">$3,000.00</p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Distance to Liq.</span>
                  <span className="text-xs font-semibold text-green-500 text-financial">{((1 - riskMetrics.liquidationPrice / 3000) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="panel p-5">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">System Status</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Protection & monitoring</p>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-[11px] text-muted-foreground">Auto-Protection</span>
                <span className="text-[11px] font-semibold text-green-500">ENABLED</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-[11px] text-muted-foreground">Risk Level</span>
                <span className={`text-[11px] font-semibold ${getRiskColor(riskMetrics.riskLevel).split(' ')[0]}`}>{riskMetrics.riskLevel}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-[11px] text-muted-foreground">Active Alerts</span>
                <span className="text-[11px] font-semibold text-yellow-500">2</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[11px] text-muted-foreground">Last Update</span>
                <span className="text-[11px] font-semibold text-foreground">2s ago</span>
              </div>
            </div>
            <div className="pt-3 border-t border-border space-y-2">
              <button className="w-full py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">Manage Position</button>
              <button className="w-full py-2 bg-muted border border-border text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors">View Analytics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
