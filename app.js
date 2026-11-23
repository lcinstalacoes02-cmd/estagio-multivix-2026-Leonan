// Interface da página: menu do celular, barra de atalhos, horário e a pré-ordem de serviço.
(function () {
  'use strict';

  const config = window.LC_CONFIG;
  const regras = window.LcOrdem;
  const SAUDACAO = 'Olá! Vim pelo site da LC Conecta.';
  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Links de WhatsApp que levam uma pergunta própria.
  for (const link of $$('a[data-msg]')) {
    link.href = regras.linkWhatsApp(config.whatsapp, SAUDACAO + ' ' + link.dataset.msg);
  }

  // Menu do celular.
  const botaoMenu = $('.menu-toggle');
  const menu = $('#menu');
  function abrirMenu(abrir) {
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    menu.classList.toggle('aberto', abrir);
  }
  botaoMenu.addEventListener('click', () => abrirMenu(botaoMenu.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', evento => { if (evento.target.closest('a')) abrirMenu(false); });
  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
      abrirMenu(false);
      botaoMenu.focus();
    }
  });

  // Barra de atalhos do celular: aparece depois que a abertura sai da tela.
  const barra = $('.barra-celular');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([item]) => barra.classList.toggle('visivel', !item.isIntersecting)).observe($('.abertura'));
  } else {
    barra.classList.add('visivel');
  }

  // Luz de atendendo agora ou fechado, pela hora de Guarapari.
  function atualizarHorario() {
    const { dia, hora, minuto } = regras.agoraEmGuarapari(new Date());
    const situacao = regras.situacaoHorario(dia, hora, minuto, config.horario);
    for (const status of $$('[data-horario]')) {
      status.classList.toggle('aberto', situacao.aberto);
      status.classList.toggle('fechado', !situacao.aberto);
      $('.status-texto', status).textContent = situacao.texto;
    }
  }
  atualizarHorario();
  setInterval(atualizarHorario, 60000);

  // Pré-ordem de serviço.
  const estado = { aparelho: 'celular', parte: null, sintoma: null, atendimento: null };
  let ordem = null;
  const ficha = $('.ficha');
  const botoesAparelho = $$('.aparelho-botao');
  const desenhos = $$('.desenho');
  const pinos = $('#pinos');
  const listaPartes = $('#partes-lista');
  const modelo = $('#modelo');
  const campos = {
    aparelho: $('#campo-aparelho'),
    parte: $('#campo-parte'),
    defeito: $('#campo-defeito'),
    atendimento: $('#campo-atendimento'),
  };
  const passos = { parte: $('#passo-parte'), sintoma: $('#passo-sintoma'), atendimento: $('#passo-atendimento'), pronto: $('#resultado') };

  const aparelhoAtual = () => regras.APARELHOS[estado.aparelho];
  const desenhoAtual = () => desenhos.find(desenho => desenho.dataset.aparelho === estado.aparelho);

  function preencher(campo, texto) {
    campo.textContent = texto || 'a escolher';
    campo.classList.toggle('vazio', !texto);
  }

  function atualizarFicha() {
    const aparelho = aparelhoAtual();
    const parte = estado.parte ? aparelho.partes[estado.parte] : null;
    const nomeModelo = regras.limparModelo(modelo.value);
    preencher(campos.aparelho, nomeModelo ? `${aparelho.nome} (${nomeModelo})` : aparelho.nome);
    preencher(campos.parte, parte && parte.nome);
    preencher(campos.defeito, parte && estado.sintoma && parte.sintomas[estado.sintoma].nome);
    preencher(campos.atendimento, estado.atendimento && regras.ATENDIMENTOS[estado.atendimento].nome);
    $('#ficha-numero').textContent = ordem ? ordem.numero : 'a gerar';
    ficha.classList.toggle('pronta', Boolean(ordem));
  }

  // Mostra só o passo da vez. O foco vai para o título dele, para quem usa teclado ou leitor de tela.
  function irPara(passo, focar = true) {
    for (const [nome, bloco] of Object.entries(passos)) bloco.hidden = nome !== passo;
    if (!focar) return;
    const titulo = $('.passo-titulo, .resultado-titulo', passos[passo]);
    titulo.focus({ preventScroll: true });
    titulo.scrollIntoView({ block: 'nearest', behavior: semMovimento ? 'auto' : 'smooth' });
  }

  function criarBotao(classe, texto, valor) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = classe;
    botao.dataset.valor = valor;
    botao.textContent = texto;
    return botao;
  }

  function montarOpcoes(lugar, itens, aoEscolher) {
    lugar.textContent = '';
    for (const [valor, texto] of itens) {
      const botao = criarBotao('opcao', texto, valor);
      botao.setAttribute('aria-pressed', 'false');
      botao.addEventListener('click', () => aoEscolher(valor));
      lugar.append(botao);
    }
  }

  // Pinos numerados sobre o desenho e a mesma lista em botões embaixo dele.
  function montarPartes() {
    const desenho = desenhoAtual();
    const caixa = desenho.viewBox.baseVal;
    pinos.textContent = '';
    listaPartes.textContent = '';
    Object.entries(aparelhoAtual().partes).forEach(([chave, parte], indice) => {
      const numero = String(indice + 1);
      const ancora = $(`.ancora[data-parte="${chave}"]`, desenho);
      const pino = criarBotao('pino', numero, chave);
      pino.tabIndex = -1;
      pino.setAttribute('aria-hidden', 'true');
      pino.style.left = (Number(ancora.getAttribute('cx')) / caixa.width) * 100 + '%';
      pino.style.top = (Number(ancora.getAttribute('cy')) / caixa.height) * 100 + '%';
      pinos.append(pino);

      const chip = criarBotao('chip-parte', '', chave);
      const marcador = document.createElement('span');
      marcador.className = 'chip-num';
      marcador.setAttribute('aria-hidden', 'true');
      marcador.textContent = numero;
      chip.append(marcador, parte.nome);
      chip.setAttribute('aria-pressed', 'false');
      listaPartes.append(chip);
    });
  }

  function destacar(classe, chave) {
    for (const item of $$('[data-parte]', desenhoAtual())) item.classList.toggle(classe, item.dataset.parte === chave);
    for (const item of $$('.pino, .chip-parte')) {
      const igual = item.dataset.valor === chave;
      item.classList.toggle(classe, igual);
      if (classe === 'ativa' && item.classList.contains('chip-parte')) item.setAttribute('aria-pressed', String(igual));
    }
  }

  function escolherAparelho(chave) {
    if (!regras.APARELHOS[chave]) return;
    Object.assign(estado, { aparelho: chave, parte: null, sintoma: null, atendimento: null });
    ordem = null;
    for (const botao of botoesAparelho) botao.setAttribute('aria-pressed', String(botao.dataset.aparelho === chave));
    for (const desenho of desenhos) desenho.toggleAttribute('hidden', desenho.dataset.aparelho !== chave);
    $('#vista-nome').textContent = aparelhoAtual().nome.toUpperCase();
    montarPartes();
    destacar('ativa', null);
    atualizarFicha();
    irPara('parte', false);
  }

  function escolherParte(chave) {
    const parte = aparelhoAtual().partes[chave];
    if (!parte) return;
    Object.assign(estado, { parte: chave, sintoma: null, atendimento: null });
    ordem = null;
    destacar('ativa', chave);
    montarOpcoes($('#opcoes-sintoma'), Object.entries(parte.sintomas).map(([valor, sintoma]) => [valor, sintoma.nome]), escolherSintoma);
    atualizarFicha();
    irPara('sintoma');
  }

  function escolherSintoma(chave) {
    Object.assign(estado, { sintoma: chave, atendimento: null });
    ordem = null;
    const opcoes = aparelhoAtual().atendimentos.map(valor => [valor, regras.ATENDIMENTOS[valor].nome]);
    montarOpcoes($('#opcoes-atendimento'), opcoes, escolherAtendimento);
    atualizarFicha();
    irPara('atendimento');
  }

  function escolherAtendimento(chave) {
    estado.atendimento = chave;
    ordem = regras.montar({ ...estado, modelo: modelo.value }, new Date());
    $('#resultado-urgente').hidden = !ordem.urgente;
    $('#resultado-dica').textContent = ordem.dica;
    $('#resultado-antes-titulo').textContent = ordem.tituloAntes;
    const lista = $('#resultado-antes');
    lista.textContent = '';
    for (const item of ordem.antes) {
      const li = document.createElement('li');
      li.textContent = item;
      lista.append(li);
    }
    $('#resultado-prazo').textContent = ordem.prazo;
    $('#resultado-whats').href = regras.linkWhatsApp(config.whatsapp, regras.mensagem(ordem));
    atualizarFicha();
    irPara('pronto');
  }

  for (const botao of botoesAparelho) botao.addEventListener('click', () => escolherAparelho(botao.dataset.aparelho));

  const aoTocarParte = evento => {
    const alvo = evento.target.closest('.pino, .chip-parte');
    if (alvo) escolherParte(alvo.dataset.valor);
  };
  pinos.addEventListener('click', aoTocarParte);
  listaPartes.addEventListener('click', aoTocarParte);

  // Passar o mouse num pino ou na lista acende a peça no desenho.
  for (const lugar of [pinos, listaPartes]) {
    lugar.addEventListener('pointerover', evento => {
      const alvo = evento.target.closest('.pino, .chip-parte');
      destacar('foco', alvo ? alvo.dataset.valor : null);
    });
    lugar.addEventListener('pointerleave', () => destacar('foco', null));
  }

  modelo.addEventListener('input', atualizarFicha);

  $('#recomecar').addEventListener('click', () => {
    modelo.value = '';
    escolherAparelho(estado.aparelho);
    const botao = botoesAparelho.find(item => item.dataset.aparelho === estado.aparelho);
    botao.focus({ preventScroll: true });
    $('.tapete').scrollIntoView({ block: 'start', behavior: semMovimento ? 'auto' : 'smooth' });
  });

  // Os cartões de consertos abrem o diagnóstico já no aparelho certo.
  for (const link of $$('a[data-aparelho]')) {
    link.addEventListener('click', () => escolherAparelho(link.dataset.aparelho));
  }

  escolherAparelho('celular');
})();
