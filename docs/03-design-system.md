# 03 – Design system

Base: manual de marca `MARCA-DELICIAS-DA-RO.md` (v2, 17/10/2026, guardado no projeto DELÍCIAS DA RÔ do Claude; o que interessa ao site está resumido aqui e em `conteudo/dados-da-confeitaria.md`) e a direção do app Precifica Rô (elegante e premium, creme, chocolate, rosa suave e caramelo, nada infantil ou poluído). Se a skill **estudio-visual-franklin** estiver instalada, usar para as artes da capa e das datas especiais.

O site **não é um post**: o manual foi feito para posts (Fredoka, 60-30-10, botão vermelho). No site, o tom é mais sóbrio e premium. As cores são as mesmas da marca.

## Cores (tokens em `css/variaveis.css`)

| Token | Hex | Uso |
|---|---|---|
| `--cor-fundo` | `#FFF7F5` (Fundo Nuvem) | Fundo principal |
| `--cor-fundo-2` | `#FBE3E1` (Blush) | Faixas alternadas, cartões de destaque |
| `--cor-creme` | `#EEE4D1` (Creme Chantilly) | Cartões, áreas neutras |
| `--cor-borda` | `#F6CBCD` (Borda Pétala) | Contornos |
| `--cor-texto` | `#4A2329` (chocolate escuro, a validar) | Texto corrido |
| `--cor-texto-2` | `#6E2A33` (Cacau) | Títulos, subtítulos |
| `--cor-rosa` | `#E99892` (Rosa Rô) | Detalhes, ícones, fios (não usar em texto pequeno sobre fundo claro: contraste baixo) |
| `--cor-caramelo` | `#C58B4B` | Detalhes premium, linhas finas, selos |
| `--cor-acao` | `#CC2D1F` (Vermelho Morango) | Só o botão principal (WhatsApp / ação principal) e alertas |
| `--cor-whatsapp` | `#1F8F4E` (verde escurecido, a validar) | Ícone do WhatsApp quando aparecer sozinho |

Medir o contraste de cada par texto/fundo (≥ 4,5:1) e ajustar o tom do chocolate se precisar. Modo escuro não entra na v1.

## Tipografia (Google Fonts)

| Função | Fonte |
|---|---|
| Títulos | **Fraunces** (escolhida pelo Franklin em 23/10/2026) |
| Texto e interface | **Nunito** (600 a 800) |
| Frase afetiva curta | **Dancing Script**, só em frases curtas e nunca em texto corrido |

No máximo 3 famílias. Na área da Rô, só Nunito e a serifada nos títulos de tela.

## Componentes do site

- Botão principal em pílula (Vermelho Morango, texto branco), botão secundário com contorno Cacau.
- Botão flutuante do WhatsApp em todas as telas, que não cobre o conteúdo do rodapé.
- Cartão de produto: foto real 4:5, nome, descrição curta, "a partir de" ou "consulte", botão "Pedir este".
- Cantos arredondados (16px nos cartões, pílula nos botões), sombras suaves, respiro generoso.
- Logo horizontal original no topo; o "R" sozinho como ícone do site e da área da Rô.

## Área da Rô: princípios de usabilidade

A Rô achou o app antigo pouco prático. Estas regras são o centro da reescrita:

1. **Uma ação principal por tela**, num botão grande e fixo embaixo, ao alcance do polegar.
2. **Menos passos:** montar uma precificação em uma tela só, com seções que abrem e fecham (Ingredientes, Custos, Rendimento, Lucro), e o preço sempre visível num rodapé fixo que atualiza enquanto ela digita.
3. **Salvar sozinho** (rascunho automático) e "Desfazer" depois de excluir.
4. **Teclado certo:** `inputmode="decimal"` nos números, vírgula como separador decimal, R$ formatado ao sair do campo.
5. **Letra legível:** texto mínimo de 16px; números de preço grandes.
6. **Buscar sempre à mão:** campo de busca no topo da Dispensa, Biblioteca e Precificação; ao adicionar ingrediente numa receita, buscar na Dispensa enquanto digita.
7. **Linguagem da cozinha:** "embalagem de 1 kg por R$ 6,00", "usa 300 g", em vez de "preço base / quantidade base".
8. **Navegação:** barra inferior com até 5 itens no celular (Início, Precificação, Dispensa, Biblioteca, Mais); barra lateral no computador.
9. Antes de cada etapa visual da área da Rô, o Claude Code mostra um protótipo navegável de 2 ou 3 telas para o Franklin testar com a Rô no celular dela.
