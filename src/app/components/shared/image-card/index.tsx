import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';

type TImageCard = {
  src: string;
  alt: string;
  showSkeleton?: boolean;
};

export function ImageCard({ src, alt, showSkeleton = true }: TImageCard) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setIsLoaded(false);

    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setIsLoaded(true);

  return (
    <div className="relative overflow-hidden w-full h-full">
      {!isLoaded && showSkeleton && (
        <Skeleton className="h-full w-full flex items-center justify-center">
          <span className="sr-only">Carregando imagem...</span>
          <ImageIcon className="size-6 text-gray-700" />
        </Skeleton>
      )}

      <figure className="relative w-full h-full">
        <img
          ref={imgRef}
          className={cn(
            'transition-opacity duration-300 size-full rounded-t-[inherit] object-cover',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      </figure>
    </div>
  );
}
