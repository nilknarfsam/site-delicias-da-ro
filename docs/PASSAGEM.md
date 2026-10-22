# Passagem de bastão

Arquivo vivo. Quem trabalhar no projeto **lê primeiro** e **atualiza por último**. A última sessão fica no topo.

## Estado atual

- Fase/etapa: **1C – Encomendas, Datas especiais, Sobre a Rô, Contato** (a fazer, pelo **Codex**). 1A e 1B publicadas no `main` (PRs #1 e #2).
- Branch ativa: `feat/1c-paginas-de-informacao` (já criada pelo Claude, com este pedido)
- PR aberto: nenhum ainda
- Situação: pedido escrito e aprovado pelo Franklin. Primeira etapa feita pelo Codex: o Claude revisa o PR depois.
- GitHub Pages: o Franklin ainda precisa ligar (Settings → Pages → Deploy from a branch → `main` / root).

## Próxima tarefa (exata) – Etapa 1C, para o Codex

**Objetivo:** dar conteúdo às 4 páginas que hoje só têm `[PENDENTE]`, sem inventar nada sobre a Rô. O que não estiver confirmado aparece com o marcador visível `<span class="pendente">[PENDENTE: ...]</span>` (classe já existe em `css/componentes.css`).

### Arquivos

| Arquivo | O que fazer |
|---|---|
| `js/dados/encomendas.js` (novo) | Dados de Encomendas e Datas especiais (estrutura abaixo). Nada de preço |
| `js/telas/encomendas.js` (novo) | Monta a tela a partir dos dados, tudo passando por `escapar()` de `js/modules/templates.js` |
| `js/telas/datas-especiais.js` (novo) | Idem para Datas especiais |
| `js/modules/whatsapp.js` | Aceitar `data-mensagem="..."` (mensagem inteira personalizada), mantendo `data-produto` e o padrão como estão |
| `js/main.js` | Ligar `encomendas` e `datas-especiais` às novas telas (as outras duas continuam com `aoAbrirView`) |
| `html/encomendas.html`, `html/datas-especiais.html`, `html/sobre.html`, `html/contato.html` | Estrutura das telas (um `h1` por tela, mantendo o cabeçalho `pagina__cabecalho` atual) |
| `css/componentes.css` | Componentes novos só com tokens de `css/variaveis.css`: `.passos`, `.regras`, `.faq`, `.contato-cartoes` (nomes sugeridos). Nada de cor solta |
| `README.md` | Atualizar a tabela de rotas |
| `docs/capturas/1c/` | Capturas em 390px e 1280px das 4 telas |

### Conteúdo de cada tela

**1. Encomendas (`#/encomendas`)**
- **Como pedir, em 4 passos** (lista numerada `ol.passos`): 1) Escolha no cardápio (link `#/cardapio`); 2) Chame a Rô no WhatsApp; 3) Combine os detalhes e pague o sinal; 4) Retire ou receba a sua encomenda.
- **Regras do pedido**: vieram do modelo de orçamento do app antigo e **ainda não foram confirmadas pela Rô**. Mostrar o texto e, ao lado de cada uma, `[PENDENTE: confirmar com a Rô]`. Guardar no dado com `confirmado: false`, para depois só virar `true`:
  - Sinal de 50% do valor para confirmar a encomenda.
  - Antecedência mínima de 3 dias.
  - Retirada com data e hora marcadas.
  - Fazemos entregas (taxa sob consulta).
  - Pagamento: PIX, dinheiro e cartões.
  - Topo, glitter e embalagens são cobrados à parte.
- **Sabores** (também `confirmado: false`): massas branca ou chocolate; cobertura de chantininho; recheios tradicionais: chocolate, prestígio, leite Ninho, 4 leites; recheios premium (com acréscimo): Ninho com morango, maracujá, Ninho com Nutella, Ninho com geleia de morango.
- **Aviso do Bentô Cake e bolos pequenos**: usar o texto que já existe em `avisoRetirada` de `js/dados/cardapio.js` (importar, não copiar).
- **Perguntas frequentes** com `<details><summary>`: "Com quanto tempo de antecedência devo pedir?", "Vocês entregam?", "Quais as formas de pagamento?", "Posso pedir um bolo com personagem?". Resposta = a regra correspondente com `[PENDENTE: confirmar com a Rô]`; na do personagem: "Sim, a decoração é combinada com a Rô pelo WhatsApp." + `[PENDENTE: confirmar com a Rô]`.
- Botão final "Faça sua encomenda" (`data-whatsapp`).
- **Não colocar preços**, nem a tabela de tamanhos do app antigo: preço no site só quando a Rô decidir (`mostrarPrecos` em `cardapio.js`).

