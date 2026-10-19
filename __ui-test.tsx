import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// dynamic imports: react-dom must see the DOM globals at module init
const React = await import("react");
const { act } = React;
const { createRoot } = await import("react-dom/client");
const { App } = await import("./src/App");

const doc = document as any;
const wins = (globalThis as any).window as any;

function setValue(el: any, v: string) {
  const proto = Object.getPrototypeOf(el);
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  desc.set.call(el, v);
  // inputType "insertText" is what real keystrokes produce; Base UI only opens
  // the popup for genuine typing (bare "input" events look like autofill).
  el.dispatchEvent(
    new wins.InputEvent("input", { bubbles: true, inputType: "insertText", data: v }),
  );
}
function click(el: any) {
  el.dispatchEvent(new wins.MouseEvent("pointerdown", { bubbles: true }));
  el.dispatchEvent(new wins.MouseEvent("pointerup", { bubbles: true }));
  el.dispatchEvent(new wins.MouseEvent("click", { bubbles: true }));
}
const text = () => doc.body.textContent;
function assert(cond: boolean, msg: string) {
  console.log(cond ? "OK  " : "FAIL", msg);
  if (!cond) process.exitCode = 1;
}

const container = doc.createElement("div");
doc.body.appendChild(container);
const root = createRoot(container);
await act(async () => root.render(React.createElement(App)));

// 1. Context bar (no "Papel")
assert(!text().includes("Papel"), "no 'Papel' anywhere");
assert(text().includes("Amostra"), "context bar sample");

// 2. Taxon panel present
assert(text().includes("Nenhum táxon registrado ainda."), "taxon empty state shown");

// 2b. Fixed-size card: qtd block always rendered, invisible before selection
const qtdRef = () => doc.getElementById("qtd") as any;
assert(!!qtdRef(), "qtd input always rendered (fixed card)");
assert(qtdRef()?.closest(".invisible") != null, "qtd block invisible before selection");

// 3. Type in combobox -> filters
const comboboxInput = doc.querySelector('input[placeholder^="Ex.:"]') as any;
assert(!!comboboxInput, "combobox input exists");
await act(async () => {
  comboboxInput.focus();
  setValue(comboboxInput, "pseudo");
});
let items = Array.from(doc.querySelectorAll('[data-slot="combobox-item"]')) as any[];
assert(items.length === 1, `filter 'pseudo' -> 1 item (got ${items.length})`);
assert(items[0]?.textContent?.includes("Pseudodiaptomus forbesi"), "filtered item is P. forbesi");

// 4. Empty state
await act(async () => setValue(comboboxInput, "zzzz"));
assert(text().includes("Nenhum táxon encontrado."), "empty state shown");

