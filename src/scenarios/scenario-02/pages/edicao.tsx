import { useRef, useState } from "react";
import { ChevronLeft, Plus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PaginaProps } from "@/scenarios";
import { TAXA, type Taxon } from "@/taxa";

import { useCenario02 } from "../state";

export function EdicaoAmostra({ irPara }: PaginaProps) {
  const { selecionada, rascunho, sujo, salva, editar, salvar } = useCenario02();
  const [rascunhoQtd, setRascunhoQtd] = useState<Partial<Record<Taxon, string>>>({});
  const [novoTaxon, setNovoTaxon] = useState<Taxon | null>(null);
  const [novoQtd, setNovoQtd] = useState("1");
  const inputNovoQtd = useRef<HTMLInputElement>(null);

  if (!selecionada) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editar amostra</CardTitle>
          <CardDescription>
            Nenhuma amostra selecionada. Volte e escolha uma na lista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => irPara(0)}>
            <ChevronLeft /> Voltar às amostras
          </Button>
        </CardContent>
      </Card>
    );
  }

  const taxons = Object.keys(rascunho).sort();
  const total = Object.values(rascunho).reduce((a, b) => a + b, 0);
  const disponiveis = TAXA.filter((t) => !(t in rascunho));
  const qtdValida = Number.isInteger(Number(novoQtd)) && Number(novoQtd) >= 1;

  function commit(t: Taxon, bruto: string) {
    setRascunhoQtd((r) => {
      const resto = { ...r };
      delete resto[t];
      return resto;
    });
    if (bruto === "") return; // campo vazio não altera; 0 remove o táxon
    const n = Number(bruto);
    if (!Number.isInteger(n) || n < 0 || n === (rascunho[t] ?? 0)) return;
    editar(t, n);
  }

  function adicionar() {
    if (!novoTaxon || !qtdValida) return;
    editar(novoTaxon, Number(novoQtd));
    setNovoTaxon(null);
    setNovoQtd("1");
    inputNovoQtd.current?.focus();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Amostra {selecionada.id}</CardTitle>
          <CardDescription>
            {selecionada.data} · {selecionada.estacao} · {selecionada.coords}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum táxon registrado. Adicione o primeiro abaixo.
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
                {taxons.map((t) => (
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
                        value={rascunhoQtd[t] ?? String(rascunho[t] ?? 0)}
                        onChange={(e) => setRascunhoQtd((r) => ({ ...r, [t]: e.target.value }))}
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
                  <td className="py-2 text-right">{total} ocorr.</td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Adicionar novo táxon */}
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3 border-t border-border pt-4">
            <div className="min-w-60 flex-1 space-y-2">
              <Label>Táxon</Label>
              <Combobox
                items={disponiveis}
                value={novoTaxon}
                openOnInputClick
                autoHighlight
                onValueChange={(v) => {
                  setNovoTaxon(typeof v === "string" ? v : null);
                  if (typeof v === "string") inputNovoQtd.current?.focus();
                }}
                filter={(item, query) => item.toLowerCase().includes(query.toLowerCase())}
              >
                <ComboboxInput
                  showClear
                  placeholder="Escolha o táxon…"
                  className="w-full max-w-sm"
                  onKeyDown={(e) => {
                    // Tab com texto na busca confirma o item destacado, como se fosse Enter
                    if (e.key !== "Tab" || !e.currentTarget.value.trim()) return;
                    const item = document.querySelector<HTMLElement>(
                      '[data-slot="combobox-content"] [data-slot="combobox-item"][data-highlighted]',
                    );
                    if (item) {
                      e.preventDefault();
                      item.click();
                    }
                  }}
                />
                <ComboboxContent>
                  <ComboboxList>
                    {/* filter só age sobre o props `items`, então os itens são renderizados via Collection */}
                    <ComboboxCollection>
                      {(item: Taxon) => (
                        <ComboboxItem key={item} value={item}>
                          <em>{item}</em>
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                    <ComboboxEmpty>Nenhum táxon disponível.</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="flex items-end gap-3 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="novo-qtd">Ocorrências</Label>
                <Input
                  id="novo-qtd"
                  ref={inputNovoQtd}
                  type="number"
                  min={1}
                  step={1}
                  value={novoQtd}
                  onChange={(e) => setNovoQtd(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionar()}
                  className="w-28"
                />
              </div>
              <Button onClick={adicionar} disabled={!novoTaxon || !qtdValida}>
                <Plus /> Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => irPara(0)}>
          <ChevronLeft /> Voltar
        </Button>
        <div className="flex items-center gap-3">
          <p
            className={cn(
              "text-sm",
              salva && !sujo ? "text-green-600" : "text-muted-foreground",
              !salva && !sujo && "invisible",
            )}
          >
            {salva && !sujo ? "Amostra atualizada" : "Alterações não salvas"}
          </p>
          <Button onClick={salvar} disabled={!sujo}>
            <Save /> Salvar alterações
          </Button>
        </div>
      </div>
    </>
  );
}
