import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { protectedLoader, publicLoader } from './auth-loader';
import type { LoaderFunctionArgs } from 'react-router';

const mockGetSession = vi.fn();

vi.mock('@/app/config/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: any[]) => mockGetSession(...args)
    }
  }
}));

function createRequest(url: string): Request {
  return new Request(url);
}

describe('Auth Guards (Loaders)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('protectedLoader (Require Auth)', () => {
    it('should allow access (return null) when user is authenticated', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: '1' } } }
      });

      const request = createRequest('http://localhost:3000/app/dashboard');
      const response = await protectedLoader({
        request,
        params: {},
        context: {}
      } as LoaderFunctionArgs);

      expect(response).toBeNull();
      expect(mockGetSession).toHaveBeenCalledTimes(1);
    });

    it('should redirect to login with "redirectTo" param when user is NOT authenticated', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null }
      });

      const targetUrl = 'http://localhost:3000/app/products/123?filter=active';
      const request = createRequest(targetUrl);
      const response = await protectedLoader({
        request,
        params: {},
        context: {}
      } as LoaderFunctionArgs);

      expect(response).toBeInstanceOf(Response);

      const redirectUrl = (response as Response).headers.get('Location');
      const expectedRedirectPath = `/app/products/123?filter=active`;

      expect(redirectUrl).toBe(
        `/auth/login?redirectTo=${encodeURIComponent(expectedRedirectPath)}`
      );
    });
  });

  describe('publicLoader (Require Guest)', () => {
    it('should allow access (return null) when user is NOT authenticated', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null }
      });

      const response = await publicLoader();

      expect(response).toBeNull();
    });

    it('should redirect to home when user IS authenticated', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: '1' } } }
      });

      const response = await publicLoader();

      expect(response).toBeInstanceOf(Response);

      const redirectUrl = (response as Response).headers.get('Location');

      expect(redirectUrl).toBe('/');
    });
  });
});
