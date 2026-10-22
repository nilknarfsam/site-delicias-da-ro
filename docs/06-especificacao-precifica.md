# 06 – Especificação do Precifica Rô Web

Fonte: leitura do repositório `precifica_ro_mobile` (commit `afa222a`, 22/10/2026, ~13.400 linhas Dart). Os caminhos citados são desse repositório. Na dúvida sobre um comportamento, conferir lá; se o app antigo e este documento divergirem, perguntar ao Franklin.

## 1. Inventário do app antigo

Navegação (`presentation/pages/main_navigation_page.dart`): **Precificação · Dispensa · Biblioteca · Orçamentos · Configurações**.

| Módulo | Funções | Onde está |
|---|---|---|
| Biblioteca | Listar, buscar, cadastrar, editar, excluir, importar receita por JSON, backup e restauração (só da Biblioteca), limpar tudo, levar para a Precificação | `domain/library/`, `presentation/library/` |
| Dispensa | Ingrediente com preço pela embalagem (`precoBase` por `quantidadeBase` `unidadeBase`), tipo peso/volume ou unidade; mudou o preço → cascata nas precificações | `domain/pantry/`, `presentation/pages/dispensa_page.dart` |
| Precificação | Ingredientes, custos adicionais (extras diretos), custos indiretos, taxa operacional %, rendimento, lucro %, preço sugerido, custo e preço por unidade, status, categorias do usuário, copiar resumo, PDF da receita | `domain/usecases/`, `presentation/pages/pricing_page.dart`, `recipe_summary_page.dart` |
| Orçamentos | Modelos de texto ("Bolos personalizados", "Docinhos"), criar modelo, copiar, compartilhar texto, gerar PDF e compartilhar | `presentation/sales/` |

## 2. Entidades

**Ingrediente da Dispensa** (`PantryIngredient`): `id`, `nome`, `precoBase`, `quantidadeBase`, `unidadeBase` (padrão `g`), `tipoMedida` (`peso` | `unidade`).

**Ingrediente da receita** (`RecipeIngredient`): `nome`, `tipoMedida`, `precoBase`, `quantidadeBase`, `quantidadeUsada`, `unidadeBase`, `custoCalculado`, `grupoAlternativa?`, `precisaRevisao?`, `pantryIngredientId?`.

**Precificação** (`Recipe`): `id`, `nome`, `categoria`, `descricao?`, `modoPreparo?`, `ingredientes[]`, `custosAdicionais[]` e `custosIndiretos[]` (cada um `{nome, valor, tipo: fixo|variavel}`), `margem?` (lucro, fração), `taxaOperacional?` (fração), `rendimentoQuantidade?`, `rendimentoTipo?` (unidade, fatia, porção, bolo inteiro…), `rendimentoProntoQuantidade?`, `rendimentoProntoUnidade?`, `custoTotal?`, `precoSugerido?`, `isPrecified`, `dataCriacao`, `dataAtualizacao`, `vezesAcessada`.

**Receita da Biblioteca** (`LibraryRecipe`): `id`, `nome`, `categoria`, `descricao?`, `ingredientes[]`, `modoPreparo?`, `observacoes?`, `origem?`, `dataCriacao`, `localidadeCidade?`, `localidadeEstado?`, `rendimento?` (texto), `tempoPreparo?`, `dificuldade?`, `autor?`. Ingrediente: `nome`, `tipoMedida?`, `grupo?`, `quantidadeOriginal?` (texto, ex.: "2 xícaras"), `quantidadeBase?`, `unidadeBase?`, `precoBase?`, `quantidadeUsada?`, `unidadeUsada?`, `precisaRevisao?`, `observacao?`, `tipoItem?`, `grupoAlternativa?`.

**Importação por JSON** (`domain/library/usecases/import_library_recipe_from_json.dart`): aceita apelidos de campo (ex.: `nome`/`name`, `modoPreparo`/`preparo`/`modo_preparo`, `rendimento`/`yield`/`porcoes`, `quantidadeOriginal`/`quantidade`/`quantity`). **Manter os mesmos apelidos** para os JSONs gerados no GPT continuarem funcionando.

