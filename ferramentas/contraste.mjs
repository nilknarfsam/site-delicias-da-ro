// Mede o contraste (fórmula WCAG 2.1) dos pares de cor usados no site.
// Uso: node ferramentas/contraste.mjs   (sai com código 1 se algum par de texto ficar abaixo de 4,5:1)
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/variaveis.css', import.meta.url), 'utf8');
const cor = (nome) => {
  const m = css.match(new RegExp(`--${nome}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error('Token não encontrado: ' + nome);
  return m[1];
};

const luminancia = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a, b) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// [texto, fundo, uso, mínimo]
const pares = [
  ['cor-texto', 'cor-fundo', 'texto corrido no fundo', 4.5],
  ['cor-texto', 'cor-fundo-2', 'texto corrido em faixa Blush', 4.5],
  ['cor-texto', 'cor-creme', 'texto em cartão creme / marcador pendente', 4.5],
  ['cor-texto-2', 'cor-fundo', 'títulos e links no fundo', 4.5],
  ['cor-texto-2', 'cor-fundo-2', 'títulos e menu ativo em Blush', 4.5],
  ['cor-branco', 'cor-acao', 'botão principal', 4.5],
  ['cor-branco', 'cor-acao-escura', 'botão principal (hover)', 4.5],
  ['cor-branco', 'cor-texto-2', 'botão contorno (hover) e "pular para o conteúdo"', 4.5],
  ['cor-rodape-texto', 'cor-rodape', 'texto do rodapé', 4.5],
  ['cor-rosa', 'cor-fundo', 'Rosa Rô (só detalhe, não texto)', 0],
  ['cor-caramelo', 'cor-fundo', 'Caramelo (só fios, não texto)', 0],
];

let falhou = false;
for (const [t, f, uso, minimo] of pares) {
  const r = razao(cor(t), cor(f));
  const ok = r >= minimo;
  if (!ok) falhou = true;
  const marca = minimo === 0 ? 'info' : ok ? 'ok  ' : 'FALHA';
  console.log(`${marca}  ${r.toFixed(2).padStart(5)}:1  ${t} sobre ${f}  (${uso})`);
}
process.exit(falhou ? 1 : 0);
