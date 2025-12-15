import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon, ImageOff } from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';

type TImageCard = {
  src: string;
  alt: string;
  showSkeleton?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain';
};

export function ImageCard({
  src,
  alt,
  showSkeleton = true,
  className,
  objectFit = 'cover'
}: TImageCard) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  );
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setStatus('loading');
    const img = imgRef.current;

    if (img && img.complete && img.naturalWidth > 0) {
      setStatus('loaded');
    }
  }, [src]);

  return (
    <div
      className={cn(
        'relative overflow-hidden w-full h-full bg-muted/20',
        className
      )}
    >
      {status === 'loading' && showSkeleton && (
        <Skeleton className="absolute inset-0 z-10 flex items-center justify-center h-full w-full">
          <ImageIcon className="size-6 text-muted-foreground/50" />
          <span className="sr-only">Carregando imagem...</span>
        </Skeleton>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-muted text-muted-foreground h-full w-full">
          <ImageOff className="size-8 mb-2 opacity-50" />
          <span className="text-xs">Não disponível</span>
        </div>
      )}

      <figure className="relative w-full h-full">
        <img
          ref={imgRef}
          className={cn(
            'transition-opacity duration-300 size-full rounded-[inherit]',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            objectFit === 'contain' ? 'object-contain' : 'object-cover'
          )}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      </figure>
    </div>
  );
}
