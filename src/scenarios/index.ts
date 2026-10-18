import type { ComponentType } from "react";

export type Pagina = {
  id: string;
  rotulo: string;
  Componente: ComponentType;
};

export type Cenario = {
  id: string;
  amostra: { id: string; data: string; estacao: string; coords: string };
  paginas: Pagina[];
};
