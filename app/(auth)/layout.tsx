import React, { ReactNode } from 'react';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/80 transition-colors"
            >
              <BarChart3 className="h-6 w-6" />
              <span>Bidding Insights</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/50 backdrop-blur-sm border-t">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Bidding Insights. All rights reserved.</p>
            <p className="mt-1">
              Secure government procurement transparency platform for Namibia
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;