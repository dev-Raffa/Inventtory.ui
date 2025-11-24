import { Users, ArrowLeftRight, Package, SwatchBook } from 'lucide-react';

export const navLinks = [
  {
    label: 'Usuários',
    href: '/users',
    icon: <Users className="w-5 h-5" />
  },
  {
    label: 'Produtos',
    href: '/products',
    icon: <Package className="w-5 h-5" />
  },
  {
    label: 'Movimentação',
    href: '/movements',
    icon: <ArrowLeftRight className="w-5 h-5" />
  },
  {
    label: 'Catalogos',
    href: '/catalogs',
    icon: <SwatchBook className="w-5 h-5" />
  }
];
