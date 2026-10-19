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
  if (!ctx) throw new Error("useAmostras precisa estar dentro do AmostrasProvider");
  return ctx;
}

const INICIAIS: Amostra[] = [
  {
    id: "A-17",
    data: "12/03/2025",
    estacao: "Estação 3 – Rio Piraí",
    coords: "22°51′S 43°12′W",
    ocorrencias: {
      "Pseudodiaptomus forbesi": 34,
      "Daphnia galeata": 21,
      "Bosmina coregoni": 8,
    },
  },
  {
    id: "A-16",
    data: "05/03/2025",
    estacao: "Estação 2 – Rio Piraí",
    coords: "22°49′S 43°15′W",
    ocorrencias: {
      "Cyclops strenuus": 12,
      "Moina micrura": 6,
    },
  },
  {
    id: "A-15",
    data: "26/02/2025",
    estacao: "Estação 3 – Rio Piraí",
    coords: "22°51′S 43°12′W",
    ocorrencias: {
      "Parvocalanus parvus": 40,
      "Ceriodaphnia dubia": 17,
      "Diaptomus sicilianus": 5,
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

  return <Ctx.Provider value={{ amostras, obter, salvar }}>{children}</Ctx.Provider>;
}
