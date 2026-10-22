# Passagem de bastão

Arquivo vivo. Quem trabalhar no projeto **lê primeiro** e **atualiza por último**. A última sessão fica no topo.

## Estado atual

- Fase/etapa: 1A – Estrutura e design system (pronta, aguardando revisão)
- Branch ativa: `feat/1a-estrutura-design-system`
- PR aberto: 1A (ver GitHub)
- Situação: aguardando o Franklin escolher a fonte dos títulos e aprovar o PR. Depois do merge: ligar o GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root).

## Próxima tarefa (exata)

- Objetivo: etapa **1B** (Início e Cardápio) do `docs/04-roteiro-de-tarefas.md`. Mostrar o plano e esperar o ok.
- Antes: aplicar a fonte escolhida (apagar a outra do link do Google Fonts no `index.html` e no `design-system.html`, remover o bloco `[data-fonte="cormorant"]` e o trecho `?fonte=` do `js/main.js`, ou trocar `--fonte-titulo` se a escolha for Cormorant).
- Arquivos envolvidos: `html/inicio.html`, `html/cardapio.html`, `js/dados/cardapio.js` (novo), `js/telas/cardapio.js` (novo), `css/componentes.css`, `imagens/produtos/`.
- Critério de pronto: capa de impacto, destaques e prévia do cardápio no Início; Cardápio por categoria com cartão (foto real 4:5, nome, descrição, "a partir de" ou "consulte", botão "Pedir este" com `data-produto`). O que faltar da Rô fica `[PENDENTE: ...]`.
- Testes a rodar: `python -m http.server 8080`, 390px e 1280px, `node ferramentas/contraste.mjs`.

## Dúvidas para o Franklin

- Fonte dos títulos: Fraunces (A, padrão) ou Cormorant Garamond (B)? Comparar em `design-system.html` ou `index.html?fonte=cormorant`.
- Domínio: `deliciasdaro.com.br` (confirmar disponibilidade no Registro.br quando for comprar).
- Contador: GoatCounter ou o mesmo do samfieldsoak?
- Link "Área da Rô" no rodapé ou sem link?
- Lista do cardápio, fotos reais e preço "a partir de" ou "consulte" (para a 1B).

## Sessões (mais recente primeiro)

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
