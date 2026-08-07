/* =============================================================
   Treinos — Como executar cada exercício
   passos = o movimento, por ordem
   erro   = o erro mais comum, e como o corrigir
   ============================================================= */
(function (global) {
  'use strict';

  const EXECUCAO = {

    /* ---------------- PEITO ---------------- */
    'supino-reto-barra': {
      passos: [
        'Deita-te no banco com os olhos por baixo da barra e os pés bem assentes no chão.',
        'Agarra a barra um pouco mais afastado do que a largura dos ombros e junta as omoplatas contra o banco.',
        'Tira a barra do suporte e desce-a devagar até tocar a meio do peito, com os cotovelos a cerca de 45 graus do tronco.',
        'Empurra a barra para cima até esticar os braços, sem descolar a bacia do banco.'
      ],
      erro: 'Abrir os cotovelos a 90 graus. Isso atira a tensão para a frente do ombro — mantém-nos mais fechados.'
    },
    'supino-inclinado-barra': {
      passos: [
        'Coloca o banco entre 30 e 45 graus. Mais do que isso passa a ser um exercício de ombro.',
        'Junta as omoplatas e agarra a barra pouco mais aberto do que os ombros.',
        'Desce a barra até à parte de cima do peito, junto às clavículas.',
        'Empurra para cima e ligeiramente para trás, terminando com a barra por cima dos ombros.'
      ],
      erro: 'Inclinar demasiado o banco. Acima de 45 graus são os deltoides a fazer quase todo o trabalho.'
    },
    'supino-declinado-barra': {
      passos: [
        'Prende bem as pernas nos apoios do banco declinado antes de tirar a barra.',
        'Agarra a barra à largura habitual do supino e retira-a do suporte com os braços esticados.',
        'Desce até à parte de baixo do peito, logo acima do fim do esterno.',
        'Empurra para cima em linha recta, sem deixar os cotovelos abrirem.'
      ],
      erro: 'Levantar-se depressa no fim da série. Pede ajuda para pousar a barra e sai devagar para não ficares tonto.'
    },
    'supino-reto-halteres': {
      passos: [
        'Senta-te no banco com os halteres apoiados nas coxas e deita-te a impulsioná-los com as pernas.',
        'Começa com os halteres à altura do peito, pulsos por cima dos cotovelos.',
        'Desce até sentires o peito esticado, um pouco abaixo da linha do tronco.',
        'Empurra para cima aproximando os halteres, sem os bater um no outro.'
      ],
      erro: 'Descer demasiado à procura de amplitude. Pára quando o ombro começar a rolar para a frente.'
    },
    'supino-inclinado-halteres': {
      passos: [
        'Banco a 30 graus, halteres apoiados nas coxas antes de te deitares.',
        'Encosta as costas ao banco e junta as omoplatas.',
        'Desce os halteres em linha com a parte de cima do peito, cotovelos ligeiramente à frente do tronco.',
        'Empurra para cima e junta os halteres no topo, mantendo a tensão no peito.'
      ],
      erro: 'Levantar os ombros do banco no esforço. Mantém as omoplatas coladas do princípio ao fim.'
    },
    'press-peito-maquina': {
      passos: [
        'Ajusta o banco para as pegas ficarem à altura do meio do peito.',
        'Encosta as costas ao apoio e assenta os pés no chão.',
        'Empurra as pegas para a frente até quase esticar os braços.',
        'Volta devagar até sentires o peito esticado, sem deixar os pesos baterem.'
      ],
      erro: 'Assento demasiado alto ou baixo. Se as pegas ficarem à altura do pescoço ou da barriga, o ombro paga a factura.'
    },
    'crucifixo-halteres': {
      passos: [
        'Deita-te no banco com um halter em cada mão por cima do peito, palmas viradas uma para a outra.',
        'Dobra ligeiramente os cotovelos e mantém esse ângulo fixo durante todo o movimento.',
        'Abre os braços em arco até sentires o peito esticado, à altura do tronco.',
        'Fecha o arco juntando os halteres por cima do peito, como se abraçasses um barril.'
      ],
      erro: 'Transformar o exercício num supino. Se os cotovelos dobram e esticam, a carga está alta demais.'
    },
    'crucifixo-inclinado': {
      passos: [
        'Banco entre 30 e 45 graus, um halter em cada mão por cima do peito.',
        'Cotovelos ligeiramente dobrados, ângulo fixo.',
        'Abre os braços em arco até à linha dos ombros.',
        'Junta os halteres em cima, apertando a parte de cima do peito.'
      ],
      erro: 'Deixar os halteres irem atrás da cabeça. O arco faz-se à frente do peito, não por cima dele.'
    },
    'peck-deck': {
      passos: [
        'Ajusta o assento para as pegas ficarem à altura do peito.',
        'Encosta as costas ao apoio e agarra as pegas com os cotovelos ligeiramente dobrados.',
        'Junta os braços à frente do peito e aperta um segundo.',
        'Volta devagar até sentires o peito esticado, controlando a carga.'
      ],
      erro: 'Voltar de repente e deixar os pesos baterem. A parte que faz crescer é a descida controlada.'
    },
    'crossover-alto': {
      passos: [
        'Coloca as duas polias em cima e agarra uma pega em cada mão.',
        'Dá um passo à frente com o tronco ligeiramente inclinado e o peito aberto.',
        'Com os cotovelos ligeiramente dobrados, puxa as mãos para baixo e para dentro, até se cruzarem à frente da barriga.',
        'Volta devagar até sentires o peito esticado.'
      ],
      erro: 'Empurrar com os tríceps. Os cotovelos ficam quase parados — quem se move são os braços a partir do ombro.'
    },
    'crossover-baixo': {
      passos: [
        'Polias em baixo, uma pega em cada mão, palmas viradas para a frente.',
        'Dá um passo à frente e mantém o tronco direito.',
        'Sobe as mãos em arco até à altura do peito, juntando-as à frente.',
        'Desce devagar, sem deixar os braços passarem muito atrás do tronco.'
      ],
      erro: 'Usar o balanço do tronco para arrancar. Se precisas de te atirar para trás, tira carga.'
    },
    flexoes: {
      passos: [
        'Mãos no chão pouco mais afastadas do que os ombros, corpo em linha recta dos calcanhares à cabeça.',
        'Aperta os glúteos e a barriga para não deixar a bacia cair.',
        'Desce até o peito ficar a um punho do chão, cotovelos a 45 graus do tronco.',
        'Empurra o chão para longe até esticar os braços.'
      ],
      erro: 'Deixar a bacia descair. Se acontecer, faz menos repetições ou apoia os joelhos.'
    },
    'flexoes-joelhos': {
      passos: [
        'Apoia os joelhos no chão, de preferência sobre uma toalha dobrada.',
        'Mãos pouco mais afastadas do que os ombros, corpo em linha recta dos joelhos à cabeça.',
        'Desce o peito até perto do chão com os cotovelos a 45 graus.',
        'Empurra até esticar os braços, sem levantar a bacia primeiro.'
      ],
      erro: 'Dobrar na anca e mexer só o tronco. O corpo, dos joelhos à cabeça, tem de subir e descer todo junto.'
    },
    'flexoes-declinadas': {
      passos: [
        'Põe os pés num banco ou degrau e as mãos no chão à largura dos ombros.',
        'Mantém o corpo em linha recta e a barriga apertada.',
        'Desce até o peito ficar perto do chão.',
        'Empurra até esticar os braços.'
      ],
      erro: 'Pés demasiado altos logo à primeira. Começa num degrau baixo e vai subindo com o tempo.'
    },
    'dips-peito': {
      passos: [
        'Sobe às paralelas com os braços esticados e inclina o tronco à frente cerca de 30 graus.',
        'Deixa os cotovelos abrirem um pouco para fora e cruza os pés atrás.',
        'Desce até os ombros ficarem à altura dos cotovelos.',
        'Empurra para cima mantendo a inclinação do tronco.'
      ],
      erro: 'Descer abaixo do ponto em que o ombro fica confortável. Se sentes um puxão à frente do ombro, pára mais acima.'
    },
    'pullover-halter': {
      passos: [
        'Deita-te no banco a segurar um halter com as duas mãos por cima do peito.',
        'Cotovelos ligeiramente dobrados e barriga apertada.',
        'Leva o halter atrás da cabeça até sentires as costelas e as costas esticarem.',
        'Traz de volta até ficar por cima do peito.'
      ],
      erro: 'Arquear a zona lombar para ir mais atrás. A amplitude vem do ombro, não da coluna.'
    },
    'supino-inclinado-maquina': {
      passos: [
        'Ajusta o assento para as pegas ficarem à altura da parte de cima do peito, junto às clavículas.',
        'Encosta as costas e a cabeça ao apoio e assenta bem os pés no chão.',
        'Empurra as pegas para cima e para a frente até quase esticar os braços.',
        'Volta devagar até sentires o peito esticado, sem deixar os pesos baterem.'
      ],
      erro: 'Pegas demasiado altas, à altura do pescoço. Baixa o assento até o esforço se sentir no peito e não no ombro.'
    },
    'press-peito-maquina-uni': {
      passos: [
        'Ajusta o assento como no press normal e usa só uma pega, com a outra mão apoiada no banco.',
        'Aperta a barriga e o glúteo para o tronco não rodar quando empurrares.',
        'Empurra a pega até quase esticar o braço, sem deixar o ombro adiantar-se.',
        'Volta devagar até sentires o peito esticado e repete. Só depois muda de braço.'
      ],
      erro: 'Deixar o tronco rodar atrás da mão. Se as costas descolam do apoio, tira carga — é o preço de ser a um braço.'
    },
    'supino-halter-uni': {
      passos: [
        'Deita-te no banco com um só halter, o outro braço esticado ao lado ou a segurar o banco.',
        'Aperta o glúteo e a barriga: metade do trabalho é não deixar o corpo torcer.',
        'Desce o halter até à altura do peito, cotovelo a 45 graus do tronco.',
        'Empurra para cima até esticar o braço e repete. Só depois trocas de lado.'
      ],
      erro: 'Rodar o tronco para acompanhar o halter. Mantém as duas omoplatas coladas ao banco do princípio ao fim.'
    },
    'crossover-uni': {
      passos: [
        'Polia à altura do ombro, uma pega só. Dá um passo à frente com o pé contrário à mão que trabalha.',
        'Abre o peito e deixa o braço ir atrás até sentires o peitoral esticado.',
        'Com o cotovelo ligeiramente dobrado e fixo, traz a mão em arco até ao meio do peito.',
        'Aperta um segundo e volta devagar. Faz todas as repetições antes de mudar de braço.'
      ],
      erro: 'Rodar o tronco para ajudar. O ombro que não trabalha fica quieto — quem se mexe é só o braço.'
    },
    'peck-deck-uni': {
      passos: [
        'Assento à altura do peito, agarra só uma pega e segura o apoio com a outra mão.',
        'Fecha o braço até ao meio do peito e aperta um segundo.',
        'Volta devagar até sentires o peito esticado, sem deixar o ombro rolar para a frente.',
        'Termina o lado e só depois passa ao outro.'
      ],
      erro: 'Deixar o tronco acompanhar o braço. Encosta o ombro do lado parado ao apoio e mantém-no lá.'
    },
    'flexoes-arqueiro': {
      passos: [
        'Põe as mãos bem mais afastadas do que numa flexão normal, corpo em linha recta.',
        'Desce a dobrar só um braço, deixando o outro esticar-se para o lado.',
        'Chega com o peito perto da mão que dobra, sem deixar a bacia cair.',
        'Empurra para cima e repete do mesmo lado; depois muda.'
      ],
      erro: 'Dobrar os dois braços por igual. O braço esticado deve ficar quase direito — é ele que faz a diferença de carga.'
    },

    /* ---------------- COSTAS ---------------- */
    'elevacoes-pronada': {
      passos: [
        'Agarra a barra com as palmas viradas para a frente, mãos pouco mais afastadas do que os ombros.',
        'Deixa o corpo esticar e depois puxa as omoplatas para baixo antes de dobrar os braços.',
        'Puxa até o queixo passar a barra, com o peito a subir na direcção dela.',
        'Desce devagar até esticar os braços por completo.'
      ],
      erro: 'Dar pontapés no ar para subir. Se não consegues, usa elástico ou a máquina de assistência.'
    },
    'elevacoes-supinada': {
      passos: [
        'Agarra a barra com as palmas viradas para ti, mãos à largura dos ombros.',
        'Baixa as omoplatas e puxa com os cotovelos junto ao corpo.',
        'Sobe até o queixo passar a barra.',
        'Desce controlado até esticar os braços.'
      ],
      erro: 'Balançar o corpo. Aperta os glúteos e cruza os pés para não te desequilibrares.'
    },
    'elevacoes-neutra': {
      passos: [
        'Usa as pegas paralelas da barra fixa, palmas viradas uma para a outra.',
        'Deixa o corpo esticar e começa por baixar as omoplatas.',
        'Puxa com os cotovelos a descer junto ao tronco, até o peito chegar às mãos.',
        'Desce devagar até esticar os braços.'
      ],
      erro: 'Escolher esta pega e continuar a puxar como na pronada. Aqui os cotovelos passam rentes ao corpo, não abertos.'
    },
    'puxada-frontal': {
      passos: [
        'Ajusta o apoio das coxas para não te levantares do banco.',
        'Agarra a barra pouco mais afastado do que os ombros, palmas para a frente.',
        'Inclina o tronco cerca de 15 graus para trás e puxa a barra até à parte de cima do peito.',
        'Deixa subir devagar até esticar os braços e sentir as costas esticarem.'
      ],
      erro: 'Puxar a barra atrás da nuca. Não traz vantagem nenhuma e força o ombro numa posição de risco.'
    },
    'puxada-fechada-pronada': {
      passos: [
        'Barra normal, palmas viradas para a frente, mãos à largura dos ombros ou pouco menos.',
        'Prende as coxas no apoio e abre o peito, tronco quase direito.',
        'Puxa até ao peito com os cotovelos a descer junto ao tronco — mais amplitude do que na pega larga.',
        'Deixa subir devagar até esticar os braços por completo.'
      ],
      erro: 'Fechar tanto as mãos que os pulsos torcem. Se doerem, abre um pouco ou passa à pega neutra.'
    },
    'puxada-supinada': {
      passos: [
        'Agarra a barra com as palmas viradas para ti, à largura dos ombros.',
        'Tronco quase direito, peito aberto.',
        'Puxa a barra até ao peito com os cotovelos a descer junto ao corpo.',
        'Volta a esticar os braços devagar.'
      ],
      erro: 'Encolher os ombros no arranque. Baixa primeiro as omoplatas, só depois dobras os braços.'
    },
    'puxada-neutra': {
      passos: [
        'Usa a pega em V ou a barra de pega neutra, palmas viradas uma para a outra.',
        'Senta-te com as coxas presas e o peito aberto.',
        'Puxa até a pega tocar a parte de cima do peito.',
        'Sobe devagar até esticar os braços.'
      ],
      erro: 'Deitar o tronco muito para trás. Passa a ser uma remada — mantém-te quase direito.'
    },
    'puxada-corda': {
      passos: [
        'Prende a corda na polia alta e agarra-a pelas pontas, palmas viradas uma para a outra.',
        'Senta-te com as coxas presas, tronco quase direito.',
        'Puxa para baixo e afasta as pontas da corda à medida que desces, terminando com as mãos à altura das orelhas.',
        'Deixa subir devagar até esticar os braços.'
      ],
      erro: 'Puxar com as mãos juntas até ao fim. É a abertura da corda no fim que dá o trabalho extra aos dorsais.'
    },
    'puxada-uni-polia': {
      passos: [
        'Prende uma pega simples na polia alta e ajoelha-te ou senta-te de frente para ela.',
        'Agarra com uma mão, braço esticado e ombro a subir; a outra mão apoia-te na coxa.',
        'Baixa primeiro a omoplata e depois puxa o cotovelo até junto às costelas.',
        'Deixa o braço subir devagar até esticar. Faz todas as repetições antes de mudar de lado.'
      ],
      erro: 'Rodar o tronco para acompanhar a mão. Fica de frente para a polia — quem roda é só a omoplata.'
    },
    'remada-curvada-barra': {
      passos: [
        'Pés à largura da anca, joelhos ligeiramente dobrados, agarra a barra por fora das pernas.',
        'Inclina o tronco para a frente até cerca de 45 graus, com as costas direitas e o peito aberto.',
        'Puxa a barra na direcção do umbigo, com os cotovelos a passar junto ao corpo.',
        'Desce a barra devagar até esticar os braços, sem arredondar as costas.'
      ],
      erro: 'Levantar o tronco a cada repetição. O tronco fica parado — só os braços e as omoplatas se movem.'
    },
    'remada-yates': {
      passos: [
        'Agarra a barra com as palmas viradas para a frente (pega supinada), à largura dos ombros.',
        'Tronco inclinado apenas 20 a 30 graus — mais direito do que na remada curvada.',
        'Puxa a barra até à parte de baixo da barriga, cotovelos rentes ao corpo.',
        'Desce devagar até esticar os braços, sem deixar as costas arredondarem.'
      ],
      erro: 'Usar a pega supinada com os pulsos rígidos e carga a mais. É assim que se magoa o bíceps — sobe o peso devagar ao longo das semanas.'
    },
    'remada-pendlay': {
      passos: [
        'Tronco quase paralelo ao chão, barra pousada no chão a cada repetição.',
        'Costas direitas, peito aberto, olhar à frente do pé.',
        'Puxa a barra do chão até à barriga com força e rapidez.',
        'Pousa a barra outra vez no chão e recomeça do zero.'
      ],
      erro: 'Arredondar as costas para chegar à barra. Se não consegues manter a coluna neutra, eleva a barra em discos.'
    },
    'remada-halter-uni': {
      passos: [
        'Apoia um joelho e a mão do mesmo lado no banco, com as costas paralelas ao chão.',
        'Segura o halter com o braço esticado, ombro a apontar para o chão.',
        'Puxa o halter até à anca, com o cotovelo junto ao corpo.',
        'Desce devagar até esticar o braço e sentir a costa a alongar.'
      ],
      erro: 'Rodar o tronco para levantar mais peso. Mantém os ombros paralelos ao chão.'
    },
    'remada-meadows': {
      passos: [
        'Encaixa uma barra num canto ou no suporte de barra T e põe os discos só na ponta de fora.',
        'Coloca-te de lado para a barra, pés afastados, e agarra a ponta com a mão mais distante.',
        'Inclina o tronco e apoia o outro braço na coxa da frente; deixa o ombro descer.',
        'Puxa a ponta da barra até à anca com o cotovelo alto e desce devagar. Faz o lado todo antes de mudar.'
      ],
      erro: 'Segurar a barra pelo meio da manga. Agarra mesmo a ponta — é a distância que dá o desafio à pega e ao dorsal.'
    },
    'remada-peito-apoiado': {
      passos: [
        'Põe o banco a 30 ou 45 graus e deita-te de barriga para baixo, com o peito apoiado.',
        'Deixa os halteres pendurados com os braços esticados, palmas viradas uma para a outra.',
        'Puxa até às costelas com os cotovelos junto ao corpo, apertando as omoplatas.',
        'Desce devagar até esticar os braços por completo.'
      ],
      erro: 'Descolar o peito do banco para puxar mais peso. Se o peito sai do apoio, deixou de ser este exercício.'
    },
    'remada-barra-t': {
      passos: [
        'Coloca-te sobre a barra com o peito apoiado ou o tronco inclinado, conforme a máquina.',
        'Agarra as pegas e estica os braços.',
        'Puxa até as mãos chegarem ao tronco, apertando as omoplatas.',
        'Desce devagar até esticar por completo.'
      ],
      erro: 'Encolher os ombros em vez de aproximar as omoplatas. Pensa em levar os cotovelos para trás.'
    },
    'remada-baixa-polia': {
      passos: [
        'Senta-te com os pés apoiados e os joelhos ligeiramente dobrados.',
        'Tronco direito, peito aberto, braços esticados a segurar a pega.',
        'Puxa a pega até à barriga, cotovelos junto ao corpo.',
        'Deixa os braços esticarem devagar, permitindo que as omoplatas se afastem no fim.'
      ],
      erro: 'Balançar o tronco para a frente e para trás. Se precisas de balanço, o peso está alto demais.'
    },
    'remada-polia-larga': {
      passos: [
        'Prende a barra larga na polia baixa e agarra-a com as palmas viradas para baixo.',
        'Senta-te direito, pés apoiados, braços esticados.',
        'Puxa a barra até à parte de cima da barriga com os cotovelos abertos, à altura dos ombros.',
        'Volta devagar até esticar os braços e deixar as omoplatas afastarem-se.'
      ],
      erro: 'Fazer esta com os cotovelos junto ao corpo. Com pega larga os cotovelos vão abertos — é o que apanha o trapézio e o deltoide de trás.'
    },
    'remada-polia-uni': {
      passos: [
        'Prende uma pega simples na polia baixa e senta-te de frente, com os pés apoiados.',
        'Agarra com uma mão, braço esticado, e deixa a omoplata ir à frente.',
        'Puxa o cotovelo para trás junto às costelas, rodando ligeiramente o tronco para abrir o peito.',
        'Volta devagar até esticar o braço. Termina o lado antes de mudar.'
      ],
      erro: 'Puxar só com o braço. A rotação curta do tronco é permitida e ajuda a chegar ao fim do movimento — o que não vale é balançar.'
    },
    'remada-maquina': {
      passos: [
        'Ajusta o assento para as pegas ficarem à altura da parte de baixo do peito.',
        'Encosta o peito ao apoio e segura as pegas com os braços esticados.',
        'Puxa até as mãos chegarem ao tronco, apertando as omoplatas.',
        'Volta devagar até esticar os braços.'
      ],
      erro: 'Descolar o peito do apoio. É esse apoio que impede a lombar de trabalhar em vez das costas.'
    },
    'remada-maquina-uni': {
      passos: [
        'Assento à mesma altura da remada normal, peito encostado ao apoio.',
        'Agarra só uma pega e deixa o braço esticar por completo.',
        'Puxa o cotovelo para trás até à costela, sem deixar o peito descolar do apoio.',
        'Volta devagar e faz todas as repetições antes de mudar de braço.'
      ],
      erro: 'Rodar os ombros para chegar mais longe. O tronco fica de frente; ganhas amplitude com a omoplata, não com a torção.'
    },
    'pullover-polia': {
      passos: [
        'De pé, de frente para uma polia alta, agarra a barra ou a corda com os braços quase esticados.',
        'Inclina ligeiramente o tronco à frente e aperta a barriga.',
        'Puxa a barra para baixo em arco, até chegar às coxas, mantendo os cotovelos quase fixos.',
        'Deixa subir devagar até sentir as costas esticarem.'
      ],
      erro: 'Dobrar os cotovelos e transformar isto numa extensão de tríceps. O braço mantém-se quase esticado.'
    },
    'puxada-omoplatas': {
      passos: [
        'Senta-te na máquina de puxadas e agarra a barra com as palmas para a frente, mãos afastadas.',
        'Estica os braços por completo e deixa os ombros subirem junto às orelhas.',
        'Sem dobrar os cotovelos, baixa as omoplatas e puxa o peito na direcção da barra — o movimento é curto.',
        'Volta a deixar os ombros subirem, controlando a carga.'
      ],
      erro: 'Dobrar os braços. Aqui os cotovelos ficam esticados do princípio ao fim: quem trabalha é a omoplata, e é isso que ensina o corpo a começar bem as puxadas.'
    },
    'remada-invertida': {
      passos: [
        'Coloca uma barra à altura da anca e passa por baixo dela.',
        'Agarra a barra, corpo em linha recta com os calcanhares no chão.',
        'Puxa o peito na direcção da barra apertando as omoplatas.',
        'Desce devagar até esticar os braços.'
      ],
      erro: 'Deixar a bacia cair. Quanto mais horizontal ficares, mais difícil é — ajusta a altura da barra ao teu nível.'
    },
    'remada-invertida-supinada': {
      passos: [
        'Barra à altura da anca; passa por baixo e agarra-a com as palmas viradas para ti, mãos à largura dos ombros.',
        'Corpo em linha recta, calcanhares no chão, barriga apertada.',
        'Puxa o peito à barra com os cotovelos rentes ao tronco — vais sentir mais bíceps do que na pega pronada.',
        'Desce devagar até esticar os braços por completo.'
      ],
      erro: 'Parar a meio. Com esta pega consegues chegar mais perto da barra: toca-lhe com o peito em cada repetição.'
    },
    'face-pull': {
      passos: [
        'Coloca a polia à altura da cara e agarra a corda com as palmas viradas uma para a outra.',
        'Dá um passo atrás e estica os braços à frente.',
        'Puxa a corda na direcção da testa, afastando as mãos e rodando os ombros para fora.',
        'Volta devagar à posição inicial.'
      ],
      erro: 'Usar carga a mais e puxar com os bíceps. Este é um exercício de precisão, não de força.'
    },
    'encolhimentos-barra': {
      passos: [
        'De pé, segura a barra à frente das coxas com os braços esticados.',
        'Peito aberto, olhar em frente.',
        'Sobe os ombros na direcção das orelhas o mais alto que conseguires.',
        'Desce devagar até sentir o trapézio esticar.'
      ],
      erro: 'Rodar os ombros. O movimento é a direito, para cima e para baixo — rodar não acrescenta nada.'
    },
    'encolhimentos-halteres': {
      passos: [
        'De pé, um halter em cada mão ao lado do corpo.',
        'Braços esticados, ombros para trás.',
        'Encolhe os ombros o mais alto que conseguires e aguenta um segundo.',
        'Desce devagar até esticar por completo.'
      ],
      erro: 'Dobrar os braços para ajudar. Os braços são só ganchos — quem trabalha é o trapézio.'
    },
    'encolhimento-polia': {
      passos: [
        'Polia em baixo com uma barra ou duas pegas, braços esticados à frente ou ao lado das coxas.',
        'De pé, peito aberto e barriga apertada.',
        'Encolhe os ombros na direcção das orelhas e aguenta um segundo em cima.',
        'Desce devagar até sentir o trapézio esticar — o cabo mantém a tensão mesmo em baixo.'
      ],
      erro: 'Inclinar-te para trás para contrariar o cabo. Fica direito e usa menos peso.'
    },
    'peso-morto': {
      passos: [
        'Pés à largura da anca, barra por cima do meio do pé, quase a tocar nas canelas.',
        'Dobra a anca e os joelhos para agarrar a barra por fora das pernas, com as costas direitas e o peito aberto.',
        'Aperta a barriga, estica os braços e empurra o chão com os pés, levantando o peito e a bacia ao mesmo tempo.',
        'Termina de pé com a barra encostada às coxas e desce pelo mesmo caminho.'
      ],
      erro: 'Arredondar as costas no arranque. Se não consegues manter a coluna neutra, baixa a carga — sem excepções.'
    },
    'peso-morto-romeno': {
      passos: [
        'De pé, barra encostada às coxas, joelhos ligeiramente dobrados.',
        'Empurra a bacia para trás e deixa a barra deslizar pela frente das pernas.',
        'Desce até sentires a parte de trás das coxas bem esticada, normalmente a meio da canela.',
        'Volta a subir empurrando a bacia à frente e apertando os glúteos no topo.'
      ],
      erro: 'Dobrar os joelhos como num agachamento. Aqui quem se move é a anca — os joelhos ficam quase parados.'
    },
    'peso-morto-sumo': {
      passos: [
        'Pés bem mais afastados do que os ombros, pontas viradas para fora.',
        'Agarra a barra com as mãos por dentro das pernas, peito aberto e costas direitas.',
        'Empurra o chão para fora com os pés e sobe mantendo a barra colada às pernas.',
        'Termina de pé e desce controlado pelo mesmo caminho.'
      ],
      erro: 'Deixar os joelhos caírem para dentro. Empurra-os na direcção das pontas dos pés durante todo o movimento.'
    },
    hiperextensoes: {
      passos: [
        'Ajusta o apoio para ficar logo abaixo da anca.',
        'Cruza os braços ao peito e deixa o tronco descer devagar.',
        'Desce até sentires a parte de trás das coxas a esticar.',
        'Sobe até o corpo ficar em linha recta e pára aí.'
      ],
      erro: 'Subir para além da linha do corpo. Passar disso comprime a lombar sem trabalhar mais nada.'
    },

    /* ---------------- OMBROS ---------------- */
    'press-militar': {
      passos: [
        'De pé, barra apoiada na parte de cima do peito, mãos pouco mais afastadas do que os ombros.',
        'Aperta os glúteos e a barriga para travar o tronco.',
        'Empurra a barra para cima, afastando ligeiramente a cara para a deixar passar.',
        'No topo, mete a cabeça à frente da barra e estica os braços. Desce controlado até ao peito.'
      ],
      erro: 'Arquear a lombar para trás. Se acontece, aperta os glúteos ou faz o exercício sentado com apoio.'
    },
    'press-ombros-halteres': {
      passos: [
        'Sentado com as costas apoiadas, sobe os halteres até à altura das orelhas, palmas para a frente.',
        'Cotovelos ligeiramente à frente do tronco, não completamente abertos.',
        'Empurra para cima até quase esticar os braços, aproximando os halteres.',
        'Desce devagar até os cotovelos ficarem à altura dos ombros.'
      ],
      erro: 'Bater os halteres um no outro em cima. Pára um palmo antes e mantém a tensão no deltoide.'
    },
    'press-arnold': {
      passos: [
        'Sentado, começa com os halteres à frente do peito e as palmas viradas para ti.',
        'Sobe rodando os pulsos para fora, até as palmas ficarem viradas para a frente.',
        'Estica os braços por cima da cabeça.',
        'Desce fazendo o caminho inverso, com a rotação a acontecer na descida.'
      ],
      erro: 'Rodar de repente com carga pesada. Este exercício pede peso moderado e movimento suave.'
    },
    'press-ombros-maquina': {
      passos: [
        'Ajusta o assento para as pegas ficarem à altura dos ombros.',
        'Costas encostadas ao apoio, pés no chão.',
        'Empurra para cima até quase esticar os braços.',
        'Desce devagar até os cotovelos ficarem à altura dos ombros.'
      ],
      erro: 'Descer demasiado. Se o cotovelo passa muito abaixo do ombro, o ombro fica em posição frágil.'
    },
    'press-ombros-neutro': {
      passos: [
        'Sentado com as costas apoiadas, sobe os halteres à altura dos ombros com as palmas viradas uma para a outra.',
        'Mantém os cotovelos à frente do tronco, não abertos de lado.',
        'Empurra para cima sem rodar os pulsos, até quase esticar os braços.',
        'Desce devagar até os cotovelos ficarem à altura dos ombros.'
      ],
      erro: 'Abrir os cotovelos a meio da subida. É a pega neutra com os cotovelos à frente que poupa o ombro — se abres, perdes a vantagem.'
    },
    'press-ombro-uni-halter': {
      passos: [
        'De pé ou sentado, um só halter à altura do ombro, palma para a frente ou virada para dentro.',
        'Aperta a barriga e o glúteo: o tronco não pode inclinar-se para o lado.',
        'Empurra para cima até esticar o braço, com o halter a acabar por cima do ombro.',
        'Desce devagar e repete. Só depois muda de braço.'
      ],
      erro: 'Deitar o tronco para o lado contrário para ajudar. Se acontece, tira carga ou senta-te com encosto.'
    },
    'press-kettlebell-uni': {
      passos: [
        'Encaixa o kettlebell no antebraço, com a mão à altura do ombro e o pulso direito.',
        'Aperta a barriga e o glúteo do mesmo lado antes de empurrar.',
        'Empurra para cima até esticar o braço, com a palma a acabar virada para a frente.',
        'Desce controlado até ao ombro. Faz todas as repetições antes de mudar de lado.'
      ],
      erro: 'Deixar o pulso dobrar para trás com o peso da bola. Fecha bem a mão e mantém o pulso direito e alinhado com o antebraço.'
    },
    'elevacoes-laterais': {
      passos: [
        'De pé, um halter em cada mão ao lado das coxas, cotovelos ligeiramente dobrados.',
        'Sobe os braços para os lados, a liderar com o cotovelo, até à altura dos ombros.',
        'Pára quando os braços ficarem paralelos ao chão.',
        'Desce devagar até junto ao corpo, sem deixar a carga cair.'
      ],
      erro: 'Balançar o corpo e atirar os halteres. Aqui a carga leve com movimento limpo ganha sempre à carga pesada.'
    },
    'elevacoes-laterais-polia': {
      passos: [
        'Coloca a polia em baixo e fica de lado para a máquina.',
        'Agarra a pega com a mão de fora, a passar à frente do corpo.',
        'Sobe o braço para o lado até à altura do ombro.',
        'Desce devagar, controlando a tensão do cabo até ao fim.'
      ],
      erro: 'Ficar demasiado perto da polia. Afasta-te um passo para o cabo puxar mesmo de lado.'
    },
    'elevacao-lateral-inclinado': {
      passos: [
        'Segura-te a um suporte ou à máquina com uma mão e inclina o corpo para o lado de fora, braço esticado.',
        'Halter na mão de fora, a pender por baixo do ombro.',
        'Sobe o braço para o lado até à altura do ombro — a inclinação faz o exercício começar sem folga.',
        'Desce devagar até baixo. Faz todas as repetições antes de trocar de lado.'
      ],
      erro: 'Usar o mesmo peso das elevações normais. Inclinado é mais difícil no início do movimento: baixa a carga.'
    },
    'elevacoes-laterais-maquina': {
      passos: [
        'Ajusta o assento para os cotovelos ficarem alinhados com o eixo da máquina.',
        'Encosta o tronco ao apoio e coloca os antebraços nas almofadas.',
        'Sobe até os braços ficarem paralelos ao chão.',
        'Desce devagar sem deixar os pesos baterem.'
      ],
      erro: 'Subir acima do ombro. Passar disso mete o trapézio a fazer o trabalho.'
    },
    'elevacoes-frontais': {
      passos: [
        'De pé, um halter em cada mão à frente das coxas, palmas viradas para trás.',
        'Sobe um braço à frente, esticado, até à altura do ombro.',
        'Desce devagar e repete com o outro braço, ou faz os dois ao mesmo tempo.',
        'Mantém o tronco parado do princípio ao fim.'
      ],
      erro: 'Subir acima da linha dos ombros. Acima disso é o trapézio, não a frente do ombro.'
    },
    'elevacao-frontal-polia-uni': {
      passos: [
        'Polia em baixo, de costas para a máquina, com o cabo a passar por fora da perna.',
        'Agarra a pega com uma mão e dá um passo à frente, braço esticado ao lado da coxa.',
        'Sobe o braço à frente, esticado, até à altura do ombro.',
        'Desce devagar, sem deixar o cabo puxar o braço para trás. Termina o lado e muda.'
      ],
      erro: 'Inclinar o tronco para trás para subir mais. Aperta a barriga e pára à altura do ombro.'
    },
    'crucifixo-invertido': {
      passos: [
        'Inclina o tronco à frente até quase paralelo ao chão, sentado ou de pé.',
        'Deixa os halteres pendurados por baixo do peito, cotovelos ligeiramente dobrados.',
        'Abre os braços para os lados até à altura dos ombros.',
        'Desce devagar até os halteres se aproximarem outra vez.'
      ],
      erro: 'Puxar com os cotovelos como numa remada. O braço vai para fora, não para trás.'
    },
    'crucifixo-invertido-maquina': {
      passos: [
        'Senta-te de frente para o apoio de peito e agarra as pegas com os braços esticados.',
        'Cotovelos ligeiramente dobrados e ombros baixos.',
        'Abre os braços para trás até à linha do tronco.',
        'Volta devagar sem deixar os pesos baterem.'
      ],
      erro: 'Encolher os ombros durante o movimento. Mantém o pescoço comprido e os ombros longe das orelhas.'
    },
    'crucifixo-invertido-polia-uni': {
      passos: [
        'Polia à altura do ombro. Fica de lado e agarra a pega com a mão de fora, a cruzar à frente do peito.',
        'Braço quase esticado, cotovelo com uma dobra ligeira e fixa.',
        'Abre o braço para fora e para trás, até à linha do tronco, sem encolher o ombro.',
        'Volta devagar a cruzar à frente do peito. Faz o lado todo antes de mudar.'
      ],
      erro: 'Puxar o cotovelo para trás como numa remada. O braço abre em arco largo — se dobras o cotovelo, é o dorsal que trabalha.'
    },
    'remada-alta': {
      passos: [
        'De pé, agarra a barra à largura dos ombros, à frente das coxas.',
        'Puxa a barra para cima junto ao corpo, com os cotovelos a subir sempre acima das mãos.',
        'Pára quando a barra chegar à parte de cima do peito.',
        'Desce devagar até esticar os braços.'
      ],
      erro: 'Puxar até ao queixo com pega fechada. Usa pega mais aberta e pára ao nível do peito — o ombro agradece.'
    },

    /* ---------------- BÍCEPS ---------------- */
    'rosca-direta-barra': {
      passos: [
        'De pé, agarra a barra por baixo à largura dos ombros, braços esticados.',
        'Cotovelos junto ao tronco e ligeiramente à frente.',
        'Dobra os braços até a barra chegar perto do peito, sem mexer os cotovelos.',
        'Desce devagar até esticar por completo.'
      ],
      erro: 'Atirar a barra com o balanço do tronco. Encosta as costas a uma parede se te apanhares a balançar.'
    },
    'rosca-barra-w': {
      passos: [
        'Agarra a barra W nas partes inclinadas, palmas viradas para cima e para dentro.',
        'Cotovelos junto ao corpo, braços esticados.',
        'Sobe a barra até perto do peito, apertando o bíceps no topo.',
        'Desce devagar até esticar os braços.'
      ],
      erro: 'Escolher a barra W só por hábito. Se não te dói o pulso na barra direita, essa dá mais trabalho ao bíceps.'
    },
    'rosca-alternada': {
      passos: [
        'De pé ou sentado, um halter em cada mão ao lado do corpo, palmas viradas para dentro.',
        'Sobe um halter rodando o pulso para que a palma fique virada para cima.',
        'Aperta o bíceps no topo e desce devagar, desfazendo a rotação.',
        'Repete com o outro braço.'
      ],
      erro: 'Começar o braço seguinte antes de acabar o anterior. Uma repetição de cada vez, com o tronco parado.'
    },
    'rosca-martelo': {
      passos: [
        'De pé, halteres ao lado do corpo com as palmas viradas uma para a outra.',
        'Mantém essa pega neutra durante todo o movimento.',
        'Sobe até o halter chegar perto do ombro, sem mexer o cotovelo.',
        'Desce devagar até esticar o braço.'
      ],
      erro: 'Deixar o cotovelo ir à frente. Se ele viaja, é o ombro a trabalhar em vez do braço.'
    },
    'rosca-martelo-corda': {
      passos: [
        'Polia em baixo com a corda; agarra as pontas com as palmas viradas uma para a outra.',
        'Cotovelos junto ao tronco, braços esticados, um passo atrás da polia.',
        'Sobe mantendo a pega neutra do princípio ao fim — os polegares apontam sempre para cima.',
        'Desce devagar até esticar os braços por completo.'
      ],
      erro: 'Rodar os pulsos na subida. Se as palmas viram para cima, deixou de ser martelo e o braquial sai do exercício.'
    },
    'rosca-inversa': {
      passos: [
        'Agarra a barra por cima (palmas viradas para baixo), mãos à largura dos ombros.',
        'Cotovelos junto ao tronco e pulsos firmes, em linha com o antebraço.',
        'Sobe a barra até perto do peito sem deixar os pulsos caírem.',
        'Desce devagar até esticar os braços.'
      ],
      erro: 'Usar a carga do curl normal. Com a pega pronada consegues bem menos peso — começa por metade.'
    },
    'rosca-scott': {
      passos: [
        'Ajusta o banco para a axila ficar apoiada na parte de cima da almofada.',
        'Agarra a barra por baixo e estica os braços quase por completo.',
        'Sobe até a barra chegar perto do queixo.',
        'Desce devagar e controla os últimos graus, que é onde o exercício custa.'
      ],
      erro: 'Deixar cair a barra na parte final. É aí que se magoam os cotovelos — desce sempre travado.'
    },
    'rosca-scott-uni': {
      passos: [
        'Apoia só uma axila na almofada do banco Scott, com o halter na mão desse lado.',
        'Estica o braço quase por completo, mantendo o ombro em baixo.',
        'Sobe o halter até perto do ombro, rodando ligeiramente o mindinho para dentro no topo.',
        'Desce devagar e controla o fim do movimento. Faz todas as repetições antes de mudar de braço.'
      ],
      erro: 'Levantar o corpo para ajudar na última repetição. Se precisas disso, a série já acabou.'
    },
    'rosca-concentrada': {
      passos: [
        'Senta-te num banco com as pernas afastadas e apoia o cotovelo na parte de dentro da coxa.',
        'Deixa o braço esticado a segurar o halter.',
        'Sobe o halter até ao ombro, virando ligeiramente o mindinho para dentro no topo.',
        'Desce devagar até esticar por completo.'
      ],
      erro: 'Empurrar o cotovelo contra a coxa para ajudar. O apoio serve só para travar o braço.'
    },
    'rosca-polia': {
      passos: [
        'Polia em baixo, agarra a barra ou as pegas com os braços esticados.',
        'Dá um pequeno passo atrás para haver tensão desde o início.',
        'Sobe até perto do peito, com os cotovelos parados junto ao corpo.',
        'Desce devagar, sem deixar o cabo puxar o braço de repente.'
      ],
      erro: 'Ficar em cima da polia. Um passo atrás mantém a tensão em toda a amplitude.'
    },
    'rosca-polia-uni': {
      passos: [
        'Polia em baixo com uma pega simples; agarra-a com uma mão, palma virada para cima.',
        'Um passo atrás, cotovelo junto ao tronco, braço esticado.',
        'Sobe até perto do ombro sem deixar o cotovelo viajar à frente.',
        'Desce devagar contra a tensão do cabo. Termina o braço antes de mudar.'
      ],
      erro: 'Deixar o cabo esticar o braço de repente no fim. A descida travada é metade do trabalho.'
    },
    'rosca-polia-alta-uni': {
      passos: [
        'Polia à altura da cabeça ou acima; fica de lado com o braço esticado na direcção dela.',
        'Agarra a pega com a palma virada para cima e o braço à altura do ombro.',
        'Dobra o braço a levar a mão à orelha, sem deixar o cotovelo descer.',
        'Estica devagar até ao início. Faz todas as repetições antes de mudar de lado.'
      ],
      erro: 'Baixar o cotovelo durante a série. O cotovelo fica à altura do ombro — é essa posição que estica a cabeça longa.'
    },
    'rosca-inclinada': {
      passos: [
        'Senta-te num banco inclinado a 45 graus e deixa os braços pendurados atrás da linha do tronco.',
        'Palmas viradas para a frente.',
        'Sobe os halteres sem mexer os cotovelos para a frente.',
        'Desce devagar até esticar por completo e sentir o bíceps a alongar.'
      ],
      erro: 'Levantar os cotovelos na subida. É esta posição atrás do tronco que torna o exercício especial.'
    },
    'rosca-aranha': {
      passos: [
        'Deita-te de barriga para baixo num banco inclinado a 45 graus, com o peito apoiado.',
        'Deixa os braços pendurados a direito, halteres com as palmas para a frente.',
        'Sobe até perto dos ombros, apertando o bíceps no topo.',
        'Desce devagar até esticar por completo — sem o tronco, não há forma de fazer batota.'
      ],
      erro: 'Encolher os ombros para ajudar a subir. Mantém o peito colado ao banco e os ombros baixos.'
    },

    /* ---------------- TRÍCEPS ---------------- */
    'dips-triceps': {
      passos: [
        'Sobe às paralelas com os braços esticados e o tronco o mais direito possível.',
        'Cotovelos junto ao corpo, a apontar para trás.',
        'Desce até os cotovelos ficarem a 90 graus.',
        'Empurra até esticar os braços sem trancar de repente.'
      ],
      erro: 'Inclinar o tronco à frente. Isso passa o trabalho para o peito — para tríceps, tronco direito.'
    },
    'supino-fechado': {
      passos: [
        'Deita-te no banco e agarra a barra à largura dos ombros, não mais fechado do que isso.',
        'Desce a barra até à parte de baixo do peito, com os cotovelos junto ao tronco.',
        'Empurra a barra para cima até esticar os braços.',
        'Mantém os pulsos direitos por cima dos cotovelos.'
      ],
      erro: 'Fechar demasiado as mãos. Mãos muito juntas magoam os pulsos e não dão mais tríceps.'
    },
    'triceps-polia-barra': {
      passos: [
        'Polia em cima, agarra a barra por cima à largura dos ombros.',
        'Cotovelos colados ao tronco, tronco ligeiramente inclinado à frente.',
        'Estica os braços até em baixo, sem mexer os cotovelos.',
        'Deixa subir devagar até os antebraços ficarem paralelos ao chão.'
      ],
      erro: 'Empurrar com o corpo todo. Se o tronco sobe e desce, tira carga e trava os cotovelos.'
    },
    'triceps-polia-corda': {
      passos: [
        'Polia em cima, agarra a corda com as palmas viradas uma para a outra.',
        'Cotovelos colados ao tronco.',
        'Estica os braços para baixo e afasta as pontas da corda no fim.',
        'Volta devagar, controlando a subida.'
      ],
      erro: 'Não abrir a corda no fim. É esse último bocado que faz a diferença neste exercício.'
    },
    'triceps-polia-corda-uni': {
      passos: [
        'Polia em cima. Agarra uma das pontas da corda com uma só mão, palma virada para dentro.',
        'Cola o cotovelo ao tronco e mantém o tronco ligeiramente inclinado à frente.',
        'Estica o braço para baixo e roda a mão para fora no fim, como se despejasses um copo.',
        'Deixa subir devagar até o antebraço ficar paralelo ao chão. Faz o braço todo antes de mudar.'
      ],
      erro: 'Deixar o cotovelo afastar-se das costelas. A um braço é fácil não dar por isso — usa a outra mão para o segurar no sítio.'
    },
    'triceps-polia-uni-supinada': {
      passos: [
        'Polia em cima com uma pega simples; agarra-a por baixo, palma virada para cima.',
        'Cotovelo colado ao tronco, ombro em baixo.',
        'Estica o braço para baixo até ficar direito, mantendo o pulso firme.',
        'Sobe devagar até o antebraço ficar paralelo ao chão. Termina o lado e muda.'
      ],
      erro: 'Rodar o pulso a meio para uma pega neutra. Se a palma vira, deixas de insistir na cabeça de dentro do tríceps.'
    },
    'triceps-testa': {
      passos: [
        'Deitado no banco, segura a barra W por cima do peito com os braços esticados.',
        'Mantém os cotovelos apontados para cima e ligeiramente atrás da cabeça.',
        'Dobra os braços e desce a barra até perto da testa.',
        'Estica os braços até à posição inicial sem mexer os cotovelos.'
      ],
      erro: 'Deixar os cotovelos abrirem para os lados. Aponta-os sempre ao tecto.'
    },
    'triceps-acima-cabeca': {
      passos: [
        'Sentado ou de pé, segura um halter com as duas mãos por cima da cabeça.',
        'Cotovelos apontados à frente e junto às orelhas.',
        'Desce o halter atrás da cabeça até sentires o tríceps esticar.',
        'Estica os braços até cima sem mexer os cotovelos.'
      ],
      erro: 'Abrir os cotovelos. Quanto mais fechados, mais trabalha a cabeça longa do tríceps.'
    },
    'triceps-acima-cabeca-uni': {
      passos: [
        'Sentado ou de pé, segura um halter com uma mão por cima da cabeça, braço esticado.',
        'Cotovelo junto à orelha, a apontar ao tecto; a outra mão pode segurar esse cotovelo.',
        'Desce o halter atrás da cabeça até sentires o tríceps bem esticado.',
        'Estica o braço até cima sem mexer o cotovelo. Faz todas as repetições antes de mudar de braço.'
      ],
      erro: 'Deixar o cotovelo abrir para o lado. Segura-o com a outra mão e mantém-no a apontar para cima.'
    },
    'triceps-polia-acima-cabeca': {
      passos: [
        'Prende a corda na polia baixa, agarra-a e vira-te de costas para a máquina.',
        'Leva as mãos atrás da cabeça, cotovelos apontados à frente e junto às orelhas.',
        'Dá um passo à frente e inclina ligeiramente o tronco.',
        'Estica os braços à frente e para cima, e volta devagar até sentir o tríceps esticar.'
      ],
      erro: 'Deixar os cotovelos descerem e abrirem. Mantém-nos altos e apontados à frente do princípio ao fim.'
    },
    'triceps-kickback': {
      passos: [
        'Inclina o tronco à frente com apoio de uma mão no banco.',
        'Sobe o cotovelo até o braço ficar paralelo ao chão e deixa-o aí.',
        'Estica o antebraço para trás até o braço ficar todo direito.',
        'Volta devagar sem deixar o cotovelo cair.'
      ],
      erro: 'Baixar o cotovelo entre repetições. O braço fica parado — só o antebraço se move.'
    },
    'triceps-kickback-polia': {
      passos: [
        'Polia em baixo com uma pega simples; inclina o tronco à frente e apoia a outra mão no joelho ou no banco.',
        'Sobe o cotovelo até o braço ficar paralelo ao chão e trava-o aí.',
        'Estica o antebraço para trás até o braço ficar direito e aperta um segundo.',
        'Volta devagar contra o cabo. Faz todas as repetições antes de trocar de braço.'
      ],
      erro: 'Deixar o cabo puxar o antebraço para a frente e o cotovelo cair. O braço fica parado — o cabo só resiste ao antebraço.'
    },
    'triceps-maquina': {
      passos: [
        'Ajusta o assento para os cotovelos ficarem alinhados com o eixo da máquina.',
        'Encosta as costas e apoia os braços na almofada.',
        'Estica os braços até ao fim.',
        'Volta devagar até sentires o tríceps esticar.'
      ],
      erro: 'Trancar os cotovelos com força no fim. Estica sem bater no fim do curso.'
    },
    'flexoes-diamante': {
      passos: [
        'No chão, junta as mãos formando um triângulo entre os polegares e os indicadores.',
        'Corpo em linha recta, barriga apertada.',
        'Desce até o peito tocar nas mãos, com os cotovelos junto ao corpo.',
        'Empurra até esticar os braços.'
      ],
      erro: 'Abrir os cotovelos. Junto ao corpo é o que faz disto um exercício de tríceps.'
    },

    /* ---------------- ANTEBRAÇO ---------------- */
    'rosca-punho': {
      passos: [
        'Senta-te e apoia os antebraços nas coxas, com as mãos para fora dos joelhos, palmas viradas para cima.',
        'Deixa a barra rolar até às pontas dos dedos.',
        'Fecha a mão e enrola o punho para cima o máximo que conseguires.',
        'Desce devagar até esticar por completo.'
      ],
      erro: 'Levantar os antebraços das coxas. Só o punho se move.'
    },
    'rosca-punho-halter-uni': {
      passos: [
        'Sentado, apoia um antebraço na coxa com a mão para fora do joelho, palma virada para cima.',
        'Segura o halter e deixa-o rolar até às pontas dos dedos.',
        'Fecha a mão e enrola o punho para cima o máximo que conseguires.',
        'Desce devagar até esticar. Faz o braço todo antes de mudar de lado.'
      ],
      erro: 'Fazer só metade do movimento. Deixa mesmo o halter rolar até aos dedos — é aí que o antebraço trabalha a sério.'
    },
    'rosca-punho-invertida': {
      passos: [
        'Antebraços apoiados nas coxas, palmas viradas para baixo.',
        'Deixa os punhos descerem para o chão.',
        'Sobe as costas das mãos o mais alto que conseguires.',
        'Desce devagar até esticar.'
      ],
      erro: 'Usar carga a mais. Os extensores são pequenos e ganham com repetições altas e peso leve.'
    },
    'farmers-walk': {
      passos: [
        'Levanta um halter pesado em cada mão, dobrando as pernas e não as costas.',
        'De pé, peito aberto, ombros para trás e barriga apertada.',
        'Caminha em passo firme e controlado, sem balançar os braços.',
        'Pousa a carga dobrando as pernas quando o tempo acabar.'
      ],
      erro: 'Encolher os ombros e curvar as costas. Se acontecer antes do tempo, reduz a carga.'
    },
    'transporte-mala': {
      passos: [
        'Levanta um só halter ou kettlebell do chão, dobrando as pernas e não as costas.',
        'De pé, ombros nivelados: o lado com carga não pode descer nem o outro subir.',
        'Caminha em passo firme, com a barriga apertada a impedir a inclinação lateral.',
        'Pousa a carga e repete do outro lado, com o mesmo tempo.'
      ],
      erro: 'Inclinar o corpo para o lado do peso. Se o tronco tomba, é peso a mais — o exercício é precisamente não tombar.'
    },
    'pega-disco': {
      passos: [
        'Junta um ou dois discos com o lado liso para fora, pousados na vertical.',
        'Agarra-os pela borda só com os dedos e o polegar, sem apoiar a palma.',
        'Levanta e mantém o braço esticado ao lado do corpo, ombro para trás.',
        'Aguenta o tempo marcado e pousa com cuidado. Repete com a outra mão.'
      ],
      erro: 'Encostar o disco à perna para descansar. Mantém-no afastado do corpo — quem tem de aguentar são os dedos.'
    },

    /* ---------------- QUADRÍCEPS ---------------- */
    'agachamento-barra': {
      passos: [
        'Barra apoiada na parte de cima das costas, pés à largura dos ombros com as pontas ligeiramente para fora.',
        'Aperta a barriga, peito aberto e olhar em frente.',
        'Desce empurrando a bacia para trás e os joelhos na direcção das pontas dos pés, até as coxas ficarem paralelas ao chão ou abaixo.',
        'Sobe empurrando o chão com o pé inteiro, sem deixar a bacia subir antes do peito.'
      ],
      erro: 'Deixar os joelhos caírem para dentro. Empurra-os para fora durante a subida.'
    },
    'agachamento-frontal': {
      passos: [
        'Barra apoiada à frente, nos deltoides, cotovelos bem altos.',
        'Pés à largura dos ombros, pontas ligeiramente para fora.',
        'Desce mantendo o tronco o mais direito possível e os cotovelos altos.',
        'Sobe empurrando o chão, sem deixar os cotovelos caírem.'
      ],
      erro: 'Baixar os cotovelos. Assim que caem, a barra rola para a frente e tens de largar.'
    },
    'agachamento-bulgaro': {
      passos: [
        'Apoia o peito do pé de trás num banco e dá um passo à frente com a outra perna.',
        'Tronco ligeiramente inclinado à frente e barriga apertada.',
        'Desce até o joelho de trás quase tocar no chão.',
        'Sobe empurrando com o calcanhar da perna da frente.'
      ],
      erro: 'Pé da frente demasiado perto do banco. Se o joelho passa muito à frente do pé, dá mais um passo.'
    },
    'goblet-squat': {
      passos: [
        'Segura um halter ou kettlebell junto ao peito, com as duas mãos.',
        'Pés à largura dos ombros, pontas ligeiramente para fora.',
        'Desce entre os joelhos, mantendo o peito aberto e os cotovelos por dentro das coxas.',
        'Sobe empurrando o chão até ficares direito.'
      ],
      erro: 'Deixar o peso afastar-se do peito. Colado ao corpo é o que mantém o tronco direito.'
    },
    'prensa-pernas': {
      passos: [
        'Senta-te com as costas e a bacia bem encostadas ao apoio.',
        'Pés a meio da plataforma, à largura dos ombros.',
        'Desce a plataforma até os joelhos ficarem a cerca de 90 graus.',
        'Empurra até quase esticar as pernas, sem trancar os joelhos.'
      ],
      erro: 'Descer tanto que a bacia se enrola e descola do apoio. Pára antes disso — é onde a lombar se magoa.'
    },
    'prensa-uni': {
      passos: [
        'Senta-te como na prensa normal e põe um só pé a meio da plataforma, alinhado com a anca.',
        'A outra perna fica pousada de lado, fora da plataforma.',
        'Desce até o joelho ficar a cerca de 90 graus, sem deixar a bacia descolar do apoio.',
        'Empurra com o pé inteiro até quase esticar. Faz a perna toda antes de mudar.'
      ],
      erro: 'Manter o pé no meio da plataforma como se fossem dois. Alinha o pé com a anca desse lado, senão o joelho torce.'
    },
    'hack-squat': {
      passos: [
        'Encosta as costas e os ombros aos apoios da máquina.',
        'Pés a meio da plataforma, à largura dos ombros.',
        'Desce até as coxas ficarem paralelas à plataforma.',
        'Sobe empurrando com o pé inteiro, sem trancar os joelhos no topo.'
      ],
      erro: 'Pés demasiado à frente ou atrás. À frente carrega os glúteos, atrás carrega os joelhos — procura o meio.'
    },
    'extensao-pernas': {
      passos: [
        'Ajusta o encosto para o joelho ficar alinhado com o eixo da máquina.',
        'Apoio nos tornozelos, mãos nas pegas laterais.',
        'Estica as pernas até em cima e aperta o quadríceps um segundo.',
        'Desce devagar sem deixar os pesos baterem.'
      ],
      erro: 'Atirar as pernas com balanço. É um exercício de isolamento — carga moderada e movimento limpo.'
    },
    'extensao-pernas-uni': {
      passos: [
        'Encosto ajustado para o joelho ficar alinhado com o eixo da máquina.',
        'Põe só uma perna sob o apoio; a outra fica pousada no chão ou de lado.',
        'Estica a perna até em cima e aperta o quadríceps um segundo.',
        'Desce devagar até ao início. Termina a perna antes de mudar — é aqui que se vê qual é a mais fraca.'
      ],
      erro: 'Torcer a bacia para ajudar. Segura as pegas laterais e mantém as duas nádegas no assento.'
    },
    'afundos-halteres': {
      passos: [
        'De pé, um halter em cada mão ao lado do corpo.',
        'Dá um passo à frente e desce até o joelho de trás quase tocar no chão.',
        'Mantém o tronco direito e o joelho da frente alinhado com o pé.',
        'Empurra com o calcanhar da frente para voltar à posição inicial.'
      ],
      erro: 'Passo curto demais. Se o joelho da frente passa muito o pé, dá um passo maior.'
    },
    'afundo-reverso': {
      passos: [
        'De pé com halteres ao lado do corpo, pés à largura da anca.',
        'Dá um passo atrás e desce até o joelho de trás quase tocar no chão.',
        'Mantém quase todo o peso no pé da frente e o tronco direito.',
        'Empurra com o calcanhar da frente para voltar. Faz a perna toda ou alterna, como preferires.'
      ],
      erro: 'Pousar o pé de trás em cima da mesma linha do da frente. Afasta-o um pouco para o lado para não perderes o equilíbrio.'
    },
    'afundo-lateral': {
      passos: [
        'De pé com um halter ao peito ou um em cada mão, pés juntos.',
        'Dá um passo largo para o lado e senta-te nessa perna, empurrando a bacia para trás.',
        'A outra perna fica esticada, com o pé todo assente no chão.',
        'Empurra o chão com a perna dobrada para voltar ao meio. Termina o lado e muda.'
      ],
      erro: 'Deixar o joelho cair para dentro. Aponta o joelho na direcção do pé e mantém a planta toda no chão.'
    },
    'afundos-caminhando': {
      passos: [
        'Halteres ao lado do corpo, peito aberto.',
        'Dá um passo à frente e desce até o joelho de trás quase tocar no chão.',
        'Em vez de voltar, sobe passando o pé de trás à frente e repete do outro lado.',
        'Mantém o tronco direito e o passo firme.'
      ],
      erro: 'Olhar para os pés. Olha em frente — o equilíbrio melhora logo.'
    },
    'step-up': {
      passos: [
        'Escolhe um banco que deixe a coxa paralela ao chão quando pousas o pé.',
        'Halteres ao lado do corpo.',
        'Sobe empurrando com o calcanhar da perna que está no banco, sem dar impulso com a de baixo.',
        'Desce devagar e controla o pé no chão.'
      ],
      erro: 'Dar impulso com a perna de baixo. Se precisas de saltar, o banco está alto demais.'
    },
    'agachamento-pistola': {
      passos: [
        'De pé sobre uma perna, com a outra esticada à frente e os braços à frente para contrapeso.',
        'Empurra a bacia para trás e desce devagar, mantendo o calcanhar de apoio no chão.',
        'Desce até te sentares nos calcanhares, com a perna da frente sempre no ar.',
        'Sobe empurrando o chão com o pé inteiro, sem deixar o joelho cair para dentro.'
      ],
      erro: 'Tentar a versão completa cedo demais. Começa a descer para uma caixa alta e vai baixando à medida que ganhas força.'
    },
    'agachamento-uma-perna-caixa': {
      passos: [
        'Fica de pé sobre uma perna, de costas para uma caixa ou banco, com a outra perna à frente.',
        'Empurra a bacia para trás e desce devagar até tocares na caixa com os glúteos.',
        'Toca sem te sentares nem descansares o peso.',
        'Sobe empurrando com o calcanhar. Faz a perna toda antes de mudar.'
      ],
      erro: 'Deixar-te cair na caixa. Toca de leve e sobe — se cais, sobe a altura da caixa.'
    },
    'sumo-squat-halter': {
      passos: [
        'Pés bem afastados, pontas viradas para fora, halter segurado entre as pernas com as duas mãos.',
        'Peito aberto e barriga apertada.',
        'Desce a direito, com os joelhos a apontar na direcção das pontas dos pés.',
        'Sobe empurrando o chão para fora e aperta os glúteos no topo.'
      ],
      erro: 'Inclinar o tronco à frente. Neste agachamento o tronco fica quase vertical.'
    },

    /* ---------------- ISQUIOTIBIAIS, GLÚTEOS E ADUTORES ---------------- */
    'flexao-pernas-deitado': {
      passos: [
        'Deita-te de barriga para baixo com os joelhos ligeiramente fora do fim da almofada.',
        'Apoio dos tornozelos por cima dos calcanhares.',
        'Dobra os joelhos e leva os calcanhares na direcção dos glúteos.',
        'Desce devagar até quase esticar as pernas.'
      ],
      erro: 'Levantar a bacia para ajudar. Mantém a anca colada à almofada.'
    },
    'flexao-pernas-sentado': {
      passos: [
        'Senta-te com as costas apoiadas e prende a almofada por cima das coxas.',
        'Apoio dos tornozelos junto aos calcanhares.',
        'Dobra os joelhos empurrando os calcanhares para baixo e para trás.',
        'Volta devagar até quase esticar as pernas.'
      ],
      erro: 'Almofada das coxas mal apertada. Se a perna sobe, perdes a tensão toda.'
    },
    'flexao-pernas-uni': {
      passos: [
        'Deitado ou sentado na máquina, põe só uma perna sob o apoio dos tornozelos.',
        'A outra perna fica pousada de lado, fora do caminho.',
        'Dobra o joelho levando o calcanhar na direcção do glúteo, sem levantar a bacia.',
        'Volta devagar até quase esticar. Faz a perna toda antes de mudar.'
      ],
      erro: 'Rodar a bacia para o lado que trabalha. Segura as pegas e mantém a anca quadrada com a máquina.'
    },
    'good-morning': {
      passos: [
        'Barra apoiada na parte de cima das costas, pés à largura da anca.',
        'Joelhos ligeiramente dobrados e barriga apertada.',
        'Empurra a bacia para trás e inclina o tronco à frente com as costas direitas.',
        'Volta a subir apertando os glúteos, até ficares direito.'
      ],
      erro: 'Usar carga pesada. Este exercício ensina o movimento da anca — vai leve e concentra-te na técnica.'
    },
    'nordic-curl': {
      passos: [
        'Ajoelha-te com os tornozelos presos por um apoio ou por alguém.',
        'Corpo direito desde os joelhos até à cabeça, braços à frente.',
        'Desce devagar travando com a parte de trás das coxas o máximo que conseguires.',
        'Amortece com as mãos no fim e volta a subir com a ajuda dos braços.'
      ],
      erro: 'Dobrar na anca para facilitar. O corpo mantém-se em linha recta durante toda a descida.'
    },
    'peso-morto-uni': {
      passos: [
        'De pé sobre uma perna, com um halter na mão do lado contrário ao pé de apoio.',
        'Joelho de apoio ligeiramente dobrado, barriga apertada.',
        'Empurra a anca para trás e desce o halter junto à perna, deixando a perna de trás subir em linha com o tronco.',
        'Desce até sentires a coxa de apoio bem esticada e sobe apertando o glúteo. Faz a perna toda antes de mudar.'
      ],
      erro: 'Abrir a anca para o lado ao subir a perna de trás. Mantém as duas ancas viradas para o chão — imagina dois faróis a apontar para baixo.'
    },
    'hip-thrust': {
      passos: [
        'Encosta as omoplatas a um banco, barra apoiada na dobra da anca com uma almofada.',
        'Pés à largura da anca, calcanhares por baixo dos joelhos.',
        'Sobe a bacia até o corpo ficar em linha recta dos ombros aos joelhos, apertando os glúteos.',
        'Desce devagar sem pousar a barra por completo.'
      ],
      erro: 'Arquear a lombar no topo. O queixo aproxima-se do peito e o glúteo faz o trabalho, não a coluna.'
    },
    'hip-thrust-uni': {
      passos: [
        'Omoplatas apoiadas num banco, um pé no chão com o calcanhar por baixo do joelho.',
        'A outra perna fica levantada, com o joelho dobrado junto ao peito ou esticada à frente.',
        'Sobe a bacia empurrando com o calcanhar, até o corpo ficar em linha dos ombros ao joelho.',
        'Desce devagar sem pousar por completo. Faz a perna toda antes de mudar.'
      ],
      erro: 'Deixar a bacia tombar para o lado sem apoio. Sobe as duas ancas à mesma altura, mesmo que faças menos repetições.'
    },
    'ponte-gluteos': {
      passos: [
        'Deita-te de costas com os joelhos dobrados e os pés no chão à largura da anca.',
        'Braços ao lado do corpo.',
        'Sobe a bacia apertando os glúteos até o corpo ficar em linha recta.',
        'Desce devagar sem pousar a bacia por completo entre repetições.'
      ],
      erro: 'Empurrar com as pontas dos pés. Empurra com os calcanhares para o glúteo trabalhar.'
    },
    'abducao-anca': {
      passos: [
        'Senta-te com as costas encostadas e as almofadas por fora das coxas.',
        'Segura as pegas laterais.',
        'Abre as pernas para fora até ao fim do curso confortável.',
        'Fecha devagar sem deixar os pesos baterem.'
      ],
      erro: 'Inclinar o tronco à frente e balançar. Costas encostadas e movimento controlado.'
    },
    'abducao-anca-polia': {
      passos: [
        'Prende a tornozeleira no pé de fora e fica de lado para a polia baixa.',
        'Segura-te ao suporte com a mão de dentro, tronco direito.',
        'Abre a perna para o lado com o joelho esticado, até onde a anca deixar.',
        'Volta devagar sem deixar o peso puxar. Faz a perna toda antes de mudar.'
      ],
      erro: 'Inclinar o tronco para o lado contrário para levantar mais a perna. Fica direito e usa menos carga.'
    },
    'aducao-anca': {
      passos: [
        'Senta-te com as almofadas por dentro das coxas e as pernas abertas.',
        'Costas encostadas ao apoio.',
        'Fecha as pernas apertando a parte de dentro das coxas.',
        'Abre devagar até sentires o alongamento, sem forçar.'
      ],
      erro: 'Abrir demasiado à procura de amplitude. Pára quando sentires o alongamento, não a dor.'
    },
    'coice-polia': {
      passos: [
        'Prende a tornozeleira num pé e fica de frente para a polia baixa.',
        'Inclina ligeiramente o tronco à frente e segura o apoio.',
        'Leva a perna para trás com o joelho quase esticado, apertando o glúteo.',
        'Volta devagar sem deixar o peso puxar a perna.'
      ],
      erro: 'Arquear a lombar para levar a perna mais atrás. A amplitude vem da anca, não da coluna.'
    },
    'peso-morto-pernas-rigidas': {
      passos: [
        'De pé, barra à frente das coxas, pernas quase esticadas.',
        'Empurra a bacia para trás e desce a barra junto às pernas.',
        'Desce até sentires a parte de trás das coxas bem esticada.',
        'Sobe apertando os glúteos até ficares direito.'
      ],
      erro: 'Trancar os joelhos por completo. Deixa-os com uma dobra pequena para proteger a articulação.'
    },
    'agachamento-cossaco': {
      passos: [
        'Pés bem afastados, pontas ligeiramente para fora.',
        'Passa o peso para uma perna e desce, deixando a outra esticar de lado.',
        'Mantém o calcanhar da perna que dobra no chão e o peito aberto.',
        'Sobe empurrando o chão e repete do outro lado.'
      ],
      erro: 'Descer mais do que a mobilidade permite. Apoia-te num suporte à frente enquanto não tens amplitude.'
    },

    /* ---------------- GÉMEOS ---------------- */
    'gemeos-pe': {
      passos: [
        'Coloca as pontas dos pés na plataforma com os calcanhares no ar.',
        'Pernas quase esticadas e tronco direito.',
        'Desce os calcanhares até sentires o alongamento.',
        'Sobe o mais alto que conseguires e aguenta um segundo em cima.'
      ],
      erro: 'Fazer repetições rápidas e curtas. O gémeo responde a amplitude completa e a pausa em cima.'
    },
    'gemeos-sentado': {
      passos: [
        'Senta-te com as almofadas por cima dos joelhos e as pontas dos pés na plataforma.',
        'Desce os calcanhares até ao fim.',
        'Sobe o mais alto que conseguires apertando o gémeo.',
        'Desce devagar até esticar outra vez.'
      ],
      erro: 'Saltar a pausa em baixo. Com o joelho dobrado, é o alongamento que faz o trabalho.'
    },
    'gemeos-prensa': {
      passos: [
        'Na prensa, apoia só as pontas dos pés na parte de baixo da plataforma.',
        'Pernas quase esticadas, com as travas de segurança postas.',
        'Empurra a plataforma esticando os tornozelos.',
        'Deixa os calcanhares descerem devagar até ao alongamento.'
      ],
      erro: 'Pés demasiado altos na plataforma. Só as pontas devem estar apoiadas.'
    },
    'gemeos-uni': {
      passos: [
        'Põe a ponta de um pé num degrau ou disco, com o calcanhar no ar; a outra perna fica dobrada atrás.',
        'Segura-te à parede ou a um suporte só para o equilíbrio, sem apoiar peso.',
        'Desce o calcanhar até sentires o gémeo esticar por completo.',
        'Sobe o mais alto que conseguires e aguenta um segundo. Faz a perna toda antes de mudar.'
      ],
      erro: 'Puxar-te com o braço de apoio. A mão serve só para não caíres — quem levanta é o gémeo.'
    },

    /* ---------------- ABDOMINAIS E LOMBAR ---------------- */
    prancha: {
      passos: [
        'Antebraços no chão, cotovelos por baixo dos ombros, pés à largura da anca.',
        'Corpo em linha recta dos calcanhares à cabeça.',
        'Aperta os glúteos e a barriga como se fosses levar um murro.',
        'Respira normalmente e aguenta o tempo previsto.'
      ],
      erro: 'Levantar a bacia para descansar. Se a posição se desfaz, pára o tempo — mais vale menos segundos bem feitos.'
    },
    'prancha-lateral': {
      passos: [
        'Deita-te de lado com o cotovelo por baixo do ombro e os pés um à frente do outro.',
        'Sobe a bacia até o corpo ficar em linha recta.',
        'Aperta a barriga e o glúteo do lado de baixo.',
        'Aguenta o tempo e repete do outro lado.'
      ],
      erro: 'Rodar o tronco para a frente. Os ombros e a bacia ficam empilhados na vertical.'
    },
    crunch: {
      passos: [
        'Deita-te de costas com os joelhos dobrados e os pés no chão.',
        'Mãos ao lado da cabeça, sem puxar o pescoço.',
        'Enrola a coluna levantando as omoplatas do chão.',
        'Desce devagar até quase encostar as costas.'
      ],
      erro: 'Puxar a cabeça com as mãos. Deixa uma laranja imaginária entre o queixo e o peito.'
    },
    'crunch-polia': {
      passos: [
        'Ajoelha-te de costas para a polia alta e segura a corda junto à cabeça.',
        'Anca fixa, o movimento é só de coluna.',
        'Enrola o tronco levando os cotovelos na direcção dos joelhos.',
        'Volta devagar até esticar a coluna.'
      ],
      erro: 'Dobrar na anca em vez de enrolar a coluna. A bacia fica quase parada.'
    },
    'elevacao-pernas-suspenso': {
      passos: [
        'Pendura-te na barra com os braços esticados e os ombros activos.',
        'Aperta a barriga para não balançares.',
        'Sobe as pernas esticadas até à altura da anca ou mais.',
        'Desce devagar sem deixar o corpo balançar.'
      ],
      erro: 'Usar o balanço para atirar as pernas. Se balanças, faz primeiro a versão de joelhos.'
    },
    'elevacao-joelhos': {
      passos: [
        'Pendura-te na barra ou apoia-te no aparelho de antebraços.',
        'Aperta a barriga e enrola ligeiramente a bacia.',
        'Sobe os joelhos até acima da linha da anca.',
        'Desce devagar sem deixar as pernas caírem.'
      ],
      erro: 'Parar na altura da anca. Só quando enrolas a bacia é que o abdominal trabalha a sério.'
    },
    'ab-wheel': {
      passos: [
        'De joelhos, segura a roda com as duas mãos à frente.',
        'Aperta a barriga e os glúteos e enrola ligeiramente a bacia.',
        'Rola para a frente o máximo que conseguires sem deixar a lombar arquear.',
        'Volta puxando com a barriga, não com os braços.'
      ],
      erro: 'Ir demasiado longe e arquear as costas. Rola só até ao ponto em que consegues manter a bacia enrolada.'
    },
    'russian-twist': {
      passos: [
        'Senta-te com os joelhos dobrados e o tronco inclinado para trás cerca de 45 graus.',
        'Segura um peso junto ao peito com as duas mãos.',
        'Roda o tronco levando o peso para um lado.',
        'Roda para o outro lado, controlando o movimento.'
      ],
      erro: 'Mexer só os braços. Quem roda é o tronco — os ombros acompanham as mãos.'
    },
    'flexao-lateral-halter': {
      passos: [
        'De pé com um halter numa mão, braço esticado ao lado do corpo; a outra mão atrás da cabeça.',
        'Pés à largura da anca e glúteos apertados.',
        'Inclina o tronco a direito para o lado do peso, deixando o halter descer pela perna abaixo.',
        'Sobe apertando o lado contrário. Faz todas as repetições antes de mudar de lado.'
      ],
      erro: 'Segurar um halter em cada mão. Assim os pesos anulam-se e o oblíquo não faz nada — é só de um lado de cada vez.'
    },
    'crunch-bicicleta': {
      passos: [
        'Deitado de costas, mãos junto às orelhas e pernas levantadas com os joelhos a 90 graus.',
        'Levanta as omoplatas do chão e mantém a lombar encostada.',
        'Leva o cotovelo a um joelho enquanto esticas a outra perna.',
        'Troca de lado devagar, sem deixar as omoplatas voltarem ao chão.'
      ],
      erro: 'Puxar a cabeça com as mãos e ir a correr. Mãos soltas junto às orelhas e ritmo lento, com pausa em cada lado.'
    },
    'mountain-climbers': {
      passos: [
        'Posição de flexão com as mãos por baixo dos ombros.',
        'Corpo em linha recta e barriga apertada.',
        'Traz um joelho ao peito e volta a estender, alternando as pernas em ritmo rápido.',
        'Mantém a bacia baixa e estável durante todo o tempo.'
      ],
      erro: 'Levantar a bacia com o cansaço. Abranda o ritmo antes de deixar a posição desfazer-se.'
    },
    'dead-bug': {
      passos: [
        'Deita-te de costas com os braços apontados ao tecto e os joelhos dobrados a 90 graus.',
        'Encosta a lombar ao chão e mantém-na lá.',
        'Estica um braço atrás da cabeça e a perna oposta à frente, sem tocar no chão.',
        'Volta ao início e repete do outro lado.'
      ],
      erro: 'Deixar a lombar levantar do chão. Reduz a amplitude até conseguires mantê-la colada.'
    },
    'bird-dog': {
      passos: [
        'De gatas, mãos por baixo dos ombros e joelhos por baixo da anca.',
        'Aperta a barriga e mantém as costas planas.',
        'Estica um braço à frente e a perna oposta atrás, até à linha do corpo.',
        'Volta devagar e alterna os lados.'
      ],
      erro: 'Rodar a bacia ao levantar a perna. Imagina um copo de água apoiado na zona lombar.'
    },
    superman: {
      passos: [
        'Deita-te de barriga para baixo com os braços esticados à frente.',
        'Aperta os glúteos.',
        'Levanta o peito, os braços e as pernas ao mesmo tempo, alguns centímetros.',
        'Aguenta um segundo e desce devagar.'
      ],
      erro: 'Levantar demasiado e dobrar o pescoço. Mantém o olhar para o chão e a subida curta.'
    },
    'pallof-press': {
      passos: [
        'Fica de lado para a polia, à altura do peito, e segura a pega com as duas mãos junto ao esterno.',
        'Afasta-te até haver tensão e afasta os pés à largura dos ombros.',
        'Estica os braços à frente, resistindo à força que te quer rodar.',
        'Volta devagar ao peito sem deixar o tronco rodar.'
      ],
      erro: 'Deixar o tronco rodar na direcção da polia. Se acontece, tira carga — o objectivo é não te mexeres.'
    },
    'hollow-hold': {
      passos: [
        'Deita-te de costas e encosta a lombar ao chão.',
        'Levanta as omoplatas e as pernas do chão, com os braços esticados atrás da cabeça.',
        'Aperta a barriga e mantém a lombar colada ao chão.',
        'Aguenta o tempo previsto a respirar de forma controlada.'
      ],
      erro: 'Arquear as costas. Dobra os joelhos ou aproxima os braços do corpo até conseguires manter a lombar em baixo.'
    },

    /* ---------------- CORRIDA ---------------- */
    corrida: {
      passos: [
        'Começa com 3 a 5 minutos de marcha rápida ou corrida muito leve.',
        'Corre com o tronco direito, o olhar à frente e os ombros descontraídos.',
        'Pousa o pé por baixo da anca, não muito à frente do corpo, com passos curtos e frequentes.',
        'Acaba com alguns minutos a abrandar até voltar ao ritmo de marcha.'
      ],
      erro: 'Sair demasiado rápido. Deves conseguir falar frases curtas no ritmo base.'
    },
    'corrida-passadeira': {
      passos: [
        'Põe 1% de inclinação para simular a resistência do ar da rua.',
        'Começa a andar e sobe a velocidade aos poucos.',
        'Corre no meio do tapete, sem te agarrares aos apoios.',
        'Baixa a velocidade progressivamente no fim, nunca saltes com a passadeira em andamento.'
      ],
      erro: 'Agarrar-se aos apoios. Tira trabalho às pernas e falseia as calorias que a máquina mostra.'
    },
    sprints: {
      passos: [
        'Aquece muito bem: 5 a 10 minutos de corrida leve e algumas acelerações progressivas.',
        'Arranca com o tronco inclinado à frente e vai endireitando à medida que ganhas velocidade.',
        'Corre à velocidade máxima que consegues manter em toda a distância.',
        'Descansa até recuperares o fôlego antes da repetição seguinte.'
      ],
      erro: 'Fazer sprints sem aquecer. É a receita para uma lesão na parte de trás da coxa.'
    },
    'corrida-lugar': {
      passos: [
        'De pé, corre no mesmo sítio levantando os joelhos até à altura da anca.',
        'Tronco direito e barriga apertada.',
        'Acompanha com os braços, dobrados a 90 graus.',
        'Mantém o ritmo durante o tempo previsto.'
      ],
      erro: 'Inclinar o tronco para trás para levantar os joelhos. Mantém-te direito e sobe menos.'
    },
    'subir-escadas': {
      passos: [
        'Sobe pousando o pé inteiro em cada degrau.',
        'Tronco ligeiramente inclinado à frente e barriga apertada.',
        'Empurra com o calcanhar da perna de cima.',
        'Desce sempre a andar e com atenção — a descida é onde se torcem os tornozelos.'
      ],
      erro: 'Saltar degraus com pressa. Ritmo constante rende mais e é mais seguro.'
    },
    'marcha-inclinada': {
      passos: [
        'Põe a passadeira entre 8 e 15% de inclinação e uma velocidade que te obrigue a andar depressa.',
        'Anda sem te agarrares aos apoios.',
        'Passo longo, com o calcanhar a pousar primeiro.',
        'Baixa a inclinação nos últimos minutos para arrefecer.'
      ],
      erro: 'Agarrar-se ao corrimão para aguentar a inclinação. Se precisas, baixa a inclinação.'
    },

    /* ---------------- MÁQUINAS DE CARDIO ---------------- */
    'remo-maquina': {
      passos: [
        'Prende bem os pés e agarra a pega com as duas mãos, braços esticados.',
        'Começa por empurrar com as pernas, mantendo os braços esticados e o tronco firme.',
        'Quando as pernas estiverem quase esticadas, inclina o tronco para trás e só depois puxa a pega até ao fim do peito.',
        'Volta pela ordem inversa: braços, tronco, pernas.'
      ],
      erro: 'Puxar primeiro com os braços. A ordem é sempre pernas, tronco, braços — e ao contrário no regresso.'
    },
    'ski-erg': {
      passos: [
        'De pé, agarra as duas pegas por cima da cabeça com os braços quase esticados.',
        'Puxa para baixo dobrando a anca e usando o peso do corpo.',
        'Acaba o movimento com as mãos junto às coxas e o tronco inclinado à frente.',
        'Volta a subir esticando a anca e levantando os braços.'
      ],
      erro: 'Puxar só com os braços. Quem faz a força é a anca e a barriga, com os braços a acompanhar.'
    },
    'bicicleta-assalto': {
      passos: [
        'Ajusta o selim para o joelho ficar quase esticado com o pedal em baixo.',
        'Agarra as pegas e começa a pedalar empurrando e puxando com braços e pernas ao mesmo tempo.',
        'Mantém o tronco direito e a respiração controlada.',
        'Nos intervalos, abranda em vez de parar por completo.'
      ],
      erro: 'Arrancar a toda a força. Nesta bicicleta a resistência aumenta com o esforço — começa moderado.'
    },
    'bicicleta-estatica': {
      passos: [
        'Ajusta o selim para o joelho ficar quase esticado no ponto mais baixo do pedal.',
        'Mantém as costas direitas e os ombros descontraídos.',
        'Pedala com resistência suficiente para não abanares no selim.',
        'Acaba com alguns minutos de pedalada leve.'
      ],
      erro: 'Selim demasiado baixo. É o erro que mais dói nos joelhos ao fim de alguns minutos.'
    },
    eliptica: {
      passos: [
        'Sobe com os pés bem assentes nas plataformas e agarra as pegas móveis.',
        'Tronco direito, sem te apoiares no painel.',
        'Empurra e puxa com braços e pernas ao mesmo tempo.',
        'Aumenta a resistência para o movimento não ficar solto.'
      ],
      erro: 'Apoiar-se no painel e deixar as pernas irem sozinhas. Usa as pegas móveis.'
    },

    /* ---------------- SALTOS ---------------- */
    'salto-corda': {
      passos: [
        'Segura as pegas junto à anca, com os cotovelos próximos do corpo.',
        'Roda a corda com os pulsos, não com os braços.',
        'Salta poucos centímetros, apenas o suficiente para a corda passar.',
        'Aterra na ponta dos pés com os joelhos ligeiramente dobrados.'
      ],
      erro: 'Saltar alto demais. Saltos baixos e rápidos cansam menos e duram mais tempo.'
    },
    'box-jump': {
      passos: [
        'Escolhe uma caixa que te deixe aterrar com segurança e coloca-te a um passo dela.',
        'Dobra a anca e os joelhos e balança os braços para trás.',
        'Salta e aterra em cima da caixa com os dois pés, joelhos dobrados a amortecer.',
        'Levanta-te por completo e desce a andar, um pé de cada vez.'
      ],
      erro: 'Saltar para baixo da caixa. Desce sempre a andar — é assim que se poupam os tendões.'
    },
    burpees: {
      passos: [
        'De pé, agacha-te e apoia as mãos no chão à frente dos pés.',
        'Salta com os pés para trás até à posição de flexão e desce o peito ao chão.',
        'Empurra o chão e salta com os pés de volta para junto das mãos.',
        'Levanta-te e dá um pequeno salto com as mãos acima da cabeça.'
      ],
      erro: 'Deixar a bacia cair na parte da flexão. Aperta a barriga e mantém o corpo em linha recta.'
    },
    'burpee-box-jump': {
      passos: [
        'Faz um burpee completo à frente da caixa.',
        'Ao levantar, aproveita o impulso para saltar para cima da caixa com os dois pés.',
        'Levanta-te por completo em cima da caixa.',
        'Desce a andar e começa o burpee seguinte.'
      ],
      erro: 'Encadear os dois movimentos com pressa e falhar a caixa. Estabiliza os pés antes de saltar.'
    },
    polichinelos: {
      passos: [
        'De pé, pés juntos e braços ao lado do corpo.',
        'Salta abrindo as pernas e levantando os braços acima da cabeça.',
        'Salta outra vez fechando as pernas e baixando os braços.',
        'Mantém o ritmo durante o tempo previsto.'
      ],
      erro: 'Aterrar com as pernas esticadas. Deixa os joelhos amortecerem cada salto.'
    },
    'agachamento-salto': {
      passos: [
        'Pés à largura dos ombros, desce até meio agachamento.',
        'Sobe a explodir e salta o mais alto que conseguires.',
        'Aterra com o pé inteiro e desce logo para o agachamento seguinte.',
        'Mantém o peito aberto durante todo o movimento.'
      ],
      erro: 'Aterrar com o joelho a cair para dentro. Se acontece, faz menos repetições e salta mais baixo.'
    },
    'agachamento-livre': {
      passos: [
        'Pés à largura dos ombros, pontas ligeiramente para fora, braços à frente para equilibrar.',
        'Desce empurrando a bacia para trás até as coxas ficarem paralelas ao chão.',
        'Mantém os calcanhares no chão e o peito aberto.',
        'Sobe empurrando o chão até ficares direito.'
      ],
      erro: 'Levantar os calcanhares. Abre um pouco mais os pés ou desce menos até ganhares mobilidade.'
    },

    /* ---------------- MOVIMENTOS BALÍSTICOS ---------------- */
    'wall-ball': {
      passos: [
        'Segura a bola junto ao peito, de frente para a parede, a cerca de um passo dela.',
        'Desce até um agachamento completo, com o peito aberto.',
        'Sobe a explodir e usa o impulso das pernas para atirar a bola ao alvo na parede.',
        'Apanha a bola e desce logo para o agachamento seguinte.'
      ],
      erro: 'Atirar só com os braços. A bola sobe pelo impulso das pernas — os braços apenas a guiam.'
    },
    'slam-ball': {
      passos: [
        'De pé, com os pés à largura dos ombros e a bola no chão à frente.',
        'Levanta a bola acima da cabeça esticando o corpo todo.',
        'Atira-a ao chão com toda a força, dobrando a anca e a barriga.',
        'Apanha-a e repete sem pausa.'
      ],
      erro: 'Arredondar as costas para apanhar a bola. Dobra as pernas e mantém as costas direitas.'
    },
    'kettlebell-swing': {
      passos: [
        'Kettlebell no chão a um palmo à frente dos pés, que estão à largura dos ombros.',
        'Empurra a bacia para trás, agarra a asa com as duas mãos e balança a kettlebell entre as pernas.',
        'Empurra a bacia à frente com força, apertando os glúteos — é isso que atira a kettlebell para a frente.',
        'Deixa-a voltar entre as pernas e encadeia o balanço seguinte.'
      ],
      erro: 'Levantar a kettlebell com os braços, como numa elevação frontal. Os braços são cordas — a força vem da anca.'
    },
    thruster: {
      passos: [
        'Barra apoiada à frente, nos deltoides, cotovelos altos, pés à largura dos ombros.',
        'Desce num agachamento frontal completo.',
        'Sobe a explodir e usa esse impulso para empurrar a barra acima da cabeça.',
        'Desce a barra de volta aos ombros e encadeia a repetição seguinte.'
      ],
      erro: 'Parar entre o agachamento e o press. O movimento é um só, sem pausa no meio.'
    },
    'devil-press': {
      passos: [
        'Halteres no chão, um de cada lado dos pés.',
        'Agarra os halteres e salta com os pés para trás, para a posição de flexão, e desce o peito ao chão.',
        'Volta com os pés para a frente e levanta os halteres num só movimento, até acima da cabeça.',
        'Pousa os halteres no chão e recomeça.'
      ],
      erro: 'Arredondar as costas ao levantar os halteres. Mantém o peito aberto e usa a anca.'
    },
    'clean-and-press': {
      passos: [
        'Barra no chão, pés à largura da anca, agarra por fora das pernas.',
        'Puxa a barra do chão junto ao corpo e, com um impulso da anca, leva-a até aos ombros.',
        'Estabiliza com a barra nos deltoides e os cotovelos altos.',
        'Empurra a barra acima da cabeça e desce controlado até aos ombros e depois ao chão.'
      ],
      erro: 'Puxar com os braços em vez de usar a anca. A barra sobe com o impulso do corpo todo.'
    },
    'kettlebell-clean-press': {
      passos: [
        'Kettlebell entre os pés, agarra a asa com uma mão.',
        'Puxa com a anca e roda a mão para a kettlebell assentar no antebraço, junto ao peito.',
        'Empurra acima da cabeça até esticar o braço.',
        'Desce até ao peito e depois entre as pernas para a repetição seguinte.'
      ],
      erro: 'Deixar a kettlebell bater no antebraço. Roda a mão a tempo e mantém-na colada ao corpo na subida.'
    },
    'battle-ropes': {
      passos: [
        'Agarra uma ponta da corda em cada mão, pés à largura dos ombros e joelhos ligeiramente dobrados.',
        'Aperta a barriga e mantém o tronco firme.',
        'Faz ondas alternadas, subindo e descendo os braços com rapidez.',
        'Mantém o ritmo durante o tempo previsto.'
      ],
      erro: 'Endireitar-se e usar só os ombros. Mantém a posição de meio agachamento e usa o corpo todo.'
    },
    'turkish-get-up': {
      passos: [
        'Deitado de costas, segura a kettlebell com o braço esticado para o tecto e dobra o joelho do mesmo lado.',
        'Apoia-te no cotovelo do outro braço e depois na mão, levantando o tronco.',
        'Levanta a bacia, passa a perna de trás para a posição de joelho e levanta-te.',
        'Desce fazendo exactamente o caminho inverso, sem nunca perder a kettlebell de vista.'
      ],
      erro: 'Ir depressa demais. Aprende o movimento sem peso ou com uma garrafa de água em cima da mão.'
    },

    /* ---------------- TRANSPORTE E ARRASTO ---------------- */
    'treno-empurrar': {
      passos: [
        'Agarra os apoios do trenó com os braços esticados e o tronco inclinado à frente.',
        'Aperta a barriga e mantém as costas direitas.',
        'Empurra com passos curtos e potentes, mantendo o trenó em movimento.',
        'Pára de forma controlada no fim da distância.'
      ],
      erro: 'Arredondar as costas quando o trenó fica pesado. Se acontecer, tira um disco.'
    },
    'treno-puxar': {
      passos: [
        'Prende a corda ou o cinto ao trenó e agarra-a com as duas mãos.',
        'Inclina o tronco para trás e mantém as costas direitas.',
        'Anda para trás com passos firmes ou puxa a corda mão sobre mão, conforme a variante.',
        'Mantém o trenó sempre em movimento até ao fim da distância.'
      ],
      erro: 'Puxar só com os braços. As pernas é que fazem o trabalho — os braços seguram.'
    },
    'transporte-frontal': {
      passos: [
        'Levanta os halteres ou a kettlebell até ao peito, dobrando as pernas e não as costas.',
        'Cotovelos altos e junto ao corpo, barriga apertada.',
        'Caminha em passo controlado, sem inclinar o tronco para trás.',
        'Pousa a carga dobrando as pernas.'
      ],
      erro: 'Inclinar-se para trás para equilibrar. Aperta a barriga e mantém as costelas em baixo.'
    },
    'bear-crawl': {
      passos: [
        'De gatas, com os joelhos a um palmo do chão e as mãos por baixo dos ombros.',
        'Aperta a barriga e mantém as costas planas.',
        'Avança a mão direita com o pé esquerdo, e depois ao contrário.',
        'Mantém a bacia baixa e estável durante toda a distância.'
      ],
      erro: 'Levantar a bacia. Quanto mais baixa e parada, mais trabalha a zona central.'
    },

    /* ---------------- ELÁSTICOS ---------------- */
    'remada-elastico': {
      passos: [
        'Prende o elástico a uma altura média ou passa-o à volta dos pés, sentado.',
        'Agarra as pontas com os braços esticados e o peito aberto.',
        'Puxa até às costelas, com os cotovelos junto ao corpo.',
        'Volta devagar até esticar os braços, sem deixar o elástico puxar-te.'
      ],
      erro: 'Deixar o elástico voltar de repente. A parte que trabalha é a que resiste ao regresso.'
    },
    'puxada-elastico': {
      passos: [
        'Prende o elástico num ponto acima da cabeça.',
        'Ajoelha-te ou senta-te e agarra as pontas com os braços esticados.',
        'Puxa para baixo até às clavículas, baixando primeiro as omoplatas.',
        'Deixa subir devagar até esticar os braços.'
      ],
      erro: 'Ficar demasiado perto do ponto de fixação. Afasta-te até sentires tensão logo no início.'
    }
  };

  /** Passos de execução de um exercício, ou null se for personalizado */
  function de(id) { return EXECUCAO[id] || null; }

  global.EXECUCAO = { de, todos: EXECUCAO };
})(window);
