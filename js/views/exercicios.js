/* =============================================================
   Vistas: Biblioteca de exercícios e detalhe do exercício
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;

  let filtro = null, procura = '';

  function normalizar(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* ================= BIBLIOTECA ================= */
  Vistas.exercicios = {
    titulo: () => 'Exercícios',
    sub: () => `${Store.todosExercicios().length} disponíveis`,
    accoes: () => `<button type="button" class="btn-icone" data-novo aria-label="Criar exercício personalizado">${icone('mais', 24)}</button>`,

    montarCabecalho(cont) {
      const b = cont.querySelector('[data-novo]');
      if (b) b.addEventListener('click', () => Comp.criarExercicio(id => App.ir('exercicio/' + id)));
    },

    render() {
      const musculos = Object.keys(Store.MUSCLES);
      return `<div class="procura-wrap mb3">
          ${icone('procurar', 20)}
          <input class="entrada" type="search" inputmode="search" placeholder="Procurar exercício…"
                 aria-label="Procurar exercício" value="${esc(procura)}" data-procura>
        </div>
        <div class="filtros" role="group" aria-label="Filtrar exercícios">
          <button type="button" class="filtro" data-f="" aria-pressed="${!filtro}">Todos</button>
          <button type="button" class="filtro" data-f="fav" aria-pressed="${filtro === 'fav'}">${icone('estrela', 14)}Favoritos</button>
          <button type="button" class="filtro" data-f="meus" aria-pressed="${filtro === 'meus'}">Os meus</button>
          ${musculos.map(k => `<button type="button" class="filtro" data-f="${k}" aria-pressed="${filtro === k}">${esc(Store.MUSCLES[k].curto)}</button>`).join('')}
        </div>
        <div data-resultados>${resultados()}</div>`;
    },

    montar(raiz) {
      const input = raiz.querySelector('[data-procura]');
      const res = raiz.querySelector('[data-resultados]');

      input.addEventListener('input', () => {
        clearTimeout(input._t);
        input._t = setTimeout(() => { procura = input.value; res.innerHTML = resultados(); }, 140);
      });

      raiz.querySelectorAll('.filtro').forEach(b => b.addEventListener('click', () => {
        filtro = b.dataset.f || null;
        raiz.querySelectorAll('.filtro').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        UI.haptic('leve');
        res.innerHTML = resultados();
      }));

      raiz.addEventListener('click', e => {
        const b = e.target.closest('[data-ex]');
        if (b) App.ir('exercicio/' + b.dataset.ex);
        const n = e.target.closest('[data-vazio-accao]');
        if (n) Comp.criarExercicio(id => App.ir('exercicio/' + id));
      });
    }
  };

  function resultados() {
    let lista = Store.todosExercicios();
    if (filtro === 'fav') lista = lista.filter(e => Store.state.favoritos.includes(e.id));
    else if (filtro === 'meus') lista = lista.filter(e => e.custom);
    else if (filtro) lista = lista.filter(e => (e.p || []).includes(filtro) || (e.s || []).includes(filtro));
    if (procura) {
      const q = normalizar(procura);
      lista = lista.filter(e => normalizar(e.n).includes(q));
    }

    if (!lista.length) {
      return Comp.vazio({
        icone: 'procurar',
        titulo: filtro === 'fav' ? 'Sem favoritos' : filtro === 'meus' ? 'Sem exercícios teus' : 'Nada encontrado',
        sub: filtro === 'fav'
          ? 'Abre um exercício e toca na estrela para o teres sempre à mão.'
          : 'Cria um exercício personalizado se o teu ginásio tiver uma máquina diferente.',
        accao: filtro === 'fav' ? null : 'Criar exercício'
      });
    }

    // agrupa por músculo principal quando não há procura
    if (!procura && !filtro) {
      const grupos = {};
      lista.forEach(e => {
        const k = (e.p && e.p[0]) || 'outros';
        (grupos[k] = grupos[k] || []).push(e);
      });
      return Object.keys(Store.MUSCLES).filter(k => grupos[k]).map(k =>
        `<h2 class="grupo-tit">${esc(Store.MUSCLES[k].name)} <span style="color:var(--txt-3);font-weight:600">· ${grupos[k].length}</span></h2>
         <div class="lista">${grupos[k].map(e => Comp.exercicioItem(e)).join('')}</div>`
      ).join('');
    }

    return `<p class="seccao__tit mb3">${lista.length} resultado${lista.length > 1 ? 's' : ''}</p>
      <div class="lista">${lista.map(e => Comp.exercicioItem(e)).join('')}</div>`;
  }

  /* ================= DETALHE ================= */
  Vistas.exercicio = {
    titulo: id => { const e = Store.exercicio(id); return e ? e.n : 'Exercício'; },
    sub: id => {
      const e = Store.exercicio(id);
      if (!e) return '';
      return (e.p || []).map(k => Store.MUSCLES[k].name).join(' · ');
    },
    accoes: id => {
      const fav = Store.state.favoritos.includes(id);
      return `<button type="button" class="btn-icone" data-voltar aria-label="Voltar">${icone('voltar', 22)}</button>
        <button type="button" class="btn-icone ${fav ? 'btn-icone--activo' : ''}" data-fav
                aria-pressed="${fav}" aria-label="${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${icone('estrela', 22)}</button>`;
    },

    montarCabecalho(cont, id) {
      const v = cont.querySelector('[data-voltar]');
      if (v) v.addEventListener('click', () => App.voltar('exercicios'));
      const f = cont.querySelector('[data-fav]');
      if (f) f.addEventListener('click', () => {
        const agora = Store.alternarFavorito(id);
        f.setAttribute('aria-pressed', String(agora));
        f.classList.toggle('btn-icone--activo', agora);
        f.setAttribute('aria-label', agora ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
        UI.haptic('leve');
        UI.toast(agora ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
      });
    },

    render(id) {
      const ex = Store.exercicio(id);
      if (!ex) return Comp.vazio({ icone: 'procurar', titulo: 'Exercício não encontrado', accao: 'Ver biblioteca' });

      const rec = Store.recordes(id);
      const hist = Store.historicoExercicio(id);
      const prog = Store.sugerirProgressao(id);
      const secundarios = (ex.s || []).map(k => Store.MUSCLES[k] && Store.MUSCLES[k].name).filter(Boolean);

      const pontos = hist.slice(0, 12).reverse().map(h => ({
        label: Store.D.curto(h.data),
        valor: Math.round(Store.U.mostrar(h.melhor.rm) * 10) / 10,
        curto: UI.fmt(Store.U.mostrar(h.melhor.rm), 0),
        aria: `${UI.fmt(Store.U.mostrar(h.melhor.rm))} ${Store.U.label()} estimado`
      }));

      return `<section class="cartao mb3">
          <div class="linha" style="flex-wrap:wrap;gap:var(--e2)">
            <span class="chip chip--primaria">${esc(CATALOGO.EQUIPAMENTO[ex.e] || ex.e)}</span>
            <span class="chip">${ex.t === 'C' ? 'Composto' : 'Isolamento'}</span>
            <span class="chip num">${Store.repsDe(ex)[0]}–${Store.repsDe(ex)[1]} ${ex.tempo ? 'seg' : 'reps'}</span>
            ${ex.custom ? '<span class="chip chip--sucesso">Personalizado</span>' : ''}
          </div>
          ${secundarios.length ? `<p class="cartao__sub mt3">Também trabalha: ${esc(secundarios.join(', '))}</p>` : ''}
          ${prog ? `<p class="chip ${prog.subir ? 'chip--sucesso' : ''} mt3" style="white-space:normal;text-align:left">
              ${icone(prog.subir ? 'seta' : 'alvo', 14)}
              ${prog.subir ? `Da última vez completaste tudo — tenta ${Store.U.fmt(prog.kg)}` : `Próxima carga de referência: ${Store.U.fmt(prog.kg)}`}
            </p>` : ''}
        </section>

        ${rec ? `<section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Recordes pessoais</h2></div>
          <div class="stats">
            ${rec.semCarga
              ? Comp.stat(rec.reps.reps, 'melhor série', 'reps')
              : Comp.stat(Store.U.fmt(rec.peso.kg, true), 'peso máx.', Store.U.label())}
            ${rec.semCarga
              ? Comp.stat(rec.sessoes, rec.sessoes === 1 ? 'sessão' : 'sessões')
              : Comp.stat(UI.fmt(Store.U.mostrar(rec.rmValor), 0), '1RM est.', Store.U.label())}
            ${Comp.stat(UI.fmt(Store.U.mostrar(rec.volume), 0), 'melhor volume', Store.U.label())}
            ${rec.semCarga ? '' : Comp.stat(rec.sessoes, rec.sessoes === 1 ? 'sessão' : 'sessões')}
          </div>
          <p class="cartao__sub mt3">${rec.semCarga
            ? `Melhor série: ${rec.reps.reps} reps em ${esc(Store.D.curto(rec.reps.data))}`
            : `Peso máximo: ${Store.U.fmt(rec.peso.kg)} × ${rec.peso.reps} em ${esc(Store.D.curto(rec.peso.data))}`}</p>
        </section>` : ''}

        ${pontos.length >= 2 && !rec.semCarga ? `<section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">1RM estimado (${esc(Store.U.label())})</h2></div>
          <div class="cartao">${Charts.linha(pontos, { aria: 'Evolução do 1RM estimado' })}
            <p class="cartao__sub mt3">Fórmula de Epley a partir da melhor série de cada sessão.</p>
          </div>
        </section>` : ''}

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Histórico</h2></div>
          ${hist.length ? `<div class="pilha">${hist.slice(0, 20).map(sessaoHtml).join('')}</div>`
          : `<div class="cartao">${Comp.vazio({ icone: 'haltere', titulo: 'Ainda sem registos', sub: 'Adiciona este exercício a um treino para começares a acompanhar a evolução.' })}</div>`}
        </section>

        <button type="button" class="btn btn--primario btn--bloco btn--grande mt4" data-adicionar>
          ${icone('mais', 20)}${Store.state.ativo ? 'Adicionar ao treino a decorrer' : 'Começar treino com este exercício'}
        </button>
        ${ex.custom ? `<button type="button" class="btn btn--perigo-fantasma btn--bloco mt2" data-apagar>${icone('lixo', 18)}Apagar exercício</button>` : ''}`;
    },

    montar(raiz, id) {
      const b = raiz.querySelector('[data-vazio-accao]');
      if (b) return b.addEventListener('click', () => App.ir('exercicios'));

      const add = raiz.querySelector('[data-adicionar]');
      if (add) add.addEventListener('click', () => {
        if (Store.state.ativo) {
          Store.state.ativo.entradas.push(Store.criarEntrada(id));
          Store.guardar(true);
          UI.haptic('sucesso');
          UI.toast('Adicionado ao treino', 'sucesso');
          App.ir('treino');
        } else {
          const ex = Store.exercicio(id);
          Store.comecarTreino(ex.n, [id]);
          UI.haptic('sucesso');
          App.ir('treino');
        }
      });

      const ap = raiz.querySelector('[data-apagar]');
      if (ap) ap.addEventListener('click', async () => {
        const ex = Store.exercicio(id);
        if (!(await UI.confirmar({
          titulo: 'Apagar exercício?',
          msg: `"${ex.n}" sai da biblioteca. Os treinos já registados mantêm-se, mas deixam de mostrar o nome.`,
          ok: 'Apagar', perigo: true
        }))) return;
        Store.apagarExercicioCustom(id);
        UI.toast('Exercício apagado');
        App.ir('exercicios', true);
      });

      raiz.addEventListener('click', e => {
        const t = e.target.closest('[data-treino]');
        if (t) App.ir('sessao/' + t.dataset.treino);
      });
    }
  };

  function sessaoHtml(h) {
    return `<button type="button" class="cartao cartao--plano" data-treino="${h.treinoId}" style="text-align:left;width:100%">
      <div class="entre mb3">
        <span style="font-weight:700;font-size:var(--t-md)">${esc(Store.D.curto(h.data))} · ${esc(Store.D.relativo(h.data))}</span>
        <span class="chip num">${UI.fmt(Store.U.mostrar(h.volume), 0)} ${esc(Store.U.label())}</span>
      </div>
      <div class="linha" style="flex-wrap:wrap;gap:6px">
        ${h.series.map(s => `<span class="chip num">${Store.U.fmt(s.kg, true)}×${s.reps}</span>`).join('')}
      </div>
    </button>`;
  }
})();
