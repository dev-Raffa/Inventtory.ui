import type { Category, CategoryDTO } from '../types';

export const CategoryMapper = {
  toDomain(dto: CategoryDTO): Category {
    return {
      id: dto.id,
      name: dto.name
    };
  }
};
