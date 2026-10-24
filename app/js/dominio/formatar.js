const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const porcentagem = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function numeroFormatavel(valor) {
  if (valor == null || typeof valor === 'boolean'
    || (typeof valor === 'string' && valor.trim() === '')) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

export function formatarMoeda(valor) {
  const numero = numeroFormatavel(valor);
  if (numero == null) return '—';
  return moeda.format(numero).replace(/[\u00a0\u202f]/g, ' ');
}

export function formatarPorcentagem(fracao) {
  const numero = numeroFormatavel(fracao);
  if (numero == null) return '—';
  return `${porcentagem.format(numero * 100)} %`;
}
