import type { ComponentType, ReactNode } from "react";

export type PaginaProps = {
  irPara: (indice: number) => void;
};

export type Pagina = {
  id: string;
  rotulo: string;
  Componente: ComponentType<PaginaProps>;
  /** Opcional: oculta o rodapé de navegação (Voltar/Próxima etapa) nesta página. */
  semRodape?: boolean;
};

export type Cenario = {
  id: string;
  /** Opcional: omitido em cenários em que a amostra depende da escolha do usuário. */
  amostra?: { id: string; data: string; estacao: string; coords: string };
  paginas: Pagina[];
  /** Opcional: estado compartilhado entre as páginas do cenário. */
  Provider?: ComponentType<{ children: ReactNode }>;
};
