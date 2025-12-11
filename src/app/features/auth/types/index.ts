import type {
  Session as SupabaseSession,
  User as SupabaseUser
} from '@supabase/supabase-js';
import type { User } from '../../users/types';

export type Session = SupabaseSession;
export type AuthUser = SupabaseUser;

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  companyName: string;
  document?: string;
  slug?: string;
  fullName: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  session: Session | null;
  authUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CreateUserMetadataDTO {
  full_name: string;
  company_name: string;
  company_document: string | null;
  company_slug: string;
  avatar_url?: string;
}
