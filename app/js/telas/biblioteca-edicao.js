import {
  listarCategorias,
  validarReceita,
  lerArquivoBiblioteca,
  resumirImportacao,
  nomeDeCopia,
  paraExportacao,
} from '../dominio/biblioteca.js';
import { normalizarIngrediente } from '../dominio/normalizar.js';
import {
  salvarReceita,
  importarReceitas,
  limparBiblioteca,
} from '../dados/biblioteca.js';
import { escapar } from '../modules/templates.js';

let contextoAtivo = null;
let instanciaAtiva = null;

function abrirModal(dialogo) {
  if (typeof dialogo.showModal === 'function') {
    if (!dialogo.open) dialogo.showModal();
  } else {
    dialogo.setAttribute('open', '');
  }
}

function fecharModal(dialogo, aoFecharSemCloseEvent) {
  if (typeof dialogo.close === 'function' && dialogo.open) {
    dialogo.close();
  } else {
    const estavaAberto = dialogo.hasAttribute('open');
    dialogo.removeAttribute('open');
    if (estavaAberto && typeof aoFecharSemCloseEvent === 'function') {
      aoFecharSemCloseEvent();
    }
  }
}

function normalizarDataCriacao(valor) {
  if (valor == null) return undefined;
  if (typeof valor?.toDate === 'function') {
    const data = valor.toDate();
    return data instanceof Date && !Number.isNaN(data.getTime()) ? data.toISOString() : undefined;
  }
  if (valor instanceof Date) {
    return !Number.isNaN(valor.getTime()) ? valor.toISOString() : undefined;
  }
  if (typeof valor === 'string' && valor.trim()) {
    return valor.trim();
  }
  return undefined;
}

function rotuloAcessivelIngrediente(nome, indice) {
  const limpo = String(nome ?? '').trim();
  return limpo || `ingrediente ${indice + 1}`;
}

