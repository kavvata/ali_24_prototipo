import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { Taxon } from "./index";

export type Entrada = { taxon: Taxon; qtd: number; anterior: number };

type Cenario01 = {
  entradas: Entrada[];
  totais: Map<Taxon, number>;
  registrar: (taxon: Taxon, qtd: number) => void;
  desfazer: () => void;
  alterar: (taxon: Taxon, qtd: number) => void;
  reiniciar: () => void;
};

const Ctx = createContext<Cenario01 | null>(null);

export function useCenario01() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCenario01 precisa estar dentro do provider do cenário 01");
  return ctx;
}

export function Cenario01Provider({ children }: { children: ReactNode }) {
  const [entradas, setEntradas] = useState<Entrada[]>([]);

  const totais = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entradas) m.set(e.taxon, (m.get(e.taxon) ?? 0) + e.qtd);
    return m;
  }, [entradas]);

  function registrar(taxon: Taxon, qtd: number) {
    setEntradas((es) => [...es, { taxon, qtd, anterior: totais.get(taxon) ?? 0 }]);
  }

  function desfazer() {
    setEntradas((es) => es.slice(0, -1));
  }

  function reiniciar() {
    setEntradas([]);
  }

  // shortcut: editar reescreve o histórico do táxon como uma entrada única
  // (Desfazer passa a reverter a edição inteira) — expandir se precisar de auditoria por entrada
  function alterar(taxon: Taxon, qtd: number) {
    setEntradas((es) => [
      ...es.filter((e) => e.taxon !== taxon),
      ...(qtd > 0 ? [{ taxon, qtd, anterior: totais.get(taxon) ?? 0 }] : []),
    ]);
  }

  return (
    <Ctx.Provider value={{ entradas, totais, registrar, desfazer, alterar, reiniciar }}>
      {children}
    </Ctx.Provider>
  );
}
