'use client';

import { AlertTriangle, Info, CheckCircle, XCircle, Clock, Filter, Search, Download, RefreshCw, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  generateAlerts, 
  getAllAlerts, 
  getAlertsBySeverity, 
  getUnresolvedAlerts, 
  resolveAlert, 
  clearResolvedAlerts, 
  getAlertStats, 
  getSeverityColor, 
  getSeverityIcon, 
  generateSampleAlerts,
  Alert 
} from '@/lib/alertsService';
import { analyzeRisk } from '@/lib/riskEngine';
import { runShockSimulation } from '@/lib/shockSimulator';

export default function AlertsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertStats, setAlertStats] = useState({ total: 0, unresolved: 0, bySeverity: { Low: 0, Moderate: 0, High: 0, Critical: 0 } });

  // Portfolio data for generating dynamic alerts
  const portfolio = {
    totalCollateral: 150000,
    totalDebt: 85000,
    collateralAssets: [],
    debtAssets: [],
    currentPrice: 3000,
  };

  // Load alerts on component mount
  useEffect(() => {
    // Generate sample alerts for demo
    generateSampleAlerts();
    refreshAlerts();
  }, []);

  const refreshAlerts = () => {
    const allAlerts = getAllAlerts();
    setAlerts(allAlerts);
    setAlertStats(getAlertStats());
  };

  const generateNewAlerts = () => {
    const currentRisk = analyzeRisk(portfolio);
    const shockResult = runShockSimulation({
      collateralValue: portfolio.totalCollateral,
      debtValue: portfolio.totalDebt,
      liquidationThreshold: 0.8,
      priceDropPercent: 15
    });

    // Simulate previous health factor for comparison
    const previousHealthFactor = currentRisk.healthFactor + 0.2;

    const newAlerts = generateAlerts({
      previousHealthFactor,
      currentHealthFactor: currentRisk.healthFactor,
      shockResult,
      autoProtectionResult: {
        triggered: Math.random() > 0.7, // 30% chance
        action: 'Emergency Collateral Addition',
        repaymentAmount: 25000,
        reason: 'Health factor dropped below safety threshold',
        timestamp: new Date()
      }
    });

    refreshAlerts();
    return newAlerts;
  };

  const handleResolveAlert = (alertId: string) => {
    resolveAlert(alertId);
    refreshAlerts();
  };

  const handleClearResolved = () => {
    clearResolvedAlerts();
    refreshAlerts();
  };

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filter === 'all' || alert.severity.toLowerCase() === filter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && !alert.resolved) ||
                         (statusFilter === 'resolved' && alert.resolved);
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getAlertSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'Critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'High': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Moderate': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (resolved: boolean) => {
    return resolved 
      ? 'text-green-500 bg-green-500/10 border-green-500/20'
      : 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getStatusIcon = (resolved: boolean) => {
    return resolved 
      ? <CheckCircle className="w-3 h-3" />
      : <XCircle className="w-3 h-3" />;
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-4">
        {/* Header with Search and Filters */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Dynamic Alert Center
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time risk alerts and system notifications
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 h-8 text-xs"
                onClick={generateNewAlerts}
              >
                <Plus className="w-3.5 h-3.5" />
                Generate Alert
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 h-8 text-xs"
                onClick={refreshAlerts}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 h-8 text-xs"
                onClick={handleClearResolved}
              >
                Clear Resolved
              </Button>
              <Button size="sm" variant="outline" className="gap-2 h-8 text-xs">
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-9 pr-3 bg-muted border border-border rounded-sm text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Severity:</span>
            <button
              onClick={() => setFilter('all')}
              className={`text-xs px-2 py-1 border rounded-sm ${
                filter === 'all'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`text-xs px-2 py-1 border rounded-sm ${
                filter === 'critical'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`text-xs px-2 py-1 border rounded-sm ${
                filter === 'high'
                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setFilter('moderate')}
              className={`text-xs px-2 py-1 border rounded-sm ${
                filter === 'moderate'
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Moderate
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`text-xs px-2 py-1 border rounded-sm ${
                filter === 'low'
                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Low
            </button>

            <span className="text-xs text-muted-foreground ml-4">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-xs px-2 py-1 border rounded-sm ${
                statusFilter === 'all'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`text-xs px-2 py-1 border rounded-sm ${
                statusFilter === 'active'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`text-xs px-2 py-1 border rounded-sm ${
                statusFilter === 'resolved'
                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                  : 'text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="panel p-0 overflow-hidden mb-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Alert Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No alerts found matching your filters
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-muted/30">
                    <td className="font-mono text-[11px]">{formatTimestamp(alert.timestamp)}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {getAlertSeverityIcon(alert.severity)}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 border rounded-sm ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="font-medium text-foreground">{alert.type}</td>
                    <td className="text-muted-foreground max-w-md">
                      <div className="truncate">{alert.message}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(alert.resolved)}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 border rounded-sm ${getStatusColor(alert.resolved)}`}>
                          {alert.resolved ? 'RESOLVED' : 'ACTIVE'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {!alert.resolved && (
                          <button 
                            onClick={() => handleResolveAlert(alert.id)}
                            className="text-xs text-green-500 hover:text-green-400"
                          >
                            Resolve
                          </button>
                        )}
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-6 gap-3">
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Active Alerts
            </p>
            <p className="text-xl font-semibold text-red-500 text-financial">
              {alertStats.unresolved}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Require attention
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Critical
            </p>
            <p className="text-xl font-semibold text-red-500 text-financial">
              {alertStats.bySeverity.Critical}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              High priority
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              High Risk
            </p>
            <p className="text-xl font-semibold text-yellow-500 text-financial">
              {alertStats.bySeverity.High}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Needs monitoring
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Moderate
            </p>
            <p className="text-xl font-semibold text-blue-500 text-financial">
              {alertStats.bySeverity.Moderate}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Informational
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Low Priority
            </p>
            <p className="text-xl font-semibold text-green-500 text-financial">
              {alertStats.bySeverity.Low}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              System updates
            </p>
          </div>
          <div className="panel p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Total Alerts
            </p>
            <p className="text-xl font-semibold text-foreground text-financial">
              {alertStats.total}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              All time
            </p>
          </div>
      </div>
    </div>
  );
}