function criarInstanciaDialogos(containerInicial) {
  const controlador = new AbortController();
  const { signal } = controlador;

  let contexto = null;
  let destruida = false;
  let origemFoco = null;

  // Estado do formulário de receita
  let idEdicao = null;
  let receitaOriginal = null;
  let linhasIngredientes = [];

  // Estado da importação
  let resultadoAnalise = null;
  let resumoAnalise = null;

  const wrapper = containerInicial.ownerDocument.createElement('div');
  wrapper.className = 'biblioteca-edicao-dialogos';
  wrapper.innerHTML = `
    <dialog
      id="dialogo-form-receita"
      class="dialogo dialogo--grande"
      aria-labelledby="titulo-dialogo-form-receita"
    >
      <form id="formulario-receita" class="dialogo__corpo biblioteca-form" novalidate>
        <h2 id="titulo-dialogo-form-receita" class="dialogo__titulo">Nova receita</h2>

        <div class="campo">
          <label class="campo__rotulo" for="campo-receita-nome">Nome *</label>
          <input
            id="campo-receita-nome"
            name="nome"
            class="campo__controle"
            type="text"
            autocomplete="off"
            aria-describedby="erro-receita-nome"
          >
          <p id="erro-receita-nome" class="campo__erro" hidden></p>
        </div>

        <div class="biblioteca-form__grade-meta">
          <div class="campo">
            <label class="campo__rotulo" for="campo-receita-categoria">Categoria</label>
            <input
              id="campo-receita-categoria"
              name="categoria"
              class="campo__controle"
              type="text"
              list="lista-categorias-receita"
              autocomplete="off"
              placeholder="Ex.: Bolos, Recheios, Doces…"
            >
            <datalist id="lista-categorias-receita"></datalist>
          </div>

          <div class="campo">
            <label class="campo__rotulo" for="campo-receita-rendimento">Rendimento</label>
            <input
              id="campo-receita-rendimento"
              name="rendimento"
              class="campo__controle"
              type="text"
              autocomplete="off"
              placeholder="Ex.: 14 fatias"
            >
          </div>

          <div class="campo">
            <label class="campo__rotulo" for="campo-receita-tempo">Tempo de preparo</label>
            <input
              id="campo-receita-tempo"
              name="tempoPreparo"
              class="campo__controle"
              type="text"
              autocomplete="off"
              placeholder="Ex.: 45 min"
            >
          </div>

          <div class="campo">
            <label class="campo__rotulo" for="campo-receita-dificuldade">Dificuldade</label>
            <input
              id="campo-receita-dificuldade"
              name="dificuldade"
              class="campo__controle"
              type="text"
              list="lista-dificuldades-receita"
              autocomplete="off"
              placeholder="Ex.: Fácil, Média, Difícil"
            >
            <datalist id="lista-dificuldades-receita">
              <option value="Fácil"></option>
              <option value="Média"></option>
              <option value="Difícil"></option>
            </datalist>
          </div>
        </div>

        <div class="campo">
          <label class="campo__rotulo" for="campo-receita-descricao">Descrição</label>
          <textarea
            id="campo-receita-descricao"
            name="descricao"
            class="campo__controle biblioteca-form__textarea"
            rows="2"
          ></textarea>
        </div>

        <section class="biblioteca-form__secao" aria-labelledby="titulo-secao-ingredientes-form">
          <div class="biblioteca-form__cabecalho-secao">
            <h3 id="titulo-secao-ingredientes-form" class="biblioteca-form__subtitulo">Ingredientes</h3>
          </div>
          <p id="erro-receita-ingredientes" class="campo__erro" role="alert" hidden></p>
          <div id="lista-ingredientes-form" class="biblioteca-form__lista-ingredientes"></div>
          <div class="biblioteca-form__acoes-ingrediente">
            <button
              id="botao-adicionar-ingrediente"
              type="button"
              class="botao botao--contorno botao--compacto"
            >
              Adicionar ingrediente
            </button>
          </div>
        </section>

        <div class="campo">
          <label class="campo__rotulo" for="campo-receita-preparo">Modo de preparo</label>
          <textarea
            id="campo-receita-preparo"
            name="modoPreparo"
            class="campo__controle biblioteca-form__textarea"
            rows="4"
          ></textarea>
        </div>

        <div class="campo">
          <label class="campo__rotulo" for="campo-receita-observacoes">Observações</label>
          <textarea
            id="campo-receita-observacoes"
            name="observacoes"
            class="campo__controle biblioteca-form__textarea"
            rows="2"
          ></textarea>
        </div>

        <p id="erro-salvar-receita" class="alerta-erro" role="alert" hidden></p>

        <div class="dialogo__acoes">
          <button id="botao-salvar-receita" type="submit" class="botao botao--principal">
            Salvar
          </button>
          <button id="botao-cancelar-receita" type="button" class="botao botao--contorno">
            Cancelar
          </button>
        </div>
      </form>
    </dialog>

    <dialog
      id="dialogo-importar-biblioteca"
      class="dialogo dialogo--grande"
      aria-labelledby="titulo-dialogo-importar-biblioteca"
    >
      <div class="dialogo__corpo biblioteca-importar">
        <h2 id="titulo-dialogo-importar-biblioteca" class="dialogo__titulo">Importar receitas (JSON)</h2>
        <p class="dialogo__texto">Aceita uma receita, uma lista de receitas ou o backup da Biblioteca do app antigo.</p>

        <div class="campo">
          <label class="campo__rotulo" for="campo-arquivo-importar">Arquivo JSON</label>
          <input
            id="campo-arquivo-importar"
            class="campo__controle biblioteca-importar__arquivo"
            type="file"
            accept=".json,application/json"
          >
        </div>

        <div class="campo">
          <label class="campo__rotulo" for="campo-texto-importar">Cole o JSON aqui</label>
          <textarea
            id="campo-texto-importar"
            class="campo__controle biblioteca-form__textarea biblioteca-importar__textarea"
            rows="6"
            placeholder="Cole o JSON aqui"
          ></textarea>
        </div>

        <div class="biblioteca-importar__acoes-analise">
          <button id="botao-analisar-importacao" type="button" class="botao botao--contorno">
            Analisar
          </button>
        </div>

        <section
          id="previa-importacao-biblioteca"
          class="biblioteca-importar__previa"
          aria-live="polite"
          hidden
        >
          <p id="resumo-importacao-biblioteca" class="biblioteca-importar__resumo"></p>

          <ul id="lista-erros-importacao" class="biblioteca-importar__erros" hidden></ul>

          <fieldset id="opcoes-duplicadas-importacao" class="biblioteca-importar__duplicadas" hidden>
            <legend id="legenda-duplicadas-importacao" class="biblioteca-importar__legenda">
              Receitas repetidas encontradas
            </legend>
            <label class="biblioteca-importar__opcao-radio">
              <input
                id="radio-duplicadas-pular"
                type="radio"
                name="acao-duplicadas-biblioteca"
                value="pular"
                checked
              >
              <span>Pular as repetidas</span>
            </label>
            <label class="biblioteca-importar__opcao-radio">
              <input
                id="radio-duplicadas-copia"
                type="radio"
                name="acao-duplicadas-biblioteca"
                value="copia"
              >
              <span>Importar como cópia</span>
            </label>
          </fieldset>
        </section>

        <p id="erro-importar-biblioteca" class="alerta-erro" role="alert" hidden></p>

        <div class="dialogo__acoes">
          <button
            id="botao-confirmar-importacao"
            type="button"
            class="botao botao--principal"
            disabled
          >
            Importar 0 receitas
          </button>
          <button id="botao-cancelar-importacao" type="button" class="botao botao--contorno">
            Cancelar
          </button>
        </div>
      </div>
    </dialog>

    <dialog
      id="dialogo-limpar-biblioteca"
      class="dialogo"
      aria-labelledby="titulo-dialogo-limpar-biblioteca"
      aria-describedby="texto-dialogo-limpar-biblioteca"
    >
      <div class="dialogo__corpo">
        <h2 id="titulo-dialogo-limpar-biblioteca" class="dialogo__titulo">Limpar Biblioteca</h2>
        <p id="texto-dialogo-limpar-biblioteca" class="dialogo__texto"></p>

        <div class="campo">
          <label class="campo__rotulo" for="campo-confirmar-limpar">Digite LIMPAR para confirmar</label>
          <input
            id="campo-confirmar-limpar"
            class="campo__controle"
            type="text"
            autocomplete="off"
          >
        </div>

        <p id="erro-limpar-biblioteca" class="alerta-erro" role="alert" hidden></p>

        <div class="dialogo__acoes">
          <button
            id="botao-confirmar-limpar"
            type="button"
            class="botao botao--principal"
            disabled
          >
            Baixar backup e limpar
          </button>
          <button id="botao-cancelar-limpar" type="button" class="botao botao--contorno">
            Cancelar
          </button>
        </div>
      </div>
    </dialog>
  `;

  containerInicial.appendChild(wrapper);

  // Elementos do formulário de receita
  const dialogoForm = wrapper.querySelector('#dialogo-form-receita');
  const formularioReceita = wrapper.querySelector('#formulario-receita');
  const tituloFormEl = wrapper.querySelector('#titulo-dialogo-form-receita');
  const campoNome = wrapper.querySelector('#campo-receita-nome');
  const erroNomeEl = wrapper.querySelector('#erro-receita-nome');
  const campoCategoria = wrapper.querySelector('#campo-receita-categoria');
  const datalistCategorias = wrapper.querySelector('#lista-categorias-receita');
  const campoRendimento = wrapper.querySelector('#campo-receita-rendimento');
  const campoTempo = wrapper.querySelector('#campo-receita-tempo');
  const campoDificuldade = wrapper.querySelector('#campo-receita-dificuldade');
  const campoDescricao = wrapper.querySelector('#campo-receita-descricao');
  const erroIngredientesEl = wrapper.querySelector('#erro-receita-ingredientes');
  const listaIngredientesEl = wrapper.querySelector('#lista-ingredientes-form');
  const botaoAdicionarIngrediente = wrapper.querySelector('#botao-adicionar-ingrediente');
  const campoPreparo = wrapper.querySelector('#campo-receita-preparo');
  const campoObservacoes = wrapper.querySelector('#campo-receita-observacoes');
  const erroSalvarReceitaEl = wrapper.querySelector('#erro-salvar-receita');
  const botaoSalvarReceita = wrapper.querySelector('#botao-salvar-receita');
  const botaoCancelarReceita = wrapper.querySelector('#botao-cancelar-receita');

  // Elementos da importação
  const dialogoImportar = wrapper.querySelector('#dialogo-importar-biblioteca');
  const campoArquivoImportar = wrapper.querySelector('#campo-arquivo-importar');
  const campoTextoImportar = wrapper.querySelector('#campo-texto-importar');
  const botaoAnalisarImportacao = wrapper.querySelector('#botao-analisar-importacao');
  const previaImportacaoEl = wrapper.querySelector('#previa-importacao-biblioteca');
  const resumoImportacaoEl = wrapper.querySelector('#resumo-importacao-biblioteca');
  const listaErrosImportacaoEl = wrapper.querySelector('#lista-erros-importacao');
  const opcoesDuplicadasEl = wrapper.querySelector('#opcoes-duplicadas-importacao');
  const radioDuplicadasPular = wrapper.querySelector('#radio-duplicadas-pular');
  const radioDuplicadasCopia = wrapper.querySelector('#radio-duplicadas-copia');
  const erroImportarEl = wrapper.querySelector('#erro-importar-biblioteca');
  const botaoConfirmarImportacao = wrapper.querySelector('#botao-confirmar-importacao');
  const botaoCancelarImportacao = wrapper.querySelector('#botao-cancelar-importacao');

  // Elementos da limpeza
  const dialogoLimpar = wrapper.querySelector('#dialogo-limpar-biblioteca');
  const textoLimparEl = wrapper.querySelector('#texto-dialogo-limpar-biblioteca');
  const campoConfirmarLimpar = wrapper.querySelector('#campo-confirmar-limpar');
  const erroLimparEl = wrapper.querySelector('#erro-limpar-biblioteca');
  const botaoConfirmarLimpar = wrapper.querySelector('#botao-confirmar-limpar');
  const botaoCancelarLimpar = wrapper.querySelector('#botao-cancelar-limpar');

  function guardarFocoAtual() {
    const ativo = containerInicial.ownerDocument?.activeElement;
    if (ativo && ativo !== containerInicial.ownerDocument.body) {
      origemFoco = ativo;
    } else {
      origemFoco = containerInicial.querySelector('#botao-nova-receita');
    }
  }

  function restaurarFoco() {
    if (destruida) return;
    const alvo = origemFoco;
    origemFoco = null;
    if (alvo && typeof alvo.focus === 'function' && containerInicial.contains(alvo)) {
      alvo.focus();
      return;
    }
    const botaoPadrao = containerInicial.querySelector('#botao-nova-receita');
    botaoPadrao?.focus?.();
  }

  function popularDatalistCategorias() {
    const receitas = contexto?.obterReceitas?.() ?? [];
    const categorias = listarCategorias(Array.isArray(receitas) ? receitas : []);
    datalistCategorias.innerHTML = categorias
      .map((cat) => `<option value="${escapar(cat)}"></option>`)
      .join('');
  }

  function limparErrosReceita() {
    campoNome.removeAttribute('aria-invalid');
    erroNomeEl.textContent = '';
    erroNomeEl.hidden = true;
    erroIngredientesEl.textContent = '';
    erroIngredientesEl.hidden = true;
    erroSalvarReceitaEl.textContent = '';
    erroSalvarReceitaEl.hidden = true;
  }

  function renderizarLinhasIngredientes(errosPorIndice = {}) {
    const total = linhasIngredientes.length;
    listaIngredientesEl.innerHTML = linhasIngredientes.map((item, indice) => {
      const nomeVal = escapar(item.nome ?? '');
      const qtdVal = escapar(item.quantidadeOriginal ?? '');
      const grupoVal = escapar(item.grupo ?? '');
      const rotulo = escapar(rotuloAcessivelIngrediente(item.nome, indice));
      const msgErro = errosPorIndice?.[indice]?.nome || '';
      const temErro = Boolean(msgErro);

      return `
        <div class="biblioteca-ingrediente-form" data-indice="${indice}">
          <div class="biblioteca-ingrediente-form__campos">
            <div class="campo biblioteca-ingrediente-form__campo-nome">
              <label class="campo__rotulo" for="campo-ing-nome-${indice}">Nome *</label>
              <input
                id="campo-ing-nome-${indice}"
                class="campo__controle"
                type="text"
                autocomplete="off"
                data-campo="nome"
                data-indice="${indice}"
                value="${nomeVal}"
                aria-describedby="erro-ing-nome-${indice}"
                ${temErro ? 'aria-invalid="true"' : ''}
              >
              <p id="erro-ing-nome-${indice}" class="campo__erro" ${temErro ? '' : 'hidden'}>${escapar(msgErro)}</p>
            </div>

            <div class="campo biblioteca-ingrediente-form__campo-qtd">
              <label class="campo__rotulo" for="campo-ing-quantidade-${indice}">Quantidade</label>
              <input
                id="campo-ing-quantidade-${indice}"
                class="campo__controle"
                type="text"
                autocomplete="off"
                placeholder="Ex.: 2 xícaras"
                data-campo="quantidadeOriginal"
                data-indice="${indice}"
                value="${qtdVal}"
              >
            </div>

            <div class="campo biblioteca-ingrediente-form__campo-grupo">
              <label class="campo__rotulo" for="campo-ing-grupo-${indice}">Grupo</label>
              <input
                id="campo-ing-grupo-${indice}"
                class="campo__controle"
                type="text"
                autocomplete="off"
                placeholder="Ex.: Massa, Recheio"
                data-campo="grupo"
                data-indice="${indice}"
                value="${grupoVal}"
              >
            </div>
          </div>

          <div class="biblioteca-ingrediente-form__acoes">
            <button
              type="button"
              class="botao botao--contorno botao--compacto"
              data-acao-ingrediente="subir"
              data-indice="${indice}"
              aria-label="Subir ${rotulo}"
              ${indice === 0 ? 'disabled' : ''}
            >
              Subir
            </button>
            <button
              type="button"
              class="botao botao--contorno botao--compacto"
              data-acao-ingrediente="descer"
              data-indice="${indice}"
              aria-label="Descer ${rotulo}"
              ${indice === total - 1 ? 'disabled' : ''}
            >
              Descer
            </button>
            <button
              type="button"
              class="botao botao--contorno botao--compacto"
              data-acao-ingrediente="remover"
              data-indice="${indice}"
              aria-label="Remover ${rotulo}"
            >
              Remover
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function construirReceitaDoFormulario() {
    const dadosPreservados = {};
    if (receitaOriginal && typeof receitaOriginal === 'object') {
      for (const campo of ['origem', 'autor', 'localidadeCidade', 'localidadeEstado']) {
        if (receitaOriginal[campo] != null && String(receitaOriginal[campo]).trim()) {
          dadosPreservados[campo] = String(receitaOriginal[campo]).trim();
        }
      }
      if (receitaOriginal.localidadeReferencia && typeof receitaOriginal.localidadeReferencia === 'object') {
        dadosPreservados.localidadeReferencia = { ...receitaOriginal.localidadeReferencia };
      }
      const dataCriacao = normalizarDataCriacao(receitaOriginal.dataCriacao);
      if (dataCriacao) {
        dadosPreservados.dataCriacao = dataCriacao;
      }
    }

    const ingredientes = linhasIngredientes.map((linha) => {
      const item = { ...linha };
      item.nome = String(linha.nome ?? '').trim();

      const qtdOriginal = String(linha.quantidadeOriginal ?? '').trim();
      if (qtdOriginal) {
        item.quantidadeOriginal = qtdOriginal;
      } else {
        delete item.quantidadeOriginal;
      }

      const grupo = String(linha.grupo ?? '').trim();
      if (grupo) {
        item.grupo = grupo;
      } else {
        delete item.grupo;
      }

      return item;
    });

    return {
      ...dadosPreservados,
      nome: campoNome.value.trim(),
      categoria: campoCategoria.value.trim(),
      rendimento: campoRendimento.value.trim(),
      tempoPreparo: campoTempo.value.trim(),
      dificuldade: campoDificuldade.value.trim(),
      descricao: campoDescricao.value.trim(),
      modoPreparo: campoPreparo.value.trim(),
      observacoes: campoObservacoes.value.trim(),
      ingredientes,
    };
  }

  function aplicarValidacaoReceita() {
    const receita = construirReceitaDoFormulario();
    const validacao = validarReceita(receita);
    let primeiroInvalido = null;

    if (validacao.erros.nome) {
      campoNome.setAttribute('aria-invalid', 'true');
      erroNomeEl.textContent = validacao.erros.nome;
      erroNomeEl.hidden = false;
      primeiroInvalido = campoNome;
    } else {
      campoNome.removeAttribute('aria-invalid');
      erroNomeEl.textContent = '';
      erroNomeEl.hidden = true;
    }

    if (validacao.erros.ingredientes) {
      erroIngredientesEl.textContent = validacao.erros.ingredientes;
      erroIngredientesEl.hidden = false;
      if (!primeiroInvalido) primeiroInvalido = botaoAdicionarIngrediente;
    } else {
      erroIngredientesEl.textContent = '';
      erroIngredientesEl.hidden = true;
    }

    const errosIng = validacao.erros.ingrediente || {};
    for (let i = 0; i < linhasIngredientes.length; i += 1) {
      const inputNomeIng = listaIngredientesEl.querySelector(`#campo-ing-nome-${i}`);
      const erroIngEl = listaIngredientesEl.querySelector(`#erro-ing-nome-${i}`);
      const msg = errosIng[i]?.nome;
      if (inputNomeIng && erroIngEl) {
        if (msg) {
          inputNomeIng.setAttribute('aria-invalid', 'true');
          erroIngEl.textContent = msg;
          erroIngEl.hidden = false;
          if (!primeiroInvalido) primeiroInvalido = inputNomeIng;
        } else {
          inputNomeIng.removeAttribute('aria-invalid');
          erroIngEl.textContent = '';
          erroIngEl.hidden = true;
        }
      }
    }

    return { ...validacao, receita, primeiroInvalido };
  }

  function abrirFormularioReceita(receita = null) {
    guardarFocoAtual();
    const editando = Boolean(receita && typeof receita === 'object');
    idEdicao = editando ? (receita.id ?? null) : null;
    receitaOriginal = editando ? receita : null;

    tituloFormEl.textContent = editando ? 'Editar receita' : 'Nova receita';
    popularDatalistCategorias();
    limparErrosReceita();

    campoNome.value = editando ? String(receita.nome ?? '') : '';
    campoCategoria.value = editando ? String(receita.categoria ?? '') : '';
    campoRendimento.value = editando ? String(receita.rendimento ?? '') : '';
    campoTempo.value = editando ? String(receita.tempoPreparo ?? '') : '';
    campoDificuldade.value = editando ? String(receita.dificuldade ?? '') : '';
    campoDescricao.value = editando ? String(receita.descricao ?? '') : '';
    campoPreparo.value = editando ? String(receita.modoPreparo ?? '') : '';
    campoObservacoes.value = editando ? String(receita.observacoes ?? '') : '';

    if (editando && Array.isArray(receita.ingredientes) && receita.ingredientes.length > 0) {
      linhasIngredientes = receita.ingredientes.map((ing) => ({
        ...ing,
        nome: String(ing?.nome ?? ''),
        quantidadeOriginal: String(ing?.quantidadeOriginal ?? ''),
        grupo: String(ing?.grupo ?? ''),
      }));
    } else {
      linhasIngredientes = [{ nome: '', quantidadeOriginal: '', grupo: '' }];
    }

    renderizarLinhasIngredientes();
    botaoSalvarReceita.disabled = false;
    botaoCancelarReceita.disabled = false;

    abrirModal(dialogoForm);
    campoNome.focus();
  }

  // Eventos do formulário de receita
  campoNome.addEventListener('input', () => {
    if (campoNome.getAttribute('aria-invalid') === 'true' && campoNome.value.trim()) {
      campoNome.removeAttribute('aria-invalid');
      erroNomeEl.textContent = '';
      erroNomeEl.hidden = true;
    }
  }, { signal });

  listaIngredientesEl.addEventListener('input', (evento) => {
    const input = evento.target.closest?.('input[data-campo]');
    if (!input) return;
    const indice = Number(input.dataset.indice);
    const campo = input.dataset.campo;
    if (!Number.isInteger(indice) || !linhasIngredientes[indice]) return;

    linhasIngredientes[indice][campo] = input.value;

    if (campo === 'nome') {
      const linhaEl = input.closest('.biblioteca-ingrediente-form');
      const rotulo = rotuloAcessivelIngrediente(input.value, indice);
      if (linhaEl) {
        const btnSubir = linhaEl.querySelector('button[data-acao-ingrediente="subir"]');
        const btnDescer = linhaEl.querySelector('button[data-acao-ingrediente="descer"]');
        const btnRemover = linhaEl.querySelector('button[data-acao-ingrediente="remover"]');
        btnSubir?.setAttribute('aria-label', `Subir ${rotulo}`);
        btnDescer?.setAttribute('aria-label', `Descer ${rotulo}`);
        btnRemover?.setAttribute('aria-label', `Remover ${rotulo}`);
      }
      if (input.getAttribute('aria-invalid') === 'true' && input.value.trim()) {
        input.removeAttribute('aria-invalid');
        const erroIngEl = listaIngredientesEl.querySelector(`#erro-ing-nome-${indice}`);
        if (erroIngEl) {
          erroIngEl.textContent = '';
          erroIngEl.hidden = true;
        }
      }
    }
  }, { signal });

  listaIngredientesEl.addEventListener('click', (evento) => {
    const botao = evento.target.closest?.('button[data-acao-ingrediente]');
    if (!botao) return;
    const acao = botao.dataset.acaoIngrediente;
    const indice = Number(botao.dataset.indice);
    if (!Number.isInteger(indice) || !linhasIngredientes[indice]) return;

    if (acao === 'subir' && indice > 0) {
      const destino = indice - 1;
      const temp = linhasIngredientes[destino];
      linhasIngredientes[destino] = linhasIngredientes[indice];
      linhasIngredientes[indice] = temp;
      renderizarLinhasIngredientes();
      const novoBotao = listaIngredientesEl.querySelector(
        `.biblioteca-ingrediente-form[data-indice="${destino}"] button[data-acao-ingrediente="subir"]`,
      );
      if (novoBotao && !novoBotao.disabled) {
        novoBotao.focus();
      } else {
        listaIngredientesEl.querySelector(`#campo-ing-nome-${destino}`)?.focus();
      }
    } else if (acao === 'descer' && indice < linhasIngredientes.length - 1) {
      const destino = indice + 1;
      const temp = linhasIngredientes[destino];
      linhasIngredientes[destino] = linhasIngredientes[indice];
      linhasIngredientes[indice] = temp;
      renderizarLinhasIngredientes();
      const novoBotao = listaIngredientesEl.querySelector(
        `.biblioteca-ingrediente-form[data-indice="${destino}"] button[data-acao-ingrediente="descer"]`,
      );
      if (novoBotao && !novoBotao.disabled) {
        novoBotao.focus();
      } else {
        listaIngredientesEl.querySelector(`#campo-ing-nome-${destino}`)?.focus();
      }
    } else if (acao === 'remover') {
      linhasIngredientes.splice(indice, 1);
      renderizarLinhasIngredientes();
      if (linhasIngredientes.length > 0) {
        const proximoIndice = Math.min(indice, linhasIngredientes.length - 1);
        listaIngredientesEl.querySelector(`#campo-ing-nome-${proximoIndice}`)?.focus();
      } else {
        botaoAdicionarIngrediente.focus();
      }
    }
  }, { signal });

  botaoAdicionarIngrediente.addEventListener('click', () => {
    erroIngredientesEl.textContent = '';
    erroIngredientesEl.hidden = true;
    linhasIngredientes.push({ nome: '', quantidadeOriginal: '', grupo: '' });
    renderizarLinhasIngredientes();
    const novoIndice = linhasIngredientes.length - 1;
    listaIngredientesEl.querySelector(`#campo-ing-nome-${novoIndice}`)?.focus();
  }, { signal });

  botaoCancelarReceita.addEventListener('click', () => {
    fecharModal(dialogoForm, restaurarFoco);
  }, { signal });

  dialogoForm.addEventListener('close', () => {
    restaurarFoco();
  }, { signal });

  formularioReceita.addEventListener('submit', (evento) => {
    evento.preventDefault();
    erroSalvarReceitaEl.textContent = '';
    erroSalvarReceitaEl.hidden = true;

    const validacao = aplicarValidacaoReceita();
    if (!validacao.valido) {
      validacao.primeiroInvalido?.focus?.();
      return;
    }

    const editando = idEdicao != null || receitaOriginal != null;
    botaoSalvarReceita.disabled = true;
    botaoCancelarReceita.disabled = true;

    try {
      salvarReceita(contexto?.atelierId, contexto?.uid, validacao.receita, idEdicao);
      fecharModal(dialogoForm);
      if (editando) {
        contexto?.fecharDetalhe?.();
      }
      contexto?.mostrarStatus?.('Receita salva.');
    } catch (erro) {
      erroSalvarReceitaEl.textContent = erro?.message || 'Não foi possível salvar a receita agora. Tente novamente.';
      erroSalvarReceitaEl.hidden = false;
      botaoSalvarReceita.disabled = false;
      botaoCancelarReceita.disabled = false;
    }
  }, { signal });

  // Lógica de importação
  function calcularReceitasParaImportar() {
    if (!resultadoAnalise || !Array.isArray(resultadoAnalise.receitas)) {
      return [];
    }
    const existentes = Array.isArray(contexto?.obterReceitas?.()) ? contexto.obterReceitas() : [];
    const importarComoCopia = radioDuplicadasCopia.checked;

    if (!importarComoCopia) {
      const nomesExistentes = new Set(existentes.map((item) => normalizarIngrediente(item.nome)));
      return resultadoAnalise.receitas.filter(
        (receita) => !nomesExistentes.has(normalizarIngrediente(receita.nome)),
      );
    }

    const acumulados = existentes.map((item) => ({ nome: item.nome }));
    const nomesAcumulados = new Set(acumulados.map((item) => normalizarIngrediente(item.nome)));

    return resultadoAnalise.receitas.map((receita) => {
      const chave = normalizarIngrediente(receita.nome);
      if (nomesAcumulados.has(chave)) {
        const novoNome = nomeDeCopia(receita.nome, acumulados);
        acumulados.push({ nome: novoNome });
        nomesAcumulados.add(normalizarIngrediente(novoNome));
        return { ...receita, nome: novoNome };
      }
      acumulados.push({ nome: receita.nome });
      nomesAcumulados.add(chave);
      return receita;
    });
  }

  function atualizarBotaoImportar() {
    const finais = calcularReceitasParaImportar();
    const qtd = finais.length;
    botaoConfirmarImportacao.textContent = `Importar ${qtd} receitas`;
    botaoConfirmarImportacao.disabled = qtd === 0;
  }

  function executarAnaliseImportacao() {
    erroImportarEl.textContent = '';
    erroImportarEl.hidden = true;

    const texto = campoTextoImportar.value;
    const existentes = Array.isArray(contexto?.obterReceitas?.()) ? contexto.obterReceitas() : [];
    resultadoAnalise = lerArquivoBiblioteca(texto);
    resumoAnalise = resumirImportacao(resultadoAnalise, existentes);

    resumoImportacaoEl.textContent = `${resumoAnalise.total} receitas, ${resumoAnalise.ingredientes} ingredientes, ${resumoAnalise.comPrecoEstimado} com preço estimado`;

    if (resultadoAnalise.erros.length > 0) {
      listaErrosImportacaoEl.innerHTML = resultadoAnalise.erros.map((erro) => {
        const textoErro = erro.posicao === 0
          ? erro.mensagem
          : `Receita ${erro.posicao}: ${erro.mensagem}`;
        return `<li class="biblioteca-importar__erro-item">${escapar(textoErro)}</li>`;
      }).join('');
      listaErrosImportacaoEl.hidden = false;
    } else {
      listaErrosImportacaoEl.innerHTML = '';
      listaErrosImportacaoEl.hidden = true;
    }

    if (resumoAnalise.duplicadas.length > 0) {
      opcoesDuplicadasEl.hidden = false;
    } else {
      opcoesDuplicadasEl.hidden = true;
    }

    previaImportacaoEl.hidden = false;
    atualizarBotaoImportar();
  }

  function abrirDialogoImportacao() {
    guardarFocoAtual();
    resultadoAnalise = null;
    resumoAnalise = null;
    campoArquivoImportar.value = '';
    campoTextoImportar.value = '';
    radioDuplicadasPular.checked = true;
    radioDuplicadasCopia.checked = false;
    previaImportacaoEl.hidden = true;
    resumoImportacaoEl.textContent = '';
    listaErrosImportacaoEl.innerHTML = '';
    listaErrosImportacaoEl.hidden = true;
    opcoesDuplicadasEl.hidden = true;
    erroImportarEl.textContent = '';
    erroImportarEl.hidden = true;
    botaoConfirmarImportacao.textContent = 'Importar 0 receitas';
    botaoConfirmarImportacao.disabled = true;

    abrirModal(dialogoImportar);
    campoTextoImportar.focus();
  }

  campoArquivoImportar.addEventListener('change', () => {
    const arquivo = campoArquivoImportar.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      if (destruida) return;
      campoTextoImportar.value = typeof leitor.result === 'string' ? leitor.result : '';
    };
    leitor.onerror = () => {
      if (destruida) return;
      erroImportarEl.textContent = 'Não foi possível ler o arquivo selecionado.';
      erroImportarEl.hidden = false;
    };
    leitor.readAsText(arquivo);
  }, { signal });

  botaoAnalisarImportacao.addEventListener('click', () => {
    executarAnaliseImportacao();
  }, { signal });

  radioDuplicadasPular.addEventListener('change', atualizarBotaoImportar, { signal });
  radioDuplicadasCopia.addEventListener('change', atualizarBotaoImportar, { signal });

  botaoCancelarImportacao.addEventListener('click', () => {
    fecharModal(dialogoImportar, restaurarFoco);
  }, { signal });

  dialogoImportar.addEventListener('close', () => {
    restaurarFoco();
  }, { signal });

  botaoConfirmarImportacao.addEventListener('click', () => {
    const receitasFinais = calcularReceitasParaImportar();
    if (receitasFinais.length === 0) return;

    erroImportarEl.textContent = '';
    erroImportarEl.hidden = true;

    try {
      importarReceitas(contexto?.atelierId, contexto?.uid, receitasFinais);
      fecharModal(dialogoImportar);
      contexto?.mostrarStatus?.(`${receitasFinais.length} receitas importadas.`);
    } catch (erro) {
      erroImportarEl.textContent = erro?.message || 'Não foi possível importar as receitas agora. Tente novamente.';
      erroImportarEl.hidden = false;
    }
  }, { signal });

  // Lógica de limpeza
  function abrirDialogoLimpar() {
    const receitas = Array.isArray(contexto?.obterReceitas?.()) ? contexto.obterReceitas() : [];
    if (receitas.length === 0) {
      contexto?.mostrarStatus?.('A Biblioteca está vazia.');
      return;
    }

    guardarFocoAtual();
    textoLimparEl.textContent = `Limpar a Biblioteca apaga as ${receitas.length} receitas. Antes, o app baixa um backup em JSON.`;
    campoConfirmarLimpar.value = '';
    erroLimparEl.textContent = '';
    erroLimparEl.hidden = true;
    botaoConfirmarLimpar.disabled = true;
    botaoCancelarLimpar.disabled = false;

    abrirModal(dialogoLimpar);
    campoConfirmarLimpar.focus();
  }

  campoConfirmarLimpar.addEventListener('input', () => {
    botaoConfirmarLimpar.disabled = campoConfirmarLimpar.value !== 'LIMPAR';
  }, { signal });

  botaoCancelarLimpar.addEventListener('click', () => {
    fecharModal(dialogoLimpar, restaurarFoco);
  }, { signal });

  dialogoLimpar.addEventListener('close', () => {
    restaurarFoco();
  }, { signal });

  botaoConfirmarLimpar.addEventListener('click', () => {
    if (campoConfirmarLimpar.value !== 'LIMPAR') return;
    const receitas = Array.isArray(contexto?.obterReceitas?.()) ? contexto.obterReceitas() : [];
    if (receitas.length === 0) {
      fecharModal(dialogoLimpar);
      contexto?.mostrarStatus?.('A Biblioteca está vazia.');
      return;
    }

    erroLimparEl.textContent = '';
    erroLimparEl.hidden = true;

    try {
      exportar(contexto);
      const ids = receitas.map((item) => item.id).filter(Boolean);
      limparBiblioteca(contexto?.atelierId, ids);
      fecharModal(dialogoLimpar);
      contexto?.mostrarStatus?.('Biblioteca limpa. O backup foi baixado.');
    } catch (erro) {
      erroLimparEl.textContent = erro?.message || 'Não foi possível limpar a Biblioteca agora. Tente novamente.';
      erroLimparEl.hidden = false;
    }
  }, { signal });

  // Observador para remover quando o container sair do DOM
  let observadorDom = null;
  if (typeof MutationObserver === 'function' && containerInicial.isConnected && containerInicial.ownerDocument?.body) {
    observadorDom = new MutationObserver(() => {
      if (!containerInicial.isConnected || !containerInicial.contains(wrapper)) {
        destruir();
      }
    });
    observadorDom.observe(containerInicial.ownerDocument.body, { childList: true, subtree: true });
  }

  function destruir() {
    if (destruida) return;
    destruida = true;
    if (observadorDom) {
      observadorDom.disconnect();
      observadorDom = null;
    }
    controlador.abort();
    for (const dlg of [dialogoForm, dialogoImportar, dialogoLimpar]) {
      try {
        if (typeof dlg.close === 'function' && dlg.open) dlg.close();
      } catch {
        // Ignora erro se já estiver desconectado
      }
    }
    wrapper.remove();
    if (instanciaAtiva === api) {
      instanciaAtiva = null;
    }
  }

  const api = {
    container: containerInicial,
    wrapper,
    atualizarContexto(novoContexto) {
      contexto = novoContexto;
    },
    estaValida() {
      return !destruida && containerInicial.contains(wrapper);
    },
    abrirNovaReceita() {
      abrirFormularioReceita(null);
    },
    abrirEdicao(receita) {
      abrirFormularioReceita(receita);
    },
    abrirImportacao() {
      abrirDialogoImportacao();
    },
    abrirLimpar() {
      abrirDialogoLimpar();
    },
    destruir,
  };

  return api;
}

