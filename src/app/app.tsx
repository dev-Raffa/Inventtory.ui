import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouters } from './routers/router';
import { queryClient } from './config/react-query';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouters />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
