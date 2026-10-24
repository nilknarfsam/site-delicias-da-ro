import { mostrarPrecos } from '../dados/cardapio.js';

export const escapar = (t) => String(t ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(valor).replace(/\u00a0/g, ' ');

export function renderizarLista(container, itens, template) {
  container.innerHTML = itens.map(template).join('');
}

const ehPendente = (t) => String(t ?? '').startsWith('[PENDENTE');

// Texto comum ou marcador de pendente (visível, para a Rô completar).
export const textoOuPendente = (t) =>
  ehPendente(t) ? `<span class="pendente">${escapar(t)}</span>` : escapar(t);

// Foto real do produto (WebP + JPG de reserva) ou espaço reservado sem imagem gerada.
export function fotoProduto(item, carregarTarde = true) {
  if (!item.foto) {
    return `
      <div class="cartao__foto cartao__foto--vazia">
        <img src="imagens/logo/logo-r-192.png" width="192" height="192" alt="">
        <span class="pendente">[PENDENTE: foto real]</span>
      </div>`;
  }
  const base = escapar('imagens/produtos/' + item.foto.arquivo);
  return `
    <picture class="cartao__foto">
      <source type="image/webp" srcset="${base}-480.webp 480w, ${base}-800.webp 800w" sizes="(min-width: 992px) 380px, (min-width: 768px) 45vw, 92vw">
      <img src="${base}-800.jpg" width="800" height="1000" alt="${escapar(item.foto.alt)}"${carregarTarde ? ' loading="lazy"' : ''}>
    </picture>`;
}

export function cartaoProduto(item, { carregarTarde = true, comAviso = false, avisoTexto = '' } = {}) {
  return `
    <article class="cartao">
      ${fotoProduto(item, carregarTarde)}
      <div class="cartao__corpo">
        <h3 class="cartao__titulo">${escapar(item.nome)}</h3>
        <p class="cartao__texto">${textoOuPendente(item.descricao)}</p>
        ${comAviso ? `<p class="cartao__aviso">${escapar(avisoTexto)}</p>` : ''}
        <p class="cartao__preco">${mostrarPrecos && typeof item.aPartirDe === 'number'
    ? `A partir de ${escapar(formatarMoeda(item.aPartirDe))}`
    : 'Valores sob consulta'}</p>
        <a class="botao botao--principal botao--bloco" data-whatsapp data-produto="${escapar(item.nome)}" href="https://wa.me/5592981681827">Pedir este</a>
      </div>
    </article>`;
}

export function telaErro(titulo, mensagem) {
  return `
    <section class="container erro-tela" role="alert">
      <h1>${escapar(titulo)}</h1>
      <p>${escapar(mensagem)}</p>
      <p><button type="button" class="botao botao--contorno" data-acao="recarregar-view">Tentar de novo</button></p>
      <p><a href="#/inicio">Voltar para o início</a></p>
    </section>`;
}