## 3. Fórmulas (`domain/usecases/calculate_recipe_pricing.dart`)

```
custoIngrediente   = (precoBase / quantidadeBase) × quantidadeUsada      (quantidadeBase ≤ 0 → usa 1)
  • grupoAlternativa: só o PRIMEIRO ingrediente de cada grupo entra na soma; os outros ficam com custo 0
custoIngredientes  = Σ custoIngrediente
custoInsumos       = custoIngredientes + Σ custosAdicionais.valor
valorTaxaOperac.   = custoInsumos × taxaOperacional                     (padrão 0,30)
custoTotal         = custoInsumos + valorTaxaOperac.
precoSugerido      = custoTotal × (1 + margem)                           (padrão margem 1,0 = lucro de 100% sobre o custo)
custoPorUnidade    = custoTotal / rendimentoQuantidade
precoPorUnidade    = precoSugerido / rendimentoQuantidade
```

**Status** (`derive_pricing_status.dart`):
- **Pendente**: não precificada, ou sem ingredientes, ou algum ingrediente com `precoBase`, `quantidadeBase` ou `quantidadeUsada` ≤ 0 ou `unidadeBase` vazia.
- **Revisar dados**: tem ingrediente com `precisaRevisao` ou com `grupoAlternativa`.
- **Pronta**: o resto.

**Cascata da Dispensa** (`apply_pantry_price_cascade_to_recipes.dart`): ao salvar um ingrediente da Dispensa, atualiza em todas as precificações os ingredientes ligados por `pantryIngredientId` **ou**, se não tiverem vínculo, com o mesmo nome normalizado (`shared/ingredient_normalizer.dart`); troca preço, base e unidade, mantém a quantidade usada, recalcula e grava o vínculo.

**Biblioteca → Precificação** (`convert_library_recipe_to_pricing_draft.dart`): cria uma precificação nova a partir da receita de referência; a Biblioteca não muda.

## 4. Exemplo para os testes (`app/tests/precificacao.test.js`)

| Ingrediente | Embalagem | Usa | Custo |
|---|---|---|---|
| Farinha de trigo | R$ 6,00 / 1000 g | 300 g | R$ 1,80 |
| Açúcar | R$ 5,00 / 1000 g | 250 g | R$ 1,25 |
| Ovos | R$ 18,00 / 30 un | 4 un | R$ 2,40 |
| Chocolate em pó | R$ 24,00 / 400 g | 80 g | R$ 4,80 |
| Manteiga (grupo "gordura") | R$ 12,00 / 200 g | 100 g | R$ 6,00 |
| Margarina (grupo "gordura") | R$ 8,00 / 500 g | 100 g | R$ 0,00 (alternativa, não soma) |

Custos adicionais: topper R$ 8,00. Taxa operacional 30 %. Lucro 100 %. Rendimento 14 fatias.

| Resultado | Valor esperado |
|---|---|
| Custo dos ingredientes | R$ 16,25 |
| Custo dos insumos | R$ 24,25 |
| Taxa operacional | R$ 7,275 |
| Custo total | R$ 31,525 |
| Preço sugerido | R$ 63,05 |
| Custo por fatia | R$ 2,2518 (exibe R$ 2,25) |
| Preço por fatia | R$ 4,5036 (exibe R$ 4,50) |
| Status | Revisar dados (tem alternativa) |

Arredondar só na exibição, nunca no meio da conta.

## 5. Problemas encontrados no app antigo (corrigir na versão web)

