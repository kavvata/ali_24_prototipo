import { useMemo, useRef, useState } from "react";
import { Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { TAXA, type Taxon } from "../index";

type Entrada = { taxon: Taxon; qtd: number; anterior: number };

function sigla(nome: string) {
  const [g, ...resto] = nome.split(" ");
  return `${g?.[0]}. ${resto.join(" ")}`;
}

export function RegistroOcorrencias() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [taxon, setTaxon] = useState<Taxon | null>(null);
  const [qtd, setQtd] = useState("1");
  const [desfeita, setDesfeita] = useState<Entrada | null>(null);
  const inputQtd = useRef<HTMLInputElement>(null);
  const inputTaxon = useRef<HTMLInputElement>(null);

  const totais = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entradas) m.set(e.taxon, (m.get(e.taxon) ?? 0) + e.qtd);
    return m;
  }, [entradas]);

  const totalOcorrencias = useMemo(
    () => [...totais.values()].reduce((a, b) => a + b, 0),
    [totais],
  );
  const ultima = entradas.length > 0 ? entradas[entradas.length - 1]! : null;
  const registrados = TAXA.filter((t) => (totais.get(t) ?? 0) > 0); // TAXA já vem por nome
  const qtdNumero = Number(qtd);
  const qtdValida = Number.isInteger(qtdNumero) && qtdNumero >= 1;

  function registrar() {
    if (!taxon || !qtdValida) return;
    setEntradas((es) => [...es, { taxon, qtd: qtdNumero, anterior: totais.get(taxon) ?? 0 }]);
    setTaxon(null);
    setQtd("1");
    setDesfeita(null);
    inputTaxon.current?.focus();
  }

  function desfazer() {
    if (!ultima) return;
    setEntradas((es) => es.slice(0, -1));
    setDesfeita(ultima);
    inputTaxon.current?.focus();
  }

  return (
    <>
      {/* Registro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar ocorrência</CardTitle>
          <CardDescription>
            Digite parte do nome do táxon, escolha na lista e informe a contagem. Contagens
            repetidas do mesmo táxon somam automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Táxon</Label>
            <Combobox
              items={TAXA}
              value={taxon}
              openOnInputClick
              autoHighlight
              onValueChange={(v) => {
                setTaxon(typeof v === "string" ? v : null);
                setDesfeita(null);
                if (typeof v === "string") {
                  setQtd("1");
                  inputQtd.current?.focus();
                }
              }}
              filter={(item, query) => item.toLowerCase().includes(query.toLowerCase())}
            >
              <ComboboxInput
                ref={inputTaxon}
                showClear
                placeholder="Ex.: pseudodiaptomus…"
                className="w-full max-w-sm"
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
                  <ComboboxEmpty>Nenhum táxon encontrado.</ComboboxEmpty>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {/* Bloco sempre renderizado (invisible quando inativo) para o card não mudar de tamanho */}
          <div className={cn(!taxon && "invisible")}>
            <div className="flex items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="qtd">Quantos indivíduos de {taxon ? sigla(taxon) : ""}?</Label>
                <Input
                  id="qtd"
                  ref={inputQtd}
                  type="number"
                  min={1}
                  step={1}
                  value={qtd}
                  onChange={(e) => setQtd(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && registrar()}
                  className="w-28"
                />
              </div>
              <Button onClick={registrar} disabled={!taxon || !qtdValida}>
                Registrar
              </Button>
            </div>
          </div>

          <p className={cn("text-sm text-muted-foreground", !desfeita && "invisible")}>
            {desfeita ? (
              <>
                Desfeito: {sigla(desfeita.taxon)} (+{desfeita.qtd}) — total voltou para{" "}
                {totais.get(desfeita.taxon) ?? 0}.
              </>
            ) : (
              "\u00A0"
            )}
          </p>

        </CardContent>
      </Card>

      {/* Checklist de táxons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Táxons</CardTitle>
          <CardDescription>
            Total da amostra: <strong>{totalOcorrencias}</strong> ocorrências ·{" "}
            <strong>{totais.size}</strong> táxons
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={desfazer} disabled={!ultima}>
              <Undo2 /> Desfazer última entrada
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-1">
          {registrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum táxon registrado ainda.</p>
          ) : (
            registrados.map((t) => (
              <div key={t} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                <em>{t}</em>
                <span className="ml-auto flex items-center gap-2">
                  {ultima?.taxon === t && <span className="text-green-600">+{ultima.qtd}</span>}
                  <span className="text-muted-foreground">{totais.get(t)} ind.</span>
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
