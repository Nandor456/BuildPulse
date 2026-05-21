import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './providers/AuthProvider.tsx'
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient.ts';
import { MessagingSocketProvider } from './providers/MessagingSocketProvider.tsx';
import { TooltipProvider } from './components/ui/tooltip.tsx';
import { ThemeProvider } from './providers/ThemeProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <MessagingSocketProvider>
              <App />
            </MessagingSocketProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </StrictMode>
  </QueryClientProvider>
)
