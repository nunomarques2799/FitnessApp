/* =============================================================
   Vista: Progresso — volume, distribuição muscular e recordes
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;

  let metrica = 'volume';   // volume | series | treinos
  let semanas = 8;

  Vistas.progresso = {
    titulo: () => 'Progresso',
    sub: () => {
      const n = Store.state.treinos.length;
      return n ? `${n} treino${n > 1 ? 's' : ''} no total` : '';
    },

    render() {
      if (!Store.state.treinos.length) {
        return Comp.vazio({
          icone: 'grafico', titulo: 'Sem dados para mostrar',
          sub: 'Depois do primeiro treino aparecem aqui gráficos de volume, distribuição muscular e recordes.',
          accao: 'Começar a treinar'
        });
      }
      return resumo() + graficoSemanal() + distribuicao() + topExercicios() + recordesRecentes();
    },

    montar(raiz) {
      const b = raiz.querySelector('[data-vazio-accao]');
      if (b) return b.addEventListener('click', () => App.ir('hoje'));

      raiz.addEventListener('click', e => {
        const m = e.target.closest('[data-metrica]');
        if (m) {
          metrica = m.dataset.metrica;
          UI.haptic('leve');
          return actualizarGrafico(raiz);
        }
        const s = e.target.closest('[data-semanas]');
        if (s) {
          semanas = +s.dataset.semanas;
          UI.haptic('leve');
          return actualizarGrafico(raiz);
        }
        const ex = e.target.closest('[data-ex]');
        if (ex) return App.ir('exercicio/' + ex.dataset.ex);
        const mus = e.target.closest('[data-musculo]');
        if (mus) return sheetMusculo(mus.dataset.musculo);
      });
    }
  };

  function actualizarGrafico(raiz) {
    const alvo = raiz.querySelector('[data-grafico-seccao]');
    if (!alvo) return;
    alvo.outerHTML = graficoSemanal();
  }

  /* ---------- blocos ---------- */
  function resumo() {
    const t = Store.state.treinos;
    const volTotal = t.reduce((v, x) => v + Store.volumeTreino(x), 0);
    const seriesTotal = t.reduce((v, x) => v + Store.seriesTreino(x), 0);
    const horas = t.reduce((v, x) => v + (x.duracao || 0), 0) / 3600;
    return `<section class="seccao">
      <div class="stats">
        ${Comp.stat(t.length, 'treinos')}
        ${Comp.stat(seriesTotal, 'séries')}
        ${Comp.stat(UI.fmt(Store.U.mostrar(volTotal) / 1000, volTotal > 100000 ? 0 : 1), 'volume', 'ton')}
        ${Comp.stat(UI.fmt(horas, horas >= 10 ? 0 : 1), 'horas')}
      </div>
    </section>`;
  }

  function graficoSemanal() {
    const dados = Store.volumeSemanal(semanas).map(s => {
      const v = metrica === 'volume' ? Store.U.mostrar(s.volume) : metrica === 'series' ? s.series : s.treinos;
      return {
        label: s.label.split(' ')[0],
        valor: Math.round(v),
        curto: metrica === 'volume' ? (v >= 1000 ? UI.fmt(v / 1000, 1) + 'k' : UI.fmt(v, 0)) : UI.fmt(v, 0),
        aria: `${UI.fmt(v, 0)} ${metrica === 'volume' ? Store.U.label() : metrica}`
      };
    });
    const media = dados.reduce((a, d) => a + d.valor, 0) / (dados.length || 1);
    const ultimas = dados.slice(-2);
    const tendencia = ultimas.length === 2 && ultimas[0].valor
      ? Math.round((ultimas[1].valor / ultimas[0].valor - 1) * 100) : null;

    return `<section class="seccao" data-grafico-seccao>
      <div class="seccao__cab"><h2 class="seccao__tit">Por semana</h2></div>
      <div class="segmento mb3" role="group" aria-label="Métrica">
        <button type="button" class="segmento__b" data-metrica="volume" aria-pressed="${metrica === 'volume'}">Volume</button>
        <button type="button" class="segmento__b" data-metrica="series" aria-pressed="${metrica === 'series'}">Séries</button>
        <button type="button" class="segmento__b" data-metrica="treinos" aria-pressed="${metrica === 'treinos'}">Treinos</button>
      </div>
      <div class="cartao">
        ${Charts.barras(dados, {
          aria: `${metrica} por semana nas últimas ${semanas} semanas`,
          vazio: 'Sem treinos neste período'
        })}
        <div class="entre mt3">
          <span class="cartao__sub num">Média ${UI.fmt(media, 0)}${metrica === 'volume' ? ' ' + Store.U.label() : ''} / semana</span>
          ${tendencia !== null ? `<span class="chip ${tendencia >= 0 ? 'chip--sucesso' : 'chip--aviso'} num">
            ${tendencia >= 0 ? '+' : ''}${tendencia}% vs. anterior</span>` : ''}
        </div>
      </div>
      <div class="filtros mt3" role="group" aria-label="Período">
        ${[4, 8, 12, 26].map(n => `<button type="button" class="filtro" data-semanas="${n}" aria-pressed="${semanas === n}">${n} sem.</button>`).join('')}
      </div>
    </section>`;
  }

  function distribuicao() {
    const s30 = Store.seriesPorMusculo(30);
    const musculos = Store.musculosActivos().map(k => {
      const m = Store.MUSCLES[k];
      const alvo = Store.alvoDe(k) * 4;              // alvo mensal
      const sets = Math.round(s30[k] * 10) / 10;
      return {
        key: k, nome: m.name, curto: m.curto, zona: m.zona, alvo, sets,
        dias: null, estado: sets === 0 ? 'nunca' : sets >= alvo ? 'pronto' : sets >= alvo * 0.6 ? 'recuperar' : 'atraso',
        pct: Math.min(1, sets / alvo)
      };
    }).sort((a, b) => a.pct - b.pct);

    const emFalta = musculos.filter(m => m.pct < 0.6).length;

    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Distribuição · 30 dias</h2></div>
      <p class="texto-corpo mb3" style="font-size:var(--t-md)">
        ${emFalta ? `${emFalta} grupo${emFalta > 1 ? 's' : ''} abaixo de 60% do volume mensal recomendado.`
        : 'Todos os grupos dentro do volume mensal recomendado.'}
      </p>
      <div class="musculos">${musculos.map(m => `<button type="button" class="musculo est-${m.estado}" data-musculo="${m.key}"
        aria-label="${esc(m.nome)}: ${m.sets} de ${m.alvo} séries em 30 dias">
        <span class="musculo__n"><i class="musculo__pt" aria-hidden="true"></i>${esc(m.nome)}</span>
        <span class="musculo__meta num">${UI.fmt(m.sets)}/${m.alvo}</span>
        <span class="musculo__barra"><span class="musculo__fill" style="width:${Math.round(m.pct * 100)}%"></span></span>
      </button>`).join('')}</div>
    </section>`;
  }

  function topExercicios() {
    const acc = {};
    Store.state.treinos.forEach(t => t.entradas.forEach(e => {
      const uteis = e.series.filter(s => s.feita !== false && s.tipo !== 'aquecimento');
      const vol = uteis.reduce((v, s) => v + (s.kg || 0) * (s.reps || 0), 0);
      if (!acc[e.exId]) acc[e.exId] = { id: e.exId, vol: 0, series: 0, sessoes: 0 };
      acc[e.exId].vol += vol;
      acc[e.exId].series += uteis.length;
      acc[e.exId].sessoes++;
    }));
    const top = Object.values(acc).sort((a, b) => b.vol - a.vol).slice(0, 6);
    if (!top.length) return '';
    const max = top[0].vol || 1;

    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Exercícios com mais volume</h2></div>
      <div class="musculos">${top.map(x => {
        const ex = Store.exercicio(x.id);
        return `<button type="button" class="musculo est-pronto" data-ex="${x.id}"
          aria-label="${esc(ex ? ex.n : x.id)}: ${UI.fmt(Store.U.mostrar(x.vol), 0)} ${Store.U.label()} em ${x.sessoes} sessões">
          <span class="musculo__n">${esc(ex ? ex.n : 'Exercício removido')}</span>
          <span class="musculo__meta num">${UI.fmt(Store.U.mostrar(x.vol), 0)} ${esc(Store.U.label())} · ${x.sessoes}×</span>
          <span class="musculo__barra"><span class="musculo__fill" style="width:${Math.round(x.vol / max * 100)}%"></span></span>
        </button>`;
      }).join('')}</div>
    </section>`;
  }

  function recordesRecentes() {
    const ids = new Set();
    Store.state.treinos.slice(0, 40).forEach(t => t.entradas.forEach(e => ids.add(e.exId)));
    const lista = [...ids].map(id => {
      const r = Store.recordes(id);
      return r && r.peso ? { id, r } : null;
    }).filter(Boolean)
      .sort((a, b) => b.r.peso.data.localeCompare(a.r.peso.data))
      .slice(0, 8);
    if (!lista.length) return '';

    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Recordes recentes</h2></div>
      <div class="lista">${lista.map(({ id, r }) => {
        const ex = Store.exercicio(id);
        return `<button type="button" class="lista__i" data-ex="${id}">
          <span style="color:var(--primaria-txt)">${icone('trofeu', 22)}</span>
          <div class="lista__corpo">
            <div class="lista__t">${esc(ex ? ex.n : 'Exercício removido')}</div>
            <div class="lista__s num">${esc(Store.textoRecorde(r))} · ${esc(Store.D.relativo(r.peso.data))}</div>
          </div>
          <span class="lista__fim">${icone('direita', 20)}</span>
        </button>`;
      }).join('')}</div>
    </section>`;
  }

  function sheetMusculo(key) {
    const m = Store.MUSCLES[key];
    const s30 = Store.seriesPorMusculo(30)[key];
    const s7 = Store.seriesPorMusculo(7)[key];
    const exs = Store.todosExercicios().filter(e => (e.p || []).includes(key)).slice(0, 10);
    const s = UI.sheet({
      titulo: m.name,
      alto: true,
      html: `<div class="stats mb3">
          ${Comp.stat(UI.fmt(s7), 'séries / 7 dias')}
          ${Comp.stat(UI.fmt(s30), 'séries / 30 dias')}
          ${Comp.stat(Store.alvoDe(key), 'alvo semanal')}
        </div>
        <h3 class="seccao__tit mb3">Exercícios disponíveis</h3>
        <div class="lista">${exs.map(e => Comp.exercicioItem(e)).join('')}</div>`
    });
    s.painel.addEventListener('click', e => {
      const b = e.target.closest('[data-ex]');
      if (b) { UI.fecharSheet(); App.ir('exercicio/' + b.dataset.ex); }
    });
  }
})();
