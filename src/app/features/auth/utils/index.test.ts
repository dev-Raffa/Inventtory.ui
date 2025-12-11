import { describe, it, expect } from 'vitest';
import { generateSlug } from './index';

describe('Auth Utils', () => {
  describe('generateSlug', () => {
    it('should convert text to lowercase and replace spaces with hyphens', () => {
      expect(generateSlug('Minha Empresa')).toBe('minha-empresa');
      expect(generateSlug('HELLO WORLD')).toBe('hello-world');
    });

    it('should normalize accents and diacritics', () => {
      expect(generateSlug('Ação e Reação')).toBe('acao-e-reacao');
      expect(generateSlug('Crachá Eletrônico')).toBe('cracha-eletronico');
      expect(generateSlug('Árvore de Maçã')).toBe('arvore-de-maca');
    });

    it('should remove special characters other than hyphens', () => {
      expect(generateSlug('Empresa @ 100% Legal!')).toBe('empresa-100-legal');
      expect(generateSlug('Dev & Design')).toBe('dev-design');
      expect(generateSlug('User#123')).toBe('user-123');
    });

    it('should collapse multiple spaces or hyphens into a single hyphen', () => {
      expect(generateSlug('Nome   com    espaços')).toBe('nome-com-espacos');
      expect(generateSlug('Nome--com--hifens')).toBe('nome-com-hifens');
      expect(generateSlug('Mistura - de -- tudo')).toBe('mistura-de-tudo');
    });

    it('should trim leading and trailing hyphens/spaces', () => {
      expect(generateSlug('  teste  ')).toBe('teste');
      expect(generateSlug('-teste-')).toBe('teste');
      expect(generateSlug(' - teste - ')).toBe('teste');
    });

    it('should handle empty strings', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle mixed inputs robustly', () => {
      const input = '  SUPER Oferta: 50% de Desconto (Só Hoje!)  ';
      const expected = 'super-oferta-50-de-desconto-so-hoje';
      expect(generateSlug(input)).toBe(expected);
    });
  });
});
