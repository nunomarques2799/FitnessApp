/* =============================================================
   Treinos — Catálogo de alimentos e refeições
   Português de Portugal. Valores de referência, para corrigires.

   Campos de cada alimento:
     id      identificador estável (o registo guarda-o)
     n       nome
     cat     categoria, para agrupar na lista
     tipo    'g'  → os valores são por 100 g e registas o peso
             'un' → os valores são de uma porção e registas quantas
     kcal    calorias (por 100 g ou por porção, conforme o tipo)
     prot    proteína em gramas
     hc      hidratos em gramas
     gord    gordura em gramas
     porcao  nome da porção, só no tipo 'un' ('ovo', 'fatia', 'lata')
     g       peso típico: sugestão de gramas no tipo 'g',
             informação do peso da porção no tipo 'un'
     plano   faz parte do plano alimentar embutido

   Os valores são de tabelas de composição e de rótulos correntes.
   São uma estimativa — corrige qualquer um na app (Comida →
   Alimentos guardados) e fica guardado só no teu telemóvel.
   ============================================================= */
(function (global) {
  'use strict';

  /* --- Refeições do dia, na ordem em que se comem ------------- */
  const REFEICOES = {
    pa:     { name: 'Pequeno-almoço', curto: 'P.-almoço', ate: 11 },
    almoco: { name: 'Almoço',         curto: 'Almoço',    ate: 15 },
    lanche: { name: 'Lanche',         curto: 'Lanche',    ate: 18 },
    jantar: { name: 'Jantar',         curto: 'Jantar',    ate: 22 },
    snack:  { name: 'Snack',          curto: 'Snack',     ate: 24 }
  };

  /* --- Categorias, para a lista de alimentos ------------------ */
  const CATS = {
    proteina:    { name: 'Carne, peixe e ovos' },
    hidratos:    { name: 'Hidratos' },
    legumes:     { name: 'Legumes e fruta' },
    lacticinios: { name: 'Lacticínios' },
    gordura:     { name: 'Gorduras e frutos secos' },
    prato:       { name: 'Pratos e refeições' },
    bebida:      { name: 'Bebidas' },
    suplemento:  { name: 'Suplementos' }
  };

  /* --- Alimentos ---------------------------------------------
     Os que trazem `plano: true` são os do plano alimentar
     embutido (js/alimentar.js) e aparecem primeiro na lista.   */
  const ALIMENTOS = [
    /* ---------- carne, peixe e ovos ---------- */
    { id: 'ovo', n: 'Ovo', cat: 'proteina', tipo: 'un', porcao: 'ovo', g: 55, kcal: 78, prot: 6.3, hc: 0.6, gord: 5.3, plano: true },
    { id: 'clara', n: 'Clara de ovo', cat: 'proteina', tipo: 'g', g: 100, kcal: 52, prot: 11, hc: 0.7, gord: 0.2 },
    { id: 'frango', n: 'Peito de frango grelhado', cat: 'proteina', tipo: 'g', g: 180, kcal: 165, prot: 31, hc: 0, gord: 3.6, plano: true },
    { id: 'peru', n: 'Bife de peru grelhado', cat: 'proteina', tipo: 'g', g: 180, kcal: 150, prot: 30, hc: 0, gord: 3, plano: true },
    { id: 'vaca', n: 'Bife de vaca magro', cat: 'proteina', tipo: 'g', g: 180, kcal: 217, prot: 30, hc: 0, gord: 10, plano: true },
    { id: 'picada5', n: 'Carne picada magra (5%)', cat: 'proteina', tipo: 'g', g: 180, kcal: 137, prot: 21, hc: 0, gord: 5, plano: true },
    { id: 'porco', n: 'Lombo de porco grelhado', cat: 'proteina', tipo: 'g', g: 180, kcal: 190, prot: 30, hc: 0, gord: 8 },
    { id: 'salmao', n: 'Salmão grelhado', cat: 'proteina', tipo: 'g', g: 180, kcal: 208, prot: 22, hc: 0, gord: 13, plano: true },
    { id: 'peixe-branco', n: 'Peixe branco (pescada, dourada)', cat: 'proteina', tipo: 'g', g: 180, kcal: 92, prot: 19, hc: 0, gord: 1.5, plano: true },
    { id: 'bacalhau', n: 'Bacalhau cozido', cat: 'proteina', tipo: 'g', g: 180, kcal: 105, prot: 23, hc: 0, gord: 1 },
    { id: 'atum-lata', n: 'Atum ao natural (lata escorrida)', cat: 'proteina', tipo: 'un', porcao: 'lata', g: 80, kcal: 93, prot: 21, hc: 0, gord: 0.8, plano: true },
    { id: 'fiambre', n: 'Fiambre de peru', cat: 'proteina', tipo: 'un', porcao: 'fatia', g: 25, kcal: 28, prot: 4.5, hc: 0.5, gord: 0.8 },

    /* ---------- hidratos ---------- */
    { id: 'arroz', n: 'Arroz cozido', cat: 'hidratos', tipo: 'g', g: 150, kcal: 130, prot: 2.7, hc: 28, gord: 0.3, plano: true },
    { id: 'massa', n: 'Massa cozida', cat: 'hidratos', tipo: 'g', g: 150, kcal: 158, prot: 5.8, hc: 31, gord: 0.9, plano: true },
    { id: 'massa-integral', n: 'Massa integral cozida', cat: 'hidratos', tipo: 'g', g: 150, kcal: 130, prot: 5.3, hc: 26, gord: 1.1, plano: true },
    { id: 'batata', n: 'Batata cozida', cat: 'hidratos', tipo: 'g', g: 150, kcal: 87, prot: 2, hc: 20, gord: 0.1, plano: true },
    { id: 'batata-doce', n: 'Batata-doce cozida', cat: 'hidratos', tipo: 'g', g: 150, kcal: 90, prot: 2, hc: 21, gord: 0.1 },
    { id: 'batata-frita', n: 'Batata frita', cat: 'hidratos', tipo: 'g', g: 150, kcal: 312, prot: 3.4, hc: 41, gord: 15 },
    { id: 'pure-batata', n: 'Puré de batata', cat: 'hidratos', tipo: 'g', g: 200, kcal: 95, prot: 2, hc: 14, gord: 3.5 },
    { id: 'pao-integral', n: 'Pão integral', cat: 'hidratos', tipo: 'un', porcao: 'fatia', g: 35, kcal: 90, prot: 3.5, hc: 15, gord: 1.2, plano: true },
    { id: 'torrada-integral', n: 'Torrada integral', cat: 'hidratos', tipo: 'un', porcao: 'torrada', g: 15, kcal: 55, prot: 2, hc: 10, gord: 0.8, plano: true },
    { id: 'papo-seco', n: 'Papo-seco', cat: 'hidratos', tipo: 'un', porcao: 'pão', g: 60, kcal: 165, prot: 5.5, hc: 32, gord: 1.3 },
    { id: 'aveia', n: 'Aveia em flocos', cat: 'hidratos', tipo: 'g', g: 60, kcal: 379, prot: 13, hc: 67, gord: 7 },
    { id: 'granola', n: 'Granola', cat: 'hidratos', tipo: 'g', g: 40, kcal: 440, prot: 9, hc: 62, gord: 17, plano: true },
    { id: 'feijao', n: 'Feijão cozido', cat: 'hidratos', tipo: 'g', g: 120, kcal: 127, prot: 8.7, hc: 22, gord: 0.5 },
    { id: 'grao', n: 'Grão-de-bico cozido', cat: 'hidratos', tipo: 'g', g: 120, kcal: 164, prot: 8.9, hc: 27, gord: 2.6 },

    /* ---------- legumes e fruta ---------- */
    { id: 'salada', n: 'Salada (alface, tomate, pepino)', cat: 'legumes', tipo: 'un', porcao: 'dose', g: 120, kcal: 25, prot: 1.3, hc: 4, gord: 0.3, plano: true },
    { id: 'legumes-salteados', n: 'Legumes salteados', cat: 'legumes', tipo: 'g', g: 150, kcal: 60, prot: 2, hc: 6, gord: 3, plano: true },
    { id: 'feijao-verde', n: 'Feijão-verde cozido', cat: 'legumes', tipo: 'g', g: 150, kcal: 35, prot: 2, hc: 7, gord: 0.2, plano: true },
    { id: 'courgette', n: 'Courgette salteada', cat: 'legumes', tipo: 'g', g: 150, kcal: 45, prot: 1.2, hc: 4, gord: 3, plano: true },
    { id: 'espinafres', n: 'Espinafres salteados', cat: 'legumes', tipo: 'g', g: 150, kcal: 60, prot: 3, hc: 4, gord: 4, plano: true },
    { id: 'espargos', n: 'Espargos', cat: 'legumes', tipo: 'g', g: 120, kcal: 22, prot: 2.4, hc: 4, gord: 0.2, plano: true },
    { id: 'cogumelos', n: 'Cogumelos salteados', cat: 'legumes', tipo: 'g', g: 100, kcal: 40, prot: 3, hc: 3, gord: 2, plano: true },
    { id: 'brocolos', n: 'Brócolos cozidos', cat: 'legumes', tipo: 'g', g: 150, kcal: 35, prot: 2.4, hc: 7, gord: 0.4 },
    { id: 'sopa', n: 'Sopa de legumes', cat: 'legumes', tipo: 'un', porcao: 'prato', g: 350, kcal: 120, prot: 4, hc: 20, gord: 3 },
    { id: 'fruta', n: 'Fruta (1 peça)', cat: 'legumes', tipo: 'un', porcao: 'peça', g: 150, kcal: 90, prot: 1, hc: 22, gord: 0.3, plano: true },
    { id: 'banana', n: 'Banana', cat: 'legumes', tipo: 'un', porcao: 'banana', g: 120, kcal: 105, prot: 1.3, hc: 27, gord: 0.4, plano: true },
    { id: 'maca', n: 'Maçã', cat: 'legumes', tipo: 'un', porcao: 'maçã', g: 180, kcal: 95, prot: 0.5, hc: 25, gord: 0.3 },
    { id: 'abacate', n: 'Abacate', cat: 'legumes', tipo: 'g', g: 80, kcal: 160, prot: 2, hc: 9, gord: 15 },

    /* ---------- lacticínios ---------- */
    { id: 'iogurte-proteico', n: 'Iogurte proteico Continente', cat: 'lacticinios', tipo: 'un', porcao: 'unidade', g: 160, kcal: 140, prot: 20, hc: 12, gord: 1.5, plano: true },
    { id: 'iogurte-grego', n: 'Iogurte grego', cat: 'lacticinios', tipo: 'g', g: 170, kcal: 71, prot: 8, hc: 4, gord: 2.6, plano: true },
    { id: 'mythos', n: 'Iogurte grego Mythos Continente', cat: 'lacticinios', tipo: 'un', porcao: 'unidade', g: 125, kcal: 125, prot: 4.5, hc: 4.3, gord: 10 },
    { id: 'iogurte-natural', n: 'Iogurte natural', cat: 'lacticinios', tipo: 'un', porcao: 'unidade', g: 125, kcal: 72, prot: 4.3, hc: 5.4, gord: 3.8 },
    { id: 'leite', n: 'Leite meio-gordo', cat: 'lacticinios', tipo: 'g', g: 200, kcal: 46, prot: 3.2, hc: 4.8, gord: 1.6 },
    { id: 'queijo-flamengo', n: 'Queijo flamengo', cat: 'lacticinios', tipo: 'un', porcao: 'fatia', g: 20, kcal: 66, prot: 5, hc: 0.4, gord: 5 },
    { id: 'queijo-fresco', n: 'Queijo fresco', cat: 'lacticinios', tipo: 'un', porcao: 'unidade', g: 100, kcal: 110, prot: 11, hc: 2, gord: 6 },
    { id: 'requeijao', n: 'Requeijão', cat: 'lacticinios', tipo: 'g', g: 100, kcal: 140, prot: 11, hc: 3, gord: 9 },

    /* ---------- gorduras e frutos secos ---------- */
    { id: 'azeite', n: 'Azeite', cat: 'gordura', tipo: 'un', porcao: 'colher de sopa', g: 10, kcal: 90, prot: 0, hc: 0, gord: 10, plano: true },
    { id: 'manteiga', n: 'Manteiga', cat: 'gordura', tipo: 'g', g: 10, kcal: 740, prot: 0.9, hc: 0.6, gord: 82 },
    { id: 'manteiga-amendoim', n: 'Manteiga de amendoim', cat: 'gordura', tipo: 'g', g: 15, kcal: 600, prot: 25, hc: 20, gord: 50, plano: true },
    { id: 'caju', n: 'Castanha de caju', cat: 'gordura', tipo: 'g', g: 15, kcal: 580, prot: 18, hc: 30, gord: 44, plano: true },
    { id: 'amendoas', n: 'Amêndoas', cat: 'gordura', tipo: 'g', g: 25, kcal: 580, prot: 21, hc: 22, gord: 50 },

    /* ---------- pratos e refeições ---------- */
    { id: 'bitoque', n: 'Bitoque', cat: 'prato', tipo: 'un', porcao: 'prato', g: 450, kcal: 950, prot: 55, hc: 75, gord: 45 },
    { id: 'francesinha', n: 'Francesinha', cat: 'prato', tipo: 'un', porcao: 'prato', g: 500, kcal: 1100, prot: 55, hc: 75, gord: 65 },
    { id: 'bacalhau-bras', n: 'Bacalhau à Brás', cat: 'prato', tipo: 'un', porcao: 'prato', g: 400, kcal: 700, prot: 35, hc: 45, gord: 40 },
    { id: 'arroz-pato', n: 'Arroz de pato', cat: 'prato', tipo: 'un', porcao: 'prato', g: 400, kcal: 750, prot: 35, hc: 80, gord: 30 },
    { id: 'feijoada', n: 'Feijoada', cat: 'prato', tipo: 'un', porcao: 'prato', g: 450, kcal: 800, prot: 45, hc: 55, gord: 45 },
    { id: 'frango-assado', n: 'Frango assado com arroz', cat: 'prato', tipo: 'un', porcao: 'dose', g: 400, kcal: 650, prot: 45, hc: 60, gord: 22 },
    { id: 'bolonhesa', n: 'Massa à bolonhesa', cat: 'prato', tipo: 'un', porcao: 'dose', g: 400, kcal: 600, prot: 30, hc: 70, gord: 20 },
    { id: 'pizza', n: 'Pizza', cat: 'prato', tipo: 'un', porcao: 'fatia', g: 110, kcal: 285, prot: 12, hc: 36, gord: 10 },
    // H3: valores oficiais de h3.com (Info Nutri). O Tuga é o hambúrguer médio
    // com ovo estrelado, molho tuga e alho; arroz e batatas contam-se à parte.
    { id: 'h3-tuga', n: 'H3 Tuga (hambúrguer com ovo e molho)', cat: 'prato', tipo: 'un', porcao: 'hambúrguer', g: 180, kcal: 502, prot: 43.6, hc: 9.7, gord: 32.3 },
    { id: 'h3-arroz', n: 'Arroz do H3', cat: 'prato', tipo: 'un', porcao: 'dose', kcal: 390, prot: 6.4, hc: 70, gord: 8.4 },
    { id: 'h3-batatas', n: 'Batatas do H3', cat: 'prato', tipo: 'un', porcao: 'dose', kcal: 411, prot: 5, hc: 47.7, gord: 21.5 },
    { id: 'hamburguer', n: 'Hambúrguer', cat: 'prato', tipo: 'un', porcao: 'hambúrguer', g: 220, kcal: 550, prot: 27, hc: 45, gord: 28 },
    { id: 'tosta-mista', n: 'Tosta mista', cat: 'prato', tipo: 'un', porcao: 'tosta', g: 180, kcal: 380, prot: 20, hc: 33, gord: 18 },
    { id: 'sandes-frango', n: 'Sandes de frango', cat: 'prato', tipo: 'un', porcao: 'sandes', g: 200, kcal: 400, prot: 28, hc: 42, gord: 12 },
    { id: 'pastel-nata', n: 'Pastel de nata', cat: 'prato', tipo: 'un', porcao: 'pastel', g: 70, kcal: 250, prot: 4, hc: 27, gord: 14 },
    { id: 'bolachas', n: 'Bolachas', cat: 'prato', tipo: 'g', g: 30, kcal: 460, prot: 6, hc: 70, gord: 17 },
    { id: 'chocolate', n: 'Chocolate', cat: 'prato', tipo: 'g', g: 25, kcal: 540, prot: 6, hc: 55, gord: 32 },

    /* ---------- bebidas ---------- */
    { id: 'cafe', n: 'Café', cat: 'bebida', tipo: 'un', porcao: 'chávena', g: 40, kcal: 2, prot: 0.2, hc: 0, gord: 0 },
    { id: 'cerveja', n: 'Cerveja', cat: 'bebida', tipo: 'un', porcao: 'garrafa (33 cl)', g: 330, kcal: 140, prot: 1.5, hc: 11, gord: 0 },
    { id: 'vinho', n: 'Vinho', cat: 'bebida', tipo: 'un', porcao: 'copo', g: 150, kcal: 125, prot: 0, hc: 4, gord: 0 },
    { id: 'refrigerante', n: 'Refrigerante', cat: 'bebida', tipo: 'un', porcao: 'lata', g: 330, kcal: 139, prot: 0, hc: 35, gord: 0 },
    // em ml, que num batido de fruta com água é quase igual a gramas
    { id: 'batido-fruta', n: 'Batido de fruta (banana, manga, pera e água)', cat: 'bebida', tipo: 'g', g: 300, kcal: 57, prot: 0.7, hc: 14, gord: 0.2 },
    { id: 'sumo-laranja', n: 'Sumo de laranja natural', cat: 'bebida', tipo: 'g', g: 200, kcal: 45, prot: 0.7, hc: 10, gord: 0.2 },

    /* ---------- suplementos ---------- */
    { id: 'whey', n: 'Whey', cat: 'suplemento', tipo: 'un', porcao: 'scoop', g: 30, kcal: 120, prot: 24, hc: 3, gord: 1.5, plano: true },
    { id: 'barra-proteina', n: 'Barra de proteína', cat: 'suplemento', tipo: 'un', porcao: 'barra', g: 60, kcal: 200, prot: 20, hc: 20, gord: 6 },
    { id: 'creatina', n: 'Creatina', cat: 'suplemento', tipo: 'un', porcao: 'dose', g: 5, kcal: 0, prot: 0, hc: 0, gord: 0 }
  ];

  const POR_ID = {};
  ALIMENTOS.forEach(a => { POR_ID[a.id] = a; });

  /** Nome da refeição mais provável à hora a que estamos */
  function refeicaoDaHora(h) {
    const hora = h == null ? new Date().getHours() : h;
    const chaves = Object.keys(REFEICOES);
    for (const k of chaves) if (hora < REFEICOES[k].ate) return k;
    return 'snack';
  }

  global.COMIDA = { ALIMENTOS, POR_ID, REFEICOES, CATS, refeicaoDaHora };
})(window);
