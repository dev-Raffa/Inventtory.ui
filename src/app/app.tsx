import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouters } from './routers/router';
import { queryClient } from './config/react-query';
import { supabase } from './config/supabase';

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const loginDeTeste = async () => {
      await supabase.auth.signInWithPassword({
        email: import.meta.env.VITE_SUPABASE_USER_EMAIL,
        password: import.meta.env.VITE_SUPABASE_USER_PASSWORD
      });

      setIsAuthReady(true);
    };

    loginDeTeste();
  }, []);

  if (!isAuthReady) {
    return;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouters />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
