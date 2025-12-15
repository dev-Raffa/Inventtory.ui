import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouters } from './routers';
import { Toaster } from './components/ui/sonner';
import { AppProviders } from './providers';

export default function App() {
  return (
    <AppProviders>
      <AppRouters />
      <ReactQueryDevtools />
      <Toaster />
    </AppProviders>
  );
}
