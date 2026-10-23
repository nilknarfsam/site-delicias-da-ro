// Contador sem cookies nem dados pessoais; desligado até haver um código configurado.
import { site } from '../dados/site.js';

const CODIGO_VALIDO = /^[a-z0-9-]{1,63}$/;
const ORIGEM_VALIDA = /^[a-z0-9-]{1,30}$/;

function caminhoAtual() {
  if (!location.hash.startsWith('#/')) return '/inicio';
  const nome = location.hash.slice(2).split('/')[0];
  return nome ? `/${nome}` : '/inicio';
}

export function iniciarContador(config = site.contador) {
  const codigo = config?.codigo;
  if (typeof codigo !== 'string' || !CODIGO_VALIDO.test(codigo)) return false;

  const origemInformada = new URLSearchParams(location.search).get('origem');
  const origem = origemInformada?.toLowerCase();
  const origemValida = origem && ORIGEM_VALIDA.test(origem) ? origem : '';

  if (location.search) {
    try {
      history.replaceState(history.state, '', location.pathname + location.hash);
    } catch {
      // Bloqueadores e falhas de ambiente não devem quebrar o site.
    }
  }

  let primeiraContagem = true;
  let ultimoCaminho = '';

  const contar = (caminho) => {
    try {
      if (typeof window.goatcounter?.count !== 'function') return;
      if (caminho === ultimoCaminho) return;
      const dados = { path: caminho, title: document.title };
      if (primeiraContagem && origemValida) dados.referrer = `origem:${origemValida}`;
      window.goatcounter.count(dados);
      ultimoCaminho = caminho;
      primeiraContagem = false;
    } catch {
      // Bloqueadores e falhas de rede não podem quebrar o site.
    }
  };

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://gc.zgo.at/count.js';
    script.setAttribute('data-goatcounter', `https://${codigo}.goatcounter.com/count`);
    script.setAttribute('data-goatcounter-settings', '{"no_onload": true}');
    script.addEventListener('load', () => contar(caminhoAtual()), { once: true });
    document.head.appendChild(script);
    window.addEventListener('rota-renderizada', (e) => {
      if (e.detail?.ok) contar('/' + e.detail.nome);
    });
  } catch {
    // Bloqueadores e falhas de rede não podem quebrar o site.
  }

  return true;
}
