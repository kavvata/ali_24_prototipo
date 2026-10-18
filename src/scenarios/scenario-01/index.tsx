import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Cenario } from "../index";
import { RegistroOcorrencias } from "./pages/registro-ocorrencias";

export type Taxon = string;

export const TAXA: Taxon[] = [
  "Pseudodiaptomus forbesi",
  "Diaptomus sicilianus",
  "Cyclops strenuus",
  "Acanthocyclops vivalis",
  "Eucyclops pectinifer",
  "Bosmina coregoni",
  "Daphnia galeata",
  "Ceriodaphnia dubia",
  "Moina micrura",
  "Parvocalanus parvus",
].sort();

// Placeholder para as etapas do cenário que ainda não foram implementadas.
function EmBreve({ etapa }: { etapa: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Etapa {etapa}</CardTitle>
        <CardDescription>Esta etapa ainda não foi implementada.</CardDescription>
      </CardHeader>
    </Card>
  );
}

export const CENARIO_01: Cenario = {
  id: "01",
  amostra: {
    id: "A-17",
    data: "12/03/2025",
    estacao: "Estação 3 – Rio Piraí",
    coords: "22°51′S 43°12′W",
  },
  paginas: [
    { id: "registro", rotulo: "Registro de ocorrências", Componente: RegistroOcorrencias },
    { id: "etapa-2", rotulo: "Etapa 2", Componente: () => <EmBreve etapa={2} /> },
    { id: "etapa-3", rotulo: "Etapa 3", Componente: () => <EmBreve etapa={3} /> },
  ],
};
