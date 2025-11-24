import { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Label } from '@/app/components/ui/label';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductFormData } from '../../../product-form/schema';
import { ImageCard } from '@/app/components/shared/image-card';
import type { IProductImage } from '@/app/features/products/types/models';
import { createCloudinaryThumbnail } from '@/app/services/image-upload/utils';

interface ImagesModalProps {
  variantIndex: number;
}

export function ImagesModal({ variantIndex }: ImagesModalProps) {
  const { getValues, setValue } = useFormContext<ProductFormData>();
  const allImages = getValues('allImages');
  const productName = getValues('name');
  const currentVariant = getValues(`variants.${variantIndex}`);
  const [selectedImages, setSelectedImages] = useState<IProductImage[]>([]);
  const [enableReplication, setEnableReplication] = useState(false);
  const [replicationOption, setReplicationOption] = useState<string>('');

  const availableImages = useMemo(() => {
    const currentImageIds = new Set(
      currentVariant?.images?.map((img) => img.id) || []
    );

    return allImages?.filter((img) => !currentImageIds.has(img.id)) || [];
  }, [allImages, currentVariant?.images]);

  const handleToggleImage = (image: IProductImage) => {
    setSelectedImages((prev) => {
      const isSelected = prev.some((img) => img.id === image.id);

      if (isSelected) {
        return prev.filter((img) => img.id !== image.id);
      } else {
        return [...prev, image];
      }
    });
  };

  const replicationOptions = useMemo(() => {
    return (
      currentVariant?.options?.map((opt) => ({
        id: `${opt.name}:${opt.value}`,
        label: `Todas as variações com ${opt.name}: "${opt.value}"`
      })) || []
    );
  }, [currentVariant]);

  const handleConfirm = () => {
    const selectedImageIds = selectedImages.map((image) => image.id);

    if (!enableReplication) {
      const existingImages = currentVariant?.images || [];
      const existingImageIds = new Set(existingImages.map((img) => img.id));
      const newImagesToAdd = selectedImageIds
        .filter((id) => !existingImageIds.has(id))
        .map((id, index) => ({
          id: id,
          isPrimary: index === 0 && existingImages.length === 0
        }));

      const finalImages = [...existingImages, ...newImagesToAdd];

      setValue(`variants.${variantIndex}.images`, finalImages);
    } else {
      const allVariants = getValues('variants');
      const [attrName, attrValue] = replicationOption.split(':');

      allVariants?.forEach((variant, index) => {
        const matchesRule = variant.options.some(
          (opt) => opt.name === attrName && opt.value === attrValue
        );

        if (matchesRule) {
          const varHasImages = variant.images || [];
          const varExistingIds = new Set(varHasImages.map((img) => img.id));
          const newImagesForThisVariant = selectedImageIds
            .filter((id) => !varExistingIds.has(id))
            .map((id, idx) => ({
              id: id,
              isPrimary: idx === 0 && varHasImages.length === 0
            }));

          const varImages = [...varHasImages, ...newImagesForThisVariant];

          setValue(`variants.${index}.images`, varImages);
        }
      });
    }
  };

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          Associar Novas Imagens para {`${productName} `}
          <span className="text-primary">
            {currentVariant?.options?.map((opt) => opt.value).join(' / ')}
          </span>
        </DialogTitle>
        <DialogDescription>
          Selecione uma ou mais imagens da sua galeria para adicionar a esta
          variante.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid max-h-96 grid-cols-3 gap-4 overflow-y-auto rounded-md border p-4 md:grid-cols-5">
          {availableImages.map((image) => {
            const isSelected = selectedImages.some(
              (img) => img.id === image.id
            );

            return (
              <div
                key={image.id}
                onClick={() => handleToggleImage(image)}
                className={cn(
                  'relative aspect-square cursor-pointer overflow-hidden rounded-md border-2',
                  isSelected ? 'border-primary' : 'border-transparent'
                )}
              >
                {image.publicId && (
                  <ImageCard
                    src={createCloudinaryThumbnail(image.publicId, {
                      height: 150,
                      width: 150,
                      quality: 75
                    })}
                    alt={image.name}
                  />
                )}

                {image.src.startsWith('blob') && (
                  <ImageCard src={image.src} alt={image.name} />
                )}

                {isSelected && (
                  <div className="absolute inset-0 bg-black/50 p-1.5 text-white">
                    <Check className="absolute left-1.5 top-1.5 h-5 w-5 rounded-full bg-primary p-0.5" />
                  </div>
                )}
              </div>
            );
          })}
          {availableImages.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
              Todas as imagens já foram associadas a esta variante.
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-md border p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="replicate-check"
              checked={enableReplication}
              onCheckedChange={(checked) =>
                setEnableReplication(Boolean(checked))
              }
              disabled={selectedImages.length === 0}
            />
            <Label
              htmlFor="replicate-check"
              className={cn(
                'font-medium',
                selectedImages.length === 0 && 'text-muted-foreground'
              )}
            >
              Replicar esta seleção ({selectedImages.length}{' '}
              {selectedImages.length === 1 ? 'imagem' : 'imagens'}) para:
            </Label>
          </div>

          {enableReplication && (
            <RadioGroup
              value={replicationOption}
              onValueChange={setReplicationOption}
              className="pl-6"
            >
              {replicationOptions.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.id} id={opt.id} />
                  <Label htmlFor={opt.id}>{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            onClick={handleConfirm}
            disabled={selectedImages.length === 0}
          >
            Confirmar Seleção
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
