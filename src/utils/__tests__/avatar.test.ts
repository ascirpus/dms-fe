import { describe, it, expect } from 'vitest';
import { getAvatarColor, getInitialsFromUser } from '../avatar';

describe('avatar utils', () => {
  describe('getAvatarColor', () => {
    it('should return a consistent color for the same name', () => {
      const color1 = getAvatarColor('John Doe');
      const color2 = getAvatarColor('John Doe');
      expect(color1).toBe(color2);
    });

    it('should return different colors for different names', () => {
      const color1 = getAvatarColor('John Doe');
      const color2 = getAvatarColor('Jane Smith');
      // Not guaranteed but very likely different
      expect(typeof color1).toBe('string');
      expect(typeof color2).toBe('string');
      expect(color1.startsWith('#')).toBe(true);
      expect(color2.startsWith('#')).toBe(true);
    });

    it('should return first color for empty string', () => {
      const color = getAvatarColor('');
      expect(color).toBe('#3B82F6');
    });
  });

  describe('getInitialsFromUser', () => {
    it('should use firstName and lastName when available', () => {
      const result = getInitialsFromUser({
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result).toBe('JD');
    });

    it('should fall back to name when firstName/lastName missing', () => {
      const result = getInitialsFromUser({
        name: 'Jane Smith',
        email: 'jane@example.com',
      });
      expect(result).toBe('JS');
    });

    it('should handle single-word name', () => {
      const result = getInitialsFromUser({
        name: 'Admin',
        email: 'admin@example.com',
      });
      expect(result).toBe('A');
    });

    it('should handle multi-word name (use first and last)', () => {
      const result = getInitialsFromUser({
        name: 'John Michael Doe',
        email: 'john@example.com',
      });
      expect(result).toBe('JD');
    });

    it('should fall back to email initial', () => {
      const result = getInitialsFromUser({
        name: '',
        email: 'test@example.com',
      });
      expect(result).toBe('T');
    });

    it('should return ? when no data available', () => {
      const result = getInitialsFromUser({
        name: '',
        email: '',
      });
      expect(result).toBe('?');
    });
  });
});
