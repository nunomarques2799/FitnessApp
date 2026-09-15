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
    versao: 1,
    criadoEm: '2026-09-15',
    revisto: '2026-09-15',
    origem: 'Plano semanal de 2000 kcal/dia, escrito para acompanhar o plano de treino de quatro dias',

    /* Alvos do dia. Iguais todos os dias — o que muda é de onde vêm. */
    alvos: { kcal: 2000, prot: 150, hc: 226, gord: 55 },

    /* Margem em que o dia conta como cumprido, para o relatório não
       andar a gritar por 40 kcal de diferença */
    margem: { kcal: 150, prot: 15 },

    notasDaRevisao: 'Versão 1. O plano entra na app tal como estava escrito, com duas coisas '
      + 'tornadas explícitas porque a app precisa de números: as torradas de domingo passam a ser '
      + 'duas (uma torrada de 15 g não é um pequeno-almoço) e onde dizia "carne magra" fica bife de '
      + 'vaca, que é a carne magra que já estava escrita noutros dias. As calorias que a app mostra '
      + 'são somadas a partir do catálogo de alimentos e não dos totais arredondados do plano, por '
      + 'isso podem dar uns 50 a 100 kcal abaixo do que lá está escrito — o que conta é a soma dos '
      + 'alimentos, que é a mesma que vais registar. Somadas assim, as sete ementas dão em média '
      + '1907 kcal com 178 g de proteína e 160 g de hidratos, e não os 2000 kcal com 150 g de '
      + 'proteína e 226 g de hidratos que o alvo diz: as ementas trazem mais proteína e menos '
      + 'hidratos do que o alvo escrito. Os alvos ficam como estavam — são eles que a app mostra — '
      + 'mas isto é para decidir na primeira revisão: ou os alvos descem a proteína e sobem os '
      + 'hidratos, ou as ementas ganham mais uma dose de arroz ou massa por dia. Quinta-feira é o '
      + 'dia mais fraco de todos, 1673 kcal, porque o atum e o peixe branco são muito magros.',

    notas: [
      'Proteína distribuída por 30 a 40 g em cada refeição principal, em vez de toda ao jantar.',
      'Hidratos concentrados à volta do treino; nos dias de descanso podes cortar uma dose de arroz ou massa.',
      'A gordura vem do azeite, dos ovos, da manteiga de amendoim e dos frutos secos — é aí que mexes se precisares de margem.',
      'Podes trocar entre si as proteínas (frango, peru, peixe, carne magra, carne picada, atum) e os hidratos (arroz, batata, massa), mantendo os gramas.',
      'Défice mais agressivo do que os 300 kcal iniciais: pesa a comida sempre que der.'
    ],

    /* Dias da semana pelo número do JavaScript: 0 = domingo */
    dias: {
      1: {
        nome: 'Segunda-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3, nota: 'mexidos' }, { a: 'iogurte-proteico', q: 1 }, { a: 'pao-integral', q: 1 }],
          almoco: [{ a: 'picada5', q: 180 }, { a: 'cogumelos', q: 100 }, { a: 'arroz', q: 150 }, { a: 'feijao-verde', q: 150 }],
          lanche: [{ a: 'whey', q: 1 }, { a: 'banana', q: 1 }],
          jantar: [{ a: 'salmao', q: 180 }, { a: 'batata', q: 150 }, { a: 'salada', q: 1 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      2: {
        nome: 'Terça-feira',
        refeicoes: {
          pa:     [{ a: 'iogurte-grego', q: 170 }, { a: 'granola', q: 50 }, { a: 'fruta', q: 1 }],
          almoco: [{ a: 'peru', q: 180 }, { a: 'massa-integral', q: 150 }, { a: 'courgette', q: 150 }],
          lanche: [{ a: 'ovo', q: 2, nota: 'cozidos' }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'salmao', q: 180 }, { a: 'arroz', q: 150 }, { a: 'espinafres', q: 150 }],
          snack:  [{ a: 'whey', q: 1 }, { a: 'caju', q: 15 }]
        }
      },
      3: {
        nome: 'Quarta-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3 }, { a: 'pao-integral', q: 1 }, { a: 'manteiga-amendoim', q: 15 }],
          almoco: [{ a: 'frango', q: 180 }, { a: 'batata', q: 150 }, { a: 'salada', q: 1 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-proteico', q: 1 }],
          jantar: [{ a: 'vaca', q: 180 }, { a: 'arroz', q: 120 }, { a: 'legumes-salteados', q: 150 }],
          snack:  [{ a: 'whey', q: 1 }, { a: 'fruta', q: 1 }]
        }
      },
      4: {
        nome: 'Quinta-feira',
        refeicoes: {
          pa:     [{ a: 'iogurte-grego', q: 170 }, { a: 'granola', q: 40 }, { a: 'fruta', q: 1 }],
          almoco: [{ a: 'peixe-branco', q: 180 }, { a: 'massa', q: 150 }, { a: 'salada', q: 1 }],
          lanche: [{ a: 'ovo', q: 2, nota: 'cozidos' }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'atum-lata', q: 2, nota: 'ao natural, escorrido' }, { a: 'arroz', q: 150 }, { a: 'salada', q: 1 }],
          snack:  [{ a: 'whey', q: 1 }, { a: 'caju', q: 15 }]
        }
      },
      5: {
        nome: 'Sexta-feira',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3 }, { a: 'iogurte-proteico', q: 1 }, { a: 'pao-integral', q: 1 }],
          almoco: [{ a: 'vaca', q: 180 }, { a: 'arroz', q: 150 }, { a: 'salada', q: 1 }],
          lanche: [{ a: 'iogurte-proteico', q: 1 }],
          jantar: [{ a: 'salmao', q: 180 }, { a: 'batata', q: 120 }, { a: 'espargos', q: 120 }],
          snack:  [{ a: 'whey', q: 1 }, { a: 'fruta', q: 1 }]
        }
      },
      6: {
        nome: 'Sábado',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3 }, { a: 'iogurte-proteico', q: 1 }, { a: 'pao-integral', q: 1 }],
          almoco: [{ a: 'frango', q: 180 }, { a: 'massa', q: 150 }, { a: 'legumes-salteados', q: 150 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'iogurte-grego', q: 170 }, { a: 'granola', q: 30 }],
          jantar: [{ a: 'peixe-branco', q: 180 }, { a: 'arroz', q: 150 }, { a: 'salada', q: 1 }],
          snack:  [{ a: 'iogurte-proteico', q: 1 }]
        }
      },
      0: {
        nome: 'Domingo',
        refeicoes: {
          pa:     [{ a: 'ovo', q: 3 }, { a: 'torrada-integral', q: 2 }, { a: 'manteiga-amendoim', q: 15 }],
          almoco: [{ a: 'vaca', q: 180 }, { a: 'massa', q: 150 }, { a: 'salada', q: 1 }, { a: 'azeite', q: 1 }],
          lanche: [{ a: 'whey', q: 1 }, { a: 'fruta', q: 1 }],
          jantar: [{ a: 'peixe-branco', q: 180 }, { a: 'arroz', q: 120 }, { a: 'espargos', q: 120 }],
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
