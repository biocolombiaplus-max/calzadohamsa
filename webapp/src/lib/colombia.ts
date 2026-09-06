import colombia from 'colombia-territorial';

let departamentosCache: string[] | null = null;

export function getDepartamentos(): string[] {
  if (!departamentosCache) {
    departamentosCache = colombia.departamentos.map((d) => d.nombre).sort((a, b) => a.localeCompare(b, 'es'));
  }
  return departamentosCache;
}

export function getMunicipios(departamento: string): string[] {
  if (!departamento) return [];
  return colombia
    .getMunicipios(departamento)
    .map((m) => m.nombre)
    .sort((a, b) => a.localeCompare(b, 'es'));
}