**2. Datas especiais (`#/datas-especiais`)**
- Faixa da **Campanha vintage** com 2 das fotos reais que já existem (`imagens/produtos/bolo-vintage-*`, com `<picture>` WebP 480/800 + JPG, `alt` descritivo, `loading="lazy"`) e botão "Quero um bolo vintage" com `data-mensagem="Olá, Rô! Vim pelo site e quero um bolo vintage."`.
- Cartões para **Dia das Mães, Dia dos Namorados, Páscoa e Natal**: título, uma linha "Fale com a Rô com antecedência para garantir a sua encomenda." e botão com `data-mensagem="Olá, Rô! Vim pelo site e quero uma encomenda para <data>."`. Sem foto: usar o mesmo espaço `[PENDENTE: foto real]` que o cardápio usa (ver `fotoProduto` em `templates.js`). **Nunca** imagem gerada no lugar de produto.
- Não inventar o que a Rô faz em cada data (produtos, kits, preços): só `[PENDENTE: produtos da época]` em cada cartão.

**3. Sobre a Rô (`#/sobre`)** – só o confirmado:
- Chef Rosangela Vieira, formada em Gastronomia, confeitaria Delícias da Rô em Manaus – AM, "Sabores que encantam", Instagram @chefrosangelavieira (link de `js/dados/site.js`).
- `[PENDENTE: história contada pela Rô]`, `[PENDENTE: tempo de confeitaria]`, `[PENDENTE: foto da Rô, se ela quiser]`.
- **Não** colocar a mascote Chef Rô ainda (depende do ok da Rô e entra na etapa 1D).

**4. Contato (`#/contato`)**
- Cartões: **WhatsApp** (número visível `(92) 98168-1827` + botão `data-whatsapp`) e **Instagram** (@chefrosangelavieira, abre em nova aba). Dados vêm de `js/dados/site.js`, não repetir números no HTML se der para preencher pelo JS; se ficar no HTML, que seja igual ao `site.js`.
- "Atendimento por encomenda em Manaus – AM."
- Horário: o de `site.js` com `[PENDENTE: confirmar com a Rô]`.
- `[PENDENTE: região de entrega]` e `[PENDENTE: link do Perfil da Empresa no Google]`.
- **Sem formulário, sem endereço, sem mapa.** Nenhuma coleta de dado pessoal.

### Critério de pronto
- As 4 telas com o conteúdo acima; o que não é confirmado aparece como `[PENDENTE: ...]`.
- Um `h1` por tela; foco visível; alvos de toque ≥ 44px; `<details>` acessível pelo teclado.
- Todo texto de dados passa por `escapar()`.
- Sem preço, sem endereço, sem formulário, sem imagem gerada por IA.
- Botões do WhatsApp com a mensagem certa (`data-mensagem`, `data-produto` e padrão funcionando).

### Testes a rodar
- `python -m http.server 8080` e abrir as 6 rotas em **390px e 1280px**: um `h1`, sem rolagem horizontal, 0 erros no console, 0 imagens quebradas.
- Conferir 3 links do WhatsApp (um padrão, um `data-produto` no cardápio, um `data-mensagem` em Datas especiais): `wa.me/5592981681827?text=` com o texto certo.
- `node ferramentas/contraste.mjs` (tudo ≥ 4,5:1; se criar um par novo de cor de texto, acrescentar no script).
- Capturas em `docs/capturas/1c/`.

### Como trabalhar
- Escritor: CSS dos componentes e as 4 views. Principal: dados, telas JS, `whatsapp.js` e integração. Revisor: diff completo antes do PR.
- Commits pequenos em português (Conventional Commits), última linha `Feito-por: Codex`.
- Abrir PR para `main` com: o que fez, como testar, lista de `[PENDENTE]` novos. **Não** registrar em `docs/registro-de-publicacoes.md` (só depois do merge).
- Ao terminar ou se o limite acabar: atualizar esta passagem (sessão nova no topo de "Sessões").

### Fora do escopo da 1C
- Mascote Chef Rô, ícones 3D, Open Graph, JSON-LD, contador (tudo isso é 1D).
- Pedir ou gerar imagem: se faltar imagem, anotar em "Dúvidas para o Franklin"; o Claude transforma em pedido para o ChatGPT (ver "Imagens" no `AGENTS.md`).

## Dúvidas para o Franklin

