import type { CreateUserMetadataDTO, SignUpPayload } from '../types';
import { generateSlug } from '../utils';

export function toSupabaseMetadata(
  payload: SignUpPayload
): CreateUserMetadataDTO {
  return {
    full_name: payload.fullName,
    company_name: payload.companyName,
    company_document: payload.document || null,
    company_slug: payload.slug || generateSlug(payload.companyName),
    avatar_url: ''
  };
}
