export interface User {
  id: string;
  authId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  organizationId: string;
  organizationName?: string;
}

export interface UserProfileDTO {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  organization_id: string;
  organizations?: {
    name: string;
  } | null;
}
