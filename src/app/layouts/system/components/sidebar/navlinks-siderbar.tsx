import { ArrowLeftRight, Package } from 'lucide-react';

export const navLinks = [
  {
    label: 'Produtos',
    href: '/products',
    icon: <Package className="w-5 h-5" />
  },
  {
    label: 'Movimentação',
    href: '/movements',
    icon: <ArrowLeftRight className="w-5 h-5" />
  }
];
