
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlansPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Basic',
      price: '₦50',
      period: 'month',
      data: '1GB',
      features: ['Data compression', 'Basic security', 'Email support']
    },
    {
      name: 'Pro',
      price: '₦100',
      period: 'month',
      data: '5GB',
      features: ['Data compression', 'Advanced security', 'Priority support', 'Multiple devices']
    },
    {
      name: 'Pay-as-you-go',
      price: '₦0.20',
      period: 'MB',
      data: 'Unlimited',
      features: ['Data compression', 'Basic security', 'No monthly commitment']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Secure, fast, and affordable VPN with data saving
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={index === 1 ? 'border-blue-500 relative' : ''}>
              {index === 1 && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-600">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-500">/{plan.period}</span>
                </div>
                <CardDescription>{plan.data} data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Choose Plan</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
