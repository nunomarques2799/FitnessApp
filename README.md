# Treinos

App web de registo de treinos, feita para correr no iPhone a partir do ecrã principal — sem App Store,
sem conta, sem servidor. **Todos os dados ficam guardados no telemóvel** (`localStorage`).

---

## O que faz

| Ecrã | O que tem |
|---|---|
| **Hoje** | O dia do plano que vem a seguir, cobertura muscular dos últimos 7 dias |
| **Plano** | O plano embutido: roda dos cinco dias, cargas contra o chão do plano, volume, relatório da semana |
| **Treino** | Registo de séries e de rondas de circuito, repetições em reserva, cronómetro de descanso opcional, deteção de recordes |
| **Histórico** | Calendário do mês com os dias treinados, detalhe de cada sessão, editar/apagar/repetir |
| **Exercícios** | 191 exercícios organizados por grupo muscular, com filtro da parte do músculo, da pega e instruções de execução |
| **Progresso** | Volume por semana, peso corporal, condição física dos últimos 30 dias, distribuição muscular, recordes |
| **Ajustes** | Peso corporal, plano embutido, objectivo, divisão de treino, tempos de descanso, cronómetro, RIR, fecho automático, kg/lb, tema, exportar/importar cópia de segurança |

## O plano embutido

A app traz um plano concreto lá dentro — [`js/plano.js`](js/plano.js) — e é ele que manda enquanto
estiver ligado em **Ajustes → Plano de treino embutido**. Cinco dias em roda, sem estarem presos a
dias da semana:

| Dia | O que é | Exercícios |
|---|---|---|
| **A** | Costas e bíceps | 6 |
| **B** | Peito, tríceps e deltoide lateral | 5 |
| **C** | Pernas | a tua sessão, mais o core do plano |
| **D** | Costas e ombros | 6 |
| **E** | Peito e braços | 5 |

Cada exercício traz o número de séries, o intervalo de repetições, a **carga de partida** e o
incremento daquela máquina. As cargas escritas são o **chão da primeira sessão**: a partir daí quem
manda é o que registas, com a dupla progressão de sempre. O dia C é livre — a app escolhe os
exercícios de pernas como faria normalmente e o plano só acrescenta o insecto morto e a prancha no fim.

Ligar o plano adopta também os descansos que ele manda (3 minutos nos compostos, 90 segundos nos
isolamentos). Desligá-lo devolve a app ao motor de sugestão normal, com a divisão e os músculos em atraso.

### Monitorizar ao longo do tempo

O ecrã **Plano** mostra em que semana vais, quantas vezes fizeste cada dia, e — o que interessa —
a **carga de cada exercício contra o chão do plano**, em degraus ganhos. O volume é medido sobre a
última rotação completa (as cinco sessões), não sobre sete dias: com uma roda de cinco dias, comparar
com uma semana de calendário dava números que saltavam sem querer dizer nada.

Há também o ponto de controlo da semana 4: se a puxada à frente e o supino inclinado com halteres
não tiverem subido um incremento, o travão é a comida ou o sono, não o plano.

### Rever o plano ao fim da semana

**Plano → Relatório da semana** gera um texto com tudo o que é preciso para a revisão: as sessões
com todas as séries (carga × repetições e RIR), as cargas contra o chão do plano, o volume da
rotação e o peso corporal. Copia-se ou partilha-se como ficheiro `.md`.

Com esse texto na mão, o plano actualiza-se num sítio só — [`js/plano.js`](js/plano.js): cargas,
séries, intervalos e incrementos. Sobe o `versao`, muda o `revisto` e escreve em `notasDaRevisao`
o que mudou; a app passa a propor os valores novos na sessão seguinte.

### Objectivos

A app serve quatro objectivos, e cada um repõe as repetições, o descanso, o volume e o plano:

| Objectivo | Repetições | Descanso | Plano |
|---|---|---|---|
| **Ganhar músculo** | 8–12 | 3:00 | Empurrar, puxar e pernas |
| **Ganhar força** | 3–6 | 4:00 | Superior e inferior, com prioridade aos compostos |
| **Perder peso** | 12–15 | 1:15 | Corpo inteiro alternado com circuitos |
| **Força e condição física** | 6–10 | 2:30 | Dias de força alternados com circuitos |

Depois de escolher um objectivo, todos os valores continuam a poder ser afinados um a um.

### Treinos híbridos em circuito

Sete circuitos prontos, com quatro formatos: **rondas fixas**, **máximo de voltas no tempo (AMRAP)**,
**uma estação por minuto (EMOM)** e **tabata**. As estações juntam corrida, remoergómetro, bola à
parede, kettlebell, saltos e agachamentos. Durante o treino a app conta as rondas, muda de estação
sozinha e mede o descanso curto entre estações.

Cada exercício regista-se na unidade que faz sentido: carga × repetições, só repetições, segundos,
metros ou calorias da máquina. Os exercícios de condição física não entram na contagem de volume
de musculação — aparecem no bloco **Condição física** do Progresso.

### Um lado de cada vez

