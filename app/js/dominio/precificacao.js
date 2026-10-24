function numeroFinito(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function numeroOuPadrao(valor, padrao) {
  if (valor == null || (typeof valor === 'string' && valor.trim() === '')) return padrao;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : padrao;
}

export function calcularCustoIngrediente(ing) {
  const quantidadeBase = numeroFinito(ing.quantidadeBase);
  return (numeroFinito(ing.precoBase) / (quantidadeBase > 0 ? quantidadeBase : 1))
    * numeroFinito(ing.quantidadeUsada);
}

export function calcularPrecificacao(receita) {
  const grupos = new Set();
  const ingredientes = (receita.ingredientes ?? []).map((ingrediente) => {
    const grupo = (ingrediente.grupoAlternativa ?? '').trim();
    const alternativa = grupo !== '' && grupos.has(grupo);
    if (grupo !== '') grupos.add(grupo);
    return {
      ...ingrediente,
      custoCalculado: alternativa ? 0 : calcularCustoIngrediente(ingrediente),
    };
  });
  const custoIngredientes = ingredientes.reduce((soma, ing) => soma + ing.custoCalculado, 0);
  const custoAdicional = (receita.custosAdicionais ?? [])
    .reduce((soma, custo) => soma + numeroFinito(custo.valor), 0);
  const custoInsumos = custoIngredientes + custoAdicional;
  const taxaOperacional = numeroOuPadrao(receita.taxaOperacional, 0.30);
  const valorTaxaOperacional = custoInsumos * taxaOperacional;
  const custoTotal = custoInsumos + valorTaxaOperacional;
  const margem = numeroOuPadrao(receita.margem, 1.0);
  const precoSugerido = custoTotal * (1 + margem);
  const rendimento = numeroFinito(receita.rendimentoQuantidade);

  return {
    ingredientes, custoIngredientes, custoAdicional, custoInsumos,
    taxaOperacional, valorTaxaOperacional, custoTotal, margem, precoSugerido,
    custoPorUnidade: rendimento > 0 ? custoTotal / rendimento : null,
    precoPorUnidade: rendimento > 0 ? precoSugerido / rendimento : null,
  };
}
