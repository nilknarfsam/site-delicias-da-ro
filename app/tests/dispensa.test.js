import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UNIDADES, paraArmazenamento, paraFormulario, validarIngrediente, precoReferencia,
  descreverEmbalagem, chaveBusca, filtrarIngredientes, mudouPreco,
} from '../js/dominio/dispensa.js';

const formulario = { nome: ' Farinha  de\n trigo ', preco: '6,50', quantidade: '1', unidade: 'kg' };
const ingrediente = {
  nome: 'Farinha de trigo', precoBase: 6.5, quantidadeBase: 1000, unidadeBase: 'g', tipoMedida: 'peso',
};

test('unidades disponíveis conservam a distinção de volume no catálogo', () => {
  assert.deepEqual(UNIDADES.map((item) => item.id), ['g', 'kg', 'ml', 'L', 'un']);
  assert.deepEqual(UNIDADES.find((item) => item.id === 'L'),
    { id: 'L', rotulo: 'L', base: 'ml', fator: 1000, tipoMedida: 'volume' });
});

test('armazenamento limpa nome, aceita vírgula decimal e converte kg para g', () => {
  const antes = structuredClone(formulario);
  assert.deepEqual(paraArmazenamento(formulario), ingrediente);
  assert.deepEqual(formulario, antes);
});

test('1,5 L vira 1500 ml, mantendo tipoMedida compatível com o app antigo', () => {
  assert.deepEqual(paraArmazenamento({ ...formulario, quantidade: '1,5', unidade: 'L' }),
    { ...ingrediente, quantidadeBase: 1500, unidadeBase: 'ml' });
  for (const unidade of ['g', 'ml', 'un']) {
    const dados = paraArmazenamento({ ...formulario, quantidade: 500, unidade });
    assert.equal(dados.quantidadeBase, 500);
    assert.equal(dados.unidadeBase, unidade);
    assert.equal(dados.tipoMedida, unidade === 'un' ? 'unidade' : 'peso');
  }
  assert.throws(() => paraArmazenamento({ ...formulario, unidade: 'xícara' }), /Unidade inválida/);
});

test('formulário escolhe kg e L a partir de mil, e conserva unidades pequenas', () => {
  for (const [base, quantidade, unidade, esperada] of [
    ['g', 1000, 'kg', 1], ['g', 500, 'g', 500], ['g', 1250, 'kg', 1.25],
    ['ml', 1500, 'L', 1.5], ['ml', 500, 'ml', 500], ['un', 1500, 'un', 1500],
  ]) {
    const dados = { ...ingrediente, quantidadeBase: quantidade, unidadeBase: base };
    assert.deepEqual(paraFormulario(dados),
      { nome: ingrediente.nome, preco: 6.5, quantidade: esperada, unidade });
    assert.deepEqual(paraArmazenamento(paraFormulario(dados)), {
      ...dados, tipoMedida: base === 'un' ? 'unidade' : 'peso',
    });
  }
});

test('validação permite os cinco tipos de unidade e preços com vírgula', () => {
  for (const { id } of UNIDADES) {
    assert.deepEqual(validarIngrediente({ ...formulario, unidade: id }),
      { valido: true, erros: {}, avisos: {} });
  }
});

test('validação rejeita nome vazio, unidade desconhecida e números inválidos', () => {
  const resultado = validarIngrediente({ nome: '\t ', preco: 0, quantidade: -1, unidade: 'l' });
  assert.equal(resultado.valido, false);
  assert.deepEqual(Object.keys(resultado.erros), ['nome', 'preco', 'quantidade', 'unidade']);
  for (const valor of ['', ' ', null, undefined, false, true, [], {}, NaN, Infinity, -Infinity,
    'Infinity', 'abc', '1,2,3', 0, -0.1]) {
    for (const campo of ['preco', 'quantidade']) {
      const resultado = validarIngrediente({ ...formulario, [campo]: valor });
      assert.equal(resultado.valido, false, `${campo}: ${String(valor)}`);
      assert.deepEqual(Object.keys(resultado.erros), [campo]);
    }
  }
});

