import { escapar } from '../modules/templates.js';

const AREAS_EM_BREVE = {
  dispensa: { titulo: 'Dispensa', etapa: '2C' },
  biblioteca: { titulo: 'Biblioteca', etapa: '2D' },
  precificacao: { titulo: 'Precificação', etapa: '2E' },
  orcamentos: { titulo: 'Orçamentos', etapa: '2F' },
  ajustes: { titulo: 'Ajustes', etapa: '2G' },
};

export function renderizarEmBreve(container, chaveArea) {
  const area = AREAS_EM_BREVE[chaveArea] || { titulo: 'Em breve', etapa: '2C' };

  container.innerHTML = `
    <section class="painel painel--central">
      <span class="selo-etapa">Etapa ${escapar(area.etapa)}</span>
      <h1>${escapar(area.titulo)}</h1>
      <p>Esta parte chega nas próximas etapas.</p>
    </section>
  `;
}
