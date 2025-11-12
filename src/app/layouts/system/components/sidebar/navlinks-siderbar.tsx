import { Book, Boxes, House, Package } from 'lucide-react';

export const navLinks = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <House className="w-5 h-5" />
  },
  {
    label: 'Produtos',
    href: '/products',
    icon: <Package className="w-5 h-5" />
  },
  {
    label: 'Inventário',
    href: '/inventory',
    icon: <Boxes className="w-5 h-5" />
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: <Book className="w-5 h-5" />
  }
];
