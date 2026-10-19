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
import { useCenario01, type Entrada } from "../state";

function sigla(nome: string) {
  const [g, ...resto] = nome.split(" ");
  return `${g?.[0]}. ${resto.join(" ")}`;
}

export function RegistroOcorrencias() {
  const { entradas, totais, registrar, desfazer } = useCenario01();
  const [taxon, setTaxon] = useState<Taxon | null>(null);
  const [qtd, setQtd] = useState("1");
  const [desfeita, setDesfeita] = useState<Entrada | null>(null);
  const [sobreDesfazer, setSobreDesfazer] = useState(false);
  const inputQtd = useRef<HTMLInputElement>(null);
  const inputTaxon = useRef<HTMLInputElement>(null);

  const totalOcorrencias = useMemo(
    () => [...totais.values()].reduce((a, b) => a + b, 0),
    [totais],
  );
  const ultima = entradas.length > 0 ? entradas[entradas.length - 1]! : null;
  const registrados = TAXA.filter((t) => (totais.get(t) ?? 0) > 0); // TAXA já vem por nome
  const qtdNumero = Number(qtd);
  const qtdValida = Number.isInteger(qtdNumero) && qtdNumero >= 1;

  function registrarOcorrencia() {
    if (!taxon || !qtdValida) return;
    registrar(taxon, qtdNumero);
    setTaxon(null);
    setQtd("1");
    setDesfeita(null);
    inputTaxon.current?.focus();
  }

  function desfazerUltima() {
    if (!ultima) return;
    desfazer();
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
            Digite parte do nome do táxon, escolha na lista e informe a
            contagem. Contagens repetidas do mesmo táxon somam automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-4">
            <div className="min-w-60 flex-1 space-y-2">
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
                filter={(item, query) =>
                  item.toLowerCase().includes(query.toLowerCase())
                }
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

            <div className="flex items-end gap-3 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="qtd">Quantas ocorrências?</Label>
                <Input
                  id="qtd"
                  ref={inputQtd}
                  type="number"
                  min={1}
                  step={1}
                  value={qtd}
                  onChange={(e) => setQtd(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && registrarOcorrencia()}
                  className="w-28"
                />
              </div>
              <Button
                onClick={registrarOcorrencia}
                disabled={!taxon || !qtdValida}
              >
                Registrar
              </Button>
            </div>
          </div>

          <p
            className={cn(
              "text-sm text-muted-foreground",
              !desfeita && "invisible",
            )}
          >
            {desfeita ? (
              <>
                Desfeito: {sigla(desfeita.taxon)} (+{desfeita.qtd}) — total
                voltou para {totais.get(desfeita.taxon) ?? 0}.
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
            <Button
              variant="outline"
              size="sm"
              onClick={desfazerUltima}
              disabled={!ultima}
              onMouseEnter={() => setSobreDesfazer(true)}
              onMouseLeave={() => setSobreDesfazer(false)}
              onFocus={() => setSobreDesfazer(true)}
              onBlur={() => setSobreDesfazer(false)}
            >
              <Undo2 /> Desfazer última entrada
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-1">
          {registrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum táxon registrado ainda.
            </p>
          ) : (
            registrados.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
              >
                <em>{t}</em>
                <span className="ml-auto flex items-center gap-2">
                  {ultima?.taxon === t && (
                    <span
                      className={cn(
                        "text-green-600 transition-colors",
                        sobreDesfazer && "-mx-1 rounded bg-amber-200/80 px-1",
                      )}
                    >
                      +{ultima.qtd}
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {totais.get(t)} ocorr.
                  </span>
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
