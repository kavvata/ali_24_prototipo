import { createContext, useContext, useState, type ReactNode } from "react";

/** Ocorrências de uma amostra: táxon → quantidade. */
export type Ocorrencias = Record<string, number>;

export type Amostra = {
  id: string;
  data: string;
  estacao: string;
  coords: string;
  ocorrencias: Ocorrencias;
};

type AmostrasCtx = {
  amostras: Amostra[];
  obter: (id: string) => Amostra | undefined;
  /** Atualiza as ocorrências de uma amostra já registrada. */
  salvar: (id: string, ocorrencias: Ocorrencias) => void;
};

const Ctx = createContext<AmostrasCtx | null>(null);

export function useAmostras() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useAmostras precisa estar dentro do AmostrasProvider");
  return ctx;
}

// Contagens próximas à média por amostra da Tabela 2 (Santos, 2024):
// 2.146 indivíduos em 9 manguezais (81 amostras) → média de ~26 indiv./amostra.
// Locais e datas de Tabela 1 (amostragem em out–nov/2021).
const INICIAIS: Amostra[] = [
  {
    id: "A-17",
    data: "28/10/2021",
    estacao: "Estação 1 – Parque Estadual do Boguaçu, Guaratuba (PR)",
    coords: "25°44′S 48°33′W",
    ocorrencias: {
      "Chelorchestia darwinii": 14,
      "Chironomidae (larva)": 3,
      "Sinelobus stanfordi": 2,
      "Trombicula sp": 1,
      Nematoda: 1,
      Oligochaeta: 1,
    },
  },
  {
    id: "A-16",
    data: "22/10/2021",
    estacao: "Estação 1 – Parque Estadual do Boguaçu, Guaratuba (PR)",
    coords: "25°44′S 48°33′W",
    ocorrencias: {
      "Chelorchestia darwinii": 8,
      "Ceratopogonidae (larva)": 2,
      Nematoda: 2,
      "Trochammina inflata": 1,
      "Littoraria angulifera": 1,
    },
  },
  {
    id: "A-15",
    data: "15/10/2021",
    estacao: "Estação 2 – Rio Itiberê, Paranaguá (PR)",
    coords: "25°31′S 48°30′W",
    ocorrencias: {
      "Chelorchestia darwinii": 18,
      "Ceratopogonidae (larva)": 2,
      "Chironomidae (larva)": 1,
      "Ceratopogonidae (pupa)": 1,
      "Trombicula sp": 1,
      "Euraphia rizophorae": 1,
    },
  },
];

export function AmostrasProvider({ children }: { children: ReactNode }) {
  const [amostras, setAmostras] = useState<Amostra[]>(INICIAIS);

  function obter(id: string) {
    return amostras.find((a) => a.id === id);
  }

  // shortcut: só atualiza amostras já cadastradas (não cria novas) —
  // adicionar criação se o cenário de registro passar a usar ids dinâmicos
  function salvar(id: string, ocorrencias: Ocorrencias) {
    setAmostras((as) =>
      as.map((a) =>
        a.id === id
          ? {
              ...a,
              ocorrencias: Object.fromEntries(
                Object.entries(ocorrencias).filter(([, q]) => q > 0),
              ),
            }
          : a,
      ),
    );
  }

  return (
    <Ctx.Provider value={{ amostras, obter, salvar }}>{children}</Ctx.Provider>
  );
}
