import { describe, it, expect } from 'vitest';
import { toSupabaseMetadata } from './mappers';
import type { SignUpPayload } from '../types';

describe('Auth Mappers', () => {
  describe('toSupabaseMetadata', () => {
    it('should correctly map SignUpPayload to CreateUserMetadataDTO', () => {
      const payload: SignUpPayload = {
        fullName: 'John Doe',
        companyName: 'Acme Corp',
        email: 'john@acme.com',
        password: 'securePassword123',
        document: '12345678900',
        slug: 'acme-corp'
      };

      const result = toSupabaseMetadata(payload);

      expect(result).toEqual({
        full_name: 'John Doe',
        company_name: 'Acme Corp',
        company_document: '12345678900',
        company_slug: 'acme-corp',
        avatar_url: ''
      });
    });

    it('should generate a slug if one is not provided', () => {
      const payload: SignUpPayload = {
        fullName: 'Jane Doe',
        companyName: 'Minha Empresa Legal',
        email: 'jane@company.com',
        password: 'password'
      };

      const result = toSupabaseMetadata(payload);

      expect(result.company_slug).toBe('minha-empresa-legal');
    });

    it('should handle null document correctly', () => {
      const payload: SignUpPayload = {
        fullName: 'User Without Doc',
        companyName: 'No Doc Inc',
        email: 'nodoc@inc.com',
        password: 'password'
      };

      const result = toSupabaseMetadata(payload);

      expect(result.company_document).toBeNull();
    });
  });
});