47 exercícios trabalham **um braço ou uma perna de cada vez** — extensão de tríceps na corda a um
braço, remada e puxada na polia a um braço, prensa e extensão de pernas a uma perna, peso morto
romeno a uma perna, agachamento em pistola. Servem para corrigir diferenças entre lados e para
apoiar o tronco em vez de o usar a fazer batota. Estão todos juntos no cartão **Um lado de cada
vez**, na biblioteca e no selector de exercícios.

Uma série conta o trabalho de um lado: faz o direito e o esquerdo antes de a marcares como feita,
e escreve a carga de um lado só.

### Pegas

A mesma puxada muda de exercício conforme a pega, por isso cada exercício diz qual usa —
**pronada**, **supinada**, **neutra**, **mista** ou **corda** — e, quando faz diferença, a largura
das mãos. Dentro de um grupo muscular há um filtro por pega, com a explicação do que cada uma muda:
a pega supinada mete mais bíceps e puxa a parte de baixo dos dorsais, a pronada larga insiste na
parte de fora, a neutra é a mais amiga do ombro.

### Mudar o nome dos exercícios

Se tratas um exercício por outro nome, muda-o: **abre o exercício → Mudar o nome**, ou nas opções
do exercício durante o treino. Passa a aparecer assim em todo o lado e os registos antigos
mantêm-se. O nome original fica guardado — a procura continua a encontrar o exercício pelos dois
nomes, e há sempre um botão para o repor.

### Cronómetro de descanso

No início de cada treino a app pergunta se queres contar o descanso. Enquanto não responderes, não
aparece cronómetro nenhum. Podes ligá-lo ou desligá-lo a meio, nas opções do treino, e em
**Ajustes → Descanso entre séries** fixas a resposta: *Perguntar*, *Sempre* ou *Nunca*.

### Repetições em reserva (RIR)

Cada série tem uma coluna **RIR**: quantas repetições ainda conseguias fazer quando paraste.
0 é falha total; 2 é o ponto habitual para ganhar músculo sem te arrasares. Escreves o número
directamente na linha da série, ou tocas no número da série e escolhes ao toque — aí está também
a explicação. É opcional: as séries sem RIR continuam a contar como sempre.

Serve para dois efeitos. Fica no histórico, ao lado da carga e das repetições, para saberes
quão perto do limite treinaste. E entra na progressão: se registares **3 ou mais em todas as
séries** de um exercício, já dentro do intervalo de repetições, a app sugere subir a carga na
sessão seguinte sem esperar que chegues ao topo — a carga está a ficar leve antes do tempo.

Podes desligar a coluna em **Ajustes → Durante o treino**. Não aparece em circuitos, nem em
corridas, remo, pranchas e afins, onde não quer dizer nada.

### O treino fecha-se sozinho

Se te esqueceres de terminar o treino, ele deixa de ficar a contar a noite toda. Ao fim de
**4 horas sem nenhum registo** (ajustável entre 2 e 8 horas, ou desligável, em
**Ajustes → Durante o treino**), a app fecha-o e guarda-o com a duração até à **última série que
marcaste**. Um treino que ficou aberto sem nenhuma série marcada é descartado.

O treino fica assinalado no histórico, para saberes que aquela duração não foi medida até ao fim.

Para os treinos absurdos que já lá estão, **Ajustes → Durante o treino → Corrigir durações**
troca-os por uma estimativa feita a partir das séries registadas (cada série custa o descanso
previsto mais o tempo de execução). A duração original fica guardada, e no menu de cada treino
podes sempre acertar os minutos à mão.

### Peso corporal

**Ajustes → Perfil** guarda o teu peso, um valor por dia. O **Progresso** mostra a evolução em
gráfico e a diferença dos últimos 30 dias, e a página de cada exercício passa a dizer quanto é
o teu máximo estimado em relação ao teu peso (`1,4× o teu peso`). Pesa-te sempre à mesma hora,
de manhã e em jejum, senão o gráfico anda aos saltos por causa da comida e da água.

Como tudo o resto, fica só no telemóvel e vai dentro da cópia de segurança.

### Figura dos músculos

Todos os exercícios mostram uma figura humana de frente e de costas, com os músculos principais a
laranja e os secundários a meio-tom. As formas vivem num único conjunto SVG injectado uma vez e
reutilizado com `<use>`, para que centenas de figuras não pesem na página.

### Como decide o que sugerir

0. Se o **plano embutido** estiver ligado, salta tudo isto: sugere o dia da roda que vem a seguir,
   com os exercícios e as cargas que o plano prescreve. O resto só vale com o plano desligado.
1. Olha para a **divisão escolhida** e vê qual foi o último dia feito — sugere o seguinte.
   Se esse dia for de circuito, propõe um circuito adequado ao objectivo.
2. Conta as **séries por músculo dos últimos 7 dias** (séries em que o músculo é secundário contam metade)
   e compara com um alvo semanal por grupo.
3. Escolhe os exercícios pela ordem do dia, dando prioridade aos que já tens histórico
   (para saber a carga), aos favoritos e aos movimentos de referência.
