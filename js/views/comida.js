/* =============================================================
   Vista: Comida — o que comeste hoje, contra o plano e os alvos

   O plano alimentar propõe, não regista: cada refeição do plano
   aparece com um botão "Comi isto" que a mete no diário de uma
   vez. Tudo o que fujas ao plano escreve-se ao lado, e é isso que
   o relatório da semana leva para a revisão.
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;

  /* Doses rápidas, para não andar a escrever números no telemóvel */
  const MULTIPLOS = [0.5, 1, 1.5, 2, 3];
  const GRAMAS = [30, 50, 100, 150, 180, 200, 250];

  function dataDe(arg) {
    return arg && /^\d{4}-\d{2}-\d{2}$/.test(arg) ? arg : Store.D.hoje();
  }

  function legivel(data) {
    const d = Store.D.parse(data);
    const rel = Store.D.desdeHoje(data);
    const nome = rel === 0 ? 'Hoje' : rel === 1 ? 'Ontem' : Store.D.nomeDia(data);
    return `${nome}, ${d.getDate()} de ${Store.D.nomeMes(d.getMonth())}`;
  }

  Vistas.comida = {
    titulo: () => 'Comida',
    sub: arg => legivel(dataDe(arg)),
    accoes: () => `<button type="button" class="btn-icone" data-add-cab aria-label="Registar alimento">${icone('mais', 24)}</button>`,

    montarCabecalho(cont, arg) {
      const b = cont.querySelector('[data-add-cab]');
      if (b) b.addEventListener('click', () => {
        const data = dataDe(arg);
        sheetEscolher(data, COMIDA.refeicaoDaHora(data === Store.D.hoje() ? null : 12));
      });
    },

    render(arg) {
      const data = dataDe(arg);
      const d = Store.diaComida(data);
      return [
        barraDias(data),
        resumo(d),
        d.refeicoes.map(r => seccaoRefeicao(r, data)).join(''),
        rodape(d)
      ].join('');
    },

    montar(raiz, arg) {
      const data = dataDe(arg);

      raiz.addEventListener('click', e => {
        const dia = e.target.closest('[data-dia]');
        if (dia) return App.ir('comida/' + dia.dataset.dia, true);

        const add = e.target.closest('[data-add-ref]');
        if (add) return sheetEscolher(data, add.dataset.addRef);

        const pl = e.target.closest('[data-plano-ok]');
        if (pl) return registarDoPlano(data, pl.dataset.planoOk);

        const item = e.target.closest('[data-comida]');
        if (item) return sheetItem(item.dataset.comida, data);

        if (e.target.closest('[data-relatorio]')) return sheetRelatorio();
        if (e.target.closest('[data-alimentos]')) return sheetAlimentos();
        if (e.target.closest('[data-alvos]')) return App.ir('ajustes');
        if (e.target.closest('[data-copiar-ontem]')) return copiarDia(data);
      });
    }
  };

  /* ---------- cabeçalho: os sete dias à volta ---------- */

  function barraDias(data) {
    const hoje = Store.D.hoje();
    const dias = [];
    for (let i = 6; i >= 0; i--) dias.push(Store.D.maisDias(hoje, -i));
    if (data < dias[0]) dias.unshift(data);
    const nomes = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    return `<nav class="dias-b" aria-label="Escolher dia">
      ${dias.map(x => {
        const d = Store.D.parse(x);
        const t = Store.totaisComida(x);
        return `<button type="button" class="dia-b ${x === data ? 'dia-b--activo' : ''} ${t.kcal ? 'dia-b--cheio' : ''}"
          data-dia="${x}" aria-current="${x === data ? 'date' : 'false'}"
          aria-label="${esc(legivel(x))}${t.kcal ? `, ${t.kcal} calorias` : ', sem registo'}">
          <span class="dia-b__s">${nomes[d.getDay()]}</span>
          <span class="dia-b__n num">${d.getDate()}</span>
        </button>`;
      }).join('')}
    </nav>`;
  }

  /* ---------- resumo do dia ---------- */

  function barra(label, feito, alvo, cls) {
    const pct = alvo ? Math.min(100, Math.round(feito / alvo * 100)) : 0;
    const passou = alvo && feito > alvo * 1.05;
    return `<div class="macro ${cls}">
      <div class="macro__cab">
        <span class="macro__l">${esc(label)}</span>
        <span class="macro__v num">${UI.fmt(feito, 0)}${alvo ? ` <span class="macro__alvo">/ ${UI.fmt(alvo, 0)} g</span>` : ' g'}</span>
      </div>
      <span class="macro__barra"><span class="macro__fill ${passou ? 'macro__fill--passou' : ''}" style="width:${pct}%"></span></span>
    </div>`;
  }

  function resumo(d) {
    const a = d.alvos;
    const t = d.totais;
    const pct = a && a.kcal ? Math.min(100, Math.round(t.kcal / a.kcal * 100)) : 0;
    const sobra = d.restante && d.restante.kcal != null ? d.restante.kcal : null;

    return `<section class="cartao cartao--destaque mb3">
      <div class="entre">
        <div>
          <span class="chip ${a ? 'chip--primaria' : ''}">${icone('alvo', 13)}${a ? (a.fonte === 'plano' ? esc(a.nome) : 'Alvos definidos por ti') : 'Sem alvos'}</span>
          <p class="kcal num">${UI.fmt(t.kcal, 0)}<span class="kcal__u">kcal</span></p>
          ${a && a.kcal ? `<p class="cartao__sub num">${sobra >= 0
              ? `faltam ${UI.fmt(sobra, 0)} para as ${UI.fmt(a.kcal, 0)}`
              : `${UI.fmt(-sobra, 0)} acima das ${UI.fmt(a.kcal, 0)}`}</p>`
            : '<p class="cartao__sub">Sem alvo de calorias definido</p>'}
        </div>
        ${a && a.kcal ? `<div class="anel" style="--pct:${pct}"><span class="anel__v num">${pct}%</span></div>` : ''}
      </div>
      <div class="macros mt4">
        ${barra('Proteína', t.prot, a && a.prot, 'macro--prot')}
        ${barra('Hidratos', t.hc, a && a.hc, 'macro--hc')}
        ${barra('Gordura', t.gord, a && a.gord, 'macro--gord')}
      </div>
      ${!a ? `<button type="button" class="btn btn--secundario btn--bloco mt3" data-alvos>${icone('alvo', 18)}Definir alvos em Ajustes</button>` : ''}
    </section>`;
  }

  /* ---------- uma refeição ---------- */

  function linhaItem(c) {
    return `<button type="button" class="lista__i" data-comida="${c.id}">
      <div class="lista__corpo">
        <div class="lista__t">${esc(c.n)}${c.doPlano ? ` <span class="chip chip--primaria">plano</span>` : ''}</div>
        <div class="lista__s num">${esc(Store.textoQuantidade(c))} · ${UI.fmt(c.prot, 0)} g de proteína${c.nota ? ` · ${esc(c.nota)}` : ''}</div>
      </div>
      <span class="lista__fim num" style="font-weight:700">${UI.fmt(c.kcal, 0)} kcal</span>
    </button>`;
  }

  function seccaoRefeicao(r, data) {
    const temItens = r.itens.length > 0;
    const propor = !temItens && r.plano;
    return `<section class="seccao">
      <div class="seccao__cab">
        <h2 class="seccao__tit">${esc(r.nome)}</h2>
        <span class="linha" style="gap:var(--e2)">
          ${temItens ? `<span class="chip num">${UI.fmt(r.totais.kcal, 0)} kcal · ${UI.fmt(r.totais.prot, 0)} P</span>` : ''}
          <button type="button" class="seccao__accao" data-add-ref="${r.k}" aria-label="Juntar alimento a ${esc(r.nome)}">+ Juntar</button>
        </span>
      </div>
      ${temItens ? `<div class="lista">${r.itens.map(linhaItem).join('')}</div>` : ''}
      ${propor ? `<div class="cartao cartao--plano">
        <div class="entre">
          <span class="lista__t linha">${icone('lista', 15)}O plano manda</span>
          <span class="chip num">${UI.fmt(r.plano.totais.kcal, 0)} kcal · ${UI.fmt(r.plano.totais.prot, 0)} P</span>
        </div>
        <ul class="plano-l mt2">
          ${r.plano.linhas.map(l => `<li class="entre">
            <span class="crescer truncar">${esc(l.n)}${l.nota ? ` <span style="color:var(--txt-3)">(${esc(l.nota)})</span>` : ''}</span>
            <span class="num" style="color:var(--txt-2);white-space:nowrap">${esc(Store.textoQuantidade(l))}</span>
          </li>`).join('')}
        </ul>
        <button type="button" class="btn btn--primario btn--bloco mt3" data-plano-ok="${r.k}">
          ${icone('check', 18)}Comi isto
        </button>
        <button type="button" class="btn btn--fantasma btn--bloco mt2" data-add-ref="${r.k}">Comi outra coisa</button>
      </div>` : ''}
      ${!temItens && !propor ? `<button type="button" class="cartao cartao--plano vazio-b" data-add-ref="${r.k}">
        <span class="cartao__sub">${icone('mais', 16)} Nada registado — toca para juntar</span>
      </button>` : ''}
    </section>`;
  }

  /* ---------- rodapé ---------- */

  function rodape(d) {
    const s = Store.semanaComida(0);
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Esta semana</h2></div>
      <div class="stats mb3">
        ${Comp.stat(s.comRegisto, s.comRegisto === 1 ? 'dia registado' : 'dias registados')}
        ${Comp.stat(s.media ? UI.fmt(s.media.kcal, 0) : '—', 'média', 'kcal')}
        ${Comp.stat(s.media ? UI.fmt(s.media.prot, 0) : '—', 'proteína', 'g')}
        ${Comp.stat(s.desvio && s.desvio.kcal != null ? (s.desvio.kcal > 0 ? '+' : '') + UI.fmt(s.desvio.kcal, 0) : '—', 'face ao alvo', 'kcal')}
      </div>
      <div class="pilha">
        <button type="button" class="btn btn--secundario btn--bloco" data-relatorio>
          ${icone('nota', 18)}Relatório da semana
        </button>
        <button type="button" class="btn btn--secundario btn--bloco" data-alimentos>
          ${icone('lista', 18)}Alimentos guardados
        </button>
        ${d.vazio ? `<button type="button" class="btn btn--fantasma btn--bloco" data-copiar-ontem>
          ${icone('duplicar', 18)}Copiar o último dia registado
        </button>` : ''}
      </div>
      <p class="campo__ajuda">O relatório é o texto que levas para a revisão da semana: o que comeste
        dia a dia, a média contra os alvos e o peso corporal.</p>
    </section>`;
  }

  /* ---------- acções ---------- */

  function registarDoPlano(data, refeicao) {
    const n = Store.registarRefeicaoDoPlano(data, refeicao);
    if (!n) { UI.toast('O plano não tem nada nessa refeição', 'erro'); return; }
    UI.haptic('sucesso');
    UI.toast(`${n} ${n === 1 ? 'alimento registado' : 'alimentos registados'}`, 'sucesso');
    App.render();
  }

  async function copiarDia(data) {
    const anterior = Store.diasComRegisto().find(d => d !== data);
    if (!anterior) { UI.toast('Ainda não há nenhum dia registado', 'erro'); return; }
    const itens = Store.comidasDoDia(anterior);
    if (!(await UI.confirmar({
      titulo: 'Copiar ' + legivel(anterior).toLowerCase() + '?',
      msg: `Passa os ${itens.length} alimentos desse dia para ${legivel(data).toLowerCase()}. Depois podes apagar o que não comeste.`,
      ok: 'Copiar'
    }))) return;
    itens.forEach(c => Store.registarComida({
      alimentoId: c.aId, q: c.q, refeicao: c.refeicao, data, nota: c.nota, doPlano: c.doPlano
    }, true));
    Store.guardar(true);
    UI.haptic('sucesso');
    UI.toast(`${itens.length} alimentos copiados`, 'sucesso');
    App.render();
  }

  /* ---------- escolher o que comeste ---------- */

  function sheetEscolher(data, refeicao) {
    const s = UI.sheet({
      titulo: 'Juntar a ' + COMIDA.REFEICOES[refeicao].name.toLowerCase(),
      alto: true,
      html: `<div class="campo">
          <input class="entrada" type="search" data-procura data-auto-focus placeholder="Procurar alimento"
                 autocomplete="off" aria-label="Procurar alimento">
        </div>
        <div data-lista></div>`,
      rodape: `<button type="button" class="btn btn--secundario" data-novo>${icone('mais', 18)}Novo alimento</button>`,
      focar: false
    });

    const lista = s.painel.querySelector('[data-lista]');
    const campo = s.painel.querySelector('[data-procura]');
    const usos = Store.usosAlimentos();

    function desenhar() {
      const termo = campo.value.trim();
      const achados = Store.procurarAlimentos(termo, 40);
      if (!achados.length) {
        lista.innerHTML = `<div class="cartao cartao--plano">${Comp.vazio({
          icone: 'procurar', titulo: 'Sem resultados',
          sub: 'Cria o alimento com as calorias do rótulo e fica guardado para a próxima.'
        })}</div>`;
        return;
      }
      lista.innerHTML = `${!termo ? '<p class="campo__ajuda" style="margin-top:0">Os mais usados primeiro.</p>' : ''}
        <div class="lista">${achados.map(a => {
          const u = usos[a.id];
          const porcao = a.tipo === 'g' ? `${a.kcal} kcal / 100 g` : `${a.kcal} kcal / ${esc(a.porcao || 'porção')}`;
          return `<button type="button" class="lista__i" data-a="${esc(a.id)}">
            <div class="lista__corpo">
              <div class="lista__t">${esc(a.n)}${a.plano ? ' <span class="chip chip--primaria">plano</span>' : ''}</div>
              <div class="lista__s num">${porcao} · ${UI.fmt(a.prot, 0)} P · ${UI.fmt(a.hc, 0)} HC · ${UI.fmt(a.gord, 0)} G</div>
            </div>
            ${u ? `<span class="lista__fim num" style="font-size:var(--t-xs);color:var(--txt-3)">${u.n}×</span>` : ''}
          </button>`;
        }).join('')}</div>`;
    }
    desenhar();

    let atraso = null;
    campo.addEventListener('input', () => { clearTimeout(atraso); atraso = setTimeout(desenhar, 120); });

    lista.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = Store.alimento(b.dataset.a);
      if (!a) return;
      UI.fecharSheet();
      setTimeout(() => sheetQuantidade(a, { data, refeicao }), 250);
    });

    s.painel.querySelector('[data-novo]').addEventListener('click', () => {
      const nome = campo.value.trim();
      UI.fecharSheet();
      setTimeout(() => sheetAlimento(null, { nome, aoGuardar: a => sheetQuantidade(a, { data, refeicao }) }), 250);
    });
  }

  /* ---------- quanto comeste ---------- */

  function sheetQuantidade(a, opts) {
    const porGrama = a.tipo === 'g';
    const inicial = opts.q != null ? opts.q : (porGrama ? (a.g || 100) : 1);
    const atalhos = porGrama
      ? [...new Set([a.g, ...GRAMAS].filter(Boolean))].sort((x, y) => x - y).slice(0, 7)
      : MULTIPLOS;

    const s = UI.sheet({
      titulo: a.n,
      html: `<div class="campo">
          <label class="campo__l" for="q-v">${porGrama ? 'Quantidade em gramas' : `Quantas porções (${esc(a.porcao || 'porção')})`}</label>
          <input class="entrada num" id="q-v" type="text" inputmode="decimal" data-q value="${UI.fmt(inicial)}" autocomplete="off">
        </div>
        <div class="linha" style="flex-wrap:wrap;gap:6px">
          ${atalhos.map(v => `<button type="button" class="chip chip--contorno" data-atalho="${v}">
            ${porGrama ? v + ' g' : UI.fmt(v) + '×'}</button>`).join('')}
        </div>
        <div class="stats mt4" data-previa></div>
        ${a.tipo === 'un' && a.g ? `<p class="campo__ajuda">Cada ${esc(a.porcao || 'porção')} pesa cerca de ${a.g} g.</p>` : ''}`,
      rodape: `<button type="button" class="btn btn--fantasma" data-cancelar>Cancelar</button>
               <button type="button" class="btn btn--primario" data-ok>${opts.comidaId ? 'Guardar' : 'Registar'}</button>`
    });

    const campo = s.painel.querySelector('[data-q]');
    const previa = s.painel.querySelector('[data-previa]');

    function desenhar() {
      const q = UI.lerNumero(campo.value) || 0;
      const m = Store.macrosDe(a, q);
      previa.innerHTML = `${Comp.stat(UI.fmt(m.kcal, 0), 'calorias', 'kcal')}
        ${Comp.stat(UI.fmt(m.prot, 0), 'proteína', 'g')}
        ${Comp.stat(UI.fmt(m.hc, 0), 'hidratos', 'g')}
        ${Comp.stat(UI.fmt(m.gord, 0), 'gordura', 'g')}`;
    }
    desenhar();
    campo.addEventListener('input', desenhar);

    s.painel.querySelectorAll('[data-atalho]').forEach(b => b.addEventListener('click', () => {
      campo.value = UI.fmt(+b.dataset.atalho);
      UI.haptic('leve');
      desenhar();
    }));

    s.painel.querySelector('[data-cancelar]').addEventListener('click', () => UI.fecharSheet());
    s.painel.querySelector('[data-ok]').addEventListener('click', () => {
      const q = UI.lerNumero(campo.value);
      if (!q || q <= 0) { UI.toast('Escreve a quantidade', 'erro'); UI.haptic('erro'); return; }
      if (opts.comidaId) Store.actualizarComida(opts.comidaId, { q });
      else Store.registarComida({ alimentoId: a.id, q, refeicao: opts.refeicao, data: opts.data });
      UI.fecharSheet();
      UI.haptic('sucesso');
      UI.toast(opts.comidaId ? 'Quantidade corrigida' : `${a.n} registado`, 'sucesso');
      App.render();
    });
  }

  /* ---------- mexer numa linha já registada ---------- */

  function sheetItem(id, data) {
    const c = Store.comida(id);
    if (!c) return;
    const a = Store.alimento(c.aId);

    const s = UI.sheet({
      titulo: c.n,
      html: `<div class="stats mb3">
          ${Comp.stat(UI.fmt(c.kcal, 0), 'calorias', 'kcal')}
          ${Comp.stat(UI.fmt(c.prot, 0), 'proteína', 'g')}
          ${Comp.stat(UI.fmt(c.hc, 0), 'hidratos', 'g')}
          ${Comp.stat(UI.fmt(c.gord, 0), 'gordura', 'g')}
        </div>
        <p class="texto-corpo mb3">${esc(Store.textoQuantidade(c))} · ${esc(COMIDA.REFEICOES[c.refeicao].name)}</p>
        <div class="campo">
          <span class="campo__l" id="it-ref">Mudar de refeição</span>
          <div class="segmento" role="group" aria-labelledby="it-ref" style="flex-wrap:wrap">
            ${Store.ordemRefeicoes().map(k => `<button type="button" class="segmento__b" data-ref="${k}"
              aria-pressed="${c.refeicao === k}">${esc(COMIDA.REFEICOES[k].curto)}</button>`).join('')}
          </div>
        </div>
        ${a ? '' : '<p class="campo__ajuda">Este alimento já não está na lista, mas o que registaste fica.</p>'}`,
      rodape: `<button type="button" class="btn btn--perigo-fantasma" data-apagar>${icone('lixo', 18)}Apagar</button>
               <button type="button" class="btn btn--primario" data-quantidade>${icone('editar', 18)}Quantidade</button>`
    });

    s.painel.querySelectorAll('[data-ref]').forEach(b => b.addEventListener('click', () => {
      Store.actualizarComida(id, { refeicao: b.dataset.ref });
      UI.fecharSheet();
      UI.haptic('leve');
      App.render();
    }));

    s.painel.querySelector('[data-quantidade]').addEventListener('click', () => {
      if (!a) { UI.toast('Sem o alimento não dá para recalcular — apaga e volta a registar', 'erro'); return; }
      UI.fecharSheet();
      setTimeout(() => sheetQuantidade(a, { data, refeicao: c.refeicao, q: c.q, comidaId: id }), 250);
    });

    s.painel.querySelector('[data-apagar]').addEventListener('click', () => {
      Store.apagarComida(id);
      UI.fecharSheet();
      UI.haptic('medio');
      UI.toast('Apagado');
      App.render();
    });
  }

  /* ---------- criar e corrigir alimentos ---------- */

  function sheetAlimento(a, opts) {
    opts = opts || {};
    const novo = !a;
    const tipoInicial = a ? a.tipo : 'g';

    const s = UI.sheet({
      titulo: novo ? 'Novo alimento' : 'Corrigir ' + a.n,
      alto: true,
      html: `<div class="campo">
          <label class="campo__l" for="al-n">Nome</label>
          <input class="entrada" id="al-n" data-n value="${esc(a ? a.n : (opts.nome || ''))}"
                 placeholder="Por exemplo: Bitoque" autocomplete="off" data-auto-focus>
        </div>
        <div class="campo">
          <span class="campo__l" id="al-t">Como o contas</span>
          <div class="segmento" role="group" aria-labelledby="al-t">
            <button type="button" class="segmento__b" data-tipo="g" aria-pressed="${tipoInicial === 'g'}">Por peso (100 g)</button>
            <button type="button" class="segmento__b" data-tipo="un" aria-pressed="${tipoInicial === 'un'}">Por porção</button>
          </div>
          <p class="campo__ajuda" data-ajuda-tipo></p>
        </div>
        <div class="campo" data-campo-porcao>
          <label class="campo__l" for="al-p">Nome da porção</label>
          <input class="entrada" id="al-p" data-porcao value="${esc(a ? (a.porcao || '') : '')}"
                 placeholder="prato, fatia, lata, copo" autocomplete="off">
        </div>
        <div class="campo">
          <label class="campo__l" for="al-kcal">Calorias <span data-unidade></span></label>
          <input class="entrada num" id="al-kcal" type="text" inputmode="decimal" data-kcal
                 value="${a ? a.kcal : ''}" placeholder="0" autocomplete="off">
        </div>
        <div class="grelha-3">
          <div class="campo">
            <label class="campo__l" for="al-prot">Proteína (g)</label>
            <input class="entrada num" id="al-prot" type="text" inputmode="decimal" data-prot value="${a ? a.prot : ''}" placeholder="0">
          </div>
          <div class="campo">
            <label class="campo__l" for="al-hc">Hidratos (g)</label>
            <input class="entrada num" id="al-hc" type="text" inputmode="decimal" data-hc value="${a ? a.hc : ''}" placeholder="0">
          </div>
          <div class="campo">
            <label class="campo__l" for="al-gord">Gordura (g)</label>
            <input class="entrada num" id="al-gord" type="text" inputmode="decimal" data-gord value="${a ? a.gord : ''}" placeholder="0">
          </div>
        </div>
        <div class="campo">
          <label class="campo__l" for="al-cat">Categoria</label>
          <select class="select" id="al-cat" data-cat>
            ${Object.keys(COMIDA.CATS).map(k =>
              `<option value="${k}" ${a && a.cat === k ? 'selected' : ''}>${esc(COMIDA.CATS[k].name)}</option>`).join('')}
          </select>
        </div>
        <div class="campo">
          <label class="campo__l" for="al-g" data-l-g></label>
          <input class="entrada num" id="al-g" type="text" inputmode="decimal" data-g value="${a && a.g ? a.g : ''}" placeholder="opcional">
        </div>
        <p class="chip chip--multilinha" data-conta></p>`,
      rodape: `${a && !a.custom ? `<button type="button" class="btn btn--fantasma" data-repor>Repor</button>` : ''}
               <button type="button" class="btn btn--primario" data-ok>Guardar</button>`,
      focar: false
    });

    const q = sel => s.painel.querySelector(sel);
    let tipo = tipoInicial;

    function actualizarTipo() {
      s.painel.querySelectorAll('[data-tipo]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tipo === tipo)));
      q('[data-campo-porcao]').hidden = tipo !== 'un';
      q('[data-unidade]').textContent = tipo === 'g' ? '(por 100 g)' : '(por porção)';
      q('[data-ajuda-tipo]').textContent = tipo === 'g'
        ? 'Escreves os valores do rótulo por 100 g e depois registas os gramas que comeste.'
        : 'Escreves os valores de uma porção inteira e depois registas quantas comeste.';
      q('[data-l-g]').textContent = tipo === 'g' ? 'Dose habitual em gramas (opcional)' : 'Peso de uma porção em gramas (opcional)';
      conta();
    }

    function valores() {
      return {
        n: q('[data-n]').value,
        cat: q('[data-cat]').value,
        tipo,
        porcao: q('[data-porcao]').value,
        kcal: UI.lerNumero(q('[data-kcal]').value) || 0,
        prot: UI.lerNumero(q('[data-prot]').value) || 0,
        hc: UI.lerNumero(q('[data-hc]').value) || 0,
        gord: UI.lerNumero(q('[data-gord]').value) || 0,
        g: UI.lerNumero(q('[data-g]').value) || null
      };
    }

    /* As calorias têm de bater certo com os macros: 4 por grama de proteína e de
       hidratos, 9 por grama de gordura. Um aviso apanha gralhas do rótulo. */
    function conta() {
      const v = valores();
      const calc = v.prot * 4 + v.hc * 4 + v.gord * 9;
      const cx = q('[data-conta]');
      if (!v.kcal && !calc) { cx.hidden = true; return; }
      cx.hidden = false;
      const dif = v.kcal - calc;
      const fora = v.kcal > 20 && Math.abs(dif) / v.kcal > 0.15;
      cx.className = 'chip chip--multilinha ' + (fora ? 'chip--aviso' : '');
      cx.innerHTML = fora
        ? `${icone('aviso', 14)}Os macros dão ${UI.fmt(calc, 0)} kcal e escreveste ${UI.fmt(v.kcal, 0)}. `
          + 'Confere o rótulo — a não ser que seja bebida alcoólica, em que o álcool também conta.'
        : `${icone('checkCirculo', 14)}Os macros dão ${UI.fmt(calc, 0)} kcal, bate certo.`;
    }

    s.painel.querySelectorAll('[data-tipo]').forEach(b => b.addEventListener('click', () => {
      tipo = b.dataset.tipo;
      UI.haptic('leve');
      actualizarTipo();
    }));
    ['kcal', 'prot', 'hc', 'gord'].forEach(k => q(`[data-${k}]`).addEventListener('input', conta));
    actualizarTipo();

    const repor = q('[data-repor]');
    if (repor) repor.addEventListener('click', () => {
      const posto = Store.reporAlimento(a.id);
      UI.fecharSheet();
      UI.haptic('medio');
      UI.toast('Valores repostos', 'sucesso');
      if (opts.aoGuardar) opts.aoGuardar(posto); else App.render();
    });

    q('[data-ok]').addEventListener('click', () => {
      const v = valores();
      if (!v.n.trim()) { UI.toast('Escreve o nome', 'erro'); UI.haptic('erro'); return; }
      if (!v.kcal) { UI.toast('Escreve as calorias', 'erro'); UI.haptic('erro'); return; }
      const guardado = Store.guardarAlimento(Object.assign({ id: a ? a.id : null }, v));
      UI.fecharSheet();
      UI.haptic('sucesso');
      UI.toast(novo ? 'Alimento guardado' : 'Alimento corrigido', 'sucesso');
      if (opts.aoGuardar) setTimeout(() => opts.aoGuardar(guardado), 250);
      else App.render();
    });
  }

  /* ---------- a lista de alimentos ---------- */

  function sheetAlimentos() {
    const s = UI.sheet({
      titulo: 'Alimentos guardados',
      alto: true,
      html: `<div class="campo">
          <input class="entrada" type="search" data-procura placeholder="Procurar alimento" autocomplete="off" aria-label="Procurar alimento">
        </div>
        <p class="campo__ajuda" style="margin-top:0">Os valores do catálogo são uma estimativa.
          Toca num alimento para corrigir com o rótulo que tens à frente — fica guardado só neste telemóvel.</p>
        <div data-lista></div>`,
      rodape: `<button type="button" class="btn btn--primario" data-novo>${icone('mais', 18)}Novo alimento</button>`,
      focar: false
    });

    const lista = s.painel.querySelector('[data-lista]');
    const campo = s.painel.querySelector('[data-procura]');

    function desenhar() {
      const achados = Store.procurarAlimentos(campo.value.trim(), 200);
      const cats = {};
      achados.forEach(a => { (cats[a.cat] = cats[a.cat] || []).push(a); });
      lista.innerHTML = Object.keys(COMIDA.CATS).filter(k => cats[k]).map(k => `
        <h3 class="seccao__tit mt4 mb3">${esc(COMIDA.CATS[k].name)}</h3>
        <div class="lista">${cats[k].map(a => `<button type="button" class="lista__i" data-a="${esc(a.id)}">
          <div class="lista__corpo">
            <div class="lista__t">${esc(a.n)}${a.custom ? ' <span class="chip">teu</span>' : ''}</div>
            <div class="lista__s num">${a.kcal} kcal / ${a.tipo === 'g' ? '100 g' : esc(a.porcao || 'porção')}
              · ${UI.fmt(a.prot, 0)} P · ${UI.fmt(a.hc, 0)} HC · ${UI.fmt(a.gord, 0)} G</div>
          </div>
          <span class="lista__fim">${icone('editar', 18)}</span>
        </button>`).join('')}</div>`).join('') || `<div class="cartao cartao--plano">${Comp.vazio({
          icone: 'procurar', titulo: 'Sem resultados', sub: 'Cria o alimento com os valores do rótulo.'
        })}</div>`;
    }
    desenhar();

    let atraso = null;
    campo.addEventListener('input', () => { clearTimeout(atraso); atraso = setTimeout(desenhar, 120); });

    lista.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = Store.alimento(b.dataset.a);
      if (!a) return;
      UI.fecharSheet();
      setTimeout(() => sheetAlimentoComApagar(a), 250);
    });

    s.painel.querySelector('[data-novo]').addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => sheetAlimento(null, { aoGuardar: () => sheetAlimentos() }), 250);
    });
  }

  /** Corrigir um alimento, com a hipótese de o tirar da lista */
  function sheetAlimentoComApagar(a) {
    const usos = Store.usosAlimentos()[a.id];
    const s = UI.sheet({
      titulo: a.n,
      html: `<div class="stats mb3">
          ${Comp.stat(a.kcal, 'calorias', a.tipo === 'g' ? '/100 g' : '/' + (a.porcao || 'porção'))}
          ${Comp.stat(UI.fmt(a.prot, 0), 'proteína', 'g')}
          ${Comp.stat(UI.fmt(a.hc, 0), 'hidratos', 'g')}
          ${Comp.stat(UI.fmt(a.gord, 0), 'gordura', 'g')}
        </div>
        ${usos ? `<p class="cartao__sub">Registado ${usos.n}× · último a ${esc(Store.D.curto(usos.ultima))}</p>` : ''}`,
      rodape: `<button type="button" class="btn btn--perigo-fantasma" data-apagar>${icone('lixo', 18)}Tirar da lista</button>
               <button type="button" class="btn btn--primario" data-editar>${icone('editar', 18)}Corrigir valores</button>`
    });

    s.painel.querySelector('[data-editar]').addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => sheetAlimento(a, { aoGuardar: () => sheetAlimentos() }), 250);
    });

    s.painel.querySelector('[data-apagar]').addEventListener('click', async () => {
      UI.fecharSheet();
      if (!(await UI.confirmar({
        titulo: 'Tirar ' + a.n + ' da lista?',
        msg: 'Deixa de aparecer quando procuras. O que já registaste com ele não se perde.',
        ok: 'Tirar', perigo: true
      }))) return;
      Store.apagarAlimento(a.id);
      UI.haptic('medio');
      UI.toast('Tirado da lista');
      sheetAlimentos();
    });
  }

  /* ---------- relatório da semana ---------- */

  function sheetRelatorio() {
    let recuar = 0;
    const s = UI.sheet({
      titulo: 'Semana de alimentação',
      alto: true,
      html: `<div class="segmento mb3" role="group" aria-label="Semana">
          <button type="button" class="segmento__b" data-semana="0" aria-pressed="true">Esta semana</button>
          <button type="button" class="segmento__b" data-semana="1" aria-pressed="false">Anterior</button>
        </div>
        <pre class="relatorio" data-texto></pre>
        <p class="campo__ajuda">Este é o texto da revisão: o que comeste, a média contra os alvos e o peso.
          O plano alimentar muda num sítio só — <strong>js/alimentar.js</strong> — como o de treino.</p>`,
      rodape: `<button type="button" class="btn btn--secundario" data-copiar>${icone('duplicar', 18)}Copiar</button>
               <button type="button" class="btn btn--primario" data-partilhar>${icone('descarregar', 18)}Partilhar</button>`
    });

    const pre = s.painel.querySelector('[data-texto]');
    function desenhar() {
      pre.textContent = Store.relatorioComida(recuar) || 'Sem registos nesta semana.';
      s.painel.querySelectorAll('[data-semana]').forEach(b =>
        b.setAttribute('aria-pressed', String(+b.dataset.semana === recuar)));
    }
    desenhar();

    s.painel.querySelectorAll('[data-semana]').forEach(b => b.addEventListener('click', () => {
      recuar = +b.dataset.semana;
      UI.haptic('leve');
      desenhar();
    }));

    s.painel.querySelector('[data-copiar]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent);
        UI.haptic('sucesso');
        UI.toast('Relatório copiado', 'sucesso');
      } catch (err) {
        UI.toast('O telemóvel não deixou copiar — usa Partilhar', 'erro');
      }
    });

    s.painel.querySelector('[data-partilhar]').addEventListener('click', async () => {
      const texto = pre.textContent;
      const sem = Store.semanaComida(recuar);
      const nome = `alimentacao-${sem.ini}.md`;
      const ficheiro = new File([texto], nome, { type: 'text/markdown' });
      if (navigator.canShare && navigator.canShare({ files: [ficheiro] })) {
        try { await navigator.share({ files: [ficheiro], title: 'Semana de alimentação' }); return; }
        catch (err) { if (err && err.name === 'AbortError') return; }
      }
      const url = URL.createObjectURL(new Blob([texto], { type: 'text/markdown' }));
      const a = document.createElement('a');
      a.href = url; a.download = nome;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      UI.toast('Ficheiro guardado', 'sucesso');
    });
  }
})();
