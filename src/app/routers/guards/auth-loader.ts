import { redirect, type LoaderFunctionArgs } from 'react-router';
import { supabase } from '@/app/config/supabase';

async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export async function protectedLoader({ request }: LoaderFunctionArgs) {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const search = url.search;
    const redirectTo = pathname + search;

    return redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return null;
}

export async function publicLoader() {
  const isAuth = await isAuthenticated();

  if (isAuth) {
    return redirect('/');
  }

  return null;
}
