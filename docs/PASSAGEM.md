# Passagem de bastão

Arquivo vivo. Quem trabalhar no projeto **lê primeiro** e **atualiza por último**. A última sessão fica no topo.

## Estado atual

- Fase/etapa: 1B – Início e Cardápio (pronta, aguardando revisão). 1A publicada no `main` (PR #1).
- Branch ativa: `feat/1b-inicio-cardapio`
- PR aberto: #2
- Situação: aguardando o Franklin aprovar o PR #2. GitHub Pages ainda precisa ser ligado (Settings → Pages → Deploy from a branch → `main` / root); a sessão na nuvem não consegue conferir isso pela API.

## Próxima tarefa (exata)

- Objetivo: etapa **1C** (Encomendas, Datas especiais, Sobre a Rô, Contato) do `docs/04-roteiro-de-tarefas.md`. Mostrar o plano e esperar o ok.
- Fonte de dados já disponível: o modelo de orçamento do app antigo (`precifica_ro_mobile`, `lib/presentation/sales/controllers/orcamentos_controller.dart`) traz recheios, sinal de 50 %, antecedência mínima de 3 dias, retirada com hora marcada, entrega com taxa e formas de pagamento. **Confirmar com a Rô antes de publicar** (o texto é antigo e tem o @ velho).
- Arquivos envolvidos: `html/encomendas.html`, `html/datas-especiais.html`, `html/sobre.html`, `html/contato.html`, talvez `js/dados/encomendas.js`.
- Critério de pronto: as 4 páginas com conteúdo confirmado ou `[PENDENTE: ...]`; aviso do Bentô Cake na Encomendas; nada de endereço residencial.
- Testes a rodar: `python -m http.server 8080`, 390px e 1280px, `node ferramentas/contraste.mjs`.

## Dúvidas para o Franklin

- Fonte dos títulos: ficou a Fraunces (A) por padrão, porque não houve escolha. Se preferir a B, é só avisar (trocar `--fonte-titulo`).
- Preços no cardápio: "a partir de" ou "valores sob consulta" (hoje: sob consulta; `mostrarPrecos = false` em `js/dados/cardapio.js`).
- Fotos reais e descrição dos itens marcados `[PENDENTE]` no cardápio (decorados, 2 andares, caseiros, doces, cupcakes, kits).
- Arte de capa feita para o site (opcional) e anos de confeitaria para os contadores.
- Domínio, contador de visitas e link "Área da Rô": como antes.

## Sessões (mais recente primeiro)

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
