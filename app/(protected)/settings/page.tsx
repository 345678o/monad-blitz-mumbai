'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Wallet, Bell, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [email, setEmail] = useState(user?.email || 'user@example.com')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [walletConnected, setWalletConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateEmail = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      toast.success('Email updated successfully')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConnectWallet = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      setWalletConnected(true)
      toast.success('Wallet connected successfully')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnectWallet = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setWalletConnected(false)
      toast.success('Wallet disconnected')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#111827] to-[#0B0F1A] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account, notifications, and wallet</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#111827] border border-[#1F2937] mb-8">
            <TabsTrigger value="account" className="text-white">Account</TabsTrigger>
            <TabsTrigger value="notifications" className="text-white">Notifications</TabsTrigger>
            <TabsTrigger value="wallet" className="text-white">Wallet</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-gradient-to-br from-[#111827] to-[#0D1116] border-[#1F2937] border backdrop-blur-xl">
              <div className="p-6 sm:p-8 space-y-8">
                {/* Email Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-400" />
                    Email Address
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-[#0D1116] border-[#1F2937] text-white placeholder-gray-500"
                    />
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={isSaving}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium"
                    >
                      {isSaving ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t border-[#1F2937] pt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full bg-[#0D1116] border-[#1F2937] text-white placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 8 chars)"
                        className="w-full bg-[#0D1116] border-[#1F2937] text-white placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="w-full bg-[#0D1116] border-[#1F2937] text-white placeholder-gray-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
                    >
                      {isSaving ? 'Updating...' : 'Change Password'}
                    </Button>
                  </form>
                </div>

                {/* Logout Section */}
                <div className="border-t border-[#1F2937] pt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Session</h3>
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-medium"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gradient-to-br from-[#111827] to-[#0D1116] border-[#1F2937] border backdrop-blur-xl">
              <div className="p-6 sm:p-8 space-y-8">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Notification Preferences
                </h3>

                {/* Email Notifications */}
                <div className="flex items-center justify-between pb-6 border-b border-[#1F2937]">
                  <div>
                    <h4 className="text-base font-medium text-white mb-1">Email Notifications</h4>
                    <p className="text-sm text-gray-400">Receive alerts about health factor changes</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-white mb-1">Push Notifications</h4>
                    <p className="text-sm text-gray-400">Get real-time alerts on your device</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Button
                  onClick={() => {
                    toast.success('Notification preferences saved')
                  }}
                  className="w-full mt-8 bg-green-500 hover:bg-green-600 text-white font-medium"
                >
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="bg-gradient-to-br from-[#111827] to-[#0D1116] border-[#1F2937] border backdrop-blur-xl">
              <div className="p-6 sm:p-8 space-y-8">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  Wallet Management
                </h3>

                {walletConnected ? (
                  <>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="flex h-2 w-2 items-center justify-center rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-400">Wallet Connected</h4>
                          <p className="text-sm text-green-300/80 mt-1">0x742d35Cc6634C0532925a3b844Bc9e7595f42e1e</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleDisconnectWallet}
                      disabled={isSaving}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-medium"
                    >
                      {isSaving ? 'Disconnecting...' : 'Disconnect Wallet'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-300">No wallet connected. Connect your wallet to use DeFi features.</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleConnectWallet}
                      disabled={isSaving}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                    >
                      {isSaving ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                  </>
                )}

                {/* Supported Networks */}
                <div className="border-t border-[#1F2937] pt-8">
                  <h4 className="font-medium text-white mb-4">Supported Networks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Ethereum</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Polygon</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Arbitrum</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Monad</span>
                      <span className="text-green-400">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
