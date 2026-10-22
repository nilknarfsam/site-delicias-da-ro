# CLAUDE.md – site da Delícias da Rô + Precifica Rô Web (v1)

## Quem é o dono e como falar com ele

- Franklin, de Manaus/AM. Técnico em engenharia de testes de hardware (não chamar de "engenheiro"), desenvolvedor (Python, Flutter, C#, web) e designer. GitHub `nilknarfsam`.
- A confeitaria é da esposa dele, a **Rosangela (Rô)**, Chef Rosangela Vieira, formada em Gastronomia. Marca: **Delícias da Rô**, "Sabores que encantam". Instagram oficial **@chefrosangelavieira** (o antigo @rosangela_delicias_da_ro não deve aparecer).
- Falar em português do Brasil, direto e simples. Explicar o que vai fazer antes de fazer.
- Nunca apagar arquivos, nunca `git push --force`, `reset --hard` ou apagar branch/tag sem ele pedir.

## Escopo de leitura (importante)

- Leia **esta pasta do projeto**. Ideias novas chegam em `caixa-de-entrada/`.
- **Exceção:** pode ler o repositório `precifica_ro_mobile` (app Flutter antigo) **só para consulta**, para conferir fórmulas, telas e formatos de JSON. Nunca altere esse repositório, a não ser na etapa 2G do roteiro (exportação completa), e só com o ok do Franklin.
- Ordem de leitura: `LEIA-ME-PRIMEIRO.md`, `docs/01` a `docs/07`, depois `caixa-de-entrada/` e `conteudo/`.

## O que estamos construindo

1. **Site público** estático no GitHub Pages: Início, Cardápio, Encomendas, Datas especiais, Sobre a Rô, Contato, com botão do WhatsApp em todas as telas.
2. **Área da Rô** em `/app/`: o Precifica Rô reescrito para a web, com login pelo Firebase Authentication (Google), dados no Firestore com regras de segurança, funcionando offline com sincronização.

## Arquitetura obrigatória

Seguir a skill **base-site-spa-franklin** se estiver instalada. Resumo:

- HTML, CSS e JavaScript puro, sem framework e **sem etapa de build**. ES Modules.
- SPA com roteador por **hash** (`#/secao/slug`).
- **Caminhos sempre relativos** (nunca começar com `/`), porque o site nasce em `nilknarfsam.github.io/site-delicias-da-ro/` e depois vai para a raiz de um domínio próprio.
- Pastas do site: `index.html`, `html/`, `css/` (variaveis → base → layout → componentes → utilitarios), `js/main.js`, `js/dados/`, `js/modules/`, `js/telas/`, `imagens/`.
- A área da Rô fica em `app/`, com a mesma organização e com `app/js/dominio/` para as regras de cálculo (funções puras, sem DOM e sem Firebase).
- Tokens só em `css/variaveis.css` (o `app/` importa os mesmos tokens). Mobile first. Grid de 12 colunas no macro, Flexbox nos componentes.
- Todo texto vindo de dados ou do usuário passa por `escapar()`.
- Acessibilidade: um `h1` por tela, contraste ≥ 4,5:1, foco visível, "Pular para o conteúdo", `alt` correto, alvos de toque ≥ 44px.
- Firebase pelo SDK modular via CDN oficial (`https://www.gstatic.com/firebasejs/<versão>/...`), versão fixada num só arquivo `app/js/firebase.js`.
- Testes das regras de cálculo com `node --test` (sem dependências), em `app/tests/`.
- Testar o site com `python -m http.server 8080`.

## Regras de segurança e dados (não negociáveis)

1. **Nenhum custo, receita, dado da Dispensa ou da precificação no repositório.** Tudo isso vive no Firestore. A única exceção são os preços de venda que a Rô decidir mostrar aos clientes no cardápio ("a partir de"), que podem ficar em `js/dados/cardapio.js`.
2. A configuração do Firebase (`apiKey` etc.) pode ficar no código: ela não é segredo. O que protege são as **regras do Firestore** (`firestore.rules`), que precisam ser escritas, testadas no emulador ou no simulador do console e mostradas ao Franklin antes de publicar.
3. Nenhum e-mail pessoal nas regras ou no código. O acesso é dado pela lista de membros do ateliê no Firestore (ver `docs/02-arquitetura.md`).
4. Toda operação que apaga dados pede confirmação e oferece desfazer quando possível. Antes de qualquer migração ou importação, gerar um backup em JSON.
5. Site público sem coleta de dados pessoais. Contador de visitas sem cookies.

## Regras de conteúdo do site público

1. **Nada inventado sobre a Rô**: história, formação, números e preços só com o que o Franklin ou a Rô passarem. Na falta, deixar marcador visível `[PENDENTE: ...]` e listar no fim da etapa.
2. **Produtos sempre com foto real.** Imagem gerada por IA só para capa, fundos e arte decorativa, nunca no lugar de um produto.
3. Logo sempre o arquivo original, nunca recriado.
4. Só contato comercial: WhatsApp (92) 98168-1827, Instagram @chefrosangelavieira. Nenhum endereço residencial.
5. Bentô Cake e bolos pequenos: aviso de retirada no ateliê, por carro particular (sem transporte por moto).
6. Personagens licenciados só aparecem em foto real de bolo, nunca desenhados.
7. Português correto, com acentos. No máximo uma exclamação por frase.

## Fluxo de trabalho

- Antes de codar: mostrar o plano da etapa e esperar o ok.
- Uma etapa por branch `feat/...`, commits em português (Conventional Commits), PR para o Franklin aprovar.
- Ao fim de cada etapa: testar em 390px e 1280px, dizer o que está pronto, o que foi testado e o que falta.
- Manter o `README.md` atualizado e registrar cada publicação em `docs/registro-de-publicacoes.md` (criar se não existir).

## Rotina: processar a caixa de entrada

Quando o Franklin pedir "processe a caixa de entrada":

1. Listar os arquivos de `caixa-de-entrada/` com `status: pendente` (ignorar `_MODELO-de-ideia.md` e `processadas/`).
2. Mostrar um resumo de uma linha de cada e perguntar se faz todos ou só alguns.
3. Seguir o "Pedido para o Claude Code" escrito no próprio arquivo.
4. Rodar local e mostrar a rota exata.
5. Com o ok: commit, mudar para `status: publicado` com a data, mover para `caixa-de-entrada/processadas/`, registrar em `docs/registro-de-publicacoes.md`.
6. Lembrar o Franklin de avisar o Claude do celular o que foi publicado.
