import type { CreateMovementDTO, MovementResponse } from '../types';

async function getAll(): Promise<MovementResponse[]> {
  return [
    {
      id: '1',
      date: 'Mon Oct 20 2025 14:30:00 GMT-0300',
      type: 'entry',
      reason: 'Compra Inverno 2024 - NF #5920',
      totalQuantity: 150,
      user: {
        name: 'Ana Silva',
        avatar: '/diverse-group-avatars.png',
        initials: 'AS'
      },
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          productName: 'Jaqueta Puffer',
          variantId: 'v1',
          variantAttributes: 'Preto / P',
          productImage: '/black-tshirt.jpg',
          quantity: 50,
          currentStock: 120
        },
        {
          id: 'item-2',
          productId: 'product-1',
          variantId: 'v2',
          productName: 'Jaqueta Puffer',
          variantAttributes: 'Preto / M',
          productImage: '/black-tshirt.jpg',
          quantity: 50,
          currentStock: 145
        },
        {
          id: 'item-3',
          productId: 'product-1',
          variantId: 'v3',
          productName: 'Jaqueta Puffer',
          variantAttributes: 'Preto / G',
          productImage: '/black-tshirt.jpg',
          quantity: 50,
          currentStock: 80
        }
      ]
    },
    {
      id: '2',
      date: 'Mon Oct 20 2025 10:15:00 GMT-0300',
      type: 'withdrawal',
      reason: 'Venda #1023',
      totalQuantity: 2,
      user: {
        name: 'Carlos Oliveira',
        avatar: '/pandoran-bioluminescent-forest.png',
        initials: 'CO'
      },
      items: [
        {
          id: 'item-4',
          productId: 'product-2',
          variantId: 'v1',
          productName: 'Calça Jeans Slim',
          variantAttributes: 'Azul Escuro / 42',
          productImage: '/folded-denim-stack.png',
          quantity: 2,
          currentStock: 18
        }
      ]
    },
    {
      id: '3',
      date: 'Sun Oct 19 2025 16:45:00 GMT-0300',
      type: 'adjustment',
      reason: 'Correção de Inventário Mensal',
      totalQuantity: 1,
      user: {
        name: 'Roberto Santos',
        avatar: '/diverse-group-avatars.png',
        initials: 'RS'
      },
      items: [
        {
          id: 'item-5',
          productId: 'product-4',
          variantId: 'v-5',
          productName: 'Tênis Casual Urbano',
          variantAttributes: 'Branco / 40',
          productImage: '/diverse-sneaker-collection.png',
          quantity: 1,
          currentStock: 45
        }
      ]
    },
    {
      id: '4',
      date: 'Sun Oct 19 2025 09:20:00 GMT-0300',
      type: 'withdrawal',
      reason: 'Venda #1022',
      totalQuantity: 1,
      user: {
        name: 'Ana Silva',
        avatar: '/diverse-group-avatars.png',
        initials: 'AS'
      },
      items: [
        {
          id: 'item-6',
          productId: 'product-9',
          variantId: 'v-22',
          productName: 'Jaqueta Corta-Vento',
          variantAttributes: 'Cinza / G',
          productImage: '/stylish-woman-leather-jacket.png',
          quantity: 1,
          currentStock: 12
        }
      ]
    },
    {
      id: '5',
      date: 'Sat Oct 18 2025 11:00:00 GMT-0300',
      type: 'entry',
      reason: 'Reposição Básicos - NF #4830',
      totalQuantity: 100,
      user: {
        name: 'Fernanda Lima',
        avatar: '/diverse-group-avatars.png',
        initials: 'FL'
      },
      items: [
        {
          id: 'item-7',
          productId: 'product-58',
          variantId: 'v-24',
          productName: 'Meias Esportivas (Kit 3)',
          variantAttributes: 'Branco / Único',
          productImage: '/colorful-socks.png',
          quantity: 100,
          currentStock: 500
        }
      ]
    }
  ];
}

async function create(payload: CreateMovementDTO): Promise<void> {
  console.log('Enviando para Supabase:', payload);

  /* Exemplo futuro:
  const { error } = await supabase.rpc('create_stock_movement', { payload });
  if (error) throw new Error(error.message);
  */

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

export const MovementService = {
  getAll,
  create
};
