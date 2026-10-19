import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CENARIO_01 } from "@/scenarios/scenario-01";
import "../styles/globals.css";
// Quando o cenário 02 existir, o cenário ativo é escolhido aqui (ou via seletor).
const cenario = CENARIO_01;

export function App() {
  const [pagina, setPagina] = useState(0);

  const paginas = cenario.paginas.map(({ id, Componente }, i) => (
    <section key={id} hidden={i !== pagina} className="space-y-4">
      <Componente irPara={setPagina} />
    </section>
  ));

  return (
    <div className="min-h-dvh">
      {/* Barra de contexto — sempre visível */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              Amostra {cenario.amostra.id} · {cenario.amostra.data} · {cenario.amostra.estacao}
            </p>
            <p className="text-xs text-muted-foreground">{cenario.amostra.coords}</p>
          </div>
          {/* Etapas: clicar em um ponto troca a página */}
          <nav
            className="ml-auto flex items-center"
            aria-label={`Etapa ${pagina + 1} de ${cenario.paginas.length}`}
          >
            {cenario.paginas.map((p, i) => (
              <span key={p.id} className="flex items-center">
                {i > 0 && <span className="h-px w-6 bg-border" />}
                <button
                  type="button"
                  onClick={() => setPagina(i)}
                  aria-label={p.rotulo}
                  aria-current={i === pagina ? "step" : undefined}
                  className="-m-1.5 rounded-md p-1.5 focus-visible:outline-2"
                >
                  <span
                    className={cn(
                      "block size-2.5 rounded-full",
                      i === pagina
                        ? "bg-green-600"
                        : i < pagina
                          ? "bg-green-600/50"
                          : "bg-muted-foreground/40",
                    )}
                  />
                </button>
              </span>
            ))}
          </nav>
        </div>
      </header>

      {/* Todas as páginas ficam montadas (ocultas quando inativas) para não perder o estado ao navegar */}
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        {cenario.Provider ? (
          <cenario.Provider>{paginas}</cenario.Provider>
        ) : (
          paginas
        )}
        {/* Rodapé de navegação — oculto na última página, que define o próprio CTA */}
        {pagina < cenario.paginas.length - 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setPagina((p) => Math.max(p - 1, 0))}
              disabled={pagina === 0}
            >
              <ChevronLeft /> Voltar
            </Button>
            <Button onClick={() => setPagina((p) => Math.min(p + 1, cenario.paginas.length - 1))}>
              Próxima etapa <ChevronRight />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
