import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouters } from './routers';
import { queryClient } from './config/react-query';
import { AuthProvider } from './features/auth/hooks/use-auth';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouters />
      </AuthProvider>
      <ReactQueryDevtools />
      <Toaster />
    </QueryClientProvider>
  );
}
