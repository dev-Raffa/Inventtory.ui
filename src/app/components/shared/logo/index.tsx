import InventtoIcon from '@/assets/icon.svg';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <figure className={cn('relative flex gap-1 items-center', className)}>
      <img
        src={InventtoIcon}
        alt="Inventto Logo"
        className="absolute top-[-8px]"
      ></img>

      {showText && (
        <figcaption className="pl-10 text-green-950 text-[32px] font-bold leading-none font-philosopher">
          Inventto
        </figcaption>
      )}
    </figure>
  );
};
