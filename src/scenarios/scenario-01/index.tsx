import type { Cenario } from "../index";
import { Cenario01Provider } from "./state";
import { RegistroOcorrencias } from "./pages/registro-ocorrencias";
import { RevisaoContagens } from "./pages/revisao-contagens";
import { ResumoAmostra } from "./pages/resumo";

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
    { id: "revisao", rotulo: "Revisão de contagens", Componente: RevisaoContagens },
    { id: "resumo", rotulo: "Resumo da amostra", Componente: ResumoAmostra },
  ],
  Provider: Cenario01Provider,
};
