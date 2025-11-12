import { Logo } from '@/app/components/shared/logo/logo';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { BellIcon } from 'lucide-react';

export const SystemLayoutHeader = () => {
  return (
    <header className="flex items-center justify-between px-4  h-16">
      <Logo />
      <section className="flex items-center gap-2">
        <Button
          variant={'outline'}
          size={'icon'}
          className="rounded-full cursor-pointer"
        >
          <BellIcon />
        </Button>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage></AvatarImage>
          <AvatarFallback className="bg-white ">US</AvatarFallback>
        </Avatar>
      </section>
    </header>
  );
};
