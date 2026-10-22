# AGENTS.md – site da Delícias da Rô + Precifica Rô Web

Este projeto segue o **Protocolo de trabalho em dupla Claude + Codex** (v1, 22/10/2026). Vale para qualquer agente: Codex, Claude Code ou outro.

## Antes de qualquer coisa

1. Ler `docs/PASSAGEM.md` (estado atual e próxima tarefa).
2. `git pull` e conferir se ninguém está trabalhando na mesma branch.

## Regras do projeto

As regras completas deste projeto estão no **`CLAUDE.md`** e valem igualmente para o Codex: dono e idioma, escopo de leitura, arquitetura obrigatória (HTML/CSS/JS puro, SPA por hash, caminhos relativos, `app/js/dominio/` com testes `node --test`), segurança e dados (Firestore com regras, nada de custo ou receita no repositório), conteúdo do site e fluxo de trabalho. Leia-o inteiro, depois `LEIA-ME-PRIMEIRO.md` e `docs/01` a `docs/07`.

Onde o `CLAUDE.md` disser "Claude Code", leia "o agente que estiver trabalhando".

## Orquestração (modelos por tamanho)

- O agente principal planeja: lê a passagem, divide a etapa em tarefas pequenas com arquivos e critério de pronto, integra e decide.
- Tarefas de escrita bem especificadas vão para o agente **escritor** (`.codex/agents/escritor.toml`, modelo menor).
- Antes de abrir PR, o agente **revisor** (`.codex/agents/revisor.toml`, modelo médio) lê o diff contra o `CLAUDE.md`, este arquivo e `docs/06-especificacao-precifica.md`.
- Regras de segurança do Firestore, modelo de dados, fórmulas de precificação e decisões de produto **nunca** vão para o escritor.
- Etapa pequena: o principal faz sozinho.

## Passagem de bastão

- Branch `feat/<etapa>-<assunto>`, commits pequenos em português; última linha `Feito-por: Codex` ou `Feito-por: Claude`.
- Ao terminar ou se o limite estiver acabando: commit do que funciona e **atualizar `docs/PASSAGEM.md`** (o que fez, o que testou, o que falta, próxima tarefa exata).
- Abrir PR com o que foi feito, como testar e o que falta. O outro agente revisa antes do merge.
- Dúvida de decisão: anotar em "Dúvidas para o Franklin" na passagem e seguir com o que não depende dela.
- Nunca `push --force`, `reset --hard`, apagar branch, tag ou arquivo sem o Franklin pedir.
