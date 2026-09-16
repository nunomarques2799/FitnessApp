/* =============================================================
   Treinos — O plano alimentar embutido

   Este ficheiro é o plano em si: alvos do dia e as refeições de
   cada dia da semana. É o único sítio a mexer quando revemos a
   alimentação ao fim da semana — sobe `versao`, actualiza
   `revisto` e escreve o que mudou em `notasDaRevisao`.

   Ao contrário do plano de treino, este anda preso aos dias da
   semana: segunda é segunda. O que o plano manda não entra no
   registo sozinho — é uma proposta com um botão ao lado.

   Campos de cada linha de refeição:
     a    id do alimento no catálogo (js/alimentos.js)
     q    quantidade: gramas nos alimentos por 100 g,
          número de porções nos alimentos por unidade
     nota linha a mostrar por baixo, quando for preciso

   Alvos: as calorias mandam, a proteína é o chão que não se
   baixa, e hidratos e gordura são a repartição do que sobra.
   ============================================================= */
(function (global) {
  'use strict';

  const PLANO = {
    // o id fica o de origem: é por ele que o telemóvel sabe que o plano está ligado
    id: 'nuno-2000',
    nome: 'Plano de 2450 kcal',
    versao: 3,
    criadoEm: '2026-09-15',
    revisto: '2026-09-17',
    origem: 'Plano semanal para ganhar músculo com pouca gordura, a acompanhar o plano de treino de quatro dias',

    /* Alvos do dia. Iguais todos os dias — o que muda é de onde vêm.
       Contas (17 set 2026): homem, 26 anos, 1,73 m, 72 kg, 14–17% de gordura
       a olho, 5 meses de treino a sério, creatina todos os dias. Metabolismo
       em repouso pela fórmula de Mifflin-St Jeor, 1676 kcal; com trabalho de
       secretária e quatro treinos de força, gasta perto de 2300 a 2450 kcal.
       O objectivo é ganhar músculo: 2450 kcal é um excedente pequeno, para
       ~0,5 kg por mês (nos 5 meses anteriores foi ~1 kg por mês, e parte foi
       gordura). A proteína fica acima dos 2 g/kg porque os iogurtes e o whey
       a trazem com poucas calorias; o chão é 145 g. */
    alvos: { kcal: 2450, prot: 175, hc: 280, gord: 65 },

    /* Margem em que o dia conta como cumprido, para o relatório não
       andar a gritar por 40 kcal de diferença */
    margem: { kcal: 150, prot: 15 },

    notasDaRevisao: 'Versão 3. Muda o objectivo: o Nuno não quer perder peso, quer ganhar '
      + 'músculo — e muito. Com 14 a 17% de gordura não precisa de secar primeiro, e 2000 kcal '
      + 'eram um défice de ~380 kcal por dia, que segura o músculo mas não o faz crescer. As '
      + 'calorias sobem para 2450, um excedente pequeno: o objectivo é ~0,5 kg por mês, metade do '
      + 'ritmo dos últimos cinco meses, para a gordura lateral não crescer. O que decide se está '
      + 'certo é a média semanal do peso ao lado da cintura (que a app passa a registar): peso a '
      + 'subir com a cintura parada está bem; a cintura a subir mais de 1 cm por mês pede −150 kcal; '
      + 'o peso parado pede +150 kcal. '
      + 'O que subiu: aveia para 50 a 60 g, arroz, massa e batata para 200 a 300 g, granola no '
      + 'lanche, uma colher de azeite em quase todos os almoços, amêndoas na quinta. A proteína '
      + 'fica igual em gramas de comida — sobe só o que está à volta dela. '
      + 'Continua sem saladas nem legumes verdes, que o Nuno não come: há sopa antes do jantar, '
      + 'cenoura ao almoço e feijão-frade ou grão-de-bico ao almoço de segunda, quarta, quinta e '
      + 'sexta. Os iogurtes são os de casa, com os valores dos rótulos: o de beber (+Proteína, '
      + '280 g, 20 g de proteína) e o de comer (+Proteína baunilha, 200 g, 14 g); quinta ao jantar '
      + 'leva uma lata do atum em óleo com dois ovos. '
      + 'Somadas pelo catálogo, as sete ementas dão em média 2462 kcal, 180 g de proteína, 279 g de '
      + 'hidratos e 66 g de gordura, entre 2417 e 2500 kcal por dia. Os alvos acompanham as '
      + 'ementas: a proteína fica nos 175 g porque os iogurtes e o whey a dão barata em calorias, '
      + 'e os hidratos nos 280 g.',

    notas: [
      'Proteína distribuída por 30 a 40 g em cada refeição principal, em vez de toda ao jantar.',
      'Hidratos concentrados à volta do treino; nos dias de descanso podes cortar uma dose de arroz ou massa.',
      'A gordura vem sobretudo dos ovos, do salmão e da granola — é aí que mexes se precisares de margem.',
      'Podes trocar entre si as proteínas (frango, peru, peixe, carne magra, carne picada, atum) e os hidratos (arroz, batata, massa), mantendo os gramas.',
      'O iogurte de beber e um scoop de whey valem o mesmo em proteína: troca um pelo outro à vontade.',
      'A aveia pode ir dentro do iogurte de comer ou cozida em água; os gramas são da aveia crua.',
      'Excedente pequeno de propósito: pesa a comida sempre que der, e mede a cintura uma vez por semana.',
      'Creatina: 3 a 5 g todos os dias, a qualquer hora, também nos dias sem treino.'
    ],

    /* Dias da semana pelo número do JavaScript: 0 = domingo */
    dias: {
      1: {
        nome: 'Segunda-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 2, nota: 'mexidos' }, { a: 'iogurte-proteico', q: 1 }, { a: 'aveia', q: 60 }, { a: 'banana', q: 1 }],
          almoco: [{ a: 'picada5', q: 180 }, { a: 'cogumelos', q: 100 }, { a: 'arroz', q: 220 }, { a: 'feijao-frade', q: 100 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'granola', q: 30 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'salmao', q: 150 }, { a: 'batata', q: 250 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      2: {
        nome: 'Terça-feira',
        refeicoes: {
          pa:     [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'aveia', q: 60 }, { a: 'granola', q: 30 }, { a: 'banana', q: 1 }],
          almoco: [{ a: 'peru', q: 180 }, { a: 'massa-integral', q: 250 }, { a: 'cenoura', q: 100 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'ovo', q: 2, nota: 'cozidos' }, { a: 'pao-integral', q: 2 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'salmao', q: 150 }, { a: 'arroz', q: 200 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      3: {
        nome: 'Quarta-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3 }, { a: 'pao-integral', q: 2 }, { a: 'manteiga-amendoim', q: 15 }],
          almoco: [{ a: 'frango', q: 150 }, { a: 'batata', q: 300 }, { a: 'grao', q: 100 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'aveia', q: 50 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'vaca', q: 150 }, { a: 'arroz', q: 200 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      4: {
        nome: 'Quinta-feira',
        refeicoes: {
          pa:     [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'aveia', q: 60 }, { a: 'granola', q: 30 }, { a: 'banana', q: 1 }],
          almoco: [{ a: 'peixe-branco', q: 180 }, { a: 'massa', q: 250 }, { a: 'cenoura', q: 100 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-proteico', q: 1 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'atum-oleo', q: 1, nota: 'escorrido' }, { a: 'ovo', q: 2, nota: 'cozidos' }, { a: 'grao', q: 150 }, { a: 'arroz', q: 150 }],
          snack:  [{ a: 'whey', q: 1 }, { a: 'amendoas', q: 20 }]
        }
      },
      5: {
        nome: 'Sexta-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 2 }, { a: 'iogurte-proteico', q: 1 }, { a: 'aveia', q: 60 }, { a: 'banana', q: 1 }],
          almoco: [{ a: 'vaca', q: 150 }, { a: 'arroz', q: 220 }, { a: 'feijao-frade', q: 100 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'granola', q: 40 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'salmao', q: 150 }, { a: 'batata', q: 250 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      6: {
        nome: 'Sábado',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 2 }, { a: 'iogurte-proteico', q: 1 }, { a: 'aveia', q: 60 }, { a: 'banana', q: 1 }],
          almoco: [{ a: 'frango', q: 150 }, { a: 'massa', q: 250 }, { a: 'cenoura', q: 100 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'granola', q: 40 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'peixe-branco', q: 180 }, { a: 'arroz', q: 200 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }, { a: 'fruta', q: 1 }]
        }
      },
      0: {
        nome: 'Domingo',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3 }, { a: 'torrada-integral', q: 3 }, { a: 'manteiga-amendoim', q: 20 }],
          almoco: [{ a: 'vaca', q: 150 }, { a: 'massa', q: 250 }, { a: 'cenoura', q: 100 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'aveia', q: 50 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'peixe-branco', q: 180 }, { a: 'arroz', q: 200 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      }
    }
  };

  /* ---------- ajudas ---------- */

  /** O dia do plano para uma data ISO (ou para hoje) */
  function dia(iso) {
    const d = iso ? new Date(iso + 'T00:00:00') : new Date();
    return PLANO.dias[d.getDay()] || null;
  }

  /** Alimentos que o plano usa, sem repetidos */
  function alimentosDoPlano() {
    const vistos = new Set();
    Object.keys(PLANO.dias).forEach(k => {
      const r = PLANO.dias[k].refeicoes;
      Object.keys(r).forEach(m => r[m].forEach(l => vistos.add(l.a)));
    });
    return [...vistos];
  }

  global.PLANO_ALIMENTAR = Object.assign(PLANO, { dia, alimentosDoPlano });
})(window);
