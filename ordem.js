// Regras da pré-ordem de serviço: aparelhos, partes, defeitos, número da ordem, mensagem do WhatsApp e horário.
(function (raiz) {
  'use strict';

  const ATENDIMENTOS = Object.freeze({
    bancada: { nome: 'Levo até a bancada', prazo: 'Diagnóstico em até 1 dia útil depois que o aparelho chega.', fecho: 'Pode me passar o orçamento?' },
    buscar: { nome: 'Busca e entrega em casa', prazo: 'Combinamos a retirada pelo WhatsApp. O diagnóstico sai em até 1 dia útil.', fecho: 'Quando podem buscar?' },
    visita: { nome: 'Visita técnica no local', prazo: 'Visita marcada pelo WhatsApp, no dia e na hora que forem melhores para você.', fecho: 'Qual o melhor dia para a visita?' },
  });

  const s = (nome, dica, urgente = false) => ({ nome, dica, urgente });

  const APARELHOS = {
    celular: {
      nome: 'Celular',
      atendimentos: ['bancada', 'buscar'],
      antes: [
        'Se o aparelho ainda liga, faça backup das fotos e das conversas.',
        'Tire a capinha e o chip.',
        'Para o teste final, anote a senha de desbloqueio ou desbloqueie na hora, aqui na bancada.',
      ],
      partes: {
        tela: { nome: 'Tela', sintomas: {
          quebrada: s('Vidro trincado ou quebrado', 'Na maioria dos casos é troca da tela completa. Antes do orçamento conferimos se o resto do aparelho funciona.'),
          imagem: s('Manchas, listras ou tela preta', 'Pode ser a tela danificada por dentro ou o cabo que liga a tela à placa. O teste na bancada separa um do outro.'),
          toque: s('Toque falhando ou clicando sozinho', 'Costuma ser a camada de toque da tela. Às vezes é só a película ou umidade, e o teste mostra qual é o caso.'),
        } },
        bateria: { nome: 'Bateria', sintomas: {
          descarrega: s('Descarrega rápido', 'Medimos a saúde da bateria e olhamos o consumo dos aplicativos. A troca só é sugerida se a bateria estiver gasta.'),
          estufada: s('Bateria estufada ou tampa levantando', 'Pare de carregar e traga logo, porque bateria estufada pode piorar. É troca da bateria, e conferimos se a tela não foi forçada.', true),
          desliga: s('Desliga sozinho mesmo com carga', 'É sinal comum de bateria no fim da vida útil. Também testamos o carregamento para descartar outra causa.'),
        } },
        som: { nome: 'Som e microfone', sintomas: {
          naoEscuto: s('Não escuto nas ligações', 'Pode ser sujeira na tela do alto-falante ou a peça com defeito. A limpeza vem antes de qualquer troca.'),
          naoMeOuvem: s('Não me escutam nas ligações', 'O microfone fica perto da entrada de carga e junta poeira. Limpamos e testamos; se não voltar, trocamos.'),
        } },
        camera: { nome: 'Câmera', sintomas: {
          embacada: s('Foto embaçada ou manchada', 'Pode ser o vidro da lente riscado ou o foco da câmera. O vidro da lente costuma ter troca simples.'),
          naoAbre: s('Câmera não abre', 'Primeiro descartamos falha do sistema. Se o defeito for na câmera, ela é trocada como módulo.'),
        } },
        sistema: { nome: 'Não liga ou travando', sintomas: {
          naoLiga: s('Não liga', 'Testamos bateria, carga e botão antes de olhar a placa. Muito aparelho que parece perdido volta com uma peça simples.'),
          travando: s('Travando ou reiniciando', 'Pode ser memória cheia, atualização com problema ou bateria fraca. Se for preciso restaurar o sistema, copiamos os dados antes.'),
          molhou: s('Caiu na água', 'Desligue, não carregue e não coloque no arroz. Quanto antes o aparelho for aberto e limpo por dentro, maior a chance de salvar a placa.', true),
        } },
        carga: { nome: 'Conector de carga', sintomas: {
          naoCarrega: s('Não carrega ou só carrega em certa posição', 'Muitas vezes é sujeira dentro da entrada, e a limpeza resolve. Se o conector estiver gasto, fazemos a troca.'),
          devagar: s('Carrega muito devagar', 'Testamos com o cabo e o carregador da bancada para saber se o problema está no aparelho ou nos acessórios.'),
        } },
      },
    },
    notebook: {
      nome: 'Notebook',
      atendimentos: ['bancada', 'buscar'],
      antes: [
        'Traga o carregador junto.',
        'Se ainda liga, copie os arquivos importantes para um pendrive ou para a nuvem.',
        'Para o teste final, anote a senha do Windows ou digite na hora.',
      ],
      partes: {
        tela: { nome: 'Tela', sintomas: {
          quebrada: s('Tela quebrada ou com manchas', 'Troca da tela pelo modelo certo do seu notebook. Conferimos o código da peça antes de passar o orçamento.'),
          semImagem: s('Liga, mas fica sem imagem', 'Ligamos num monitor externo. Se a imagem aparece, o problema está na tela ou no cabo; se não aparece, está na placa.'),
        } },
        teclado: { nome: 'Teclado', sintomas: {
          teclas: s('Teclas falhando', 'Pode ser sujeira ou o teclado gasto. Em muitos modelos o teclado é trocado inteiro.'),
          liquido: s('Derramou líquido', 'Desligue e tire da tomada. Não seque com secador: traga para abrir e limpar por dentro o quanto antes.', true),
        } },
        bateria: { nome: 'Bateria e carregador', sintomas: {
          naoCarrega: s('Não carrega', 'Testamos o carregador, a entrada de energia e a bateria, nessa ordem. Muitas vezes o defeito está só no carregador.'),
          naoSegura: s('A bateria não segura a carga', 'Medimos o desgaste da bateria. Se estiver no fim, trocamos por uma compatível com o modelo.'),
        } },
        dobradica: { nome: 'Dobradiça e carcaça', sintomas: {
          dobradica: s('Dobradiça dura, solta ou quebrada', 'Quanto antes, melhor: dobradiça forçada acaba quebrando a carcaça e o cabo da tela.'),
          carcaca: s('Carcaça trincada ou abrindo', 'Colamos ou trocamos a parte da carcaça, conforme o estrago e a peça disponível.'),
        } },
        sistema: { nome: 'Lento ou não liga', sintomas: {
          lento: s('Muito lento', 'Na maioria das vezes, trocar o HD por SSD e limpar o sistema deixa o notebook bem mais rápido. Copiamos seus arquivos antes.'),
          naoLiga: s('Não liga', 'Testamos carregador, bateria e placa. O diagnóstico mostra se vale a pena consertar antes de qualquer gasto.'),
          erro: s('Erro ou tela azul ao ligar', 'Pode ser o sistema ou o armazenamento com falha. Testamos o disco e salvamos os arquivos antes de reinstalar.'),
        } },
        aquecimento: { nome: 'Ventoinha e aquecimento', sintomas: {
          esquenta: s('Esquenta muito ou desliga sozinho', 'Costuma ser poeira na ventoinha e pasta térmica seca. A limpeza interna resolve a maior parte dos casos.'),
          barulho: s('Ventoinha fazendo barulho', 'Limpeza e lubrificação. Se a ventoinha estiver gasta, fazemos a troca.'),
        } },
      },
    },
    computador: {
      nome: 'Computador',
      atendimentos: ['bancada', 'buscar', 'visita'],
      antes: [
        'Traga só o gabinete, a não ser que o defeito esteja no monitor, no teclado ou no mouse.',
        'Se ainda liga, copie os arquivos importantes.',
        'Para o teste final, anote a senha do Windows ou digite na hora.',
      ],
      partes: {
        fonte: { nome: 'Fonte de energia', sintomas: {
          naoLiga: s('Não liga', 'Testamos a fonte e o botão de ligar. Fonte com defeito é uma das causas mais comuns e tem troca rápida.'),
          desliga: s('Desliga sozinho ou cheiro de queimado', 'Tire da tomada e não insista em ligar. Pode ser a fonte ou superaquecimento, e a bancada mostra qual dos dois.', true),
        } },
        refrigeracao: { nome: 'Cooler e aquecimento', sintomas: {
          barulho: s('Barulho alto no gabinete', 'Limpeza interna e, se o cooler estiver gasto, troca da peça.'),
          esquenta: s('Esquenta e trava', 'Limpeza, troca da pasta térmica do processador e teste de temperatura com o computador trabalhando.'),
        } },
        armazenamento: { nome: 'SSD e memória', sintomas: {
          lento: s('Demora para ligar e abrir programas', 'Trocar o HD por SSD costuma ser a melhora mais visível. Também conferimos a memória.'),
          espaco: s('Quero mais espaço ou memória', 'Vemos o que a placa aceita e indicamos o upgrade que cabe no seu uso.'),
        } },
        sistema: { nome: 'Sistema e vírus', sintomas: {
          virus: s('Vírus ou propagandas abrindo sozinhas', 'Removemos os programas maliciosos e deixamos o antivírus configurado. Se precisar formatar, copiamos seus arquivos antes.'),
          formatar: s('Quero formatar', 'Copiamos seus arquivos, reinstalamos o sistema e devolvemos com os programas que você usa.'),
        } },
        entradas: { nome: 'Entradas USB e som', sintomas: {
          usb: s('USB não reconhece', 'Pode ser a entrada da frente desconectada, o driver ou a própria entrada. Testamos uma por uma.'),
          som: s('Sem som', 'Conferimos a configuração, o driver e a saída de áudio da placa.'),
        } },
        video: { nome: 'Placa de vídeo e imagem', sintomas: {
          semImagem: s('Liga, mas o monitor fica sem imagem', 'Testamos cabo, monitor, memória e vídeo, um de cada vez, até achar a peça com defeito.'),
          falhas: s('Imagem com falhas ou travando em jogos', 'Pode ser aquecimento ou a placa de vídeo. Testamos com o computador em uso pesado para o defeito aparecer.'),
        } },
      },
    },
    roteador: {
      nome: 'Roteador e Wi-Fi',
      atendimentos: ['visita', 'bancada'],
      antes: [
        'Tenha à mão o nome e a senha atuais do Wi-Fi.',
        'Anote qual é a sua operadora de internet.',
        'Se a internet caiu de vez, confira com a operadora se não há falha na região.',
      ],
      partes: {
        sinal: { nome: 'Sinal do Wi-Fi', sintomas: {
          fraco: s('Não chega em alguns cômodos', 'Avaliamos a posição do roteador e, se precisar, instalamos repetidor ou um ponto cabeado no cômodo.'),
          cai: s('Cai toda hora', 'Pode ser interferência, roteador antigo ou aparelhos demais na mesma rede. Medimos o sinal em cada cômodo.'),
        } },
        luzes: { nome: 'Luzes do aparelho', sintomas: {
          vermelha: s('Luz vermelha ou piscando', 'Em muitos modelos indica falta de sinal da operadora ou configuração perdida. No atendimento descobrimos qual é o caso.'),
          apagado: s('Não acende', 'Testamos a fonte do roteador e a tomada. Se o aparelho queimou, indicamos um substituto.'),
        } },
        config: { nome: 'Configuração', sintomas: {
          senha: s('Trocar o nome ou a senha do Wi-Fi', 'Configuramos e deixamos anotados o nome e a senha novos para você.'),
          novo: s('Configurar roteador ou repetidor novo', 'Instalamos, configuramos e testamos o sinal em todos os cômodos que você usa.'),
        } },
        cabos: { nome: 'Cabos e pontos de rede', sintomas: {
          semInternet: s('Computador no cabo sem internet', 'Testamos o cabo ponto por ponto com o testador de rede e refazemos a ponta se precisar.'),
          novoPonto: s('Quero um ponto de rede novo', 'Passamos o cabo, montamos as pontas e testamos o ponto antes de ir embora.'),
        } },
      },
    },
  };

  const doisDigitos = n => String(n).padStart(2, '0');

  // LCAAMMDD-HHMM, com a hora local de quem preencheu.
  function numeroOrdem(data) {
    const dia = String(data.getFullYear()).slice(2) + doisDigitos(data.getMonth() + 1) + doisDigitos(data.getDate());
    return 'LC' + dia + '-' + doisDigitos(data.getHours()) + doisDigitos(data.getMinutes());
  }

  // Marca e modelo digitados: sem caracteres de controle, espaços simples e no máximo 40 caracteres.
  function limparModelo(texto) {
    return String(texto || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40).trim();
  }

  // Confere as escolhas e devolve a ordem completa.
  function montar(escolha, data) {
    const aparelho = APARELHOS[escolha.aparelho];
    if (!aparelho) throw new Error('Aparelho inválido');
    const parte = aparelho.partes[escolha.parte];
    if (!parte) throw new Error('Parte inválida');
    const sintoma = parte.sintomas[escolha.sintoma];
    if (!sintoma) throw new Error('Defeito inválido');
    if (!aparelho.atendimentos.includes(escolha.atendimento)) throw new Error('Atendimento inválido');
    const atendimento = ATENDIMENTOS[escolha.atendimento];
    return {
      numero: numeroOrdem(data),
      aparelho: aparelho.nome,
      modelo: limparModelo(escolha.modelo),
      parte: parte.nome,
      defeito: sintoma.nome,
      dica: sintoma.dica,
      urgente: sintoma.urgente,
      atendimento: atendimento.nome,
      prazo: atendimento.prazo,
      fecho: atendimento.fecho,
      antes: aparelho.antes.slice(),
      tituloAntes: escolha.atendimento === 'visita' ? 'Antes da visita' : 'Antes de trazer',
    };
  }

  function mensagem(ordem) {
    const aparelho = ordem.modelo ? `${ordem.aparelho} (${ordem.modelo})` : ordem.aparelho;
    return [
      'Olá! Vim pelo site da LC Conecta.',
      'Pré-ordem ' + ordem.numero,
      'Aparelho: ' + aparelho,
      'Parte: ' + ordem.parte,
      'Defeito: ' + ordem.defeito,
      'Atendimento: ' + ordem.atendimento,
      ordem.fecho,
    ].join('\n');
  }

  function linkWhatsApp(numero, texto) {
    if (!/^55\d{10,11}$/.test(numero)) throw new Error('Número de WhatsApp inválido');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
  }

  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  // horario: { 1: [8, 18], ... } com o dia da semana (0 = domingo) e as horas de abrir e fechar.
  function situacaoHorario(dia, hora, minuto, horario) {
    const agora = hora + minuto / 60;
    const hoje = horario[dia];
    if (hoje && agora >= hoje[0] && agora < hoje[1]) {
      return { aberto: true, texto: `Atendendo agora, até as ${hoje[1]}h` };
    }
    if (hoje && agora < hoje[0]) return { aberto: false, texto: `Fechado agora, abre hoje às ${hoje[0]}h` };
    for (let i = 1; i <= 7; i++) {
      const proximo = (dia + i) % 7;
      const faixa = horario[proximo];
      if (!faixa) continue;
      const quando = i === 1 ? 'amanhã' : DIAS[proximo];
      return { aberto: false, texto: `Fechado agora, abre ${quando} às ${faixa[0]}h` };
    }
    return { aberto: false, texto: 'Fechado agora' };
  }

  // Dia e hora em Guarapari, qualquer que seja o fuso de quem abre a página.
  function agoraEmGuarapari(data) {
    const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(data);
    const valor = tipo => partes.find(p => p.type === tipo).value;
    return { dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday')), hora: Number(valor('hour')), minuto: Number(valor('minute')) };
  }

  raiz.LcOrdem = Object.freeze({ APARELHOS, ATENDIMENTOS, numeroOrdem, limparModelo, montar, mensagem, linkWhatsApp, situacaoHorario, agoraEmGuarapari });
})(globalThis);
