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
    id: 'nuno-2000',
    nome: 'Plano de 2000 kcal',
    versao: 2,
    criadoEm: '2026-09-15',
    revisto: '2026-09-16',
    origem: 'Plano semanal de 2000 kcal/dia, escrito para acompanhar o plano de treino de quatro dias',

    /* Alvos do dia. Iguais todos os dias — o que muda é de onde vêm.
       Contas (16 set 2026): homem, 26 anos, 1,73 m, 72 kg. Metabolismo em
       repouso pela fórmula de Mifflin-St Jeor, 1676 kcal; com trabalho de
       secretária e quatro treinos de força, gasta perto de 2300 a 2450 kcal.
       2000 kcal dão um défice de ~380 kcal, uns 0,35 kg de gordura por semana.
       Proteína: 150 g são 2,1 g por kg, para o défice não levar músculo. */
    alvos: { kcal: 2000, prot: 150, hc: 226, gord: 55 },

    /* Margem em que o dia conta como cumprido, para o relatório não
       andar a gritar por 40 kcal de diferença */
    margem: { kcal: 150, prot: 15 },

    notasDaRevisao: 'Versão 2. O plano passa a ser feito com o que está na despensa, com os '
      + 'valores tirados dos rótulos: o iogurte de beber (+Proteína, 280 g, 136 kcal e 20 g de '
      + 'proteína), o iogurte de comer (+Proteína baunilha, 200 g, 92 kcal e 14 g), a aveia e a '
      + 'granola Nacional. Na versão 1 as ementas davam 1907 kcal com 178 g de proteína e só 160 g '
      + 'de hidratos, longe do alvo de 226 g; os alvos ficam iguais e são as ementas que andam. '
      + 'A aveia entra seis vezes por semana, ao pequeno-almoço ou ao lanche, e o feijão-frade e o '
      + 'grão-de-bico entram ao almoço e ao jantar. Saem as saladas e os legumes verdes (salada, '
      + 'espargos, espinafres, courgette, feijão-verde, legumes salteados), que o Nuno não come: '
      + 'um plano com comida que não se come é um plano que não se segue. No lugar deles vai sopa '
      + 'de legumes antes do jantar e cenoura ao almoço. Para pagar isso sai proteína que estava a mais: dois ovos '
      + 'em vez de três quando há iogurte de beber, frango e carne de vaca a 150 g, salmão a 150 g '
      + '(é o que traz mais gordura). O iogurte grego sai do plano — o que há em casa é o Mythos, '
      + 'com 8 g de gordura e 3,6 g de proteína por 100 g — e entra no lugar dele o de comer. '
      + 'Saem também os cajus e a maior parte do azeite, que eram gordura sem proteína. '
      + 'Quinta-feira ao jantar leva uma lata do atum em óleo em vez de duas ao natural, com dois '
      + 'ovos cozidos e grão-de-bico para a proteína não cair. Somadas pelo catálogo, as sete '
      + 'ementas dão agora em média 2023 kcal, 169 g de proteína, 220 g de hidratos e 49 g de '
      + 'gordura; nenhum dia fica abaixo de 1986 kcal nem de 163 g de proteína.',

    notas: [
      'Proteína distribuída por 30 a 40 g em cada refeição principal, em vez de toda ao jantar.',
      'Hidratos concentrados à volta do treino; nos dias de descanso podes cortar uma dose de arroz ou massa.',
      'A gordura vem sobretudo dos ovos, do salmão e da granola — é aí que mexes se precisares de margem.',
      'Podes trocar entre si as proteínas (frango, peru, peixe, carne magra, carne picada, atum) e os hidratos (arroz, batata, massa), mantendo os gramas.',
      'O iogurte de beber e um scoop de whey valem o mesmo em proteína: troca um pelo outro à vontade.',
      'A aveia pode ir dentro do iogurte de comer ou cozida em água; os gramas são da aveia crua.',
      'Défice mais agressivo do que os 300 kcal iniciais: pesa a comida sempre que der.'
    ],

    /* Dias da semana pelo número do JavaScript: 0 = domingo */
    dias: {
      1: {
        nome: 'Segunda-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 2, nota: 'mexidos' }, { a: 'iogurte-proteico', q: 1 }, { a: 'aveia', q: 40 }, { a: 'banana', q: 1 }],
          almoco: [{ a: 'picada5', q: 180 }, { a: 'cogumelos', q: 100 }, { a: 'arroz', q: 150 }, { a: 'feijao-frade', q: 100 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'salmao', q: 150 }, { a: 'batata', q: 150 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      2: {
        nome: 'Terça-feira',
        refeicoes: {
          pa:     [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'aveia', q: 40 }, { a: 'granola', q: 20 }, { a: 'fruta', q: 1 }],
          almoco: [{ a: 'peru', q: 180 }, { a: 'massa-integral', q: 200 }, { a: 'cenoura', q: 100 }],
          lanche: [{ a: 'ovo', q: 2, nota: 'cozidos' }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'salmao', q: 150 }, { a: 'arroz', q: 150 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      3: {
        nome: 'Quarta-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3 }, { a: 'pao-integral', q: 2 }],
          almoco: [{ a: 'frango', q: 150 }, { a: 'batata', q: 200 }, { a: 'grao', q: 100 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'aveia', q: 30 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'vaca', q: 150 }, { a: 'arroz', q: 150 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      4: {
        nome: 'Quinta-feira',
        refeicoes: {
          pa:     [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'aveia', q: 50 }, { a: 'granola', q: 20 }, { a: 'fruta', q: 1 }],
          almoco: [{ a: 'peixe-branco', q: 180 }, { a: 'massa', q: 200 }, { a: 'cenoura', q: 100 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-proteico', q: 1 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'atum-oleo', q: 1, nota: 'escorrido' }, { a: 'ovo', q: 2, nota: 'cozidos' }, { a: 'grao', q: 150 }, { a: 'arroz', q: 50 }],
          snack:  [{ a: 'whey', q: 1 }]
        }
      },
      5: {
        nome: 'Sexta-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 2 }, { a: 'iogurte-proteico', q: 1 }, { a: 'aveia', q: 40 }, { a: 'banana', q: 1 }],
          almoco: [{ a: 'vaca', q: 150 }, { a: 'arroz', q: 150 }, { a: 'feijao-frade', q: 100 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'granola', q: 30 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'salmao', q: 120 }, { a: 'batata', q: 150 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      6: {
        nome: 'Sábado',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 2 }, { a: 'iogurte-proteico', q: 1 }, { a: 'aveia', q: 40 }, { a: 'banana', q: 1 }],
          almoco: [{ a: 'frango', q: 150 }, { a: 'massa', q: 200 }, { a: 'cenoura', q: 100 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'granola', q: 30 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'peixe-branco', q: 180 }, { a: 'arroz', q: 150 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      0: {
        nome: 'Domingo',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3 }, { a: 'torrada-integral', q: 2 }, { a: 'manteiga-amendoim', q: 15 }],
          almoco: [{ a: 'vaca', q: 150 }, { a: 'massa', q: 200 }, { a: 'cenoura', q: 100 }],
          lanche: [{ a: 'iogurte-proteina-baunilha', q: 1 }, { a: 'aveia', q: 30 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'sopa', q: 1 }, { a: 'peixe-branco', q: 180 }, { a: 'arroz', q: 120 }],
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
