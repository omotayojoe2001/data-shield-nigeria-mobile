
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Wallet, Settings, LogOut } from 'lucide-react';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">GoodDeeds VPN</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* VPN Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-500" />
                VPN Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">Disconnected</div>
                <Button className="w-full">Connect</Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-500" />
                Data Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Used: 150MB</span>
                  <span>Saved: 45MB</span>
                </div>
                <Progress value={30} className="h-2" />
                <div className="text-xs text-gray-500">500MB remaining</div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-green-500" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">₦250.00</div>
                <Button variant="outline" size="sm" onClick={() => navigate('/wallet')}>
                  Top Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              variant="outline" 
              className="h-16 justify-start"
              onClick={() => navigate('/plans')}
            >
              <Zap className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">View Plans</div>
                <div className="text-sm text-gray-500">Upgrade or change your plan</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 justify-start"
              onClick={() => navigate('/wallet')}
            >
              <Wallet className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Add Funds</div>
                <div className="text-sm text-gray-500">Top up your wallet</div>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
