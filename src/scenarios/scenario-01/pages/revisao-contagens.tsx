import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { TAXA, type Taxon } from "../index";
import { useCenario01 } from "../state";

export function RevisaoContagens() {
  const { totais, alterar } = useCenario01();
  const [rascunho, setRascunho] = useState<Partial<Record<Taxon, string>>>({});

  const registrados = TAXA.filter((t) => (totais.get(t) ?? 0) > 0);
  const totalOcorrencias = [...totais.values()].reduce((a, b) => a + b, 0);

  function commit(t: Taxon, bruto: string) {
    setRascunho((r) => {
      const resto = { ...r };
      delete resto[t];
      return resto;
    });
    if (bruto === "") return; // campo vazio reverte; 0 explícito remove o táxon
    const n = Number(bruto);
    if (!Number.isInteger(n) || n < 0 || n === (totais.get(t) ?? 0)) return;
    alterar(t, n);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revisão de contagens</CardTitle>
        <CardDescription>
          Edite o número de ocorrências de cada táxon. Confirme com Enter ou ao sair do campo;{" "}
          use <strong>0</strong> para remover o táxon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {registrados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum táxon registrado ainda.</p>
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
                  <td className="py-2 text-right">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      aria-label={`Ocorrências de ${t}`}
                      value={rascunho[t] ?? String(totais.get(t) ?? 0)}
                      onChange={(e) => setRascunho((r) => ({ ...r, [t]: e.target.value }))}
                      onBlur={(e) => commit(t, e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && commit(t, (e.target as HTMLInputElement).value)
                      }
                      className="ml-auto w-24 text-right"
                    />
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border font-medium">
                <td className="py-2">Total</td>
                <td className="py-2 text-right">{totalOcorrencias} ocorr.</td>
              </tr>
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
