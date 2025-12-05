import { useState } from 'react';
import {
  useCategoriesQuery,
  useCreateCategoryMutation
} from '@/app/features/category/hooks/use-query';
import type { Category } from '@/app/features/category/types';

interface UseCategoryFieldProps {
  onSelect: (category: Category) => void;
}

export function useCategoryField({ onSelect }: UseCategoryFieldProps) {
  const { data: categories = [] } = useCategoriesQuery();
  const { mutateAsync: createCategoryMutate } = useCreateCategoryMutation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exactMatch = categories.some(
    (cat) => cat.name.toLowerCase() === searchQuery.toLowerCase()
  );

  const showCreateOption = searchQuery.trim().length > 0 && !exactMatch;

  const handleCreateCategory = async () => {
    if (!searchQuery.trim()) return;

    setIsCreating(true);

    try {
      const newCategory = await createCategoryMutate(searchQuery);

      onSelect(newCategory);

      setOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    filteredCategories,
    showCreateOption,
    isCreating,
    handleCreateCategory
  };
}
