import { describe, it, expect } from 'vitest';
import { getUserNameInitials } from './index';

describe('User Utils', () => {
  describe('getUserNameInitials', () => {
    it('should return initials for a standard first and last name', () => {
      const result = getUserNameInitials('John Doe');
      expect(result).toBe('JD');
    });

    it('should return a single initial for a single name', () => {
      const result = getUserNameInitials('Inventto');
      expect(result).toBe('I');
    });

    it('should use only the first two names if more are provided', () => {
      const result = getUserNameInitials('John Doe Smith');
      expect(result).toBe('JD');
    });

    it('should convert lowercase names to uppercase initials', () => {
      const result = getUserNameInitials('john doe');
      expect(result).toBe('JD');
    });

    it('should return fallback US for an empty string', () => {
      const result = getUserNameInitials('');
      expect(result).toBe('US');
    });

    it('should return fallback US for a string containing only spaces', () => {
      const result = getUserNameInitials('   ');
      expect(result).toBe('US');
    });
  });
});
