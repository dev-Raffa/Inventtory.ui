import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Dialog, DialogTrigger } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { ImagePlus, Star, X } from 'lucide-react';
import type { ProductFormData } from '../../../product-form/schema';
import { ImageCard } from '@/app/components/shared/image-card';
import { ImagesModal } from './images-modal';
import { createCloudinaryThumbnail } from '@/app/services/image-upload/utils';

interface VariantImageModalProps {
  variantIndex: number;
}

export function ProductFormFieldVariantImages({
  variantIndex
}: VariantImageModalProps) {
  const { getValues, setValue } = useFormContext<ProductFormData>();
  const allImages = getValues('allImages');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentVariantImages =
    getValues(`variants.${variantIndex}.images`) || [];

  const handleSetPrimaryCard = (imageId: string) => {
    const newImages = currentVariantImages.map((img) => ({
      ...img,
      isPrimary: img.id === imageId
    }));

    newImages.sort((a, b) => {
      if (a.isPrimary === true) return -1;
      if (b.isPrimary === true) return 1;
      return 0;
    });

    setValue(`variants.${variantIndex}.images`, newImages);
  };

  const handleRemoveImage = (imageId: string) => {
    const currentImages = getValues(`variants.${variantIndex}.images`) || [];
    const newImages = currentImages.filter((img) => img.id !== imageId);
    const wasPrimary = currentImages.find(
      (img) => img.id === imageId
    )?.isPrimary;

    if (wasPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }

    setValue(`variants.${variantIndex}.images`, newImages);
  };

  return (
    <>
      {currentVariantImages?.map((image, index) => {
        const fullImageFile = allImages?.find((img) => img.id === image.id);
        return (
          <div
            key={`${index}-${image.id}`}
            className="group relative w-12 h-12 rounded-md overflow-clip"
          >
            {fullImageFile?.publicId && (
              <ImageCard
                src={createCloudinaryThumbnail(fullImageFile.publicId, {
                  height: 150,
                  width: 150,
                  quality: 75
                })}
                alt={fullImageFile.name}
                showSkeleton={false}
              />
            )}

            {fullImageFile?.src.startsWith('blob') && (
              <ImageCard
                src={fullImageFile.src}
                alt={fullImageFile.name}
                showSkeleton={false}
              />
            )}
            {image.isPrimary && (
              <div className="absolute top-0 right-0 p-0.5 bg-black/50 rounded-bl-md">
                <Star className="size-3 text-yellow-400 fill-yellow-400" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-0.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              {!image.isPrimary && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-5 text-white hover:text-yellow-400"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSetPrimaryCard(image.id);
                  }}
                  aria-label="Definir como principal"
                >
                  <Star className="size-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5 text-white hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveImage(image.id);
                }}
                aria-label="Remover imagem"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="w-12 h-12">
            <ImagePlus className="size-5" />
          </Button>
        </DialogTrigger>
        {isModalOpen && <ImagesModal variantIndex={variantIndex} />}
      </Dialog>
    </>
  );
}
