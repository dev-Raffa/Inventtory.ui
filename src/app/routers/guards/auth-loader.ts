import { redirect } from 'react-router';
import { AuthService } from '@/app/features/auth/services';

export async function protectedLoader() {
  const isAuthenticated = await AuthService.isAuthenticated();

  if (!isAuthenticated) {
    return redirect('/auth/login');
  }

  return null;
}

export async function publicLoader() {
  const isAuthenticated = await AuthService.isAuthenticated();

  if (isAuthenticated) {
    return redirect('/');
  }

  return null;
}
