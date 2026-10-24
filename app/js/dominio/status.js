function positivo(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0;
}

export function derivarStatus(receita) {
  const ingredientes = receita.ingredientes ?? [];
  const contemEstimativas = ingredientes.some((ing) => ing.precisaRevisao === true);
  const contemAlternativas = ingredientes.some((ing) => (ing.grupoAlternativa ?? '').trim() !== '');
  const faltamDados = ingredientes.length === 0 || ingredientes.some((ing) =>
    !positivo(ing.precoBase) || !positivo(ing.quantidadeBase)
    || !positivo(ing.quantidadeUsada) || (ing.unidadeBase ?? '').trim() === '');
  const revisar = contemEstimativas || contemAlternativas;
  const tipo = !receita.isPrecified || faltamDados ? 'pendente' : revisar ? 'revisarDados' : 'pronta';
  const rotulos = { pendente: 'Pendente', revisarDados: 'Revisar dados', pronta: 'Pronta' };
  const itensPendentes = [];
  if (!receita.isPrecified) itensPendentes.push('Precificação ainda não concluída');
  if (contemEstimativas) itensPendentes.push('Contém estimativas de ingredientes');
  if (contemAlternativas) itensPendentes.push('Há ingredientes alternativos');
  if (faltamDados) itensPendentes.push('Faltam dados essenciais para cálculo final');
  if (revisar) itensPendentes.push('Revisar dados antes de concluir');
  return { tipo, rotulo: rotulos[tipo], contemEstimativas, contemAlternativas, itensPendentes };
}
