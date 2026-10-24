import {
  filtrarReceitas,
  listarCategorias,
} from '../dominio/biblioteca.js';
import {
  observarBiblioteca,
  excluirReceita,
} from '../dados/biblioteca.js';
import { observarDispensa } from '../dados/dispensa.js';
import { criarRascunhoDaReceita } from '../dados/precificacoes.js';
import { escapar } from '../modules/templates.js';
import {
  configurarContextoEdicao,
  abrirNovaReceita,
  abrirEdicao,
  abrirImportacao,
  exportar,
  limpar as limparBibliotecaAcao,
} from './biblioteca-edicao.js';

const DURACAO_DESFAZER_MS = 8000;

export const acoes = {
  abrirNovaReceita,
  abrirEdicao,
  abrirImportacao,
  exportar,
  limpar: limparBibliotecaAcao,
};

export function registrarAcoesBiblioteca(novasAcoes = {}) {
  Object.assign(acoes, novasAcoes);
}

function formatarTextoMultilinha(texto) {
  return escapar(String(texto ?? '').trim()).replace(/\r?\n/g, '<br>');
}

function formatarNumeroIngrediente(valor) {
  if (valor == null || valor === '') return '';
  return String(valor).replace('.', ',');
}

function formatarQuantidadeIngrediente(ingrediente) {
  const original = String(ingrediente?.quantidadeOriginal ?? '').trim();
  if (original) return original;

  const usada = ingrediente?.quantidadeUsada;
  if (usada != null && usada !== '' && Number.isFinite(Number(usada)) && Number(usada) > 0) {
    const numero = formatarNumeroIngrediente(usada);
    const unidade = String(ingrediente?.unidadeUsada || ingrediente?.unidadeBase || '').trim();
    return unidade ? `${numero} ${unidade}` : numero;
  }
  return '';
}

function formatarLocalidade(receita) {
  const cidade = String(
    receita?.localidadeCidade || receita?.localidadeReferencia?.cidade || '',
  ).trim();
  const estado = String(
    receita?.localidadeEstado || receita?.localidadeReferencia?.estado || '',
  ).trim();
  if (cidade && estado) return `${cidade}/${estado}`;
  return cidade || estado;
}

function agruparIngredientes(ingredientes = []) {
  const mapaGrupos = new Map();

  for (const item of ingredientes) {
    if (!item || typeof item !== 'object') continue;
    const nomeGrupo = String(item.grupo ?? '').trim() || 'Ingredientes';
    if (!mapaGrupos.has(nomeGrupo)) {
      mapaGrupos.set(nomeGrupo, []);
    }
    mapaGrupos.get(nomeGrupo).push(item);
  }

  if (mapaGrupos.size === 0) {
    return [{ nome: 'Ingredientes', itens: [] }];
  }

  return Array.from(mapaGrupos.entries()).map(([nome, itensBrutos]) => {
    // Agrupa itens do mesmo grupoAlternativa em sequência para ligá-los com "ou"
    const itensOrdenados = [];
    const visitados = new Set();

    for (let i = 0; i < itensBrutos.length; i += 1) {
      if (visitados.has(i)) continue;
      visitados.add(i);
      const atual = itensBrutos[i];
      const alt = String(atual.grupoAlternativa ?? '').trim();
      itensOrdenados.push({ item: atual, ehContinuacaoAlternativa: false, temAlternativa: Boolean(alt) });

      if (alt) {
        for (let j = i + 1; j < itensBrutos.length; j += 1) {
          if (visitados.has(j)) continue;
          const candidato = itensBrutos[j];
          if (String(candidato.grupoAlternativa ?? '').trim() === alt) {
            visitados.add(j);
            itensOrdenados.push({ item: candidato, ehContinuacaoAlternativa: true, temAlternativa: true });
          }
        }
      }
    }

    return { nome, itens: itensOrdenados };
  });
}