4. Se algum músculo estiver **7 ou mais dias sem estímulo**, mete um exercício desse grupo mesmo que não seja do dia.
5. Se na última sessão completaste todas as séries no topo do intervalo, **sugere subir a carga**
   e volta ao fundo do intervalo. É dupla progressão: sobes as repetições, depois sobes o peso.
   Com RIR registado, também sugere subir quando sobraram 3 ou mais repetições em todas as séries.

Os alvos semanais por músculo seguem a referência de 10 a 20 séries para hipertrofia
(peito 16, dorsais 18, quadríceps 16, bíceps e tríceps 14…). O selector **Volume semanal alvo**
escala-os: *Moderado* se treinas 3 vezes por semana, *Alto* se treinas 5 ou 6.

---

## Pôr no iPhone

A app precisa de um endereço `https://` **fixo**, porque os dados ficam guardados por endereço.
Se o endereço mudar, os treinos antigos deixam de aparecer. Escolhe uma destas opções e mantém-na.

### Opção A — GitHub Pages (recomendada, grátis e permanente)

```bash
cd C:\Users\nuno_\Desktop\treinos
git init
git add .
git commit -m "Treinos"
gh repo create treinos --private --source=. --push
```

No GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
Ao fim de um minuto ficas com `https://<o-teu-utilizador>.github.io/treinos/`.

> Repositórios privados só servem GitHub Pages em contas Pro. Com conta gratuita usa `--public`
> ou a Opção B — a app não tem dados nenhuns dentro, os treinos ficam sempre só no telemóvel.

### Opção B — Netlify Drop (mais rápida, sem git)

1. Vai a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrasta a pasta `treinos` para a página.
3. Ficas com um endereço `https://…netlify.app`. Cria conta grátis para o endereço não expirar.

### Opção C — Só em casa, pela rede Wi-Fi

```bash
node tools/servidor.js
```

Mostra o endereço `http://192.168.x.x:8080` para abrires no iPhone (tem de estar no mesmo Wi-Fi).
Podes passar outra porta como argumento (`node tools/servidor.js 9000`) ou pela variável `PORT`.
Serve para experimentar, mas **não é boa para uso diário**: sem `https` não funciona offline,
e se o IP do PC mudar perdes o acesso aos treinos guardados.

### Adicionar ao ecrã principal

1. Abre o endereço no **Safari** (tem mesmo de ser o Safari, não o Chrome).
2. Toca em **Partilhar** (o quadrado com a seta para cima).
3. **Adicionar ao ecrã principal** → **Adicionar**.

Fica com ícone próprio, abre em ecrã inteiro sem barra do Safari e funciona sem internet.

---

## Cópias de segurança

Os dados vivem no armazenamento do Safari. Desaparecem se apagares a app do ecrã principal
ou limpares os dados do site. **Ajustes → Exportar treinos** gera um ficheiro `.json`
que podes guardar no iCloud Drive; **Importar** repõe tudo (juntar ou substituir) — treinos,
exercícios teus, definições, o peso corporal e os nomes que deste aos exercícios.

Vale a pena exportar uma vez por mês.

---

## Estrutura

```
index.html              estrutura da app
styles.css              sistema de design (tokens, tema claro/escuro, safe areas)
manifest.webmanifest    metadados para o ecrã principal
sw.js                   service worker — faz a app funcionar offline
icons/                  ícones PNG gerados
js/
  exercises.js          catálogo: 16 músculos, 9 grupos com partes, 191 exercícios, pegas, 6 planos, 7 circuitos
  plano.js              o plano embutido — dias, séries, alvos e cargas de partida
  execucao.js           passos de execução e erro mais comum de cada exercício
  anatomia.js           figura humana em SVG com os músculos trabalhados
  store.js              dados em localStorage + perfil, motor de sugestão e estatísticas
  ui.js                 ícones SVG, sheets, toasts, vibração, som
  charts.js             gráficos SVG sem bibliotecas
  components.js         peças de interface reutilizadas
  app.js                router por hash, navegação, cronómetro de descanso
  views/                um ficheiro por ecrã (plano.js é o ecrã de monitorização)
tools/
  servidor.js           servidor estático local (sem dependências)
  gerar-icones.js       gera os PNG dos ícones
```

Sem dependências, sem passo de build. Editas um ficheiro e recarregas.

> Ao alterar código, sobe `VERSAO` em `sw.js` — senão o telemóvel continua a servir
> a versão em cache até ao segundo arranque.

---

## Notas técnicas

- **Offline**: o service worker guarda em cache todos os ficheiros no primeiro arranque.
- **Privado**: nada sai do telemóvel. Não há pedidos de rede, analytics nem contas.
- **Acessibilidade**: alvos de toque ≥ 44 pt, contraste AA nos dois temas, `prefers-reduced-motion`,
  etiquetas para VoiceOver, navegação por teclado nas sheets.
- **1RM estimado**: fórmula de Epley — `peso × (1 + reps/30)`.
