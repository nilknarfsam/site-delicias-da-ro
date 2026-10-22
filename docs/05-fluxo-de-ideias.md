# 05 – Fluxo de ideias

Mesmo modelo do site @samfieldsoak.

1. **No celular (Claude):** o Franklin debate uma ideia (página nova, ajuste de tela, função nova no Precifica, texto da Rô). Quando ela fica pronta, o Claude cria um arquivo em `caixa-de-entrada/` seguindo `_MODELO-de-ideia.md`, com o texto pronto, a parte do site e o pedido para o Claude Code.
2. **No PC (Claude Code):** "processe a caixa de entrada" (rotina no `CLAUDE.md`).
3. Os arquivos processados vão para `caixa-de-entrada/processadas/` com `status: publicado`.

## Nome dos arquivos

`AAAA-MM-DD_<parte>_<assunto>.md`, onde `<parte>` é `site`, `app`, `conteudo` ou `design`.

Ex.: `2026-10-25_app_massas-e-rendimento.md`, `2026-10-26_conteudo_historia-da-ro.md`.

## Como a caixa chega ao PC

- **Opção A:** baixar só a pasta `caixa-de-entrada` do Drive e copiar para o projeto.
- **Opção B:** ligar o Google Drive para computador e apontar o Claude Code para a pasta sincronizada.

## O que nunca vai para a caixa de entrada

Custos e receitas da Rô. Isso entra pela própria área da Rô, no Firestore.
