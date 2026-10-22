# 04 – Roteiro de tarefas

Ordem: primeiro o site público, depois a área da Rô, depois as novidades. Uma etapa por branch, com PR para o Franklin aprovar.

## Fase 0 – Preparação (Franklin)

- [x] Criar o repositório público `nilknarfsam/site-delicias-da-ro` (22/10/2026).
- [ ] Ligar o GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root) depois do merge da 1A.
- [ ] Juntar com a Rô os itens de `docs/07-pendencias-da-ro.md` (dá para começar o site sem tudo; o que faltar fica marcado como pendente).
- [ ] Antes da Fase 2: criar o projeto `delicias-da-ro` no console do Firebase (plano Spark), ligar Authentication com Google, criar o Firestore (região `southamerica-east1`, São Paulo), registrar o app web e guardar a configuração.
- [ ] Antes da Fase 2: conseguir o e-mail Google da Rô.

## Fase 1 – Site público

| Etapa | O que entra | Precisa da Rô |
|---|---|---|
| **1A** Estrutura e design system ✅ (PR #1, publicado em 22/10) | Casca SPA, roteador, tokens, tipografia (mostrar as duas serifadas), cabeçalho, rodapé, botão flutuante do WhatsApp, 404 | Nada |
| **1B** Início e Cardápio ✅ (PR #2 aberto em 22/10) | Capa de impacto, destaques, prévia do cardápio, Cardápio por categoria com dados em `js/dados/cardapio.js` | Fotos reais por item, lista final do cardápio, preços ou "consulte" |
| **1C** Encomendas, Datas, Sobre, Contato | As 4 páginas | Antecedência, sinal, pagamento, retirada/entrega, região, história e formação, foto dela (se quiser) |
| **1D** Ligações e números | JSON-LD `Bakery`, Open Graph (prévia bonita no WhatsApp), favicon "R", contador de visitas com `?origem=`, números da home, `robots.txt` | Números reais para os contadores (ex.: anos de confeitaria) |
| **1E** Publicação | Testes em 390px e 1280px, contraste, links; publicar; entregar ao Franklin os links marcados para a bio e o Google | Aprovar o site no celular |

Depois da 1E, o Franklin coloca o link na bio do Instagram e no campo "Site" do Perfil da Empresa no Google.

## Fase 2 – Área da Rô (Precifica Rô Web)

| Etapa | O que entra | Precisa da Rô |
|---|---|---|
| **2A** Fundação | `app/` com casca, navegação, login Google, tela "acesso não liberado", ateliê, `firestore.rules` testadas, cache offline e indicador de conexão | Testar o login no celular dela |
| **2B** Domínio de cálculo | `app/js/dominio/` portado do Flutter com testes `node --test` (exemplo de `docs/06`) **antes** de qualquer tela | Nada |
| **2C** Dispensa | Lista, busca, cadastrar, editar, excluir, cascata de preços com aviso "X receitas atualizadas", histórico de preços | Protótipo aprovado |
| **2D** Biblioteca | Lista, busca, cadastrar, editar, excluir, importar JSON (mesmos formatos e apelidos de campo do app), limpar com confirmação, levar para a Precificação | Testar importação de um JSON do GPT |
| **2E** Precificação | Tela única com preço sempre visível, custos adicionais e indiretos, rendimento, lucro, status, categorias, copiar resumo | Conferir 3 receitas contra o app antigo |
| **2F** Orçamentos | Modelos salvos e editáveis, PDF com tabela de tamanhos e fatias, compartilhar (Web Share com arquivo; no computador, baixar o PDF e abrir o WhatsApp com o texto) | Revisar os modelos (o @ antigo sai) |
| **2G** Backup e migração | Backup completo (baixar e restaurar), aviso de 30 dias; **no repositório `precifica_ro_mobile`, com ok do Franklin:** botão "Exportar tudo" e novo APK; importação do app antigo na web | Exportar do celular e conferir na web |

## Fase 3 – Novidades

| Etapa | O que entra |
|---|---|
| **3A** Massas e rendimento | Módulo de bases e aros (especificação em `docs/06`, seção 6) |
| **3B** Instalar como app | Manifest, ícone "R", tela de abertura |
| **3C** Painel de visitas | Tela Visitas lendo o contador |
| **3D** Cardápio pela área da Rô | A Rô edita o cardápio do site dentro da área dela (coleção pública só com nome, foto, descrição e "a partir de"; **nunca** custo) |
| **3E** Agenda de encomendas | A decidir com a Rô |
| **3F** Vários ateliês | Cadastro de novas confeiteiras e venda de acesso, quando o Franklin decidir |

## Primeiro pedido para o Claude Code

```
Leia LEIA-ME-PRIMEIRO.md, CLAUDE.md e docs/01 a docs/07 desta pasta.
Depois me diga em poucas linhas o que entendeu e me mostre o plano da etapa 1A
(arquivos que vai criar, tokens de cor e as duas opções de fonte serifada).
Não escreva código antes do meu ok.
```
