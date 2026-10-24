import { formatarPorcentagem } from './formatar.js';

function numeroFinito(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

export function margemSobrePreco(markup) {
  const valor = numeroFinito(markup);
  return valor / (1 + valor);
}

export function markupPorMargem(margem) {
  const valor = numeroFinito(margem);
  return valor >= 1 ? null : valor / (1 - valor);
}

export function descreverLucro(markup) {
  const valor = numeroFinito(markup);
  return `Lucro de ${formatarPorcentagem(valor)} sobre o custo = ${formatarPorcentagem(margemSobrePreco(valor))} do preço de venda`;
}
