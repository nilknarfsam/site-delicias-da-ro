import { normalizarIngrediente } from './normalizar.js';
import { calcularPrecificacao } from './precificacao.js';

export function aplicarCascataDaDispensa(ingredienteDispensa, receitas, agora = new Date().toISOString()) {
  let atualizadas = 0;
  const nome = normalizarIngrediente(ingredienteDispensa.nome);
  const temIdDispensa = ingredienteDispensa.id != null
    && String(ingredienteDispensa.id).trim() !== '';
  const campos = ['precoBase', 'quantidadeBase', 'unidadeBase', 'tipoMedida'];
  const resultado = receitas.map((receita) => {
    let alterada = false;
    const ingredientes = (receita.ingredientes ?? []).map((ing) => {
      const temVinculo = ing.pantryIngredientId != null
        && String(ing.pantryIngredientId).trim() !== '';
      const correspondePorId = temIdDispensa && temVinculo
        && ing.pantryIngredientId === ingredienteDispensa.id;
      const corresponde = correspondePorId
        || (!temVinculo && normalizarIngrediente(ing.nome) === nome);
      if (!corresponde) return ing;
      const mudou = ing.pantryIngredientId !== ingredienteDispensa.id
        || campos.some((campo) => ing[campo] !== ingredienteDispensa[campo]);
      if (!mudou) return ing;
      alterada = true;
      return {
        ...ing,
        ...Object.fromEntries(campos.map((campo) => [campo, ingredienteDispensa[campo]])),
        pantryIngredientId: ingredienteDispensa.id,
      };
    });
    if (!alterada) return receita;
    atualizadas += 1;
    const calculo = calcularPrecificacao({ ...receita, ingredientes });
    return {
      ...receita,
      ingredientes: calculo.ingredientes,
      custoTotal: calculo.custoTotal,
      precoSugerido: calculo.precoSugerido,
      dataAtualizacao: agora,
    };
  });
  return { receitas: resultado, atualizadas };
}
