'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, TrendingUp, Shield, Zap, BarChart3, Github, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '@/contexts/auth-context';

const healthData = [
  { time: '00:00', factor: 2.1 },
  { time: '04:00', factor: 2.3 },
  { time: '08:00', factor: 1.9 },
  { time: '12:00', factor: 2.2 },
  { time: '16:00', factor: 1.8 },
  { time: '20:00', factor: 2.0 },
  { time: '24:00', factor: 1.85 },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [healthFactor, setHealthFactor] = useState(1.85);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const getHealthColor = () => {
    if (healthFactor > 2) return 'from-green-500 to-emerald-600';
    if (healthFactor > 1.5) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getHealthStatus = () => {
    if (healthFactor > 2) return 'Healthy';
    if (healthFactor > 1.5) return 'At Risk';
    return 'Critical';
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 text-foreground overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-green-50/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-border bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">DeFi Health Monitor</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">How It Works</a>
            <a href="#tech-stack" className="text-sm text-muted-foreground hover:text-foreground transition">Tech Stack</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-green-600 bg-clip-text text-transparent leading-tight">
              Monitor. Predict. Protect.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Autonomous risk intelligence for decentralized lending.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Get Started
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                variant="outline"
                className="border-2 border-green-500/30 text-foreground hover:bg-green-50 px-8 py-6 rounded-xl font-semibold"
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </div>

          {/* Hero Background Grid */}
          <div className="relative mt-12 aspect-video rounded-2xl border-2 border-green-200 bg-gradient-to-b from-green-50 to-white p-1 overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-grid-green-500/[0.05] bg-[size:50px_50px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm font-medium">Real-time blockchain analytics</p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:via-green-500/5 group-hover:to-green-500/0 transition duration-500" />
          </div>
        </div>
      </section>

      {/* Live Risk Dashboard Preview */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Gauge & Stats */}
            <div className="space-y-6">
              <div>
                <p className="text-green-600 text-sm font-bold mb-2 uppercase tracking-wider">RISK ASSESSMENT</p>
                <h2 className="text-4xl font-bold text-foreground">Portfolio Health</h2>
              </div>

              <div className="relative w-64 h-64 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#ffffff10" strokeWidth="2" />
                  
                  {/* Gradient gauge background */}
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>

                  {/* Gauge arc */}
                  <path
                    d="M 30 170 A 70 70 0 0 1 170 170"
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />

                  {/* Needle */}
                  <g transform={`rotate(${-90 + (healthFactor / 3) * 180} 100 100)`}>
                    <line x1="100" y1="100" x2="100" y2="40" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="100" cy="100" r="4" fill="#22c55e" />
                  </g>
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{healthFactor.toFixed(2)}</div>
                    <div className={`text-sm font-semibold bg-gradient-to-r ${getHealthColor()} bg-clip-text text-transparent`}>
                      {getHealthStatus()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-green-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1 font-semibold">Total Collateral</p>
                  <p className="text-2xl font-bold text-foreground">$24,580</p>
                </div>
                <div className="bg-white border-2 border-blue-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1 font-semibold">Total Borrowed</p>
                  <p className="text-2xl font-bold text-foreground">$13,200</p>
                </div>
                <div className="bg-white border-2 border-orange-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1 font-semibold">Liquidation Price</p>
                  <p className="text-2xl font-bold text-foreground">$1,850</p>
                </div>
                <div className="bg-white border-2 border-yellow-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1 font-semibold">Risk Level</p>
                  <p className="text-2xl font-bold text-yellow-600">Moderate</p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-xl">
              <p className="text-foreground text-sm font-bold mb-4">Historical Risk Trend (24h)</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={healthData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="factor" 
                    stroke="#22c55e" 
                    dot={false} 
                    strokeWidth={3}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-600 text-sm font-bold mb-2 uppercase tracking-wider">KEY CAPABILITIES</p>
            <h2 className="text-4xl font-bold text-foreground">Intelligent Risk Protection</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: 'Historical Risk Tracking',
                desc: 'Monitor your portfolio risk trends with real-time analytics and historical data insights.',
              },
              {
                icon: Zap,
                title: 'AI-Powered Risk Summary',
                desc: 'Get actionable insights powered by advanced AI analyzing on-chain data and market conditions.',
              },
              {
                icon: Shield,
                title: 'Auto-Repay Protection Bot',
                desc: 'Automated protection that prevents liquidation by maintaining optimal health factors.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white border-2 border-green-100 rounded-2xl p-6 shadow-lg hover:border-green-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-600 text-sm font-bold mb-2 uppercase tracking-wider">SIMPLE PROCESS</p>
            <h2 className="text-4xl font-bold text-foreground">How It Works</h2>
          </div>

          <div className="space-y-6">
            {[
              { step: 1, title: 'Connect Wallet', desc: 'Link your crypto wallet securely to begin monitoring.' },
              { step: 2, title: 'Analyze On-Chain Positions', desc: 'Our system scans and analyzes your lending positions.' },
              { step: 3, title: 'Calculate Health Factor', desc: 'Real-time calculation of your portfolio health metrics.' },
              { step: 4, title: 'Receive Alerts & Smart Recommendations', desc: 'Get proactive notifications and optimization suggestions.' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-md">
                  {item.step}
                </div>
                <div className="pt-1 flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Risk Summary Preview */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-green-200 rounded-2xl p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">AI Risk Summary</h3>
                <p className="text-foreground leading-relaxed">
                  Your portfolio is <span className="text-yellow-600 font-bold">moderately risky</span>. A 12% ETH price drop may trigger liquidation. 
                  Consider repaying 15% of debt or increasing collateral by $3,200 to achieve a healthy state.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Push Notification Preview */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Floating card effect */}
            <div className="bg-white border-2 border-red-200 rounded-2xl p-6 w-80 ml-auto mr-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">Health Factor Alert</p>
                  <p className="text-xs text-muted-foreground mt-2">Health factor dropped to 1.18. Add collateral immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech-stack" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-600 text-sm font-bold mb-2 uppercase tracking-wider">BUILT WITH</p>
            <h2 className="text-4xl font-bold text-foreground">Technology Stack</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Next.js 14', desc: 'React framework for production' },
              { name: 'WalletConnect', desc: 'Secure wallet integration' },
              { name: 'Monad Testnet', desc: 'High-speed blockchain network' },
              { name: 'Smart Contracts', desc: 'Decentralized protocol logic' },
              { name: 'AI Risk Engine', desc: 'Machine learning predictions' },
              { name: 'Real-Time APIs', desc: 'Live on-chain data feeds' },
            ].map((tech, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-green-100 rounded-xl p-4 shadow-md hover:border-green-300 hover:shadow-lg transition-all text-center"
              >
                <p className="text-foreground font-bold text-sm mb-1">{tech.name}</p>
                <p className="text-muted-foreground text-xs">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t-2 border-green-200 py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-foreground font-bold">DeFi Health Monitor</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Twitter className="w-5 h-5" />
              </a>
              <Button 
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-md"
              >
                Get Started
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-green-200 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 DeFi Health Monitor. Protecting your digital assets.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