export function renderizarBiblioteca(container, opcoes = {}) {
  if (typeof container?._limparBiblioteca === 'function') {
    container._limparBiblioteca();
  }

  const atelierId = opcoes.atelierId || opcoes.idAtelie || opcoes.atelie?.id || '';
  const uid = opcoes.uid || opcoes.usuario?.uid || '';

  let ativa = true;
  let carregado = false;
  let receitas = [];
  let dispensa = [];
  let termoBusca = '';
  let categoriaSelecionada = '';
  let receitaDetalhe = null;
  let receitaParaExcluir = null;
  let acaoRestaurar = null;
  let temporizadorDesfazer = null;
  let origemFoco = null;

  container.innerHTML = `
    <section class="biblioteca">
      <header class="cabecalho-tela">
        <h1>Biblioteca</h1>
        <p class="cabecalho-tela__subtitulo">Receitas de referência. Para calcular o preço, leve a receita para a Precificação.</p>
      </header>

      <div class="biblioteca__controles">
        <div class="biblioteca__linha-topo">
          <div class="biblioteca__busca">
            <label class="campo__rotulo" for="campo-busca-biblioteca">Buscar receita ou ingrediente</label>
            <input
              id="campo-busca-biblioteca"
              class="campo__controle"
              type="search"
              autocomplete="off"
              placeholder="Ex.: Bolo de chocolate, farinha, brigadeiro…"
            >
          </div>
          <div class="biblioteca__acao-principal">
            <button id="botao-nova-receita" type="button" class="botao botao--principal" data-acao="nova">
              Nova receita
            </button>
          </div>
        </div>

        <div class="biblioteca__acoes-secundarias">
          <button id="botao-importar-biblioteca" type="button" class="botao botao--contorno botao--compacto" data-acao="importar">
            Importar JSON
          </button>
          <button id="botao-exportar-biblioteca" type="button" class="botao botao--contorno botao--compacto" data-acao="exportar">
            Exportar
          </button>
          <button id="botao-limpar-biblioteca" type="button" class="botao botao--contorno botao--compacto" data-acao="limpar">
            Limpar Biblioteca
          </button>
        </div>

        <div
          id="chips-categoria-biblioteca"
          class="biblioteca__categorias"
          role="group"
          aria-label="Filtrar por categoria"
        ></div>
      </div>

      <p id="aviso-status-biblioteca" class="biblioteca__aviso-status" role="status" aria-live="polite" hidden></p>

      <div class="biblioteca__resumo">
        <p id="contador-biblioteca" class="biblioteca__contador" aria-live="polite">0 receitas</p>
      </div>

      <p id="estado-vazio-biblioteca" class="painel biblioteca__vazio" hidden></p>
      <ul id="lista-biblioteca" class="biblioteca__lista"></ul>

      <div id="aviso-desfazer-biblioteca" class="aviso-desfazer" role="status" aria-live="polite" hidden>
        <span id="texto-desfazer-biblioteca" class="aviso-desfazer__texto"></span>
        <button id="botao-desfazer-biblioteca" type="button" class="botao botao--contorno botao--compacto">
          Desfazer
        </button>
      </div>

      <dialog id="dialogo-detalhe-receita" class="dialogo dialogo--grande" aria-labelledby="titulo-detalhe-receita">
        <div class="dialogo__corpo biblioteca-detalhe">
          <header class="biblioteca-detalhe__cabecalho">
            <div class="biblioteca-detalhe__titulo-linha">
              <h2 id="titulo-detalhe-receita" class="dialogo__titulo"></h2>
              <span id="selo-pendente-detalhe" class="biblioteca-cartao__selo" hidden>Aguardando envio</span>
            </div>
            <div id="meta-detalhe-receita" class="biblioteca-detalhe__meta" hidden></div>
          </header>

          <p id="descricao-detalhe-receita" class="biblioteca-detalhe__descricao" hidden></p>

          <section id="secao-ingredientes-detalhe" class="biblioteca-detalhe__secao" aria-label="Ingredientes da receita"></section>

          <section id="secao-preparo-detalhe" class="biblioteca-detalhe__secao" aria-labelledby="titulo-preparo-detalhe" hidden>
            <h3 id="titulo-preparo-detalhe" class="biblioteca-detalhe__subtitulo">Modo de preparo</h3>
            <p id="texto-preparo-detalhe" class="biblioteca-detalhe__texto-longo"></p>
          </section>

          <section id="secao-observacoes-detalhe" class="biblioteca-detalhe__secao" aria-labelledby="titulo-observacoes-detalhe" hidden>
            <h3 id="titulo-observacoes-detalhe" class="biblioteca-detalhe__subtitulo">Observações</h3>
            <p id="texto-observacoes-detalhe" class="biblioteca-detalhe__texto-longo"></p>
          </section>

          <p id="aviso-status-detalhe" class="biblioteca__aviso-status" role="status" aria-live="polite" hidden></p>

          <div class="dialogo__acoes biblioteca-detalhe__acoes">
            <button id="botao-levar-precificacao" type="button" class="botao botao--principal" data-acao="precificar">
              Levar para a Precificação
            </button>
            <button id="botao-editar-receita" type="button" class="botao botao--contorno" data-acao="editar">
              Editar
            </button>
            <button id="botao-excluir-receita" type="button" class="botao botao--contorno" data-acao="excluir">
              Excluir
            </button>
            <button id="botao-fechar-detalhe" type="button" class="botao botao--contorno" data-acao="fechar">
              Fechar
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        id="dialogo-excluir-receita"
        class="dialogo"
        aria-labelledby="titulo-dialogo-excluir-receita"
        aria-describedby="texto-confirmar-exclusao-receita"
      >
        <div class="dialogo__corpo">
          <h2 id="titulo-dialogo-excluir-receita" class="dialogo__titulo">Excluir receita</h2>
          <p id="texto-confirmar-exclusao-receita" class="dialogo__texto"></p>
          <p id="erro-excluir-receita" class="alerta-erro" role="alert" hidden></p>
          <div class="dialogo__acoes">
            <button id="botao-confirmar-excluir-receita" type="button" class="botao botao--principal">
              Excluir
            </button>
            <button id="botao-cancelar-excluir-receita" type="button" class="botao botao--contorno">
              Cancelar
            </button>
          </div>
        </div>
      </dialog>
    </section>
  `;

  const secaoBiblioteca = container.querySelector('.biblioteca');
  const campoBusca = container.querySelector('#campo-busca-biblioteca');
  const botaoNovaReceita = container.querySelector('#botao-nova-receita');
  const chipsCategoriaEl = container.querySelector('#chips-categoria-biblioteca');
  const avisoStatus = container.querySelector('#aviso-status-biblioteca');
  const contadorEl = container.querySelector('#contador-biblioteca');
  const estadoVazioEl = container.querySelector('#estado-vazio-biblioteca');
  const listaEl = container.querySelector('#lista-biblioteca');

  const avisoDesfazerEl = container.querySelector('#aviso-desfazer-biblioteca');
  const textoDesfazerEl = container.querySelector('#texto-desfazer-biblioteca');
  const botaoDesfazer = container.querySelector('#botao-desfazer-biblioteca');

  const dialogoDetalhe = container.querySelector('#dialogo-detalhe-receita');
  const tituloDetalheEl = container.querySelector('#titulo-detalhe-receita');
  const seloPendenteDetalheEl = container.querySelector('#selo-pendente-detalhe');
  const metaDetalheEl = container.querySelector('#meta-detalhe-receita');
  const descricaoDetalheEl = container.querySelector('#descricao-detalhe-receita');
  const secaoIngredientesDetalheEl = container.querySelector('#secao-ingredientes-detalhe');
  const secaoPreparoDetalheEl = container.querySelector('#secao-preparo-detalhe');
  const textoPreparoDetalheEl = container.querySelector('#texto-preparo-detalhe');
  const secaoObservacoesDetalheEl = container.querySelector('#secao-observacoes-detalhe');
  const textoObservacoesDetalheEl = container.querySelector('#texto-observacoes-detalhe');
  const avisoStatusDetalhe = container.querySelector('#aviso-status-detalhe');
  const botaoLevarPrecificacao = container.querySelector('#botao-levar-precificacao');
  const botaoEditarReceita = container.querySelector('#botao-editar-receita');
  const botaoExcluirReceita = container.querySelector('#botao-excluir-receita');
  const botaoFecharDetalhe = container.querySelector('#botao-fechar-detalhe');

  const dialogoExcluir = container.querySelector('#dialogo-excluir-receita');
  const textoConfirmarExclusao = container.querySelector('#texto-confirmar-exclusao-receita');
  const erroExcluirEl = container.querySelector('#erro-excluir-receita');
  const botaoConfirmarExcluir = container.querySelector('#botao-confirmar-excluir-receita');
  const botaoCancelarExcluir = container.querySelector('#botao-cancelar-excluir-receita');

  function mostrarStatus(mensagem) {
    if (!mensagem) {
      avisoStatus.textContent = '';
      avisoStatus.hidden = true;
      avisoStatusDetalhe.textContent = '';
      avisoStatusDetalhe.hidden = true;
      return;
    }
    avisoStatus.textContent = mensagem;
    avisoStatus.hidden = false;
    if (dialogoDetalhe.open || dialogoDetalhe.hasAttribute('open')) {
      avisoStatusDetalhe.textContent = mensagem;
      avisoStatusDetalhe.hidden = false;
    }
  }

  function abrirModalDialogo(dialogo) {
    if (typeof dialogo.showModal === 'function') {
      dialogo.showModal();
    } else {
      dialogo.setAttribute('open', '');
    }
  }

  function fecharModalDialogo(dialogo) {
    if (typeof dialogo.close === 'function' && dialogo.open) {
      dialogo.close();
    } else {
      dialogo.removeAttribute('open');
      restaurarFocoAbertura();
    }
  }

  function encontrarCartaoReceita(id) {
    if (!id) return null;
    const botoes = listaEl.querySelectorAll('button[data-acao="detalhe"]');
    for (const botao of botoes) {
      if (botao.dataset.id === id) return botao;
    }
    return null;
  }

  function restaurarFocoAbertura() {
    if (!ativa || !origemFoco) return;
    const alvo = origemFoco;
    origemFoco = null;

    if (alvo.id) {
      const cartao = encontrarCartaoReceita(alvo.id);
      if (cartao) {
        cartao.focus();
        return;
      }
    }
    if (alvo.elemento && typeof alvo.elemento.focus === 'function' && container.contains(alvo.elemento)) {
      alvo.elemento.focus();
      return;
    }
    botaoNovaReceita.focus();
  }

  function renderizarChipsCategorias() {
    const categorias = listarCategorias(receitas);
    if (categoriaSelecionada && !categorias.includes(categoriaSelecionada)) {
      categoriaSelecionada = '';
    }

    const todasAtiva = categoriaSelecionada === '';
    const chipsHtml = [
      `<button
        type="button"
        class="chip-categoria"
        data-categoria=""
        aria-pressed="${todasAtiva ? 'true' : 'false'}"
      >Todas</button>`,
      ...categorias.map((cat) => {
        const ativaCat = categoriaSelecionada === cat;
        const catEscapada = escapar(cat);
        return `<button
          type="button"
          class="chip-categoria"
          data-categoria="${catEscapada}"
          aria-pressed="${ativaCat ? 'true' : 'false'}"
        >${catEscapada}</button>`;
      }),
    ];

    chipsCategoriaEl.innerHTML = chipsHtml.join('');
  }

  function renderizarLista() {
    if (!ativa) return;

    renderizarChipsCategorias();

    const filtradas = filtrarReceitas(receitas, termoBusca, categoriaSelecionada);
    contadorEl.textContent = `${filtradas.length} ${filtradas.length === 1 ? 'receita' : 'receitas'}`;

    if (!carregado && receitas.length === 0) {
      listaEl.innerHTML = '';
      listaEl.hidden = true;
      estadoVazioEl.textContent = 'Carregando receitas…';
      estadoVazioEl.hidden = false;
      return;
    }

    if (receitas.length === 0) {
      listaEl.innerHTML = '';
      listaEl.hidden = true;
      estadoVazioEl.textContent = 'Nenhuma receita ainda. Cadastre ou importe um JSON.';
      estadoVazioEl.hidden = false;
      return;
    }

    if (filtradas.length === 0) {
      const termoLimpo = termoBusca.trim();
      listaEl.innerHTML = '';
      listaEl.hidden = true;
      if (termoLimpo && categoriaSelecionada) {
        estadoVazioEl.textContent = `Nada encontrado para "${termoLimpo}" em "${categoriaSelecionada}".`;
      } else if (termoLimpo) {
        estadoVazioEl.textContent = `Nada encontrado para "${termoLimpo}".`;
      } else {
        estadoVazioEl.textContent = `Nada encontrado na categoria "${categoriaSelecionada}".`;
      }
      estadoVazioEl.hidden = false;
      return;
    }

    estadoVazioEl.textContent = '';
    estadoVazioEl.hidden = true;
    listaEl.hidden = false;

    listaEl.innerHTML = filtradas.map((receita) => {
      const idEscapado = escapar(receita.id);
      const nomeEscapado = escapar(receita.nome);
      const seloPendente = receita.pendente
        ? '<span class="biblioteca-cartao__selo">Aguardando envio</span>'
        : '';

      const qtdIngredientes = Array.isArray(receita.ingredientes) ? receita.ingredientes.length : 0;
      const textoIngredientes = `${qtdIngredientes} ${qtdIngredientes === 1 ? 'ingrediente' : 'ingredientes'}`;

      const partesDetalhe = [];
      if (receita.categoria && String(receita.categoria).trim()) {
        partesDetalhe.push(`<span class="biblioteca-cartao__categoria">${escapar(receita.categoria.trim())}</span>`);
      }
      if (receita.rendimento && String(receita.rendimento).trim()) {
        partesDetalhe.push(`<span class="biblioteca-cartao__rendimento">${escapar(receita.rendimento.trim())}</span>`);
      }
      partesDetalhe.push(`<span class="biblioteca-cartao__ingredientes">${escapar(textoIngredientes)}</span>`);

      const detalhesHtml = partesDetalhe.join(
        '<span class="biblioteca-cartao__separador" aria-hidden="true">·</span>',
      );

      return `
        <li class="biblioteca-item">
          <button
            type="button"
            class="biblioteca-cartao"
            data-acao="detalhe"
            data-id="${idEscapado}"
          >
            <span class="biblioteca-cartao__cabecalho">
              <span class="biblioteca-cartao__nome">${nomeEscapado}</span>
              ${seloPendente}
            </span>
            <span class="biblioteca-cartao__detalhes">
              ${detalhesHtml}
            </span>
          </button>
        </li>
      `;
    }).join('');
  }

  function preencherDialogoDetalhe(receita) {
    tituloDetalheEl.textContent = receita.nome || '';
    seloPendenteDetalheEl.hidden = !receita.pendente;

    const metadados = [];
    if (receita.categoria && String(receita.categoria).trim()) {
      metadados.push({ rotulo: 'Categoria', valor: String(receita.categoria).trim() });
    }
    if (receita.rendimento && String(receita.rendimento).trim()) {
      metadados.push({ rotulo: 'Rendimento', valor: String(receita.rendimento).trim() });
    }
    if (receita.tempoPreparo && String(receita.tempoPreparo).trim()) {
      metadados.push({ rotulo: 'Tempo', valor: String(receita.tempoPreparo).trim() });
    }
    if (receita.dificuldade && String(receita.dificuldade).trim()) {
      metadados.push({ rotulo: 'Dificuldade', valor: String(receita.dificuldade).trim() });
    }
    if (receita.autor && String(receita.autor).trim()) {
      metadados.push({ rotulo: 'Autoria', valor: String(receita.autor).trim() });
    }
    if (receita.origem && String(receita.origem).trim()) {
      metadados.push({ rotulo: 'Origem', valor: String(receita.origem).trim() });
    }
    const localidade = formatarLocalidade(receita);
    if (localidade) {
      metadados.push({ rotulo: 'Localidade', valor: localidade });
    }

    if (metadados.length > 0) {
      metaDetalheEl.innerHTML = metadados.map((item) => (
        `<span class="biblioteca-detalhe__chip"><strong>${escapar(item.rotulo)}:</strong> ${escapar(item.valor)}</span>`
      )).join('');
      metaDetalheEl.hidden = false;
    } else {
      metaDetalheEl.innerHTML = '';
      metaDetalheEl.hidden = true;
    }

    if (receita.descricao && String(receita.descricao).trim()) {
      descricaoDetalheEl.innerHTML = formatarTextoMultilinha(receita.descricao);
      descricaoDetalheEl.hidden = false;
    } else {
      descricaoDetalheEl.innerHTML = '';
      descricaoDetalheEl.hidden = true;
    }

    const grupos = agruparIngredientes(receita.ingredientes);
    secaoIngredientesDetalheEl.innerHTML = grupos.map((grupo) => {
      const itensHtml = grupo.itens.map(({ item, ehContinuacaoAlternativa, temAlternativa }) => {
        const qtd = formatarQuantidadeIngrediente(item);
        const nomeIng = escapar(item.nome);
        const textoPrincipal = qtd
          ? `<span class="biblioteca-ingrediente__quantidade">${escapar(qtd)}</span> <span class="biblioteca-ingrediente__nome">${nomeIng}</span>`
          : `<span class="biblioteca-ingrediente__nome">${nomeIng}</span>`;

        const prefixoOu = ehContinuacaoAlternativa
          ? '<span class="biblioteca-ingrediente__ou">ou</span> '
          : '';

        const obsHtml = item.observacao && String(item.observacao).trim()
          ? ` <span class="biblioteca-ingrediente__obs">(${escapar(String(item.observacao).trim())})</span>`
          : '';

        const seloAlternativa = temAlternativa
          ? '<span class="biblioteca-ingrediente__selo">alternativa</span>'
          : '';

        const seloEstimado = item.precisaRevisao === true
          ? '<span class="biblioteca-ingrediente__selo biblioteca-ingrediente__selo--aviso">preço estimado</span>'
          : '';

        const selos = (seloAlternativa || seloEstimado)
          ? `<span class="biblioteca-ingrediente__selos">${seloAlternativa}${seloEstimado}</span>`
          : '';

        return `
          <li class="biblioteca-ingrediente">
            <span class="biblioteca-ingrediente__linha">${prefixoOu}${textoPrincipal}${obsHtml}</span>
            ${selos}
          </li>
        `;
      }).join('');

      return `
        <div class="biblioteca-detalhe__grupo">
          <h3 class="biblioteca-detalhe__subtitulo">${escapar(grupo.nome)}</h3>
          <ul class="biblioteca-detalhe__lista-ingredientes">
            ${itensHtml}
          </ul>
        </div>
      `;
    }).join('');

    if (receita.modoPreparo && String(receita.modoPreparo).trim()) {
      textoPreparoDetalheEl.innerHTML = formatarTextoMultilinha(receita.modoPreparo);
      secaoPreparoDetalheEl.hidden = false;
    } else {
      textoPreparoDetalheEl.innerHTML = '';
      secaoPreparoDetalheEl.hidden = true;
    }

    if (receita.observacoes && String(receita.observacoes).trim()) {
      textoObservacoesDetalheEl.innerHTML = formatarTextoMultilinha(receita.observacoes);
      secaoObservacoesDetalheEl.hidden = false;
    } else {
      textoObservacoesDetalheEl.innerHTML = '';
      secaoObservacoesDetalheEl.hidden = true;
    }
  }

  function abrirDetalheReceita(receita, elementoOrigem = null) {
    receitaDetalhe = receita;
    origemFoco = { id: receita.id, elemento: elementoOrigem };
    avisoStatusDetalhe.textContent = '';
    avisoStatusDetalhe.hidden = true;
    botaoLevarPrecificacao.disabled = false;

    preencherDialogoDetalhe(receita);
    abrirModalDialogo(dialogoDetalhe);
    botaoFecharDetalhe.focus();
  }

  function fecharDetalheReceita() {
    fecharModalDialogo(dialogoDetalhe);
  }

  function abrirConfirmacaoExcluir(receita) {
    receitaParaExcluir = receita;
    if (!origemFoco) {
      origemFoco = { id: receita.id };
    }
    textoConfirmarExclusao.textContent = `Excluir "${receita.nome}"? Rascunhos de precificação já criados não mudam.`;
    erroExcluirEl.textContent = '';
    erroExcluirEl.hidden = true;
    botaoConfirmarExcluir.disabled = false;
    botaoCancelarExcluir.disabled = false;

    abrirModalDialogo(dialogoExcluir);
    botaoCancelarExcluir.focus();
  }

  function limparTemporizadorDesfazer() {
    if (temporizadorDesfazer != null) {
      clearTimeout(temporizadorDesfazer);
      temporizadorDesfazer = null;
    }
  }

  function ocultarAvisoDesfazer() {
    limparTemporizadorDesfazer();
    acaoRestaurar = null;
    textoDesfazerEl.textContent = '';
    avisoDesfazerEl.hidden = true;
  }

  function mostrarAvisoDesfazer(nomeReceita, restaurar) {
    limparTemporizadorDesfazer();
    acaoRestaurar = restaurar;
    textoDesfazerEl.textContent = `${nomeReceita} excluída.`;
    avisoDesfazerEl.hidden = false;

    temporizadorDesfazer = setTimeout(() => {
      if (!ativa) return;
      ocultarAvisoDesfazer();
    }, DURACAO_DESFAZER_MS);
  }

  const contextoEdicao = {
    container,
    atelierId,
    uid,
    obterReceitas: () => receitas,
    obterDispensa: () => dispensa,
    mostrarStatus,
    fecharDetalhe: fecharDetalheReceita,
  };
  configurarContextoEdicao(contextoEdicao);

  campoBusca.addEventListener('input', () => {
    termoBusca = campoBusca.value;
    renderizarLista();
  });

  chipsCategoriaEl.addEventListener('click', (evento) => {
    const chip = evento.target.closest?.('button.chip-categoria');
    if (!chip) return;
    const novaCategoria = chip.dataset.categoria ?? '';
    categoriaSelecionada = novaCategoria;
    renderizarLista();
  });

  secaoBiblioteca.addEventListener('click', (evento) => {
    const botao = evento.target.closest?.('button[data-acao]');
    if (!botao || dialogoDetalhe.contains(botao)) return;

    const { acao, id } = botao.dataset;
    if (acao === 'nova') {
      (acoes.nova || acoes.abrirNovaReceita)?.(contextoEdicao);
    } else if (acao === 'importar') {
      (acoes.importar || acoes.abrirImportacao)?.(contextoEdicao);
    } else if (acao === 'exportar') {
      acoes.exportar?.(contextoEdicao);
    } else if (acao === 'limpar') {
      acoes.limpar?.(contextoEdicao);
    } else if (acao === 'detalhe') {
      const receita = receitas.find((item) => item.id === id);
      if (receita) {
        abrirDetalheReceita(receita, botao);
      }
    }
  });

  botaoFecharDetalhe.addEventListener('click', () => {
    fecharDetalheReceita();
  });

  dialogoDetalhe.addEventListener('close', () => {
    avisoStatusDetalhe.textContent = '';
    avisoStatusDetalhe.hidden = true;
    if (!dialogoExcluir.open && !dialogoExcluir.hasAttribute('open')) {
      receitaDetalhe = null;
      restaurarFocoAbertura();
    }
  });

  botaoLevarPrecificacao.addEventListener('click', async () => {
    if (!receitaDetalhe) return;
    botaoLevarPrecificacao.disabled = true;
    try {
      const resultado = await criarRascunhoDaReceita(atelierId, uid, receitaDetalhe, dispensa);
      if (!ativa) return;
      mostrarStatus('Rascunho criado. A Precificação chega na próxima etapa.');
      resultado?.sincronizado?.catch?.(() => {
        if (ativa) {
          mostrarStatus('Não foi possível sincronizar o rascunho agora. Tente novamente.');
        }
      });
    } catch {
      if (!ativa) return;
      mostrarStatus('Não foi possível criar o rascunho de precificação agora. Tente novamente.');
    } finally {
      if (ativa) {
        botaoLevarPrecificacao.disabled = false;
      }
    }
  });

  botaoEditarReceita.addEventListener('click', () => {
    if (!receitaDetalhe) return;
    const alvo = receitaDetalhe;
    (acoes.editar || acoes.abrirEdicao)?.(alvo, contextoEdicao);
  });

  botaoExcluirReceita.addEventListener('click', () => {
    if (!receitaDetalhe) return;
    const alvo = receitaDetalhe;
    const focoGuardado = origemFoco || { id: alvo.id };
    if (typeof dialogoDetalhe.close === 'function' && dialogoDetalhe.open) {
      dialogoDetalhe.close();
    } else {
      dialogoDetalhe.removeAttribute('open');
    }
    origemFoco = focoGuardado;
    abrirConfirmacaoExcluir(alvo);
  });

  botaoCancelarExcluir.addEventListener('click', () => {
    fecharModalDialogo(dialogoExcluir);
  });

  dialogoExcluir.addEventListener('close', () => {
    receitaParaExcluir = null;
    restaurarFocoAbertura();
  });

  botaoConfirmarExcluir.addEventListener('click', async () => {
    if (!receitaParaExcluir) return;
    const alvo = receitaParaExcluir;

    erroExcluirEl.textContent = '';
    erroExcluirEl.hidden = true;
    botaoConfirmarExcluir.disabled = true;
    botaoCancelarExcluir.disabled = true;

    try {
      const { restaurar } = await excluirReceita(atelierId, alvo.id);
      if (!ativa) return;

      mostrarStatus('');
      fecharModalDialogo(dialogoExcluir);
      mostrarAvisoDesfazer(alvo.nome, restaurar);
    } catch (erro) {
      if (!ativa) return;
      erroExcluirEl.textContent = erro?.message || 'Não foi possível excluir a receita agora. Tente novamente.';
      erroExcluirEl.hidden = false;
      botaoConfirmarExcluir.disabled = false;
      botaoCancelarExcluir.disabled = false;
    }
  });

  botaoDesfazer.addEventListener('click', () => {
    const restaurar = acaoRestaurar;
    ocultarAvisoDesfazer();
    if (typeof restaurar === 'function') {
      try {
        const resultado = restaurar();
        mostrarStatus('Receita restaurada.');
        resultado?.sincronizado?.catch?.(() => {
          if (ativa) mostrarStatus('Não foi possível desfazer. Cadastre a receita de novo.');
        });
      } catch {
        mostrarStatus('Não foi possível desfazer a exclusão agora.');
      }
    }
  });

  renderizarLista();

  let cancelarObservacaoBiblioteca = null;
  let cancelarObservacaoDispensa = null;

  if (atelierId) {
    cancelarObservacaoBiblioteca = observarBiblioteca(atelierId, ({ itens }) => {
      if (!ativa) return;
      carregado = true;
      receitas = Array.isArray(itens) ? itens : [];
      if (receitaDetalhe) {
        const atualizada = receitas.find((item) => item.id === receitaDetalhe.id);
        if (atualizada) {
          receitaDetalhe = atualizada;
          if (dialogoDetalhe.open || dialogoDetalhe.hasAttribute('open')) {
            preencherDialogoDetalhe(atualizada);
          }
        }
      }
      renderizarLista();
    });

    cancelarObservacaoDispensa = observarDispensa(atelierId, ({ itens }) => {
      if (!ativa) return;
      dispensa = Array.isArray(itens) ? itens : [];
    });
  } else {
    carregado = true;
    renderizarLista();
  }

  function limpar() {
    if (!ativa) return;
    ativa = false;
    configurarContextoEdicao(null);
    limparTemporizadorDesfazer();
    if (typeof cancelarObservacaoBiblioteca === 'function') {
      cancelarObservacaoBiblioteca();
      cancelarObservacaoBiblioteca = null;
    }
    if (typeof cancelarObservacaoDispensa === 'function') {
      cancelarObservacaoDispensa();
      cancelarObservacaoDispensa = null;
    }
    if (container._limparBiblioteca === limpar) {
      delete container._limparBiblioteca;
    }
  }

  container._limparBiblioteca = limpar;
  return limpar;
}
