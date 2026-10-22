# Passagem de bastão

Arquivo vivo. Quem trabalhar no projeto **lê primeiro** e **atualiza por último**. A última sessão fica no topo.

## Estado atual

- Fase/etapa: **1C implementada, testada e em revisão no PR #3**. 1A e 1B já estão no `main` (PRs #1 e #2).
- Branch ativa: `feat/1c-paginas-de-informacao`.
- Commit de implementação no GitHub: `0404d4f460e4204fa20af2b0db5bd60bd024234b`.
- Commit de capturas no GitHub: `a31fee544345eca9f31a47351d60ff3b092f702a`.
- PR aberto para `main`: **[#3 – feat(site): páginas de informação da etapa 1C](https://github.com/nilknarfsam/site-delicias-da-ro/pull/3)**.
- Envio: concluído pela integração GitHub após o Franklin instalá-la. Os commits remotos têm as mesmas árvores/arquivos testados localmente; capturas conferidas por hash. A tentativa inicial pelo terminal não tinha credencial; o bloqueio foi resolvido pela integração.
- Situação: escritor e revisor utilizados conforme `AGENTS.md`; parecer interno sem bloqueios. Aguardando revisão do Claude no PR e aprovação do Franklin antes de qualquer merge/publicação.
- GitHub Pages: habilitação pelo Franklin ainda pendente conforme a sessão anterior; não alterada nesta etapa.

## Próxima tarefa (exata) – Revisar o PR #3 da 1C

1. Ler `AGENTS.md`, `CLAUDE.md` e esta passagem. Conferir o PR [#3](https://github.com/nilknarfsam/site-delicias-da-ro/pull/3), branch `feat/1c-paginas-de-informacao`, e sincronizar um checkout limpo.
2. **Claude:** revisar o diff da 1C contra a especificação preservada abaixo, incluindo as capturas em `docs/capturas/1c/` e os marcadores pendentes. Os testes e limitações estão nas sessões abaixo. Corrigir eventuais bloqueios nesta mesma branch, repetir os testes afetados e atualizar esta passagem.
3. **Franklin:** conferir as quatro páginas no celular e aprovar o PR. Não tratar o parecer interno do agente revisor como aprovação do Franklin.
4. Somente após aprovação: fazer o merge e registrar a publicação conforme o fluxo do projeto. Atualizar o estado, o commit de merge e esta passagem com o resultado real.
5. Planejar a **1D** de `docs/04-roteiro-de-tarefas.md` em outra branch. Não iniciar 1D nem registrar publicação da 1C antes do merge.

## Especificação preservada – Etapa 1C implementada

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

### 2026-10-22 16h10 – Codex (Work) – Envio e abertura do PR #3

- Fez: após o Franklin instalar a integração GitHub, enviou implementação (`0404d4f`) e capturas (`a31fee5`) à branch existente, com atualização de referência em avanço normal, sem força. Abriu o [PR #3](https://github.com/nilknarfsam/site-delicias-da-ro/pull/3) para `main`, com o que mudou, como testar, testes efetuados, limitações e lista de pendências. Esta passagem é atualizada no commit documental final do PR.
- Verificou: árvore de código remota idêntica à implementação local testada (`0566ab1`); oito capturas com os mesmos hashes Git locais. Nenhum código mudou depois dos testes e da revisão descritos na sessão de implementação.
- Continuidade: commits locais anteriores (`0566ab1`, `3778d22`) foram preservados; os commits enviados pela API têm hashes próprios, listados no estado atual. Não aplicar os commits locais novamente sobre a branch remota.
- Ficou faltando: revisão do Claude no PR, teste em aparelho físico e aprovação do Franklin. Nada foi mesclado ou publicado; registro de publicações da 1C não alterado.


### 2026-10-22 15h26 – Codex (Work) – Implementação e revisão da 1C

- Fez: sincronizou a branch indicada; leu as regras e docs/01 a 07. Escritor implementou CSS e as 4 views; principal criou `js/dados/encomendas.js`, `js/telas/encomendas.js`, `js/telas/datas-especiais.js`, integrou rotas, preencheu contato/Instagram/horário de `site.js` e estendeu WhatsApp com prioridade mensagem → produto → padrão. O aviso de retirada é importado do cardápio. Regras e sabores usam `confirmado: false`, e a FAQ reutiliza as regras. Nenhum preço, endereço ou formulário foi acrescentado.
- Escape: todos os textos dinâmicos passam por `escapar()`; o caminho da foto no template compartilhado também foi escapado para atender ao critério de dados seguros nas novas telas.
- Testou: `python -m http.server 8080` + Playwright/Chromium, **6 rotas × 390px e 1280px**: um `h1`, foco no título, zero rolagem lateral (incluindo limites dos elementos), zero imagens quebradas. Nas 4 telas novas, todos os links e summaries têm largura/altura ≥44px. FAQ: Enter abre, Espaço fecha, foco visível. Menu móvel, voltar/avançar e F5 passaram.
- Testou WhatsApp: links reais padrão, produto e campanha com `wa.me/5592981681827?text=` correto; todas as 5 chamadas de Datas especiais com a mensagem certa. Casos adicionais: prioridade personalizada sobre produto, acentos/aspas/`&` e mensagem vazia voltando ao produto. Testou também texto com marcação HTML exibido literalmente e mudança de `confirmado` removendo só o marcador correspondente.
- Fontes/rede: a primeira execução registrou 4 erros de rede do Google Fonts (mesma limitação já observada na 1A). Para as capturas e verificação final, as **mesmas fontes do Google Fonts foram baixadas e servidas localmente apenas pelo teste**, sem mudar o site. Nessa execução: zero erros de console, zero falhas de requisição. O acesso direto ao Google Fonts neste ambiente não foi validado.
- Contraste: `node ferramentas/contraste.mjs` aprovado; acrescentados chocolate/branco (13,43:1) e cacau/branco (10,28:1). `git diff --check` aprovado.
- Capturas: 8 PNGs em `docs/capturas/1c/` (Encomendas, Datas especiais, Sobre e Contato nas duas larguras); conferência visual das telas de encomendas e campanha/contato.
- Revisão: agente **revisor** leu o diff contra `origin/main`, regras e especificação, incluindo arquivos novos. Parecer: **sem bloqueios de implementação**. Também aprovou 5 casos WhatsApp em Node, contraste e whitespace. A única pendência operacional indicada foi completar capturas e passagem (feitas nesta sessão).
- Pendências de conteúdo visíveis: confirmação das 6 regras, 4 grupos de sabores, resposta sobre personagem e horário; foto real e produtos da época nas 4 datas; história, tempo de confeitaria e foto opcional da Rô; região de entrega e Perfil da Empresa no Google. São pendências previstas, não conteúdo inventado.
- Ficou faltando: autenticar GitHub, enviar commits, abrir PR para `main` e obter revisão do Claude/Franklin. Sem merge e sem registro de publicação da 1C. Continua pendente testar em aparelho físico.
- Observações: as alterações de `AGENTS.md` e o registro da 1B já vieram do commit `71f1b5c` preparado pelo Claude; não foram alterados nesta sessão.


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