test('duplicado normalizado é só aviso, com nome original, e ignora idAtual', () => {
  const existentes = [{ id: 'a', nome: 'Açúcar' }, { id: 'b', nome: 'Margarina' }];
  assert.deepEqual(validarIngrediente({ ...formulario, nome: ' acucar ' }, existentes),
    { valido: true, erros: {}, avisos: { duplicado: 'Açúcar' } });
  assert.deepEqual(validarIngrediente({ ...formulario, nome: 'Açúcar' }, existentes, 'a').avisos, {});
  assert.equal(validarIngrediente({ ...formulario, nome: 'Deline' }, existentes).avisos.duplicado, 'Margarina');
  assert.equal(validarIngrediente({ ...formulario, nome: 'Acucar' }, [
    ...existentes, { id: 'c', nome: 'Açúcar' },
  ], 'a').avisos.duplicado, 'Açúcar');
});

test('referências por kg, L e unidade arredondam apenas na exibição', () => {
  assert.equal(precoReferencia({ ...ingrediente, precoBase: 12, quantidadeBase: 500 }), 'R$ 24,00/kg');
  assert.equal(precoReferencia({ ...ingrediente, precoBase: 6 }), 'R$ 6,00/kg');
  assert.equal(precoReferencia({ ...ingrediente, unidadeBase: 'ml', precoBase: 9, quantidadeBase: 1500 }), 'R$ 6,00/L');
  assert.equal(precoReferencia({ ...ingrediente, unidadeBase: 'un', precoBase: 18, quantidadeBase: 30 }), 'R$ 0,60/un');
  const dados = { ...ingrediente, precoBase: 1, quantidadeBase: 3 };
  assert.equal(precoReferencia(dados), 'R$ 333,33/kg');
  assert.equal(dados.precoBase / dados.quantidadeBase, 1 / 3);
});

test('embalagem usa moeda e quantidade legível com vírgula decimal', () => {
  assert.equal(descreverEmbalagem({ ...ingrediente, precoBase: 6 }), 'R$ 6,00 por 1 kg');
  assert.equal(descreverEmbalagem({ ...ingrediente, unidadeBase: 'ml', quantidadeBase: 1500 }), 'R$ 6,50 por 1,5 L');
  assert.equal(descreverEmbalagem({ ...ingrediente, quantidadeBase: 500 }), 'R$ 6,50 por 500 g');
  assert.equal(descreverEmbalagem({ ...ingrediente, unidadeBase: 'un', quantidadeBase: 30 }), 'R$ 6,50 por 30 un');
});

test('busca ignora acentos, caixa e espaços extras e ordena sem alterar a lista', () => {
  assert.equal(chaveBusca('  AÇÚCAR  de\n Baunilha '), 'acucar de baunilha');
  assert.equal(chaveBusca(null), '');
  const lista = [{ nome: 'Ovos' }, { nome: 'Farinha' }, { nome: 'Açúcar' }, { nome: 'Açúcar mascavo' }];
  const antes = structuredClone(lista);
  assert.deepEqual(filtrarIngredientes(lista, 'acucar').map((item) => item.nome), ['Açúcar', 'Açúcar mascavo']);
  assert.deepEqual(filtrarIngredientes(lista, '').map((item) => item.nome), ['Açúcar', 'Açúcar mascavo', 'Farinha', 'Ovos']);
  assert.deepEqual(filtrarIngredientes(lista, 'inexistente'), []);
  assert.deepEqual(lista, antes);
});

test('mudouPreco compara preço, quantidade e unidade, mesmo com a mesma proporção', () => {
  assert.equal(mudouPreco(ingrediente, { ...ingrediente, nome: 'Outro', tipoMedida: 'volume' }), false);
  for (const alteracao of [{ precoBase: 7 }, { quantidadeBase: 500 }, { unidadeBase: 'ml' },
    { precoBase: 13, quantidadeBase: 2000 }]) {
    assert.equal(mudouPreco(ingrediente, { ...ingrediente, ...alteracao }), true);
  }
});
