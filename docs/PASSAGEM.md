# Passagem de bastão

Arquivo vivo. Quem trabalhar no projeto **lê primeiro** e **atualiza por último**. A última sessão fica no topo.

## Estado atual

- Fase/etapa: Fase 0 – Preparação (Franklin) → próxima: 1A – Estrutura e design system
- Branch ativa: nenhuma
- PR aberto: nenhum
- Situação: aguardando o Franklin criar o repositório `nilknarfsam/site-delicias-da-ro` e ligar o GitHub Pages

## Próxima tarefa (exata)

- Objetivo: etapa **1A** do `docs/04-roteiro-de-tarefas.md`. Primeiro mostrar o plano (arquivos, tokens de cor, as duas opções de fonte serifada) e esperar o ok.
- Arquivos envolvidos: `index.html`, `404.html`, `css/*`, `js/main.js`, `js/roteador.js`, `README.md`.
- Critério de pronto: casca SPA navegando entre as 6 rotas (páginas vazias com título), cabeçalho, rodapé e botão flutuante do WhatsApp; contraste medido; testado em 390px e 1280px.
- Testes a rodar: `python -m http.server 8080` e conferir as rotas.

## Dúvidas para o Franklin

- Domínio: `deliciasdaro.com.br` (confirmar disponibilidade no Registro.br quando for comprar).
- Contador: GoatCounter ou o mesmo do samfieldsoak?
- Link "Área da Rô" no rodapé ou sem link?

## Sessões (mais recente primeiro)

### 2026-10-22 10h40 – Claude (celular) – Planejamento

- Fez: plano aprovado e pasta do projeto (LEIA-ME, CLAUDE.md, AGENTS.md, docs/01 a 07, esta passagem, agentes escritor e revisor).
- Testou: leitura do app `precifica_ro_mobile` (commit `afa222a`) e conta de exemplo de `docs/06`.
- Ficou faltando: tudo de código; pendências da Rô em `docs/07`.
- Observações para o próximo agente: o domínio de cálculo (`app/js/dominio/`) vem com testes **antes** das telas (etapa 2B). Os números esperados estão em `docs/06`, seção 4.
