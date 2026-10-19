import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { useAmostras, type Amostra, type Ocorrencias } from "@/amostras";

type Cenario02 = {
  selecionada: Amostra | null;
  rascunho: Ocorrencias;
  sujo: boolean;
  salva: boolean;
  abrir: (id: string) => void;
  editar: (taxon: string, qtd: number) => void;
  salvar: () => void;
};

const Ctx = createContext<Cenario02 | null>(null);

export function useCenario02() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCenario02 precisa estar dentro do provider do cenário 02");
  return ctx;
}

function ocorrenciasIguais(a: Ocorrencias, b: Ocorrencias) {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
}

export function Cenario02Provider({ children }: { children: ReactNode }) {
  const { obter, salvar: salvarAmostra } = useAmostras();
  const [id, setId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Ocorrencias>({});
  const [salva, setSalva] = useState(false);

  const selecionada = id ? (obter(id) ?? null) : null;

  const sujo = useMemo(
    () => (selecionada ? !ocorrenciasIguais(rascunho, selecionada.ocorrencias) : false),
    [selecionada, rascunho],
  );

  function abrir(i: string) {
    const a = obter(i);
    if (!a) return;
    setId(i);
    setRascunho({ ...a.ocorrencias });
    setSalva(false);
  }

  function editar(taxon: string, qtd: number) {
    setRascunho((r) => {
      const resto = { ...r };
      if (qtd > 0) resto[taxon] = qtd;
      else delete resto[taxon];
      return resto;
    });
    setSalva(false);
  }

  function salvar() {
    if (!selecionada) return;
    salvarAmostra(selecionada.id, rascunho);
    setSalva(true);
  }

  return (
    <Ctx.Provider value={{ selecionada, rascunho, sujo, salva, abrir, editar, salvar }}>
      {children}
    </Ctx.Provider>
  );
}
