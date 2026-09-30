import type { ProductColor } from './types';

// Compartido entre el formulario normal de producto y la carga rápida por
// lotes, para que las tallas/colores/colecciones sugeridas sean siempre
// las mismas en los dos lugares.
export const COMMON_SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42'];

export const QUICK_COLORS: ProductColor[] = [
  { name: 'Camel', hex: '#C9A06C' },
  { name: 'Terracota', hex: '#A9673A' },
  { name: 'Beige', hex: '#F5E6CE' },
  { name: 'Negro', hex: '#1C1208' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Vino', hex: '#7A4A22' },
];

export const COMMON_COLLECTIONS = ['sandalias', 'tacones', 'flats', 'botas', 'accesorios'];
