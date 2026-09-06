import type { CartItem } from './types';

export interface BundlePricing {
  subtotal: number;
  discountedSubtotal: number;
  savings: number;
  pairsCount: number;
  hasFreeShipping: boolean;
}

/**
 * Empareja las 2 unidades más caras del carrito, luego las 2 siguientes, etc.
 * (cualquier combinación de modelo/talla/color cuenta) y cobra cada pareja al
 * precio del combo 2x1 — o menos, si la suma real ya es menor. Una unidad
 * sobrante (cantidad impar) se cobra a precio normal.
 */
export function computeBundlePricing(items: CartItem[], bundlePrice: number): BundlePricing {
  const units: number[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) units.push(item.price);
  }
  units.sort((a, b) => b - a);

  let discountedSubtotal = 0;
  let pairsCount = 0;
  for (let i = 0; i < units.length; i += 2) {
    if (i + 1 < units.length) {
      discountedSubtotal += Math.min(bundlePrice, units[i] + units[i + 1]);
      pairsCount++;
    } else {
      discountedSubtotal += units[i];
    }
  }

  const subtotal = units.reduce((sum, u) => sum + u, 0);
  return {
    subtotal,
    discountedSubtotal,
    savings: subtotal - discountedSubtotal,
    pairsCount,
    hasFreeShipping: pairsCount > 0,
  };
}
