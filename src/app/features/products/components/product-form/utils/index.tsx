import type { IProductVariant, VariantOption } from '../../../types';

type TGenerateVariants = {
  skuBase: string;
  attributes: { name: string; values: string }[];
  minimumStock?: number;
  existingVariants?: IProductVariant[];
};

const getCombinationKey = (options: VariantOption[]): string => {
  return [...options]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((opt) => `${opt.name}:${opt.value}`)
    .join('|');
};

export const generateVariants = ({
  skuBase,
  attributes,
  minimumStock = 0,
  existingVariants = []
}: TGenerateVariants): IProductVariant[] => {
  if (!attributes || attributes.length === 0) return [];

  let combinations: VariantOption[][] = [[]];

  for (const attribute of attributes) {
    const values = attribute.values
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (values.length === 0) continue;

    const newCombinations: VariantOption[][] = [];

    for (const combo of combinations) {
      for (const value of values) {
        newCombinations.push([...combo, { name: attribute.name, value }]);
      }
    }
    combinations = newCombinations;
  }

  if (
    combinations.length === 1 &&
    combinations[0].length === 0 &&
    attributes.some((attr) => attr.values.trim().length > 0)
  ) {
    return [];
  }

  const existingKeys = new Set<string>(
    existingVariants.map((variant) => getCombinationKey(variant.options))
  );

  const newCombinations = combinations.filter((combo) => {
    const key = getCombinationKey(combo);
    return !existingKeys.has(key);
  });

  const newVariants = newCombinations.map((options) => ({
    sku:
      skuBase +
      '-' +
      options.map((opt) => opt.value?.slice(0, 2).toUpperCase()).join('-'),
    minimumStock: minimumStock,
    options: options,
    images: []
  }));

  return [...existingVariants, ...newVariants];
};

export const parseValues = (valueString: string | undefined): string[] => {
  if (!valueString) return [];

  if (typeof valueString !== 'string') return [];

  return valueString
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
};
