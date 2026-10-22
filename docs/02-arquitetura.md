# 02 – Arquitetura

## Visão geral

```
GitHub Pages (repositório público site-delicias-da-ro)
├── /            → site público (HTML/CSS/JS puro, SPA por hash)
└── /app/        → área da Rô (HTML/CSS/JS puro, SPA por hash)
                      │
                      ├── Firebase Authentication (login Google)
                      └── Cloud Firestore (dados, regras de segurança, cache offline)
```

O código é público. Os dados não: ficam no Firestore e só as contas autorizadas leem e gravam, porque as **regras do Firestore** são aplicadas no servidor do Google.

## Pastas

```
site-delicias-da-ro/
├── index.html
├── 404.html                 (redireciona para #/inicio)
├── CNAME                    (só quando o domínio próprio entrar)
├── css/  variaveis.css base.css layout.css componentes.css utilitarios.css
├── html/ (views do site)
├── js/   main.js  roteador.js  dados/  modules/  telas/
├── imagens/
├── app/
│   ├── index.html
│   ├── manifest.webmanifest   (instalar na tela inicial; v1.1)
│   ├── css/ app.css           (importa ../css/variaveis.css)
│   ├── js/
│   │   ├── main.js  roteador.js
│   │   ├── firebase.js        (inicialização e versão fixada do SDK)
│   │   ├── dominio/           (cálculos puros: precificacao.js, dispensa.js, status.js, massas.js, numeros.js)
│   │   ├── dados/             (repositórios: leem e gravam no Firestore)
│   │   ├── importacao/        (JSON do GPT, backup do app antigo, backup completo)
│   │   ├── pdf/               (orçamento em PDF)
│   │   └── telas/
│   └── tests/                 (node --test)
├── firestore.rules
├── firebase.json              (só para o emulador e o deploy das regras)
├── docs/
└── README.md
```

Camadas na área da Rô (mesma ideia da Clean Architecture do app Flutter): **telas** chamam **dados** e **dominio**; **dominio** não conhece DOM nem Firebase.

## Firebase

- Projeto: `delicias-da-ro` (criado pelo Franklin no console, plano gratuito **Spark**, sem cartão: não há como gerar cobrança).
- **Authentication:** provedor Google. Domínios autorizados: `nilknarfsam.github.io` e, depois, o domínio próprio. Usar `signInWithPopup` (o redirect tem problemas em domínios que não são do Firebase).
- **Firestore:** com cache offline persistente (`persistentLocalCache` + `persistentMultipleTabManager`). A Rô pode editar sem internet; ao reconectar, sincroniza sozinho.
- **App Check com reCAPTCHA v3** (recomendado): impede que outro site use a configuração do projeto.
- Limites do plano gratuito (50 mil leituras e 20 mil gravações por dia, 1 GB) sobram para o uso da Rô.

## Modelo de dados (pronto para vários usuários)

Cada confeiteira tem um **ateliê**. Hoje existe um só: o da Rô, com dois membros.

```
ateliers/{atelierId}
  nome: "Delícias da Rô"
  membros: { <uidDaRo>: "dona", <uidDoFranklin>: "gestor" }
  criadoEm, atualizadoEm
  configuracoes: { taxaOperacionalPadrao: 0.30, lucroPadrao: 1.0, categorias: [...], ultimoBackupEm }

ateliers/{atelierId}/dispensa/{id}          ingrediente da Dispensa
ateliers/{atelierId}/biblioteca/{id}        receita de referência
ateliers/{atelierId}/precificacoes/{id}     receita precificada
ateliers/{atelierId}/bases/{id}             massas, recheios e coberturas (módulo novo)
ateliers/{atelierId}/aros/{id}              tamanhos de forma e quanto de cada base vai neles (módulo novo)
ateliers/{atelierId}/modelosOrcamento/{id}  modelos de orçamento
ateliers/{atelierId}/historicoPrecos/{id}   mudanças de preço na Dispensa (data, antes, depois)

usuarios/{uid}
  atelierAtual: <atelierId>
  nome, email, criadoEm
```

Os campos de cada documento seguem as entidades do app Flutter (ver `docs/06-especificacao-precifica.md`), em português e camelCase, com `criadoEm`, `atualizadoEm` e `atualizadoPor` (uid) em todos.

