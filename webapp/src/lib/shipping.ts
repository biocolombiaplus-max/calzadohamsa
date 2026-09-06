import type { ShippingSettings } from './types';

export function getShippingRate(shipping: ShippingSettings, department: string, municipio: string): number {
  if (!department) return shipping.defaultRate;

  const exception = shipping.exceptions.find(
    (e) => e.department === department && e.municipio === municipio,
  );
  if (exception) return exception.rate;

  const rate = shipping.rates.find((r) => r.department === department);
  return rate ? rate.rate : shipping.defaultRate;
}