function resolverContexto(contexto) {
  if (contexto && typeof contexto === 'object' && (
    contexto.container || typeof contexto.obterReceitas === 'function' || typeof contexto.mostrarStatus === 'function'
  )) {
    contextoAtivo = contexto;
    return contexto;
  }
  return contextoAtivo;
}

function obterInstancia(contexto) {
  const ctx = resolverContexto(contexto);
  if (!ctx?.container) return null;

  if (instanciaAtiva && (instanciaAtiva.container !== ctx.container || !instanciaAtiva.estaValida())) {
    instanciaAtiva.destruir();
    instanciaAtiva = null;
  }

  if (!instanciaAtiva) {
    instanciaAtiva = criarInstanciaDialogos(ctx.container);
  }

  instanciaAtiva.atualizarContexto(ctx);
  return instanciaAtiva;
}

/**
 * Registra o contexto atual da tela da Biblioteca para uso pelas ações da Parte 3.
 * @param {object|null} contexto
 */
export function configurarContextoEdicao(contexto) {
  if (contexto == null) {
    if (instanciaAtiva) {
      instanciaAtiva.destruir();
      instanciaAtiva = null;
    }
    contextoAtivo = null;
    return;
  }
  contextoAtivo = contexto;
  if (contexto.container) {
    obterInstancia(contexto);
  }
}

