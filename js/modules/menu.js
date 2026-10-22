let botao, lista;

export function iniciarMenu() {
  botao = document.querySelector('.menu__botao');
  lista = document.getElementById('menu-principal');
  if (!botao || !lista) return;

  botao.addEventListener('click', () => {
    const aberto = botao.getAttribute('aria-expanded') === 'true';
    alternar(!aberto);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      alternar(false);
      botao.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (botao.getAttribute('aria-expanded') !== 'true') return;
    if (!e.target.closest('.menu')) alternar(false);
  });
}

function alternar(abrir) {
  botao.setAttribute('aria-expanded', String(abrir));
  botao.querySelector('.menu__rotulo').textContent = abrir ? 'Fechar' : 'Menu';
  lista.dataset.aberto = String(abrir);
}

export function fecharMenu() {
  if (botao && lista) alternar(false);
}

export function marcarMenuAtivo(nome) {
  document.querySelectorAll('.menu__link').forEach((link) => {
    if (link.dataset.rota === nome) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
