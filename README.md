# Delícias da Rô – site

Site da confeitaria **Delícias da Rô** (Chef Rosangela Vieira, Manaus – AM): link da bio do Instagram [@chefrosangelavieira](https://instagram.com/chefrosangelavieira) e do Perfil da Empresa no Google. Encomendas pelo WhatsApp.

Mais tarde, a área `app/` vai receber o **Precifica Rô Web** (só para a Rô, com login). Plano completo em [`LEIA-ME-PRIMEIRO.md`](LEIA-ME-PRIMEIRO.md) e [`docs/`](docs/).

## Acesso

- Site (depois de ligar o GitHub Pages): https://nilknarfsam.github.io/site-delicias-da-ro/
- Domínio próprio previsto: `deliciasdaro.com.br` (a confirmar no Registro.br)

## Telas e rotas (SPA por hash)

| Rota | Tela | Situação |
|---|---|---|
| `#/inicio` | Início | Capa com fotos reais, destaques, prévia do cardápio (1B); arte de capa pendente |
| `#/cardapio` | Cardápio | 6 categorias, cartões com foto real ou `[PENDENTE]`; atalhos `#/cardapio/<categoria>` (1B) |
| `#/encomendas` | Encomendas | 4 passos, regras e sabores a confirmar, aviso de retirada e perguntas frequentes (1C) |
| `#/datas-especiais` | Datas especiais | Campanha vintage com fotos reais e 4 datas com produtos e fotos pendentes (1C) |
| `#/sobre` | Sobre a Rô | Apresentação confirmada; história, tempo de confeitaria e foto opcionais pendentes (1C) |
| `#/contato` | Contato | WhatsApp e Instagram comerciais; horário a confirmar, região e Perfil no Google pendentes (1C) |

Rota inexistente volta para `#/inicio`. `design-system.html` mostra cores, fontes e componentes (fora do menu).

## Estrutura

```
index.html          casca da SPA (cabeçalho, menu, <main id="app">, rodapé, botão do WhatsApp)
404.html            redireciona para o início
design-system.html  página de apoio
html/               uma view por tela
css/                variaveis → base → layout → componentes → utilitarios
js/main.js          ponto de entrada
js/dados/site.js    contato comercial (WhatsApp, Instagram, horário)
js/dados/cardapio.js categorias e itens do cardápio (sem preços enquanto a Rô não decidir)
js/dados/encomendas.js passos, regras e sabores com confirmado, FAQ e campanhas (sem preços)
js/telas/           inicio.js, cardapio.js, encomendas.js e datas-especiais.js
imagens/produtos/   fotos reais em 4:5 (WebP 480/800 + JPG)
js/modules/         roteador, menu, templates (escapar), whatsapp
imagens/logo/       logo original em WebP + PNG e ícones
ferramentas/        contraste.mjs (mede o contraste das cores)
docs/               plano, arquitetura, design system, roteiro, passagem de bastão
```

## Design system

Tokens só em `css/variaveis.css`: cores da marca (manual v2), escala tipográfica 1,25, espaços em múltiplos de 8px. Títulos em serifada (Fraunces), texto em Nunito, frases curtas em Dancing Script. Detalhes em [`docs/03-design-system.md`](docs/03-design-system.md).

## Acessibilidade

Um `h1` por tela, foco movido para o título a cada troca de tela, "Pular para o conteúdo", foco visível, alvos de toque ≥ 44px, `prefers-reduced-motion`. Contraste medido com `node ferramentas/contraste.mjs` (todos os pares de texto ≥ 4,5:1; menor: botão principal 5,30:1).

## Como rodar

```
python -m http.server 8080
# abrir http://localhost:8080
node ferramentas/contraste.mjs
```

## Fluxo de trabalho

Uma etapa por branch `feat/...` com PR. Projeto em dupla Claude + Codex: ler [`AGENTS.md`](AGENTS.md) e [`docs/PASSAGEM.md`](docs/PASSAGEM.md) antes de começar.

## Uso de IA

Site desenvolvido com Claude e Codex, com revisão do Franklin por etapa. Fotos dos produtos são sempre reais; o logo é o arquivo original.
