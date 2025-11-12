import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/app/components/ui/carousel';
import type { IProductImage } from '../../types';
import { createCloudinaryThumbnail } from '@/app/services/image-upload/utils';

export function ProductImageCarousel({ images }: { images?: IProductImage[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    api?.scrollTo(index);
  };

  return images ? (
    <div className="w-full h-full max-w-4xl mx-auto space-y-4">
      <div className="relative h-10/12 rounded-lg overflow-hidden">
        <Carousel setApi={setApi} className="h-full w-full">
          <CarouselContent className="h-full">
            {images.map((image, index) => (
              <CarouselItem className="h-full" key={index}>
                <div className="h-full bg-muted rounded-lg overflow-hidden">
                  {image.publicId && !image.publicId.startsWith('mock') ? (
                    <img
                      src={createCloudinaryThumbnail(image.publicId, {
                        height: 900,
                        width: 900,
                        quality: 80
                      })}
                      alt={image.name}
                    />
                  ) : (
                    image.src && <img src={image.src} alt={image.name} />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            type="button"
            className="left-4 bg-primary/80 hover:bg-primary text-primary-foreground"
          ></CarouselPrevious>
          <CarouselNext
            type="button"
            className="right-4 bg-primary/80 hover:bg-primary text-primary-foreground"
          />
        </Carousel>

        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
          {current} / {count}
        </div>
      </div>

      <div className="flex justify-center gap-3 flex-wrap px-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={(e) => handleThumbnailClick(e, index)}
            className={`relative w-16 h-12 rounded-md overflow-hidden transition-all duration-300 flex-shrink-0 border-2 ${
              index === current - 1
                ? 'border-primary shadow-lg scale-105'
                : 'border-transparent hover:border-muted-foreground'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current - 1}
          >
            {image.publicId && !image.publicId.startsWith('mock') ? (
              <img
                src={createCloudinaryThumbnail(image.publicId, {
                  height: 150,
                  width: 150,
                  quality: 75
                })}
                alt={image.name}
              />
            ) : (
              image.src && <img src={image.src} alt={image.name} />
            )}

            {index !== current - 1 && (
              <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors duration-200" />
            )}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <div className="w-full max-w-4xl mx-auto space-y-4"></div>
  );
}
