# LC Conecta: assistência técnica em Guarapari

Página de demonstração desenvolvida por Leonan Luiz Camargo da Silva no estágio supervisionado de Análise e Desenvolvimento de Sistemas (Multivix). Ela apresenta a LC Conecta, uma assistência técnica de celular, notebook e computador na Praia do Morro, em Guarapari - ES, com Wi-Fi, rede e acessórios como serviços de apoio.

O destaque da página é a pré-ordem de serviço: a pessoa escolhe o aparelho, toca no desenho a parte com defeito, diz o que está acontecendo e como prefere o atendimento. A ficha ao lado vai sendo preenchida e, no fim, ganha um número, a explicação do que costuma ser o defeito, o que levar, o prazo e um botão que abre o WhatsApp com tudo escrito. Nada do que é marcado fica guardado.

O nome LC Conecta, o horário, os serviços, os prazos e as condições são ilustrativos. Os dados da empresa no rodapé vêm do cartão CNPJ.

## Como rodar

Precisa só do Node.js 18 ou mais novo. Não há dependências para instalar.

```bash
npm run dev     # prévia local no navegador
npm test        # testes das regras da pré-ordem e do horário
npm run build   # gera a pasta dist/ para publicação
```

## Estrutura

| Arquivo | O que faz |
|---|---|
| index.html | conteúdo da página, desenhos dos aparelhos e ícones (sprite SVG) |
| styles.css | layout, cores, fontes e versões para celular |
| ordem.js | catálogo de aparelhos, partes e defeitos, número da ordem, mensagem do WhatsApp e horário de atendimento |
| app.js | menu do celular, barra de atalhos, luz de horário e a interface da pré-ordem |
| site.config.js | número do WhatsApp e horário de atendimento |
| server.mjs | servidor local da prévia |
| scripts/build.mjs | copia os arquivos do site para dist/ |
| testes/ordem.test.mjs | testes das regras com o executor nativo do Node |

## Como a pré-ordem funciona

- Cada aparelho (celular, notebook, computador e roteador) tem de quatro a seis partes, e cada parte tem dois ou três defeitos com uma explicação curta.
- Os números dos pinos no desenho seguem a ordem das partes no catálogo. A posição de cada pino vem do próprio desenho (círculo com a classe `ancora`).
- O número da ordem é LC + ano, mês e dia + hora e minuto, por exemplo LC261123-0840.
- Celular e notebook podem ir à bancada ou ser buscados em casa. Computador também aceita visita técnica. Roteador e Wi-Fi são atendidos com visita ou na bancada.
- Defeitos que pedem pressa, como celular que caiu na água ou bateria estufada, mostram um aviso antes da explicação.
- O texto digitado em marca e modelo é limpo e cortado em 40 caracteres antes de entrar na mensagem.

## Horário

A luz de "atendendo agora" usa o fuso de Brasília, então mostra a situação certa em qualquer lugar de onde a página for aberta. Os horários ficam em `site.config.js`.

## Imagens e fontes tipográficas

As fotos são ilustrativas, não são da empresa, e foram recortadas a partir do Wikimedia Commons:

- Técnico soldando placa de notebook: Bisajunisa, CC BY-SA 4.0.
- Celular sendo aberto: Redaktion NdW, CC BY 2.0.
- Notebook desmontado: Tulumnes, CC BY-SA 4.0.
- Placa de computador: Vintechcomputerservices, CC BY-SA 4.0.
- Testador de cabo de rede: Giacomo Alessandroni, CC BY-SA 4.0.
- Celular desmontado: Triskal, CC BY-SA 4.0.

Fontes Archivo, Instrument Sans e JetBrains Mono, sob a SIL Open Font License (licenças em assets/fonts).
