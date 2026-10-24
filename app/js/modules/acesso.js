export function derivarAcesso({ usuario, atelie, erro }) {
  if (usuario === undefined) return { estado: 'carregando' };
  if (usuario === null) return { estado: 'sem-login' };

  if (erro && erro.code !== 'permission-denied') {
    return {
      estado: 'erro',
      mensagem: 'Não foi possível verificar seu acesso. Tente novamente em instantes.',
    };
  }

  if (erro || !atelie) {
    return {
      estado: 'sem-acesso',
      mensagem: 'Seu acesso ainda não foi liberado. Envie este código ao Franklin.',
      codigo: usuario.uid,
    };
  }

  return { estado: 'liberado', nomeAtelie: atelie.nome, papel: atelie.membros[usuario.uid] };
}