1. **Backup incompleto:** só exporta a Biblioteca. Dispensa, precificações e categorias não saem. → Backup completo (`docs/02`).
2. **Modelos de orçamento não são salvos:** ficam fixos no código; o que a Rô edita some ao fechar. → Coleção `modelosOrcamento`. Os textos atuais (em `presentation/sales/controllers/orcamentos_controller.dart`) servem de modelo inicial, mas **trocar o @ antigo pelo @chefrosangelavieira** e pedir à Rô para confirmar os valores.
3. **PDF do orçamento é só texto corrido**, não uma tabela de verdade. → Gerar tabela (tamanho/aro, fatias, valor) a partir de dados do modelo.
4. **Custos indiretos são só informativos:** a tela pede Embalagem, Gás/energia, Mão de obra, Taxas e Outros, mas esses valores **não entram** no custo total (o resumo escreve "informativo"). A taxa operacional de 30 % faz esse papel. → Decisão para a Rô (ver `docs/07`): cada precificação usa **ou** a taxa operacional **ou** os custos indiretos detalhados, nunca os dois, para não contar duas vezes. Sugestão: padrão = taxa %, com a opção "detalhar custos" que troca a taxa pela soma.
5. **Duas ideias de lucro no código:** a tela usa *markup* sobre o custo (`custo × (1 + lucro)`), mas existe uma função não usada de *margem sobre o preço* (`custo / (1 − margem)`, `domain/pricing/preco_sugerido_margem.dart`). → Mostrar as duas leituras na tela: "Lucro de 100 % sobre o custo = 50 % do preço de venda". O cálculo continua por markup.
6. **Fórmula antiga esquecida:** `calculate_recipe_cost.dart` (fluxo legado) divide o preço de "unidade" por 30. Não portar.
7. PDF e compartilhamento estavam na camada de domínio usando `dart:io`. → Na web, ficam em `app/js/pdf/`, fora do domínio.

## 6. Novo módulo: Massas e rendimento (Fase 3A)

O que faltou no app: trazer o mundo físico da cozinha para a conta. Hoje o "rendimento" é um número digitado (14 fatias); a Rô não consegue dizer quanto rende **uma batida de massa** nem quanto da massa vai em cada bolo.

### Conceitos

- **Base**: receita que vira ingrediente de outras (massa branca, massa de chocolate, recheio de ninho, brigadeiro de cobertura, chantininho). Tem ingredientes da Dispensa, como qualquer receita.
- **Rendimento pesado**: depois de pronta, a Rô pesa a base. Ex.: massa branca rende **1.450 g** assada (ou crua, ela escolhe e o app guarda qual).
- **Custo por grama** da base = custo dos ingredientes da base / rendimento pesado.
- **Aro**: tamanho de forma (11, 13, 15, 17, 20, 25 cm…), com quanto de cada base vai nele (ex.: aro 15 = 700 g de massa, 450 g de recheio, 350 g de cobertura) e quantas fatias rende. Esses números a Rô mede uma vez e o app guarda.

### O que a tela faz

1. **Precificar um bolo por aro:** escolhe o aro e as bases → o app calcula o custo pelo peso de cada base, soma custos adicionais, taxa e lucro, e dá o preço do aro e da fatia.
2. **Calculadora de batidas:** "tenho encomenda de 1 aro 15 e 1 aro 20" → quantas batidas de massa e de recheio fazer, quanto sobra e o custo total.
3. **Viabilidade:** comparar o preço sugerido de cada aro com o preço da tabela de orçamento da Rô e marcar onde ela está ganhando pouco.
4. **Tabela de orçamento gerada daqui:** os aros com fatias e preço alimentam o modelo de orçamento (fim de digitar a tabela duas vezes).

### Perguntas para a Rô antes de construir

- Ela pesa a massa crua ou assada? Quanto perde no forno, mais ou menos?
- Quanto de massa, recheio e cobertura vai em cada aro hoje (mesmo que de olho)?
- Quantas fatias ela considera por aro (a tabela atual: aro 11 = 7 a 9; 13 = 10 a 12; 15 = 12 a 15; 17 = 16 a 19; 20 = 20 a 25; 25 = 38 a 40)?
- Recheio premium: acréscimo fixo por tamanho ou calculado pelo custo?
