import {
  UNIDADES,
  paraArmazenamento,
  paraFormulario,
  validarIngrediente,
  precoReferencia,
  descreverEmbalagem,
  filtrarIngredientes,
} from '../dominio/dispensa.js';
import {
  observarDispensa,
  salvarIngrediente,
  excluirIngrediente,
  listarHistorico,
} from '../dados/dispensa.js';
import { escapar } from '../modules/templates.js';

const DURACAO_DESFAZER_MS = 8000;
const CAMPOS_FORMULARIO = ['nome', 'preco', 'quantidade', 'unidade'];

function formatarNumeroCampo(valor) {
  if (valor == null || valor === '') return '';
  return String(valor).replace('.', ',');
}

function formatarDataHistorico(data) {
  if (data == null) return 'Aguardando envio';
  let dataObj = null;
  if (typeof data.toDate === 'function') {
    dataObj = data.toDate();
  } else if (typeof data.toMillis === 'function') {
    dataObj = new Date(data.toMillis());
  } else if (data instanceof Date) {
    dataObj = data;
  }
  if (!dataObj || Number.isNaN(dataObj.getTime())) {
    return 'Aguardando envio';
  }
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = String(dataObj.getFullYear());
  return `${dia}/${mes}/${ano}`;
}

export function renderizarDispensa(container, opcoes = {}) {
  if (typeof container?._limparDispensa === 'function') {
    container._limparDispensa();
  }

  const atelierId = opcoes.atelierId || opcoes.idAtelie || opcoes.atelie?.id || '';
  const uid = opcoes.uid || opcoes.usuario?.uid || '';

  let ativa = true;
  let carregado = false;
  let ingredientes = [];
  let termoBusca = '';
  let idEdicao = null;
  let ingredienteParaExcluir = null;
  let acaoRestaurar = null;
  let temporizadorDesfazer = null;
  let origemFoco = null;
  let sequenciaHistorico = 0;

  const opcoesUnidadesHtml = UNIDADES.map((item) => (
    `<option value="${escapar(item.id)}">${escapar(item.rotulo)}</option>`
  )).join('');

  container.innerHTML = `
    <section class="dispensa">
      <header class="cabecalho-tela">
        <h1>Dispensa</h1>
        <p class="cabecalho-tela__subtitulo">Preço de cada ingrediente pela embalagem. Mudou o preço, as receitas ligadas são recalculadas.</p>
      </header>

      <div class="dispensa__controles">
        <div class="dispensa__busca">
          <label class="campo__rotulo" for="campo-busca-dispensa">Buscar ingrediente</label>
          <input
            id="campo-busca-dispensa"
            class="campo__controle"
            type="search"
            autocomplete="off"
            placeholder="Ex.: Farinha, açúcar, manteiga…"
          >
        </div>
        <div class="dispensa__acao-principal">
          <button id="botao-novo-ingrediente" type="button" class="botao botao--principal">
            Novo ingrediente
          </button>
        </div>
      </div>

      <p id="aviso-status-dispensa" class="dispensa__aviso-status" role="status" aria-live="polite" hidden></p>

      <div class="dispensa__resumo">
        <p id="contador-dispensa" class="dispensa__contador" aria-live="polite">0 ingredientes</p>
      </div>

      <p id="estado-vazio-dispensa" class="painel dispensa__vazio" hidden></p>
      <ul id="lista-dispensa" class="dispensa__lista"></ul>

      <div id="aviso-desfazer" class="aviso-desfazer" role="status" aria-live="polite" hidden>
        <span id="texto-desfazer" class="aviso-desfazer__texto"></span>
        <button id="botao-desfazer" type="button" class="botao botao--contorno botao--compacto">
          Desfazer
        </button>
      </div>

      <dialog id="dialogo-ingrediente" class="dialogo" aria-labelledby="titulo-dialogo-ingrediente">
        <form id="formulario-ingrediente" class="dialogo__corpo" novalidate>
          <h2 id="titulo-dialogo-ingrediente" class="dialogo__titulo">Novo ingrediente</h2>

          <div class="campo">
            <label class="campo__rotulo" for="campo-nome">Nome</label>
            <input
              id="campo-nome"
              name="nome"
              class="campo__controle"
              type="text"
              autocomplete="off"
              aria-describedby="erro-nome"
            >
            <p id="erro-nome" class="campo__erro" hidden></p>
          </div>

          <div class="dialogo__grade">
            <div class="campo">
              <label class="campo__rotulo" for="campo-preco">Preço da embalagem (R$)</label>
              <input
                id="campo-preco"
                name="preco"
                class="campo__controle"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                placeholder="Ex.: 6,00"
                aria-describedby="erro-preco"
              >
              <p id="erro-preco" class="campo__erro" hidden></p>
            </div>

            <div class="campo">
              <label class="campo__rotulo" for="campo-quantidade">Quantidade na embalagem</label>
              <input
                id="campo-quantidade"
                name="quantidade"
                class="campo__controle"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                placeholder="Ex.: 1"
                aria-describedby="erro-quantidade"
              >
              <p id="erro-quantidade" class="campo__erro" hidden></p>
            </div>

            <div class="campo">
              <label class="campo__rotulo" for="campo-unidade">Unidade</label>
              <select
                id="campo-unidade"
                name="unidade"
                class="campo__controle"
                aria-describedby="erro-unidade"
              >
                ${opcoesUnidadesHtml}
              </select>
              <p id="erro-unidade" class="campo__erro" hidden></p>
            </div>
          </div>

          <p id="aviso-duplicado" class="campo__aviso" role="status" aria-live="polite" hidden></p>
          <p id="erro-salvar-ingrediente" class="alerta-erro" role="alert" hidden></p>

          <section id="secao-historico" class="historico-precos" aria-labelledby="titulo-historico-precos" hidden>
            <h3 id="titulo-historico-precos" class="historico-precos__titulo">Histórico de preços</h3>
            <p id="estado-historico" class="historico-precos__vazio" hidden></p>
            <ul id="lista-historico" class="historico-precos__lista" hidden></ul>
          </section>

          <div class="dialogo__acoes">
            <button id="botao-salvar-ingrediente" type="submit" class="botao botao--principal">
              Salvar
            </button>
            <button id="botao-cancelar-ingrediente" type="button" class="botao botao--contorno">
              Cancelar
            </button>
          </div>
        </form>
      </dialog>

      <dialog id="dialogo-excluir" class="dialogo" aria-labelledby="titulo-dialogo-excluir" aria-describedby="texto-confirmar-exclusao">
        <div class="dialogo__corpo">
          <h2 id="titulo-dialogo-excluir" class="dialogo__titulo">Excluir ingrediente</h2>
          <p id="texto-confirmar-exclusao" class="dialogo__texto"></p>
          <p id="erro-excluir-ingrediente" class="alerta-erro" role="alert" hidden></p>
          <div class="dialogo__acoes">
            <button id="botao-confirmar-excluir" type="button" class="botao botao--principal">
              Excluir
            </button>
            <button id="botao-cancelar-excluir" type="button" class="botao botao--contorno">
              Cancelar
            </button>
          </div>
        </div>
      </dialog>
    </section>
  `;

  const campoBusca = container.querySelector('#campo-busca-dispensa');
  const botaoNovo = container.querySelector('#botao-novo-ingrediente');
  const avisoStatus = container.querySelector('#aviso-status-dispensa');
  const contadorEl = container.querySelector('#contador-dispensa');
  const estadoVazioEl = container.querySelector('#estado-vazio-dispensa');
  const listaEl = container.querySelector('#lista-dispensa');

  const avisoDesfazerEl = container.querySelector('#aviso-desfazer');
  const textoDesfazerEl = container.querySelector('#texto-desfazer');
  const botaoDesfazer = container.querySelector('#botao-desfazer');

  const dialogoForm = container.querySelector('#dialogo-ingrediente');
  const formulario = container.querySelector('#formulario-ingrediente');
  const tituloDialogoForm = container.querySelector('#titulo-dialogo-ingrediente');
  const campoNome = container.querySelector('#campo-nome');
  const campoPreco = container.querySelector('#campo-preco');
  const campoQuantidade = container.querySelector('#campo-quantidade');
  const campoUnidade = container.querySelector('#campo-unidade');
  const avisoDuplicadoEl = container.querySelector('#aviso-duplicado');
  const erroSalvarEl = container.querySelector('#erro-salvar-ingrediente');
  const botaoSalvar = container.querySelector('#botao-salvar-ingrediente');
  const botaoCancelarForm = container.querySelector('#botao-cancelar-ingrediente');

  const secaoHistorico = container.querySelector('#secao-historico');
  const estadoHistoricoEl = container.querySelector('#estado-historico');
  const listaHistoricoEl = container.querySelector('#lista-historico');

  const dialogoExcluir = container.querySelector('#dialogo-excluir');
  const textoConfirmarExclusao = container.querySelector('#texto-confirmar-exclusao');
  const erroExcluirEl = container.querySelector('#erro-excluir-ingrediente');
  const botaoConfirmarExcluir = container.querySelector('#botao-confirmar-excluir');
  const botaoCancelarExcluir = container.querySelector('#botao-cancelar-excluir');

  const controlesCampo = {
    nome: { input: campoNome, erro: container.querySelector('#erro-nome') },
    preco: { input: campoPreco, erro: container.querySelector('#erro-preco') },
    quantidade: { input: campoQuantidade, erro: container.querySelector('#erro-quantidade') },
    unidade: { input: campoUnidade, erro: container.querySelector('#erro-unidade') },
  };

  function mostrarStatus(mensagem) {
    if (!mensagem) {
      avisoStatus.textContent = '';
      avisoStatus.hidden = true;
      return;
    }
    avisoStatus.textContent = mensagem;
    avisoStatus.hidden = false;
  }

  function encontrarBotaoDaLista(acao, id) {
    if (!id) return null;
    const botoes = listaEl.querySelectorAll(`button[data-acao="${acao}"]`);
    for (const botao of botoes) {
      if (botao.dataset.id === id) return botao;
    }
    return null;
  }

  function restaurarFocoAbertura() {
    if (!ativa || !origemFoco) return;
    const alvo = origemFoco;
    origemFoco = null;

    if (alvo.tipo === 'editar' || alvo.tipo === 'excluir') {
      const botaoItem = encontrarBotaoDaLista(alvo.tipo, alvo.id)
        || encontrarBotaoDaLista('editar', alvo.id);
      if (botaoItem) {
        botaoItem.focus();
        return;
      }
    }
    botaoNovo.focus();
  }

  function renderizarLista() {
    if (!ativa) return;

    const filtrados = filtrarIngredientes(ingredientes, termoBusca);
    contadorEl.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'ingrediente' : 'ingredientes'}`;

    if (!carregado && ingredientes.length === 0) {
      listaEl.innerHTML = '';
      listaEl.hidden = true;
      estadoVazioEl.textContent = 'Carregando ingredientes…';
      estadoVazioEl.hidden = false;
      return;
    }

    if (ingredientes.length === 0) {
      listaEl.innerHTML = '';
      listaEl.hidden = true;
      estadoVazioEl.textContent = 'Nenhum ingrediente ainda. Comece cadastrando o primeiro.';
      estadoVazioEl.hidden = false;
      return;
    }

    if (filtrados.length === 0) {
      const termoLimpo = termoBusca.trim();
      listaEl.innerHTML = '';
      listaEl.hidden = true;
      estadoVazioEl.textContent = `Nada encontrado para "${termoLimpo}".`;
      estadoVazioEl.hidden = false;
      return;
    }

    estadoVazioEl.textContent = '';
    estadoVazioEl.hidden = true;
    listaEl.hidden = false;

    listaEl.innerHTML = filtrados.map((ing) => {
      const nomeEscapado = escapar(ing.nome);
      const embalagemEscapada = escapar(descreverEmbalagem(ing));
      const referenciaEscapada = escapar(precoReferencia(ing));
      const idEscapado = escapar(ing.id);
      const seloPendente = ing.pendente
        ? '<span class="dispensa-item__selo">Aguardando envio</span>'
        : '';

      return `
        <li class="dispensa-item">
          <div class="dispensa-item__info">
            <div class="dispensa-item__cabecalho">
              <span class="dispensa-item__nome">${nomeEscapado}</span>
              ${seloPendente}
            </div>
            <div class="dispensa-item__detalhes">
              <span class="dispensa-item__embalagem">${embalagemEscapada}</span>
              <span class="dispensa-item__separador" aria-hidden="true">·</span>
              <span class="dispensa-item__referencia">${referenciaEscapada}</span>
            </div>
          </div>
          <div class="dispensa-item__acoes">
            <button
              type="button"
              class="botao botao--contorno botao--compacto"
              data-acao="editar"
              data-id="${idEscapado}"
              aria-label="Editar ${nomeEscapado}"
            >
              Editar
            </button>
            <button
              type="button"
              class="botao botao--contorno botao--compacto"
              data-acao="excluir"
              data-id="${idEscapado}"
              aria-label="Excluir ${nomeEscapado}"
            >
              Excluir
            </button>
          </div>
        </li>
      `;
    }).join('');
  }

  function lerDadosFormulario() {
    return {
      nome: campoNome.value,
      preco: campoPreco.value,
      quantidade: campoQuantidade.value,
      unidade: campoUnidade.value,
    };
  }

  function limparErrosFormulario() {
    for (const campo of CAMPOS_FORMULARIO) {
      const { input, erro } = controlesCampo[campo];
      input.removeAttribute('aria-invalid');
      erro.textContent = '';
      erro.hidden = true;
    }
    avisoDuplicadoEl.textContent = '';
    avisoDuplicadoEl.hidden = true;
    erroSalvarEl.textContent = '';
    erroSalvarEl.hidden = true;
  }

  function atualizarAvisoDuplicado() {
    const { avisos } = validarIngrediente(lerDadosFormulario(), ingredientes, idEdicao);
    if (avisos.duplicado) {
      avisoDuplicadoEl.textContent = `Já existe "${avisos.duplicado}" na Dispensa. Confira se não é repetido.`;
      avisoDuplicadoEl.hidden = false;
    } else {
      avisoDuplicadoEl.textContent = '';
      avisoDuplicadoEl.hidden = true;
    }
  }

  function aplicarValidacaoFormulario() {
    const dados = lerDadosFormulario();
    const resultado = validarIngrediente(dados, ingredientes, idEdicao);
    let primeiroInvalido = null;

    for (const campo of CAMPOS_FORMULARIO) {
      const { input, erro } = controlesCampo[campo];
      const mensagem = resultado.erros[campo];
      if (mensagem) {
        input.setAttribute('aria-invalid', 'true');
        erro.textContent = mensagem;
        erro.hidden = false;
        if (!primeiroInvalido) primeiroInvalido = input;
      } else {
        input.removeAttribute('aria-invalid');
        erro.textContent = '';
        erro.hidden = true;
      }
    }

    if (resultado.avisos.duplicado) {
      avisoDuplicadoEl.textContent = `Já existe "${resultado.avisos.duplicado}" na Dispensa. Confira se não é repetido.`;
      avisoDuplicadoEl.hidden = false;
    } else {
      avisoDuplicadoEl.textContent = '';
      avisoDuplicadoEl.hidden = true;
    }

    return { ...resultado, dados, primeiroInvalido };
  }

  async function carregarHistoricoIngrediente(ingredienteId) {
    const minhaSeq = ++sequenciaHistorico;
    secaoHistorico.hidden = false;
    listaHistoricoEl.innerHTML = '';
    listaHistoricoEl.hidden = true;
    estadoHistoricoEl.textContent = 'Carregando histórico…';
    estadoHistoricoEl.hidden = false;

    if (!atelierId || !ingredienteId) {
      estadoHistoricoEl.textContent = 'Sem mudanças de preço ainda.';
      return;
    }

    try {
      const historico = await listarHistorico(atelierId, ingredienteId);
      if (!ativa || minhaSeq !== sequenciaHistorico) return;

      if (!historico || historico.length === 0) {
        estadoHistoricoEl.textContent = 'Sem mudanças de preço ainda.';
        estadoHistoricoEl.hidden = false;
        listaHistoricoEl.hidden = true;
        return;
      }

      estadoHistoricoEl.textContent = '';
      estadoHistoricoEl.hidden = true;
      listaHistoricoEl.hidden = false;
      listaHistoricoEl.innerHTML = historico.map((mudanca) => {
        const dataTexto = escapar(formatarDataHistorico(mudanca.data));
        const antesTexto = escapar(descreverEmbalagem(mudanca.antes));
        const depoisTexto = escapar(descreverEmbalagem(mudanca.depois));
        return `
          <li class="historico-precos__item">
            <span class="historico-precos__data">${dataTexto}</span>
            <span class="historico-precos__mudanca">${antesTexto} → ${depoisTexto}</span>
          </li>
        `;
      }).join('');
    } catch {
      if (!ativa || minhaSeq !== sequenciaHistorico) return;
      estadoHistoricoEl.textContent = 'Sem mudanças de preço ainda.';
      estadoHistoricoEl.hidden = false;
      listaHistoricoEl.hidden = true;
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

  function abrirFormularioNovo() {
    idEdicao = null;
    origemFoco = { tipo: 'novo' };
    sequenciaHistorico += 1;

    tituloDialogoForm.textContent = 'Novo ingrediente';
    campoNome.value = '';
    campoPreco.value = '';
    campoQuantidade.value = '';
    campoUnidade.value = 'g';
    botaoSalvar.disabled = false;
    botaoCancelarForm.disabled = false;
    limparErrosFormulario();

    secaoHistorico.hidden = true;
    listaHistoricoEl.innerHTML = '';
    listaHistoricoEl.hidden = true;
    estadoHistoricoEl.hidden = true;

    abrirModalDialogo(dialogoForm);
    campoNome.focus();
  }

  function abrirFormularioEditar(ingrediente) {
    idEdicao = ingrediente.id;
    origemFoco = { tipo: 'editar', id: ingrediente.id };

    const valores = paraFormulario(ingrediente);
    tituloDialogoForm.textContent = 'Editar ingrediente';
    campoNome.value = valores.nome ?? '';
    campoPreco.value = formatarNumeroCampo(valores.preco);
    campoQuantidade.value = formatarNumeroCampo(valores.quantidade);
    campoUnidade.value = valores.unidade || 'g';
    botaoSalvar.disabled = false;
    botaoCancelarForm.disabled = false;
    limparErrosFormulario();
    atualizarAvisoDuplicado();

    abrirModalDialogo(dialogoForm);
    campoNome.focus();
    carregarHistoricoIngrediente(ingrediente.id);
  }

  function abrirConfirmacaoExcluir(ingrediente) {
    ingredienteParaExcluir = ingrediente;
    origemFoco = { tipo: 'excluir', id: ingrediente.id };
    textoConfirmarExclusao.textContent = `Excluir "${ingrediente.nome}"? As receitas que já usam este ingrediente mantêm o preço copiado.`;
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

  function mostrarAvisoDesfazer(nomeIngrediente, restaurar) {
    limparTemporizadorDesfazer();
    acaoRestaurar = restaurar;
    textoDesfazerEl.textContent = `${nomeIngrediente} excluído.`;
    avisoDesfazerEl.hidden = false;

    temporizadorDesfazer = setTimeout(() => {
      if (!ativa) return;
      ocultarAvisoDesfazer();
    }, DURACAO_DESFAZER_MS);
  }

  campoBusca.addEventListener('input', () => {
    termoBusca = campoBusca.value;
    renderizarLista();
  });

  botaoNovo.addEventListener('click', () => {
    abrirFormularioNovo();
  });

  campoNome.addEventListener('input', () => {
    if (campoNome.getAttribute('aria-invalid') === 'true') {
      const { erros } = validarIngrediente(lerDadosFormulario(), ingredientes, idEdicao);
      if (!erros.nome) {
        campoNome.removeAttribute('aria-invalid');
        controlesCampo.nome.erro.textContent = '';
        controlesCampo.nome.erro.hidden = true;
      }
    }
    atualizarAvisoDuplicado();
  });

  for (const nomeCampo of ['preco', 'quantidade', 'unidade']) {
    const { input, erro } = controlesCampo[nomeCampo];
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        const { erros } = validarIngrediente(lerDadosFormulario(), ingredientes, idEdicao);
        if (!erros[nomeCampo]) {
          input.removeAttribute('aria-invalid');
          erro.textContent = '';
          erro.hidden = true;
        }
      }
    });
  }

  botaoCancelarForm.addEventListener('click', () => {
    fecharModalDialogo(dialogoForm);
  });

  dialogoForm.addEventListener('close', () => {
    restaurarFocoAbertura();
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroSalvarEl.textContent = '';
    erroSalvarEl.hidden = true;

    const validacao = aplicarValidacaoFormulario();
    if (!validacao.valido) {
      validacao.primeiroInvalido?.focus();
      return;
    }

    let dadosArmazenamento;
    try {
      dadosArmazenamento = paraArmazenamento(validacao.dados);
    } catch {
      erroSalvarEl.textContent = 'Confira os dados informados e tente novamente.';
      erroSalvarEl.hidden = false;
      return;
    }

    botaoSalvar.disabled = true;
    botaoCancelarForm.disabled = true;

    try {
      const { receitasAtualizadas } = await salvarIngrediente(
        atelierId,
        uid,
        dadosArmazenamento,
        idEdicao,
      );
      if (!ativa) return;

      fecharModalDialogo(dialogoForm);

      if (receitasAtualizadas > 0) {
        mostrarStatus(`Ingrediente salvo. ${receitasAtualizadas} receitas atualizadas com o novo preço.`);
      } else {
        mostrarStatus('Ingrediente salvo.');
      }
    } catch {
      if (!ativa) return;
      erroSalvarEl.textContent = 'Não foi possível salvar o ingrediente agora. Tente novamente.';
      erroSalvarEl.hidden = false;
      botaoSalvar.disabled = false;
      botaoCancelarForm.disabled = false;
    }
  });

  listaEl.addEventListener('click', (evento) => {
    const botao = evento.target.closest?.('button[data-acao]');
    if (!botao) return;
    const { acao, id } = botao.dataset;
    const ingrediente = ingredientes.find((item) => item.id === id);
    if (!ingrediente) return;

    if (acao === 'editar') {
      abrirFormularioEditar(ingrediente);
    } else if (acao === 'excluir') {
      abrirConfirmacaoExcluir(ingrediente);
    }
  });

  botaoCancelarExcluir.addEventListener('click', () => {
    fecharModalDialogo(dialogoExcluir);
  });

  dialogoExcluir.addEventListener('close', () => {
    ingredienteParaExcluir = null;
    restaurarFocoAbertura();
  });

  botaoConfirmarExcluir.addEventListener('click', async () => {
    if (!ingredienteParaExcluir) return;
    const alvo = ingredienteParaExcluir;

    erroExcluirEl.textContent = '';
    erroExcluirEl.hidden = true;
    botaoConfirmarExcluir.disabled = true;
    botaoCancelarExcluir.disabled = true;

    try {
      const { restaurar } = await excluirIngrediente(atelierId, alvo.id);
      if (!ativa) return;

      mostrarStatus('');
      fecharModalDialogo(dialogoExcluir);
      mostrarAvisoDesfazer(alvo.nome, restaurar);
    } catch {
      if (!ativa) return;
      erroExcluirEl.textContent = 'Não foi possível excluir o ingrediente agora. Tente novamente.';
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
        mostrarStatus('Ingrediente restaurado.');
        resultado.sincronizado.catch(() => {
          if (ativa) mostrarStatus('N\u00e3o foi poss\u00edvel desfazer. Cadastre o ingrediente de novo.');
        });
      } catch {
        mostrarStatus('Não foi possível desfazer a exclusão agora.');
      }
    }
  });

  renderizarLista();

  let cancelarObservacao = null;
  if (atelierId) {
    cancelarObservacao = observarDispensa(atelierId, ({ itens }) => {
      if (!ativa) return;
      carregado = true;
      ingredientes = Array.isArray(itens) ? itens : [];
      renderizarLista();
    });
  } else {
    carregado = true;
    renderizarLista();
  }

  function limpar() {
    if (!ativa) return;
    ativa = false;
    limparTemporizadorDesfazer();
    if (typeof cancelarObservacao === 'function') {
      cancelarObservacao();
      cancelarObservacao = null;
    }
    if (container._limparDispensa === limpar) {
      delete container._limparDispensa;
    }
  }

  container._limparDispensa = limpar;
  return limpar;
}
