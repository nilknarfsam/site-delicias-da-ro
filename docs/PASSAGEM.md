# Passagem de bastão

Arquivo vivo. Quem trabalhar no projeto **lê primeiro** e **atualiza por último**. A última sessão fica no topo.

## Estado atual

- **Fase 1 (site público)** completa no `main` (PRs #1 a #5), no ar em https://nilknarfsam.github.io/site-delicias-da-ro/.
- **Etapa 1F (preços e regras)** em PR na branch `feat/1f-precos-e-regras`: preços "a partir de", tabela de tamanhos dos bolos personalizados, kits, regras de encomenda confirmadas e "não fazemos entregas".
- **Etapa 2B** no `main` (PR #7): motor de cálculo em `app/js/dominio/`, 35 testes `node --test`.
- **Firebase** configurado em 24/10 pelo Claude no Chrome: projeto `delicias-da-ro-ab7e2` (Spark), login Google ativo, domínio `nilknarfsam.github.io` autorizado, Firestore `(default)` em `southamerica-east1` no modo de produção (tudo negado), app web "Precifica Rô Web" registrado. A configuração do app web entra em `app/js/firebase.js` na 2A.

## Próxima tarefa (exata)

1. **Franklin:** aprovar o PR da 1F.
2. **Etapa 2A:** fundação da Área da Rô (casca do `app/`, login Google, tela "acesso não liberado", ateliê e membros, `firestore.rules` testadas e mostradas ao Franklin antes de publicar, offline). Regras e modelo de dados pelo GPT-6.1 Sol médio; casca pelo Gemini 3.8; revisão cruzada e Claude.
3. Depois do primeiro login da Rô: colocar o usuário dela como membro do ateliê no Firestore.

### Fica para a reunião do Franklin com a Rô
- Cardápio completo, preços e tamanhos; confirmar horário (hoje "segunda a sábado, das 9h às 18h", vindo de `conteudo/dados-da-confeitaria.md`) e as regras de encomenda.
- Números reais para a seção "A Rô em números".

### Para a troca de domínio (deliciasdaro.com.br)
- Atualizar canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD e `sitemap.xml`; `robots.txt` passa a valer na raiz.
- Avaliar conteúdo inicial já no HTML de `#app` (sugestão da auditoria de SEO) para o Google ler sem depender do JavaScript.

## Dúvidas para o Franklin

- Conferir com a Rô: "Mini Vintage de Coração" (R$ 50) e "Mini Bolo Vintage" (R$ 45) são o mesmo bolo? Os kits de junho continuam valendo? A tabela de tamanhos veio de uma arte antiga (11 cm e 15 cm batem com outubro/2026).
- Fotos reais e descrição dos itens marcados `[PENDENTE]` no cardápio (decorados, 2 andares, caseiros, doces, cupcakes, kits).
- Confirmar com a Rô o horário.
- Definir se haverá arte de capa opcional e quais números reais entram na seção "A Rô em números".
- O link "Área da Rô" no rodapé agrada; decisão final depois.
- O domínio confirmado é `deliciasdaro.com.br`, com compra prevista para a semana de 27/10.
- O contador de visitas foi adiado em 24/10.
- O Franklin colocará os links marcados na bio do Instagram e no Perfil da Empresa no Google.

## Sessões (mais recente primeiro)

### 2026-10-24 – Codex – Etapa 1F: preços e regras

- Fez (GPT-5.6 Terra, revisado pelo Claude): habilitou preços de venda "a partir de" autorizados pelo Franklin, atualizou itens e kits do cardápio, incluiu a tabela acessível de tamanhos e preços, confirmou regras/sabores, informou que não há entrega e registrou a Páscoa.
- Testou: `node --check` nos quatro JavaScript alterados, `git diff --check` e `cd app && node --test` (35 testes aprovados).
- Ficou faltando: aprovação do PR pelo Franklin. Fontes: artes do Instagram @chefrosangelavieira lidas em 24/10 (26 posts, só leitura) e três artes enviadas pelo Franklin.

### 2026-10-24 – Claude Code (computador) – Fechamento da Fase 1 e plano da Fase 2

- Fez: atualizou a documentação para registrar a conclusão da Fase 1, os PRs #1 a #5, as decisões de 24/10 e o plano da Fase 2. O texto foi escrito pelo GPT-5.6 Luna e revisado pelo Claude.
- Testou: conferiu a branch `docs/fechamento-fase-1`, o estado do repositório e os trechos documentais relacionados; `git diff --check` sem erros. Fórmulas do `docs/06` conferidas contra o app antigo no GitHub (`calculate_recipe_pricing.dart`, `derive_pricing_status.dart`, `ingredient_normalizer.dart`): batem.
- Ficou faltando: criar o projeto no Firebase, fazer a leitura aprovada dos posts do Instagram e iniciar a Etapa 2B.

### 2026-10-23 – Claude Code (computador) – Etapa 1E com três motores

- Fez: prévia de compartilhamento refeita (Claude, Pillow, logo original + fotos reais). Links marcados e registro de publicações (Gemini 3.8 Flash Low). Auditorias em paralelo, só leitura: Gemini 4 Argon High com as Web Interface Guidelines da Vercel e GPT-6.1 Sol com o checklist `seo-audit`/`schema` de coreyhaines31/marketingskills (achados no PDF "50 Claude Skills" do Drive). Correções de CSS (Gemini 3.8 Flash Low) e de HTML/JS (GPT-5.6 Luna).
- Testou: W3C (validator.w3.org/nu) com 0 erros nas 6 telas renderizadas e no `design-system.html`; 390px: 1 `h1` por tela, sem rolagem lateral, nenhum alvo de toque < 44px; menu fecha ao tocar na tela atual; tocar de novo em `#/cardapio/kits` rola e foca "Kits" abaixo do cabeçalho; "Pular para o conteúdo" por Enter foca `#app` sem trocar a rota; foco visível no rodapé; rota inválida volta ao início; só Fraunces, Nunito e Dancing Script carregadas.
- Não fez (decisão): manter o horário do rodapé (veio do Franklin; confirmar com a Rô); conteúdo pré-montado no HTML fica para a troca de domínio.

### 2026-10-23 – Codex – Ajustes da fonte, navegação e metadados

- Fez: fixou Fraunces como fonte de títulos; corrigiu o fechamento do menu ao tocar no link atual; adicionou foco/rolagem para links no mesmo hash e para "Pular para o conteúdo"; marcou tela de erro como alerta; priorizou o carregamento das fotos da campanha vintage; trocou preenchimentos de contato para `textContent`; atualizou título, viewport, fallback sem JavaScript e documentação.
- Testou: `node --check` em todos os cinco JavaScript alterados; `git diff --check`; busca por `cormorant` sem resultados fora de `docs/capturas/` e desta passagem; `design-system.html` com um único `h1`; títulos OG/Twitter preservados.
- Ficou faltando: revisão do diff pelo agente revisor, commit e PR. O `git pull --ff-only` não foi possível neste ambiente por permissão em `.git/FETCH_HEAD`.

### 2026-10-22 23h – Claude Code (computador) – Etapa 1D com três motores

- Fez: branch `feat/1d-ligacoes-e-numeros`. Escritores: Gemini 3.8 Flash Low (`robots.txt`, `sitemap.xml`, ícone), Gemini 3.8 Flash Medium (Open Graph, JSON-LD e correção do contador), GPT-5.6 Luna no Codex (contador e seção de números). Claude montou a imagem de prévia com o logo original e fotos reais (Pillow, sem IA).
- Revisão: Gemini 4 Argon High e GPT-6.1 Sol em paralelo, só leitura. Acharam contagem dupla nas subseções, título da tela anterior e a query inteira indo para o GoatCounter; corrigido com o evento `rota-renderizada` no roteador e a limpeza da query. Revisão final do Claude.
- Testou: Chromium em 390px e 1280px, 6 rotas com 1 `h1` e sem rolagem lateral; todas as imagens com 200; JSON-LD com `JSON.parse`; contraste aprovado. Contador simulado sem rede: `?origem=Instagram&email=...` vira `origem:instagram` só na primeira contagem, a query some da URL, `#/cardapio` → `#/cardapio/kits` → `#/cardapio/bento-cake` conta uma vez, `#app` não conta, código vazio ou inválido não carrega nada.
- Ficou faltando: código do GoatCounter, números reais da Rô, validar a prévia e o JSON-LD nas ferramentas do Facebook e do Google depois do merge, teste num celular de verdade.
- Ambiente: o plugin de telemetria do Google Cloud no Gemini (`~/.gemini/config/plugins/googlecloudtools.datacloud_telemetry/hooks.json`) travava o Antigravity; foi desligado com o ok do Franklin (backup `hooks.json.bak-claude`).

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
