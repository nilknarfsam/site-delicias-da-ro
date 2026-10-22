import { site } from '../dados/site.js';

// Monta o link do WhatsApp com mensagem pronta.
// Uso: linkWhatsApp() ou linkWhatsApp('Olá, Rô! Vim pelo site e quero encomendar: Bentô Cake.')
export function linkWhatsApp(mensagem = site.whatsapp.mensagemPadrao) {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
}

// Preenche todos os elementos com [data-whatsapp] dentro de "raiz".
// data-whatsapp="" usa a mensagem padrão; data-produto="Bentô Cake" monta a mensagem do item.
export function prepararLinksWhatsApp(raiz = document) {
  raiz.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const produto = el.dataset.produto;
    const mensagem = produto
      ? `Olá, Rô! Vim pelo site e quero encomendar: ${produto}.`
      : site.whatsapp.mensagemPadrao;
    el.href = linkWhatsApp(mensagem);
    el.target = '_blank';
    el.rel = 'noopener';
  });
}
