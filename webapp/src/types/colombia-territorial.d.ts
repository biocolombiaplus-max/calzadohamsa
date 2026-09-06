declare module 'colombia-territorial' {
  export interface ColombiaMunicipio {
    nombre: string;
    codigo_dane: string;
  }

  export interface ColombiaDepartamento {
    nombre: string;
    codigo_dane: string;
    capital: string;
    municipios: ColombiaMunicipio[];
  }

  const colombia: {
    departamentos: ColombiaDepartamento[];
    getDepartamentos(): ColombiaDepartamento[];
    getDepartamento(nombre: string): ColombiaDepartamento | undefined;
    getDepartamentoPorCodigo(codigo: string): ColombiaDepartamento | undefined;
    getMunicipios(departamento: string): ColombiaMunicipio[];
    getCapital(departamento: string): string | null;
    buscarDepartamento(termino: string): ColombiaDepartamento[];
    todosLosMunicipios(): ColombiaMunicipio[];
    buscarMunicipioPorCodigo(codigo: string): (ColombiaMunicipio & { departamento: string; codigo_departamento: string }) | null;
  };

  export default colombia;
}
