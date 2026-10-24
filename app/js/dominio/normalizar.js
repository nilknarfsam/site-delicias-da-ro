export function normalizarIngrediente(nome) {
  const texto = (nome ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  if (texto === '') return '';
  if (texto === 'deline' || texto === 'margarina') return 'Margarina';
  if (texto === 'acucar' || texto === 'açúcar') return 'Açúcar';
  return texto.split(' ').map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');
}
