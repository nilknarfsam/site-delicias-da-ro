# Site Delícias da Rô + Precifica Rô Web – projeto para o Claude Code (v1)

Criado em 22/10/2026 em conversa com o Claude no celular, com o plano aprovado pelo Franklin. Esta pasta é a **única** que o Claude Code do PC de casa precisa ler para construir o site (a única exceção é o repositório `precifica_ro_mobile`, só para consulta; ver `CLAUDE.md`).

## A ideia em uma frase

Um site para a confeitaria da Rô, com duas partes:

| Parte | Para quem | O que tem |
|---|---|---|
| **Site público** | Clientes (link da bio do Instagram e Perfil da Empresa no Google) | Capa bonita, quem é a Rô, cardápio, como encomendar, datas especiais, contato e botão do WhatsApp |
| **Área da Rô** (`/app/`) | Só a Rô e o Franklin, com login | O **Precifica Rô** refeito para a web, com interface nova, dados na nuvem (Firebase) sincronizados entre celular e computador, e espaço para novas ferramentas |

## Decisões já tomadas (22/10/2026)

1. **O Precifica Rô será reescrito em HTML, CSS e JavaScript puro**, não compilado do Flutter. Motivo: a Rô achou o app pouco prático de usar, e o Franklin quer ampliar funções mais rápido. O app Flutter vira a **especificação** (funções, fórmulas e telas), documentada em `docs/06-especificacao-precifica.md`.
2. **Login de verdade e dados na nuvem com Firebase** (Authentication com conta Google + Firestore). Só as contas liberadas entram: a da Rô e a do Franklin. O Franklin vê tudo o que a Rô faz. Funciona offline e sincroniza quando a internet volta.
3. **Um repositório só** (`site-delicias-da-ro`, público). A segurança está nas regras do Firestore, não em esconder o código. Nenhum custo, receita ou dado da precificação fica no repositório (só os preços de venda que a Rô quiser mostrar no cardápio).
4. **Publicação no GitHub Pages**, primeiro no endereço gratuito (`nilknarfsam.github.io/site-delicias-da-ro/`). O domínio próprio entra depois (ver `docs/02-arquitetura.md`, seção Domínio).
5. **Pensado desde já para vários usuários** (cada confeiteira com seu "ateliê", suas receitas e sua dispensa), porque no futuro pode virar um produto vendido por acesso. **Não é prioridade agora**, mas o modelo de dados já nasce pronto para isso.
6. **Site ligado no Instagram e no Perfil da Empresa no Google**, com links marcados por origem para saber de onde veio cada visita.
7. **Novo módulo de massas e rendimento** (o que faltou no app): quanto rende uma batida de massa, quanto vai em cada aro e quanto custa.

## O que tem nesta pasta

| Caminho | Para quê |
|---|---|
| `LEIA-ME-PRIMEIRO.md` | Este arquivo. |
| `CLAUDE.md` | Instruções que o Claude Code lê ao abrir a pasta. |
| `docs/01-visao-e-escopo.md` | Páginas do site, telas da área da Rô e o que entra em cada versão. |
| `docs/02-arquitetura.md` | Pastas, rotas, Firebase, modelo de dados, regras de segurança, offline, publicação e domínio. |
| `docs/03-design-system.md` | Cores, fontes, componentes e princípios de usabilidade da área da Rô. |
| `docs/04-roteiro-de-tarefas.md` | Fases, etapas e o primeiro pedido para o Claude Code. |
| `docs/05-fluxo-de-ideias.md` | Como as ideias saem do chat no celular e chegam aqui. |
| `docs/06-especificacao-precifica.md` | Tudo o que o app Flutter faz, fórmulas, exemplo de teste, problemas encontrados e o novo módulo de massas. |
| `docs/07-pendencias-da-ro.md` | Fotos, textos e decisões que dependem da Rô. |
| `caixa-de-entrada/` | Ideias prontas para virar código ou conteúdo (uma por arquivo). |
| `conteudo/` | Material de partida: dados da confeitaria, frases da marca e links marcados. |

## Como começar em casa

1. Baixar esta pasta do Drive (botão direito → Fazer download; sai um .zip) e descompactar em `C:\Projetos\site-delicias-da-ro`.
2. Ter o repositório `precifica_ro_mobile` clonado ao lado (ex.: `C:\Projetos\precifica_ro_mobile`), só para consulta.
3. Abrir o terminal na pasta do site, rodar `claude` e colar o **primeiro pedido** de `docs/04-roteiro-de-tarefas.md`.
4. Antes da Fase 2, fazer a preparação do Firebase descrita em `docs/04-roteiro-de-tarefas.md` (Fase 0).

## Decisões em aberto

- Domínio próprio: confirmar o nome (o mais provável é `deliciasdaro.com.br`) e se está livre no Registro.br.
- E-mail Google da Rô para liberar o acesso.
- Itens de `docs/07-pendencias-da-ro.md`.
