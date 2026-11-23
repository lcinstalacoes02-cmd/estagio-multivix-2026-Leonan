import test from 'node:test';
import assert from 'node:assert/strict';

await import('../ordem.js');
const { APARELHOS, ATENDIMENTOS, numeroOrdem, limparModelo, montar, mensagem, linkWhatsApp, situacaoHorario, agoraEmGuarapari } = globalThis.LcOrdem;

const escolha = { aparelho: 'celular', parte: 'tela', sintoma: 'quebrada', atendimento: 'bancada', modelo: '' };
const data = new Date(2026, 10, 22, 21, 5);
const horario = { 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 18], 6: [8, 12] };

test('número da ordem usa LC, a data com ano curto e a hora', () => {
  assert.equal(numeroOrdem(data), 'LC261122-2105');
  assert.equal(numeroOrdem(new Date(2027, 0, 3, 9, 5)), 'LC270103-0905');
});

test('cada aparelho tem partes, defeitos com explicação e atendimentos conhecidos', () => {
  for (const [chave, aparelho] of Object.entries(APARELHOS)) {
    assert.ok(Object.keys(aparelho.partes).length >= 4, chave + ' com poucas partes');
    assert.equal(aparelho.antes.length, 3, chave + ' sem a lista do que levar');
    for (const a of aparelho.atendimentos) assert.ok(ATENDIMENTOS[a], chave + ' com atendimento desconhecido');
    for (const [nomeParte, parte] of Object.entries(aparelho.partes)) {
      assert.ok(Object.keys(parte.sintomas).length >= 2, `${chave}/${nomeParte} com um defeito só`);
      for (const sintoma of Object.values(parte.sintomas)) assert.ok(sintoma.dica.length > 40);
    }
  }
});

test('a ordem reúne as escolhas, a explicação, o prazo e o que levar', () => {
  const ordem = montar(escolha, data);
  assert.equal(ordem.numero, 'LC261122-2105');
  assert.equal(ordem.aparelho, 'Celular');
  assert.equal(ordem.parte, 'Tela');
  assert.equal(ordem.defeito, 'Vidro trincado ou quebrado');
  assert.equal(ordem.atendimento, 'Levo até a bancada');
  assert.match(ordem.prazo, /1 dia útil/);
  assert.equal(ordem.tituloAntes, 'Antes de trazer');
  assert.equal(ordem.antes.length, 3);
  assert.equal(ordem.urgente, false);
});

test('celular que caiu na água vem marcado como urgente', () => {
  assert.equal(montar({ ...escolha, parte: 'sistema', sintoma: 'molhou' }, data).urgente, true);
});

test('visita técnica troca o título da lista para antes da visita', () => {
  const ordem = montar({ aparelho: 'roteador', parte: 'sinal', sintoma: 'fraco', atendimento: 'visita' }, data);
  assert.equal(ordem.tituloAntes, 'Antes da visita');
  assert.equal(ordem.fecho, 'Qual o melhor dia para a visita?');
});

test('escolha fora do catálogo é recusada', () => {
  assert.throws(() => montar({ ...escolha, aparelho: 'tablet' }, data), /Aparelho/);
  assert.throws(() => montar({ ...escolha, parte: 'teclado' }, data), /Parte/);
  assert.throws(() => montar({ ...escolha, sintoma: 'naoLiga' }, data), /Defeito/);
  assert.throws(() => montar({ ...escolha, atendimento: 'visita' }, data), /Atendimento/, 'celular não tem visita');
});

test('modelo digitado é limpo e cortado em 40 caracteres', () => {
  assert.equal(limparModelo('  Moto   G54 '), 'Moto G54');
  assert.equal(limparModelo('Dell\nInspiron\t15'), 'Dell Inspiron 15');
  assert.equal(limparModelo('x'.repeat(60)).length, 40);
  assert.equal(limparModelo(undefined), '');
});

test('mensagem do WhatsApp leva número, aparelho com modelo, parte, defeito e atendimento', () => {
  const texto = mensagem(montar({ ...escolha, modelo: 'Moto G54' }, data));
  assert.equal(texto, [
    'Olá! Vim pelo site da LC Conecta.',
    'Pré-ordem LC261122-2105',
    'Aparelho: Celular (Moto G54)',
    'Parte: Tela',
    'Defeito: Vidro trincado ou quebrado',
    'Atendimento: Levo até a bancada',
    'Pode me passar o orçamento?',
  ].join('\n'));
  assert.match(mensagem(montar(escolha, data)), /Aparelho: Celular\n/);
});

test('link do WhatsApp codifica o texto e recusa número fora do padrão', () => {
  assert.equal(linkWhatsApp('5527999169771', 'Olá! Tudo bem?'), 'https://wa.me/5527999169771?text=Ol%C3%A1!%20Tudo%20bem%3F');
  assert.throws(() => linkWhatsApp('27999169771', 'oi'), /WhatsApp/);
});

test('horário: aberto, antes de abrir, depois de fechar, sábado e domingo', () => {
  assert.deepEqual(situacaoHorario(3, 10, 30, horario), { aberto: true, texto: 'Atendendo agora, até as 18h' });
  assert.equal(situacaoHorario(3, 7, 59, horario).texto, 'Fechado agora, abre hoje às 8h');
  assert.equal(situacaoHorario(3, 18, 0, horario).texto, 'Fechado agora, abre amanhã às 8h');
  assert.equal(situacaoHorario(6, 11, 0, horario).texto, 'Atendendo agora, até as 12h');
  assert.equal(situacaoHorario(6, 12, 30, horario).texto, 'Fechado agora, abre segunda às 8h');
  assert.equal(situacaoHorario(0, 15, 0, horario).texto, 'Fechado agora, abre amanhã às 8h');
});

test('hora de Guarapari vem do fuso de Brasília', () => {
  assert.deepEqual(agoraEmGuarapari(new Date('2026-11-23T13:45:00Z')), { dia: 1, hora: 10, minuto: 45 });
  assert.deepEqual(agoraEmGuarapari(new Date('2026-11-22T02:10:00Z')), { dia: 6, hora: 23, minuto: 10 });
});
