import type { Cenario } from "../index";
import { Cenario02Provider } from "./state";
import { ListaAmostras } from "./pages/lista";
import { EdicaoAmostra } from "./pages/edicao";

export const CENARIO_02: Cenario = {
  id: "02",
  paginas: [
    { id: "lista", rotulo: "Amostras registradas", Componente: ListaAmostras, semRodape: true },
    { id: "edicao", rotulo: "Editar amostra", Componente: EdicaoAmostra },
  ],
  Provider: Cenario02Provider,
};
