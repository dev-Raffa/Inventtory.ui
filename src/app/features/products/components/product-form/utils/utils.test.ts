import { describe, it, expect } from 'vitest';
import { generateVariants, parseValues } from '.';
import type { IProductAttribute, IProductVariant } from '../../../types';

const mockAttributes: IProductAttribute[] = [
  {
    name: 'Cor',
    values: 'Azul, Preto'
  },
  {
    name: 'Tamanho',
    values: 'P, M'
  }
];

const skuBase = 'CAM-BASICA';
const minimumStock = 10;

describe('generateVariants', () => {
  it('deve gerar o número correto de variantes (produto cartesiano)', () => {
    const variants = generateVariants({
      attributes: mockAttributes,
      skuBase,
      minimumStock,
      existingVariants: []
    });

    expect(variants.length).toBe(4);
  });

  it('deve gerar os SKUs e opções corretos para cada variante', () => {
    const variants = generateVariants({
      attributes: mockAttributes,
      skuBase,
      minimumStock,
      existingVariants: []
    });

    expect(variants[0].sku).toBe('CAM-BASICA-AZ-P');
    expect(variants[0].options).toEqual([
      { name: 'Cor', value: 'Azul' },
      { name: 'Tamanho', value: 'P' }
    ]);

    expect(variants[0].minimumStock).toBe(10);

    expect(variants[3].sku).toBe('CAM-BASICA-PR-M');
    expect(variants[3].options).toEqual([
      { name: 'Cor', value: 'Preto' },
      { name: 'Tamanho', value: 'M' }
    ]);
  });

  it('deve retornar um array vazio se não houver atributos', () => {
    const variants = generateVariants({
      attributes: [],
      skuBase,
      minimumStock,
      existingVariants: []
    });

    expect(variants.length).toBe(0);
  });

  it('deve retornar um array vazio se um atributo não tiver opções', () => {
    const variants = generateVariants({
      attributes: [
        { name: 'Cor', values: 'Azul' },
        { name: 'Tamanho', values: '' }
      ],
      skuBase,
      minimumStock,
      existingVariants: []
    });

    expect(variants.length).toBe(0);
  });

  it('deve preservar dados de variantes existentes que correspondem às novas opções', () => {
    const existingVariants: IProductVariant[] = [
      {
        id: 'v1',
        sku: 'SKU-ANTIGO-AZU-P',
        stock: 50,
        minimumStock: 5,
        options: [
          { name: 'Cor', value: 'Azul' },
          { name: 'Tamanho', value: 'P' }
        ],
        images: [{ id: 'img1', isPrimary: true }]
      }
    ];

    const variants = generateVariants({
      attributes: mockAttributes,
      skuBase,
      minimumStock,
      existingVariants
    });

    expect(variants.length).toBe(4);

    const preservedVariant = variants.find(
      (v) => v.options[0].value === 'Azul' && v.options[1].value === 'P'
    );

    expect(preservedVariant).toBeDefined();
    expect(preservedVariant?.id).toBe('v1');
    expect(preservedVariant?.sku).toBe('SKU-ANTIGO-AZU-P');
    expect(preservedVariant?.stock).toBe(50);
    expect(preservedVariant?.minimumStock).toBe(5);
    expect(preservedVariant?.images?.length).toBe(1);

    const newVariant = variants.find(
      (v) => v.options[0].value === 'Preto' && v.options[1].value === 'M'
    );

    expect(newVariant).toBeDefined();
    expect(newVariant?.id).toBeUndefined();
    expect(newVariant?.sku).toBe('CAM-BASICA-PR-M');
    expect(newVariant?.stock).toBeUndefined();
    expect(newVariant?.minimumStock).toBe(10);
    expect(newVariant?.images).toEqual([]);
  });

  it('deve descartar variantes existentes que não correspondem mais aos atributos', () => {
    const existingVariants: IProductVariant[] = [
      {
        id: 'v1',
        sku: 'SKU-ANTIGO-VERDE-G',
        stock: 50,
        minimumStock: 5,
        options: [
          { name: 'Cor', value: 'Verde' },
          { name: 'Tamanho', value: 'G' }
        ],
        images: []
      }
    ];

    const variants = generateVariants({
      attributes: mockAttributes,
      skuBase,
      minimumStock,
      existingVariants
    });

    expect(variants.length).toBe(4);
    const oldVariant = variants.find((v) => v.id === 'v1');
    expect(oldVariant).toBeUndefined();
  });
});

describe('parseValues', () => {
  it('must process and clean a string of values correctly', () => {
    const input = ' Azul, Preto ,Verde ';
    const expected = ['Azul', 'Preto', 'Verde'];

    expect(parseValues(input)).toEqual(expected);
  });

  it('should return an empty array if the input is undefined, or an empty string', () => {
    expect(parseValues(undefined)).toEqual([]);
    expect(parseValues('')).toEqual([]);
  });

  it('should return an empty array if the input is not a string', () => {
    expect(parseValues(123 as any)).toEqual([]);
    expect(parseValues(null as any)).toEqual([]);
    expect(parseValues({} as any)).toEqual([]);
  });

  it('should filter out empty values resulting from the split', () => {
    const input = 'Azul,,Preto, ,Verde';
    const expected = ['Azul', 'Preto', 'Verde'];

    expect(parseValues(input)).toEqual(expected);
  });
});
