
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const WebApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">
              GoodDeeds Data VPN
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This is a React Native/Expo app designed for mobile platforms.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                How to run this app:
              </h2>
              <div className="text-left space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p>• <strong>Mobile (Recommended):</strong> Use Expo Go app</p>
                <p>• <strong>Development:</strong> Run with Expo CLI</p>
                <p>• <strong>Production:</strong> Build with EAS Build</p>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default WebApp;
