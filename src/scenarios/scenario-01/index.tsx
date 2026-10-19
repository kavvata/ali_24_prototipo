import type { Cenario } from "../index";
import { Cenario01Provider } from "./state";
import { RegistroOcorrencias } from "./pages/registro-ocorrencias";
import { RevisaoContagens } from "./pages/revisao-contagens";
import { ResumoAmostra } from "./pages/resumo";

export { TAXA, type Taxon } from "../../taxa";

export const CENARIO_01: Cenario = {
  id: "01",
  amostra: {
    id: "A-17",
    data: "28/10/2021",
    estacao: "Estação 1 – Boguaçu, Guaratuba (PR)",
    coords: "25°44′S 48°33′W",
  },
  paginas: [
    { id: "registro", rotulo: "Registro de ocorrências", Componente: RegistroOcorrencias },
    { id: "revisao", rotulo: "Revisão de contagens", Componente: RevisaoContagens },
    { id: "resumo", rotulo: "Resumo da amostra", Componente: ResumoAmostra },
  ],
  Provider: Cenario01Provider,
};
