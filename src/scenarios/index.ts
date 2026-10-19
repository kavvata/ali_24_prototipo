import type { ComponentType, ReactNode } from "react";

export type PaginaProps = {
  irPara: (indice: number) => void;
};

export type Pagina = {
  id: string;
  rotulo: string;
  Componente: ComponentType<PaginaProps>;
};

export type Cenario = {
  id: string;
  amostra: { id: string; data: string; estacao: string; coords: string };
  paginas: Pagina[];
  /** Opcional: estado compartilhado entre as páginas do cenário. */
  Provider?: ComponentType<{ children: ReactNode }>;
};