// 5. Re-type and press Enter -> selects the first (highlighted) item
await act(async () => setValue(comboboxInput, "pseudo"));
items = Array.from(doc.querySelectorAll('[data-slot="combobox-item"]')) as any[];
await act(async () => {
  comboboxInput.dispatchEvent(new wins.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
});
assert(qtdRef()?.closest(".invisible") == null, "Enter selects first item");
const qtdInput = doc.getElementById("qtd") as any;
assert(!!qtdInput, "count input appears after selection");
await act(async () => setValue(qtdInput, "3"));
const registrar = Array.from(doc.querySelectorAll("button")).find((b) =>
  (b as any).textContent.includes("Registrar"),
) as any;
assert(!!registrar, "Registrar button exists");
await act(async () => click(registrar));
assert(text().includes("3</strong> ocorrências") || /3 ocorrências/.test(text().replace(/</g, " ")), "running total 3");
assert(text().includes("3 ocorr."), "taxon panel shows 3 ocorr.");

// 7. Same taxon again with 2 -> sums
await act(async () => {
  (doc.querySelector('input[placeholder^="Ex.:"]') as any).focus();
  setValue(doc.querySelector('input[placeholder^="Ex.:"]') as any, "pseudo");
});
items = Array.from(doc.querySelectorAll('[data-slot="combobox-item"]')) as any[];
await act(async () => click(items[0]));
await act(async () => setValue(doc.getElementById("qtd") as any, "2"));
await act(async () => click(Array.from(doc.querySelectorAll("button")).find((b) => (b as any).textContent.trim() === "Registrar") as any));
assert(text().includes("5 ocorr."), "taxon panel now 5 ocorr.");

// 8. Undo
const desfazer = Array.from(doc.querySelectorAll("button")).find((b) =>
  (b as any).textContent.includes("Desfazer"),
) as any;
await act(async () => click(desfazer));
assert(text().includes("Desfeito: P. forbesi (+2)"), "undo shows what was reverted");
assert(text().includes("total voltou para 3"), "undo restores previous total");
assert(text().includes("3 ocorr."), "taxon panel back to 3 ocorr.");

// 9. Second taxon -> rows in name order, green diff only on the most recent row
await act(async () => {
  const inp = doc.querySelector('input[placeholder^="Ex.:"]') as any;
  inp.focus();
  setValue(inp, "diaptomus");
});
items = Array.from(doc.querySelectorAll('[data-slot="combobox-item"]')) as any[];
const diapt = items.find((i) => i.textContent?.includes("Diaptomus sicilianus"));
assert(!!diapt, "Diaptomus sicilianus item found");
await act(async () => click(diapt));
await act(async () => setValue(doc.getElementById("qtd") as any, "2"));
await act(async () =>
  click(Array.from(doc.querySelectorAll("button")).find((b) => (b as any).textContent.trim() === "Registrar") as any),
);
const tituloT = Array.from(doc.querySelectorAll('[data-slot="card-title"]')).find(
  (el) => el.textContent === "Táxons",
);
const conteudo = tituloT?.closest('[data-slot="card"]')?.querySelector('[data-slot="card-content"]');
const ems = Array.from(conteudo?.querySelectorAll("em") ?? []);
const nomes = ems.map((e) => e.textContent ?? "");
const linhas = ems.map((e) => e.closest("div")?.textContent ?? "");
assert(
  JSON.stringify(nomes) === JSON.stringify([...nomes].sort((a, b) => a.localeCompare(b))),
  `rows in name order: ${nomes}`,
);
const iDiapt = nomes.indexOf("Diaptomus sicilianus");
assert(
  (linhas[iDiapt] ?? "").includes("+2") && (linhas[iDiapt] ?? "").includes("2 ocorr."),
  `most recent row has green diff: ${linhas[iDiapt]}`,
);
assert(
  linhas.length === 2 && linhas.every((l, i) => i === iDiapt || !/\+\d/.test(l)),
  `diff only on most recent row: ${linhas}`,
);

// 9b. Step footer: "Próxima etapa" advances, "Voltar" goes back
const botao = (txt: string) =>
  Array.from(doc.querySelectorAll("button")).find((b: any) =>
    b.textContent.includes(txt),
  ) as any;
assert(!!botao("Próxima etapa"), "'Próxima etapa' button exists");
assert(!!botao("Voltar") && botao("Voltar").disabled, "'Voltar' disabled on step 1");
await act(async () => click(botao("Próxima etapa")));
assert(
  Array.from(doc.querySelectorAll("main > section"))
    .find((s: any) => !s.hidden)?.textContent?.includes("Revisão de contagens"),
  "button navigates to step 2",
);
await act(async () => click(botao("Voltar")));
assert(
  Array.from(doc.querySelectorAll("main > section"))
    .find((s: any) => !s.hidden)?.textContent?.includes("Registrar ocorrência"),
  "'Voltar' goes back to step 1",
);

// 9c. Hovering "Desfazer última entrada" highlights the diff number
const desfazerBtn = botao("Desfazer última entrada");
const diff = Array.from(doc.querySelectorAll("main span")).find(
  (s: any) => s.textContent === "+2" && (s.className ?? "").includes("text-green-600"),
) as any;
assert(!!diff, "diff number found on most recent row");
assert(!diff.className.includes("bg-amber-200"), "diff not highlighted before hover");
await act(async () => {
  desfazerBtn.dispatchEvent(new wins.MouseEvent("mouseover", { bubbles: true }));
});
assert(diff.className.includes("bg-amber-200"), "diff highlighted on hover");
await act(async () => {
  desfazerBtn.dispatchEvent(new wins.MouseEvent("mouseout", { bubbles: true }));
});
assert(!diff.className.includes("bg-amber-200"), "highlight removed on mouse leave");

// 10. Step 2: editable table (navigates via the step dots)
const dots = () => Array.from(doc.querySelectorAll("nav button")) as any[];
assert(dots().length === 3, `3 step dots (got ${dots().length})`);
const visivel = () =>
  Array.from(doc.querySelectorAll("main > section")).find((s: any) => !s.hidden) as any;
await act(async () => click(dots()[1]));
assert(visivel()?.textContent?.includes("Revisão de contagens"), "table page shown");
let celulas = Array.from(visivel().querySelectorAll("input[type=number]")) as any[];
assert(celulas.length === 2, `table has one input per taxon (got ${celulas.length})`);
assert(celulas[0].value === "2" && celulas[1].value === "3", "rows Diaptomus 2, P. forbesi 3");

// edit P. forbesi 3 -> 7 (Enter commits)
await act(async () => {
  setValue(celulas[1], "7");
  celulas[1].dispatchEvent(new wins.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
});
assert(visivel().textContent?.includes("9 ocorr."), "table total 9 ocorr.");

// state is shared: back to step 1
await act(async () => click(dots()[0]));
assert(text().includes("7 ocorr."), "page 1 shows 7 ocorr. for P. forbesi");
assert(/9 ocorrências/.test(text()), "page 1 total 9 ocorrências");

// back to step 2: explicit 0 removes the taxon
await act(async () => click(dots()[1]));
celulas = Array.from(visivel().querySelectorAll("input[type=number]")) as any[];
await act(async () => {
  setValue(celulas[0], "0");
  celulas[0].dispatchEvent(new wins.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
});
const apos = Array.from(visivel().querySelectorAll("input[type=number]")) as any[];
assert(apos.length === 1 && apos[0].value === "7", "zero removes the Diaptomus row");
assert(visivel().textContent?.includes("7 ocorr."), "table total 7 ocorr. after removal");

// last step: no footer navigation
await act(async () => click(dots()[2]));
assert(!botao("Próxima etapa"), "no 'Próxima etapa' on the last step");
assert(!botao("Voltar"), "no 'Voltar' on the last step");

// resumo: done message, amostra, taxa with ocorrência counts
const resumo = Array.from(doc.querySelectorAll("main > section")).find((s: any) => !s.hidden) as any;
assert(resumo.textContent.includes("Amostra finalizada"), "done message shown");
assert(
  resumo.textContent.includes("A-17") && resumo.textContent.includes("22°51′S"),
  "amostra shown on summary",
);
const linhasResumo = Array.from(resumo.querySelectorAll("tbody em")).map((e: any) =>
  e.closest("tr")?.textContent,
);
assert(
  JSON.stringify(linhasResumo) === JSON.stringify(["Pseudodiaptomus forbesi7"]),
  `summary lists remaining taxon with count: ${linhasResumo}`,
);
assert(!resumo.textContent.includes("Diaptomus sicilianus"), "removed taxon absent from summary");

// "Registrar nova amostra" resets entries and goes back to step 1
const nova = botao("Registrar nova amostra");
assert(!!nova, "'Registrar nova amostra' button exists");
await act(async () => click(nova));
const inicio = Array.from(doc.querySelectorAll("main > section")).find((s: any) => !s.hidden) as any;
assert(inicio.textContent.includes("Registrar ocorrência"), "back on step 1");
assert(inicio.textContent.includes("Nenhum táxon registrado ainda."), "entries cleared");

console.log("done");
