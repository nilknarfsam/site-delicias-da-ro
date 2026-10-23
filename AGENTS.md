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

### Escala de motores (Claude Code, desde 22/10/2026)

Quando o Claude Code coordena, ele delega pelos plugins `antigravity-mcp` e `codex-mcp` (skill `fluxo-tres-motores`):

| Papel | Modelos |
|---|---|
| Escrever código e organizar arquivos | Gemini 3.8 Flash Low (tarefas mecânicas), Gemini 3.8 Flash Medium, GPT-5.6 Luna (Codex) |
| Revisar o diff (só leitura) | Gemini 4 Argon High e GPT-6.1 Sol, em paralelo |
| Revisão final, testes e PR | Claude |

Nunca dois escritores ao mesmo tempo na mesma branch. Os commits dizem qual modelo escreveu e quem revisou.

## Passagem de bastão

- Branch `feat/<etapa>-<assunto>`, commits pequenos em português; última linha `Feito-por: Codex` ou `Feito-por: Claude`.
- Ao terminar ou se o limite estiver acabando: commit do que funciona e **atualizar `docs/PASSAGEM.md`** (o que fez, o que testou, o que falta, próxima tarefa exata).
- Abrir PR com o que foi feito, como testar e o que falta. O outro agente revisa antes do merge.
- Dúvida de decisão: anotar em "Dúvidas para o Franklin" na passagem e seguir com o que não depende dela.
- Nunca `push --force`, `reset --hard`, apagar branch, tag ou arquivo sem o Franklin pedir.

## Imagens

- O agente de código **não gera imagem**. Usa só fotos reais (`imagens/produtos/`), o logo original (`imagens/logo/`) e os arquivos já aprovados da mascote e dos ícones (a partir da etapa 1D).
- Faltou imagem: anotar em "Dúvidas para o Franklin" na passagem. O Claude escreve o pedido e o **ChatGPT** gera, seguindo o "Protocolo de imagens – Claude + ChatGPT" (Drive: `Claude/Design/00 - Pedidos de imagem (ChatGPT)`).
- Produto é sempre foto real; logo nunca é recriado; personagem licenciado nunca é desenhado.