- Fonte dos títulos: ficou a Fraunces (A) por padrão, porque não houve escolha. Se preferir a B, é só avisar (trocar `--fonte-titulo`).
- Preços no cardápio: "a partir de" ou "valores sob consulta" (hoje: sob consulta; `mostrarPrecos = false` em `js/dados/cardapio.js`).
- Fotos reais e descrição dos itens marcados `[PENDENTE]` no cardápio (decorados, 2 andares, caseiros, doces, cupcakes, kits).
- Arte de capa feita para o site (opcional) e anos de confeitaria para os contadores.
- Domínio, contador de visitas e link "Área da Rô": como antes.

## Sessões (mais recente primeiro)

### 2026-10-22 15h20 – Claude (celular, nuvem) – Pedido da 1C para o Codex

- Fez: branch `feat/1c-paginas-de-informacao`, pedido da 1C nesta passagem, regra de imagens no `AGENTS.md`, 1B no registro de publicações.
- Testou: nada de código (só documentação).
- Ficou faltando: a 1C inteira, para o Codex.
- Observações para o próximo agente: os dados das regras de encomenda vêm de `precifica_ro_mobile/lib/presentation/sales/controllers/orcamentos_controller.dart` e já estão copiados acima; não precisa abrir o app antigo.

### 2026-10-22 14h05 – Claude (celular, nuvem) – Etapa 1B

- Fez: Início com capa (título, chamada da campanha vintage, duas fotos reais e selo do R), "Queridinhos da casa" com 3 destaques, prévia do cardápio em atalhos e chamada final. Cardápio com 6 categorias montadas de `js/dados/cardapio.js` por `js/telas/cardapio.js`, cartões com foto real 4:5 (WebP 480/800 + JPG) ou espaço `[PENDENTE: foto real]` com o R do logo (sem imagem gerada), aviso de retirada no Bentô Cake, botão "Pedir este" com mensagem citando o produto. Atalho `#/cardapio/<categoria>` rola até a seção e põe o foco nela.
- Fotos usadas: as 4 da pasta do Drive `Claude/Design/01 - Delícias da Rô/Fotos Originais` (Bentô Cake com morangos, vintage coração de chocolate, vintage com laços dourados, vintage com laços marrons).
- Testou: Chromium em 390px e 1280px: 6 rotas com 1 `h1` e sem rolagem lateral, 3 destaques, 6 categorias e 11 cartões, link do WhatsApp do Bentô com o nome do produto, aviso do Bentô presente, subseção `#/cardapio/kits` com foco e rolagem certos, 0 imagens quebradas, 0 erros de console. Contraste ok (Vermelho Morango sobre o fundo, usado na palavra "encantam": 5,02:1).
- Ficou faltando: o que depende da Rô (lista acima).


### 2026-10-22 13h50 – Claude (celular, nuvem) – Etapa 1A

- Fez: casca SPA (`index.html`, roteador por hash com foco no título, menu com botão no celular e barra no computador, 404), tokens em `css/variaveis.css`, cabeçalho com logo original, rodapé com contato, botão flutuante do WhatsApp com mensagem pronta (`js/modules/whatsapp.js`, `data-whatsapp` e `data-produto`), 6 views com marcadores `[PENDENTE]`, `design-system.html` com as duas fontes lado a lado, `ferramentas/contraste.mjs`, README. Logo exportado do arquivo original (sem recriar) em WebP + PNG e ícones 32/180/192.
- Testou: Playwright (Chromium) em 390px e 1280px: as 6 rotas com 1 `h1`, sem rolagem horizontal, menu ativo certo, link do WhatsApp com `wa.me/5592981681827?text=`, menu abre e fecha (Esc), rota inválida volta ao início, F5 mantém a tela, `?fonte=cormorant` troca a fonte, 0 erros de console. Contraste: todos os pares de texto ≥ 4,5:1 (menor: botão principal 5,30:1). Capturas em `docs/capturas/1a/`.
- Ficou faltando: validação W3C (sem acesso ao validador nesta sessão); teste num celular de verdade.
- Observações para o próximo agente: o Google Fonts estava bloqueado no ambiente de teste; as capturas usaram as mesmas fontes servidas localmente. Rosa Rô e Caramelo têm contraste baixo (2,1 e 2,8): só para detalhes, nunca texto.

### 2026-10-22 10h40 – Claude (celular) – Planejamento

- Fez: plano aprovado e pasta do projeto (LEIA-ME, CLAUDE.md, AGENTS.md, docs/01 a 07, esta passagem, agentes escritor e revisor).
- Testou: leitura do app `precifica_ro_mobile` (commit `afa222a`) e conta de exemplo de `docs/06`.
- Ficou faltando: tudo de código; pendências da Rô em `docs/07`.
- Observações para o próximo agente: o domínio de cálculo (`app/js/dominio/`) vem com testes **antes** das telas (etapa 2B). Os números esperados estão em `docs/06`, seção 4.
