// Configuração da página da LC Conecta.
// whatsapp: número com 55 e DDD, só dígitos.
// horario: dia da semana (0 = domingo, 6 = sábado) com a hora de abrir e a de fechar; dia fora da lista fica fechado.
window.LC_CONFIG = Object.freeze({
  whatsapp: '5527999169771',
  horario: Object.freeze({ 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 18], 6: [8, 12] }),
});
