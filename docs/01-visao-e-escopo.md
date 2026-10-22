# 01 – Visão e escopo

## Objetivo

1. Dar à Delícias da Rô um endereço próprio e bonito para o link da bio do Instagram (@chefrosangelavieira) e para o Perfil da Empresa no Google, que leve o cliente a pedir pelo WhatsApp.
2. Dar à Rô uma ferramenta de trabalho simples de usar no celular, com os dados guardados na nuvem: o Precifica Rô Web.

## Parte 1 – Site público

Pedidos continuam pelo WhatsApp: o botão abre a conversa com uma mensagem pronta (citando o produto quando o botão estiver num item do cardápio).

| Rota | Conteúdo |
|---|---|
| `#/inicio` | Capa de impacto (arte feita para o site + logo), frase da marca, botão grande "Fazer pedido no WhatsApp", destaques com fotos reais, resumo "Conheça a Rô", prévia do cardápio, "Como encomendar" em 3 passos, datas especiais, **números** (contadores, só com dados reais passados pela Rô) e rodapé |
| `#/cardapio` | Produtos por categoria (bolos decorados, caseiros, Bentô Cake, doces e brigadeiros, cupcakes, Kit Festa, Kit Mêsversário, bolos de 2 andares e temáticos), foto real, descrição curta, "a partir de" ou "consulte" (decisão da Rô) e botão de pedido do item |
| `#/encomendas` | Como pedir, antecedência mínima, sinal, retirada e entrega, formas de pagamento, aviso do Bentô Cake |
| `#/datas-especiais` | Página que muda com a época (Natal, Páscoa, Dia das Mães…), com as artes temáticas |
| `#/sobre` | A história da Rô contada por ela, formação em Gastronomia, jeito de trabalhar |
| `#/contato` | WhatsApp, Instagram, horário, região atendida, link para o Perfil no Google |

Também entra:
- **Dados da empresa em formato que o Google entende** (JSON-LD do tipo `Bakery`), com nome, telefone, horário e região iguais aos do Perfil da Empresa no Google.
- **Contador de visitas por origem**, sem cookies: os links publicados levam `?origem=instagram`, `?origem=google`, `?origem=whatsapp` e o painel aparece dentro da área da Rô.
- Link discreto "Área da Rô" no rodapé (ou nenhum link; decisão do Franklin). Mesmo que alguém abra, sem login não vê nada.

Fica para depois: pedido e pagamento pelo site.

## Parte 2 – Área da Rô (`/app/`)

Login com conta Google. Navegação inferior no celular e lateral no computador.

| Tela | Faz o quê |
|---|---|
| **Início** | Atalhos, últimas receitas, avisos (ex.: "último backup há 30 dias", receitas com status "Revisar dados") |
| **Dispensa** | Preço de cada ingrediente pela embalagem (ex.: farinha R$ 6,00 por 1 kg). Mudou o preço, todas as receitas ligadas são recalculadas |
| **Biblioteca** | Receitas de referência: cadastrar, buscar, editar, excluir, importar por JSON (inclusive o gerado no GPT), limpar |
| **Precificação** | Montar a receita a partir da Biblioteca ou do zero, custos, rendimento, lucro, preço sugerido, status e categorias |
| **Massas e rendimento** (novo) | Receitas base (massas, recheios, coberturas) com rendimento real pesado, custo por grama e quanto vai em cada aro |
| **Orçamentos** | Modelos de orçamento salvos e editáveis, PDF com tabela de tamanhos e fatias, envio pelo WhatsApp |
| **Ajustes** | Categorias, taxa operacional e lucro padrão, backup completo (exportar e importar), dados da conta |
| **Visitas** | Painel do contador do site público |

Regras que continuam valendo do app antigo:
- **Biblioteca e Precificação são módulos separados.** A Biblioteca é a receita de referência; a Precificação é uma cópia de trabalho com preços. Levar da Biblioteca para a Precificação cria uma precificação nova, nunca mistura os dois.
- Visual elegante e premium (creme, chocolate, rosa suave, caramelo), nada infantil ou poluído.

## Versões

| Versão | O que entra |
|---|---|
| **v1 do site** | Parte 1 completa no endereço do GitHub Pages |
| **v1 da área da Rô** | Login, Dispensa, Biblioteca, Precificação, Orçamentos, backup completo e migração dos dados do celular: **tudo o que o app faz hoje**, com interface nova |
| **v1.1** | Massas e rendimento, painel de visitas, instalar como app na tela inicial |
| **Futuro** | Cardápio do site editado pela própria Rô dentro da área dela; agenda de encomendas; acesso vendido para outras confeiteiras (cada uma com seu ateliê) |
