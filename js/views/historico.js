/* =============================================================
   Vistas: Histórico (calendário + lista) e detalhe da sessão
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;
  const D = Store.D;

  let mesActual = new Date();

  /* ================= HISTÓRICO ================= */
  Vistas.historico = {
    titulo: () => 'Histórico',
    sub: () => {
      const n = Store.state.treinos.length;
      return n ? `${n} treino${n > 1 ? 's' : ''} registado${n > 1 ? 's' : ''}` : 'Ainda sem registos';
    },

    render() {
      if (!Store.state.treinos.length) {
        return Comp.vazio({
          icone: 'calendario', titulo: 'Sem treinos ainda',
          sub: 'Assim que terminares o primeiro treino ele aparece aqui, com calendário e estatísticas.',
          accao: 'Ir para Hoje'
        });
      }
      return calendario() + listaMes();
    },

    montar(raiz) {
      const b = raiz.querySelector('[data-vazio-accao]');
      if (b) return b.addEventListener('click', () => App.ir('hoje'));

      raiz.addEventListener('click', e => {
        const nav = e.target.closest('[data-mes]');
        if (nav) {
          mesActual.setMonth(mesActual.getMonth() + (+nav.dataset.mes));
          mesActual = new Date(mesActual);
          UI.haptic('leve');
          const alvo = document.getElementById('conteudo');
          alvo.innerHTML = Vistas.historico.render();
          Vistas.historico.montar(alvo);
          return;
        }
        const dia = e.target.closest('[data-dia]');
        if (dia) {
          const treinos = Store.state.treinos.filter(t => t.data === dia.dataset.dia);
          if (treinos.length === 1) return App.ir('sessao/' + treinos[0].id);
          if (treinos.length > 1) return sheetDia(dia.dataset.dia, treinos);
          UI.toast('Sem treino nesse dia');
          return;
        }
        const t = e.target.closest('[data-treino]');
        if (t) return App.ir('sessao/' + t.dataset.treino);
      });
    }
  };

  function calendario() {
    const ano = mesActual.getFullYear(), mes = mesActual.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const inicioSemana = (primeiro.getDay() + 6) % 7;   // segunda = 0
    const datas = new Set(Store.state.treinos.map(t => t.data));
    const hoje = D.hoje();

    const celulas = [];
    const mesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = inicioSemana - 1; i >= 0; i--) {
      celulas.push(`<span class="cal__d cal__d--fora" aria-hidden="true">${mesAnterior - i}</span>`);
    }
    for (let d = 1; d <= diasNoMes; d++) {
      const iso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const treinou = datas.has(iso);
      const cls = ['cal__d', treinou ? 'cal__d--treino' : '', iso === hoje ? 'cal__d--hoje' : ''].join(' ');
      celulas.push(treinou
        ? `<button type="button" class="${cls}" data-dia="${iso}" aria-label="${d} de ${D.nomeMes(mes)}, treinou">${d}</button>`
        : `<span class="${cls}" aria-label="${d}">${d}</span>`);
    }
    const resto = (7 - (celulas.length % 7)) % 7;
    for (let i = 1; i <= resto; i++) celulas.push(`<span class="cal__d cal__d--fora" aria-hidden="true">${i}</span>`);

    const doMes = Store.state.treinos.filter(t => t.data.startsWith(`${ano}-${String(mes + 1).padStart(2, '0')}`));
    const vol = doMes.reduce((v, t) => v + Store.volumeTreino(t), 0);
    const series = doMes.reduce((v, t) => v + Store.seriesTreino(t), 0);

    return `<section class="cartao cartao--calendario mb3">
      <div class="entre mb3">
        <button type="button" class="btn-icone" data-mes="-1" aria-label="Mês anterior">${icone('esquerda', 22)}</button>
        <h2 style="font-size:var(--t-base);font-weight:700">${D.nomeMes(mes)} ${ano}</h2>
        <button type="button" class="btn-icone" data-mes="1" aria-label="Mês seguinte">${icone('direita', 22)}</button>
      </div>
      <div class="cal" role="grid" aria-label="Calendário de ${D.nomeMes(mes)} ${ano}">
        ${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => `<span class="cal__dow" aria-hidden="true">${d}</span>`).join('')}
        ${celulas.join('')}
      </div>
      <div class="stats mt4">
        ${Comp.stat(doMes.length, doMes.length === 1 ? 'treino' : 'treinos')}
        ${Comp.stat(series, 'séries')}
        ${Comp.stat(UI.fmt(Store.U.mostrar(vol), 0), 'volume', Store.U.label())}
      </div>
    </section>`;
  }

  function listaMes() {
    const ano = mesActual.getFullYear(), mes = String(mesActual.getMonth() + 1).padStart(2, '0');
    const doMes = Store.state.treinos.filter(t => t.data.startsWith(`${ano}-${mes}`));
    if (!doMes.length) {
      return `<section class="seccao"><p class="texto-corpo" style="text-align:center;padding:var(--e5) 0">
        Sem treinos em ${D.nomeMes(mesActual.getMonth()).toLowerCase()}.</p></section>`;
    }
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">${D.nomeMes(mesActual.getMonth())}</h2></div>
      <div class="lista">${doMes.map(Comp.treinoItem).join('')}</div>
    </section>`;
  }

  function sheetDia(iso, treinos) {
    const s = UI.sheet({
      titulo: `${D.nomeDia(iso)}, ${D.curto(iso)}`,
      html: `<div class="lista">${treinos.map(Comp.treinoItem).join('')}</div>`
    });
    s.painel.addEventListener('click', e => {
      const b = e.target.closest('[data-treino]');
      if (b) { UI.fecharSheet(); App.ir('sessao/' + b.dataset.treino); }
    });
  }

  /* ================= DETALHE DA SESSÃO ================= */
  Vistas.sessao = {
    titulo: id => { const t = achar(id); return t ? t.nome : 'Treino'; },
    sub: id => {
      const t = achar(id);
      if (!t) return '';
      return `${D.nomeDia(t.data)}, ${D.curto(t.data)} · ${D.relativo(t.data)}`;
    },
    accoes: id => achar(id)
      ? `<button type="button" class="btn-icone" data-voltar aria-label="Voltar">${icone('voltar', 22)}</button>
         <button type="button" class="btn-icone" data-menu aria-label="Opções">${icone('opcoes', 22)}</button>` : '',

    montarCabecalho(cont, id) {
      const v = cont.querySelector('[data-voltar]');
      if (v) v.addEventListener('click', () => App.voltar('historico'));
      const m = cont.querySelector('[data-menu]');
      if (m) m.addEventListener('click', () => sheetSessao(id));
    },

    render(id) {
      const t = achar(id);
      if (!t) return Comp.vazio({ icone: 'procurar', titulo: 'Treino não encontrado', sub: 'Pode ter sido apagado.', accao: 'Ver histórico' });

      const vol = Store.volumeTreino(t);
      const series = Store.seriesTreino(t);

      return `<section class="stats mb3">
          ${Comp.stat(UI.fmtDuracao(t.duracao).replace(' min', ''), t.duracao && t.duracao >= 3600 ? 'duração' : 'minutos')}
          ${Comp.stat(t.entradas.length, 'exercícios')}
          ${Comp.stat(series, 'séries')}
          ${Comp.stat(UI.fmt(Store.U.mostrar(vol), 0), 'volume', Store.U.label())}
        </section>
        ${t.notas ? `<div class="cartao mb3"><p class="cartao__sub" style="color:var(--txt)">${icone('nota', 16)} ${esc(t.notas)}</p></div>` : ''}
        ${t.entradas.map(entradaHtml).join('')}
        <button type="button" class="btn btn--secundario btn--bloco btn--grande mt4" data-repetir>
          ${icone('reiniciar', 20)}Repetir este treino
        </button>`;
    },

    montar(raiz, id) {
      const t = achar(id);
      const b = raiz.querySelector('[data-vazio-accao]');
      if (b) return b.addEventListener('click', () => App.ir('historico'));

      raiz.querySelector('[data-repetir]').addEventListener('click', async () => {
        if (Store.state.ativo && !(await UI.confirmar({
          titulo: 'Já tens um treino a decorrer',
          msg: 'Queres descartá-lo e começar este?', ok: 'Descartar e começar', perigo: true
        }))) return;
        if (Store.state.ativo) Store.descartarTreino();
        const novo = Store.comecarTreino(t.nome, t.entradas.map(e => e.exId));
        if (t.splitId) { novo.splitId = t.splitId; novo.splitDia = t.splitDia; Store.guardar(true); }
        UI.haptic('sucesso');
        App.ir('treino');
      });

      raiz.addEventListener('click', e => {
        const ex = e.target.closest('[data-ex]');
        if (ex) App.ir('exercicio/' + ex.dataset.ex);
      });
    }
  };

  function entradaHtml(entrada) {
    const ex = Store.exercicio(entrada.exId);
    const nome = ex ? ex.n : 'Exercício removido';
    const uteis = entrada.series.filter(s => s.tipo !== 'aquecimento');
    const melhor = uteis.reduce((m, s) => {
      const r = Store.um1RM(s.kg, s.reps);
      return !m || r > m.r ? { r, s } : m;
    }, null);
    const vol = uteis.reduce((v, s) => v + (s.kg || 0) * (s.reps || 0), 0);

    return `<article class="exercicio mb3">
      <header class="exercicio__cab">
        <div class="crescer">
          <h2 class="exercicio__n">${esc(nome)}</h2>
          <p class="exercicio__meta num">${uteis.length} séries · ${UI.fmt(Store.U.mostrar(vol), 0)} ${esc(Store.U.label())} de volume${melhor && melhor.r ? ` · 1RM est. ${Store.U.fmt(melhor.r)}` : ''}</p>
        </div>
        ${ex ? `<button type="button" class="btn-icone" data-ex="${ex.id}" aria-label="Ver histórico de ${esc(nome)}">${icone('grafico', 20)}</button>` : ''}
      </header>
      <div style="padding:0 var(--e4) var(--e3)">
        ${entrada.series.map((s, i) => `<div class="entre" style="padding:6px 0;border-bottom:1px solid var(--borda)">
          <span style="font-size:var(--t-md);color:var(--txt-2);font-weight:600">
            ${s.tipo === 'aquecimento' ? 'Aquecimento' : 'Série ' + (i + 1)}${s.tipo === 'falha' ? ' · falha' : ''}
          </span>
          <span class="num" style="font-weight:700">${Store.U.fmt(s.kg)} × ${s.reps ?? '—'}</span>
        </div>`).join('')}
        ${entrada.notas ? `<p class="cartao__sub mt3">${icone('nota', 14)} ${esc(entrada.notas)}</p>` : ''}
      </div>
    </article>`;
  }

  function sheetSessao(id) {
    const t = achar(id);
    if (!t) return;
    const s = UI.sheet({
      titulo: 'Opções do treino',
      html: `<div class="campo">
          <label class="campo__l" for="s-nome">Nome</label>
          <input class="entrada" id="s-nome" value="${esc(t.nome)}" autocomplete="off">
        </div>
        <div class="campo">
          <label class="campo__l" for="s-data">Data</label>
          <input class="entrada" id="s-data" type="date" value="${esc(t.data)}">
        </div>
        <div class="campo">
          <label class="campo__l" for="s-notas">Notas</label>
          <textarea class="area" id="s-notas" placeholder="Como correu?">${esc(t.notas || '')}</textarea>
        </div>
        <button type="button" class="btn btn--perigo-fantasma btn--bloco" data-apagar>${icone('lixo', 18)}Apagar treino</button>`,
      rodape: `<button type="button" class="btn btn--primario" data-guardar>Guardar alterações</button>`
    });

    s.painel.querySelector('[data-guardar]').addEventListener('click', () => {
      t.nome = s.painel.querySelector('#s-nome').value.trim() || t.nome;
      const d = s.painel.querySelector('#s-data').value;
      if (d) t.data = d;
      t.notas = s.painel.querySelector('#s-notas').value;
      Store.state.treinos.sort((x, y) => y.data.localeCompare(x.data) || (y.inicio || 0) - (x.inicio || 0));
      Store.guardar(true);
      UI.fecharSheet();
      UI.toast('Alterações guardadas', 'sucesso');
      App.render();
    });

    s.painel.querySelector('[data-apagar]').addEventListener('click', async () => {
      UI.fecharSheet();
      if (!(await UI.confirmar({
        titulo: 'Apagar treino?',
        msg: `"${t.nome}" de ${D.curto(t.data)} será removido permanentemente.`,
        ok: 'Apagar', perigo: true
      }))) return;
      const copia = JSON.parse(JSON.stringify(t));
      Store.apagarTreino(t.id);
      UI.haptic('medio');
      App.ir('historico', true);
      UI.toast('Treino apagado', 'info', {
        label: 'Anular',
        fn: () => {
          Store.state.treinos.push(copia);
          Store.state.treinos.sort((x, y) => y.data.localeCompare(x.data) || (y.inicio || 0) - (x.inicio || 0));
          Store.guardar(true);
          App.render();
        }
      });
    });
  }

  function achar(id) { return Store.state.treinos.find(t => t.id === id); }
})();
