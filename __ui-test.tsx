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
assert(text().includes("3 ind."), "taxon panel shows 3 ind.");

// 7. Same taxon again with 2 -> sums
await act(async () => {
  (doc.querySelector('input[placeholder^="Ex.:"]') as any).focus();
  setValue(doc.querySelector('input[placeholder^="Ex.:"]') as any, "pseudo");
});
items = Array.from(doc.querySelectorAll('[data-slot="combobox-item"]')) as any[];
await act(async () => click(items[0]));
await act(async () => setValue(doc.getElementById("qtd") as any, "2"));
await act(async () => click(Array.from(doc.querySelectorAll("button")).find((b) => (b as any).textContent.trim() === "Registrar") as any));
assert(text().includes("5 ind."), "taxon panel now 5 ind.");

// 8. Undo
const desfazer = Array.from(doc.querySelectorAll("button")).find((b) =>
  (b as any).textContent.includes("Desfazer"),
) as any;
await act(async () => click(desfazer));
assert(text().includes("Desfeito: P. forbesi (+2)"), "undo shows what was reverted");
assert(text().includes("total voltou para 3"), "undo restores previous total");
assert(text().includes("3 ind."), "taxon panel back to 3 ind.");

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
  (linhas[iDiapt] ?? "").includes("+2") && (linhas[iDiapt] ?? "").includes("2 ind."),
  `most recent row has green diff: ${linhas[iDiapt]}`,
);
assert(
  linhas.length === 2 && linhas.every((l, i) => i === iDiapt || !/\+\d/.test(l)),
  `diff only on most recent row: ${linhas}`,
);

console.log("done");
