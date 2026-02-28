'use client';

import { ArrowUpDown, TrendingUp, TrendingDown, Plus, Minus, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Position {
  asset: string;
  type: 'Collateral' | 'Debt';
  amount: number;
  value: number;
  price: number;
  apy: number;
  change24h: number;
  liquidationPrice: number;
  healthFactor: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  protocol: string;
}

export default function PositionsPage() {
  const [sortField, setSortField] = useState<keyof Position>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'Collateral' | 'Debt'>('all');

  const positions: Position[] = [
    { 
      asset: 'ETH', 
      type: 'Collateral',
      amount: 30.0,
      value: 90000, 
      price: 3000,
      apy: 2.5,
      change24h: 3.2,
      liquidationPrice: 2250, 
      healthFactor: 1.45,
      riskLevel: 'Moderate',
      protocol: 'Aave V3'
    },
    { 
      asset: 'WBTC', 
      type: 'Collateral',
      amount: 1.0,
      value: 40000, 
      price: 40000,
      apy: 1.8,
      change24h: 2.1,
      liquidationPrice: 35000, 
      healthFactor: 1.85,
      riskLevel: 'Low',
      protocol: 'Compound'
    },
    { 
      asset: 'USDC', 
      type: 'Collateral',
      amount: 20000,
      value: 20000, 
      price: 1.0,
      apy: 3.2,
      change24h: 0.01,
      liquidationPrice: 0, 
      healthFactor: 2.5,
      riskLevel: 'Low',
      protocol: 'Aave V3'
    },
    { 
      asset: 'USDC', 
      type: 'Debt',
      amount: 60000,
      value: 60000, 
      price: 1.0,
      apy: 4.5,
      change24h: 0.0,
      liquidationPrice: 0, 
      healthFactor: 1.45,
      riskLevel: 'Moderate',
      protocol: 'Aave V3'
    },
    { 
      asset: 'DAI', 
      type: 'Debt',
      amount: 25000,
      value: 25000, 
      price: 1.0,
      apy: 3.8,
      change24h: -0.05,
      liquidationPrice: 0, 
      healthFactor: 1.45,
      riskLevel: 'Moderate',
      protocol: 'Compound'
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const handleSort = (field: keyof Position) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredPositions = filterType === 'all' 
    ? positions 
    : positions.filter(p => p.type === filterType);

  const sortedPositions = [...filteredPositions].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * modifier;
    }
    return ((aVal as number) - (bVal as number)) * modifier;
  });

  const totalCollateral = positions.filter(p => p.type === 'Collateral').reduce((sum, p) => sum + p.value, 0);
  const totalDebt = positions.filter(p => p.type === 'Debt').reduce((sum, p) => sum + p.value, 0);
  const netValue = totalCollateral - totalDebt;
  const avgAPY = positions.reduce((sum, p) => sum + p.apy, 0) / positions.length;

  return (
    <div className="flex-1 overflow-auto bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Position Management
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Monitor and manage your collateral and debt positions across protocols
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`text-xs px-3 py-1.5 border rounded-sm ${
                filterType === 'all'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              All Positions
            </button>
            <button
              onClick={() => setFilterType('Collateral')}
              className={`text-xs px-3 py-1.5 border rounded-sm ${
                filterType === 'Collateral'
                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Collateral
            </button>
            <button
              onClick={() => setFilterType('Debt')}
              className={`text-xs px-3 py-1.5 border rounded-sm ${
                filterType === 'Debt'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Debt
            </button>
          </div>
        </div>

        <div className="panel p-0 overflow-hidden mb-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <button 
                    onClick={() => handleSort('asset')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Asset
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Type
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Amount
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleSort('value')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Value (USD)
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Price
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button 
                    onClick={() => handleSort('apy')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    APY
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>24h Change</th>
                <th>
                  <button 
                    onClick={() => handleSort('protocol')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Protocol
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPositions.map((position, idx) => (
                <tr key={`${position.asset}-${position.type}-${idx}`} className="hover:bg-muted/30">
                  <td className="font-semibold text-foreground">{position.asset}</td>
                  <td>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 border rounded-sm ${
                      position.type === 'Collateral'
                        ? 'text-green-500 bg-green-500/10 border-green-500/20'
                        : 'text-red-500 bg-red-500/10 border-red-500/20'
                    }`}>
                      {position.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-financial">
                    {position.amount >= 1000 
                      ? position.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : position.amount.toFixed(4)}
                  </td>
                  <td className="text-financial font-medium">
                    ${position.value.toLocaleString()}
                  </td>
                  <td className="text-financial">
                    ${position.price >= 1000 
                      ? position.price.toLocaleString()
                      : position.price.toFixed(2)}
                  </td>
                  <td className="text-financial">
                    <span className={position.type === 'Collateral' ? 'text-green-500' : 'text-red-500'}>
                      {position.type === 'Collateral' ? '+' : '-'}{position.apy.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {position.change24h > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : position.change24h < 0 ? (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      ) : null}
                      <span className={`text-financial ${
                        position.change24h > 0 ? 'text-green-500' : 
                        position.change24h < 0 ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`}>
                        {position.change24h > 0 ? '+' : ''}{position.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{position.protocol}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary cursor-pointer" />
                    </div>
                  </td>
                  <td>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 border rounded-sm ${getRiskColor(position.riskLevel)}`}>
                      {position.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {position.type === 'Collateral' ? (
                        <>
                          <button className="text-xs text-green-500 hover:text-green-400 flex items-center gap-0.5">
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                          <span className="text-muted-foreground">|</span>
                          <button className="text-xs text-red-500 hover:text-red-400 flex items-center gap-0.5">
                            <Minus className="w-3 h-3" />
                            Remove
                          </button>
                        </>
                      ) : (
                        <button className="text-xs text-primary hover:text-primary/80">
                          Repay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-3">
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Total Collateral
            </p>
            <p className="text-lg font-semibold text-green-500 text-financial">
              ${(totalCollateral / 1000).toFixed(1)}K
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {positions.filter(p => p.type === 'Collateral').length} positions
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Total Debt
            </p>
            <p className="text-lg font-semibold text-red-500 text-financial">
              ${(totalDebt / 1000).toFixed(1)}K
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {positions.filter(p => p.type === 'Debt').length} positions
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Net Value
            </p>
            <p className="text-lg font-semibold text-foreground text-financial">
              ${(netValue / 1000).toFixed(1)}K
            </p>
            <p className="text-[10px] text-green-500 mt-0.5">
              +{((netValue / totalCollateral) * 100).toFixed(1)}% equity
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Avg APY
            </p>
            <p className="text-lg font-semibold text-foreground text-financial">
              {avgAPY.toFixed(2)}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Weighted average
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Protocols
            </p>
            <p className="text-lg font-semibold text-foreground text-financial">
              {new Set(positions.map(p => p.protocol)).size}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Active protocols
            </p>
          </div>
      </div>
    </div>
  );
}
