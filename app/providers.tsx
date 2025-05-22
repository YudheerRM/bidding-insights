"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Fix hydration mismatch by preventing rendering until mounted
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange
        // Set suppressHydrationWarning to avoid hydration issues
        enableColorScheme
      >
        {/* Render children only on client-side to avoid hydration mismatch */}
        {mounted ? children : (
          <div style={{ visibility: 'hidden' }}>
            {children}
          </div>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
