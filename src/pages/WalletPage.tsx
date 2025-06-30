
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WalletPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Balance</CardTitle>
              <CardDescription>Your current account balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-4">₦250.00</div>
                <div className="text-sm text-gray-500">Available for VPN usage</div>
              </div>
            </CardContent>
          </Card>

          {/* Top Up */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Funds
              </CardTitle>
              <CardDescription>Top up your wallet with Naira</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">₦100</Button>
                <Button variant="outline" size="sm">₦500</Button>
                <Button variant="outline" size="sm">₦1000</Button>
              </div>
              <Input placeholder="Custom amount" />
              <Button className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Paystack
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent wallet transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              No transactions yet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;
