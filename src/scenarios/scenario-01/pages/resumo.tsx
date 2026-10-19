import { BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PaginaProps } from "@/scenarios";

import { useAmostras } from "@/amostras";

import { CENARIO_01, TAXA } from "../index";
import { useCenario01 } from "../state";

export function ResumoAmostra({ irPara }: PaginaProps) {
  const { totais, reiniciar } = useCenario01();
  const { salvar } = useAmostras();
  const amostra = CENARIO_01.amostra!;
  const registrados = TAXA.filter((t) => (totais.get(t) ?? 0) > 0);
  const totalOcorrencias = [...totais.values()].reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="flex flex-col items-center gap-3 py-2">
        <BadgeCheck className="size-24 text-green-600" aria-hidden />
        <h2 className="text-2xl font-semibold tracking-tight">
          Amostra finalizada
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo da amostra</CardTitle>
          <CardDescription>
            Amostra {amostra.id} · {amostra.data} · {amostra.estacao} ·{" "}
            {amostra.coords}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum táxon registrado.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Táxon</th>
                  <th className="pb-2 text-right font-medium">Ocorrências</th>
                </tr>
              </thead>
              <tbody>
                {registrados.map((t) => (
                  <tr key={t} className="border-t border-border">
                    <td className="py-2">
                      <em>{t}</em>
                    </td>
                    <td className="py-2 text-right">{totais.get(t)}</td>
                  </tr>
                ))}
                <tr className="border-t border-border font-medium">
                  <td className="py-2">Total</td>
                  <td className="py-2 text-right">{totalOcorrencias}</td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={() => {
            salvar(amostra.id, Object.fromEntries(totais));
            reiniciar();
            irPara(0);
          }}
        >
          Salvar e registrar nova amostra
        </Button>
      </div>
    </>
  );
}
