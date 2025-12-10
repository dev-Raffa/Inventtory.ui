import { BellIcon } from 'lucide-react';
import { Logo } from '@/app/components/shared/logo';
import { Button } from '@/app/components/ui/button';
import { UserNav } from '../user-nav';

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
        <UserNav />
      </section>
    </header>
  );
};
