import type { BundleShippingException, ShippingSettings } from './types';

// El envío de un pedido de UN SOLO PAR es gratis por defecto — el "gatillo
// mental" de "envío gratis hoy" — salvo en los departamentos/municipios que
// el administrador agregue explícitamente en "Tarifas por departamento" o
// "Excepciones por municipio", donde sí se cobra el valor configurado.
export function getShippingRate(shipping: ShippingSettings, department: string, municipio: string): number {
  if (!department) return shipping.defaultRate;

  const exception = shipping.exceptions.find(
    (e) => e.department === department && e.municipio === municipio,
  );
  if (exception) return exception.rate;

  const rate = shipping.rates.find((r) => r.department === department);
  return rate ? rate.rate : shipping.defaultRate;
}

// El combo 2x1 trae envío gratis por defecto, pero algunos departamentos
// (por su costo real de transporte) pueden quedar marcados como excepción
// desde el admin — ahí sí se cobra el envío que se configure para ese
// departamento en vez de dejarlo gratis. Devuelve null si no aplica ninguna
// excepción (o sea, sigue siendo gratis).
export function getBundleShippingOverride(
  exceptions: BundleShippingException[],
  department: string,
): number | null {
  if (!department) return null;
  const exception = exceptions.find((e) => e.department === department);
  return exception ? exception.rate : null;
}