/**
 * Abre o diálogo de cadastro de uma nova receita na Biblioteca.
 * @param {object} [contexto]
 */
export function abrirNovaReceita(contexto) {
  const instancia = obterInstancia(contexto);
  instancia?.abrirNovaReceita();
}

/**
 * Abre o diálogo de edição para a receita selecionada.
 * @param {object} receita
 * @param {object} [contexto]
 */
export function abrirEdicao(receita, contexto) {
  const instancia = obterInstancia(contexto);
  instancia?.abrirEdicao(receita);
}

/**
 * Abre o diálogo de importação de receitas via JSON.
 * @param {object} [contexto]
 */
export function abrirImportacao(contexto) {
  const instancia = obterInstancia(contexto);
  instancia?.abrirImportacao();
}

/**
 * Exporta as receitas da Biblioteca em um arquivo JSON compatível.
 * @param {object} [contexto]
 */
export function exportar(contexto) {
  const ctx = resolverContexto(contexto);
  const receitas = Array.isArray(ctx?.obterReceitas?.()) ? ctx.obterReceitas() : [];
  if (receitas.length === 0) {
    ctx?.mostrarStatus?.('A Biblioteca está vazia.');
    return false;
  }

  const dadosExportacao = paraExportacao(receitas);
  const conteudoJson = JSON.stringify(dadosExportacao, null, 2);
  const hoje = new Date();
  const ano = String(hoje.getFullYear());
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  const nomeArquivo = `biblioteca-delicias-da-ro-${ano}-${mes}-${dia}.json`;

  const blob = new Blob([conteudoJson], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const doc = ctx?.container?.ownerDocument || document;
  const link = doc.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.hidden = true;
  (doc.body || ctx?.container)?.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  ctx?.mostrarStatus?.('Backup da Biblioteca baixado.');
  return true;
}

/**
 * Abre a confirmação de limpeza com backup prévio da Biblioteca.
 * @param {object} [contexto]
 */
export function limpar(contexto) {
  const ctx = resolverContexto(contexto);
  const receitas = Array.isArray(ctx?.obterReceitas?.()) ? ctx.obterReceitas() : [];
  if (receitas.length === 0) {
    ctx?.mostrarStatus?.('A Biblioteca está vazia.');
    return;
  }
  const instancia = obterInstancia(ctx);
  instancia?.abrirLimpar();
}