**Como alguém ganha acesso (v1):** o Franklin entra uma vez no app, o próprio app cria `usuarios/{uid}` e mostra "Acesso ainda não liberado". O Franklin então adiciona os uids no mapa `membros` do ateliê pelo console do Firebase. Sem estar em `membros`, a pessoa não lê nada. No futuro, a venda de acesso troca esse passo manual por um cadastro com pagamento.

## Regras de segurança (rascunho para o Claude Code completar e testar)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function logado() { return request.auth != null; }
    function membro(atelierId) {
      return logado() &&
        request.auth.uid in get(/databases/$(db)/documents/ateliers/$(atelierId)).data.membros;
    }

    match /usuarios/{uid} {
      allow read, write: if logado() && request.auth.uid == uid;
    }

    match /ateliers/{atelierId} {
      allow read: if membro(atelierId);
      allow update: if membro(atelierId)
        && request.resource.data.membros == resource.data.membros;   // membros só pelo console
      allow create, delete: if false;                                 // só pelo console na v1

      match /{colecao}/{docId} {
        allow read, write: if membro(atelierId);
      }
    }

    match /{tudo=**} { allow read, write: if false; }
  }
}
```

Antes de publicar: testar no emulador (ou no simulador de regras do console) os casos "sem login", "logado sem ser membro", "membro" e "tentar se adicionar em membros".

## Offline e sincronização

- O cache do Firestore guarda tudo no aparelho. Gravações feitas sem internet ficam na fila e sobem quando a conexão volta.
- Mostrar no topo um indicador discreto: "Sem internet: suas alterações serão enviadas quando voltar".
- Conflito (mesmo item editado no celular e no computador): vale a última gravação. Para receitas, guardar `atualizadoEm` e `atualizadoPor` e avisar se o item mudou em outro aparelho enquanto estava aberto.

## Backup

- Os dados já ficam na nuvem, mas a exportação automática do Firestore exige plano pago. Por isso:
  - Botão **"Baixar backup completo"** em Ajustes: um JSON com todas as coleções do ateliê e a versão do formato.
  - Botão **"Restaurar backup"**, que primeiro baixa um backup do estado atual.
  - Aviso na Início quando o último backup tiver mais de 30 dias.

## Migração dos dados do app do celular

O app Flutter guarda tudo em 4 chaves locais (`precifica_ro_library_recipes`, `precifica_ro_recipes`, `precifica_ro_pantry_ingredients`, `precifica_ro_user_categories`), mas **o backup dele só exporta a Biblioteca**. Para levar Dispensa, precificações e categorias:

1. Atualização pequena do app (v1.1): botão "Exportar tudo" que gera um JSON com as 4 chaves cruas.
2. Na área da Rô: "Importar do app antigo" lê esse JSON, converte os campos e grava no Firestore, mostrando antes um resumo ("32 receitas, 48 ingredientes, 12 precificações").
3. A Rô confere algumas receitas lado a lado (app × web) antes de parar de usar o app.

## Publicação

- GitHub Pages a partir da branch `main`, raiz do repositório.
- Endereço inicial: `https://nilknarfsam.github.io/site-delicias-da-ro/` (área da Rô em `.../app/`).
- `noindex` na área da Rô (`<meta name="robots" content="noindex">`) e `robots.txt` bloqueando `/app/`.
- Regras do Firestore publicadas pelo Franklin (console ou `firebase deploy --only firestore:rules`).

## Domínio (depois)

1. Comprar no Registro.br (provável `deliciasdaro.com.br`; confirmar).
2. Mesmo passo a passo do samfieldsoak.com.br: em "Configurar zona DNS", 4 registros A do GitHub Pages e CNAME `www` → `nilknarfsam.github.io`. Nunca mexer em "Alterar servidores DNS".
3. Arquivo `CNAME` no repositório e "Enforce HTTPS" ligado.
4. Adicionar o domínio novo nos **domínios autorizados** do Firebase Authentication e no App Check.
5. Atualizar o link da bio, o Perfil da Empresa no Google e o JSON-LD.

Como os dados estão na nuvem, trocar de domínio não perde nada.

## Contador de visitas

- Recomendado: **GoatCounter** (gratuito, sem cookies, sem dados pessoais, compatível com a LGPD), lendo o parâmetro `?origem=`.
- O painel aparece dentro da área da Rô (tela Visitas) pela API de leitura do GoatCounter; a chave de leitura fica no Firestore (`ateliers/{id}.configuracoes`), nunca no código.
- Se o Franklin preferir outro contador (o mesmo do samfieldsoak), seguir o dele.
