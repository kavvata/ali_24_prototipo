import { ChevronRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaginaProps } from "@/scenarios";
import { useAmostras } from "@/amostras";

import { useCenario02 } from "../state";

export function ListaAmostras({ irPara }: PaginaProps) {
  const { amostras } = useAmostras();
  const { abrir } = useCenario02();

  function abrirAmostra(id: string) {
    abrir(id);
    irPara(1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Amostras registradas</CardTitle>
        <CardDescription>
          Escolha uma amostra para editar as ocorrências.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {amostras.map((a) => {
          const total = Object.values(a.ocorrencias).reduce((x, y) => x + y, 0);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => abrirAmostra(a.id)}
              className="group flex w-full cursor-pointer items-baseline gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span className="font-medium">{a.id}</span>
              <span className="text-muted-foreground">
                {a.data} · {a.estacao}
              </span>
              <span className="ml-auto text-muted-foreground">
                {Object.keys(a.ocorrencias).length} táxons · {total} ocorr.
              </span>
              <ChevronRight
                className="size-4 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
