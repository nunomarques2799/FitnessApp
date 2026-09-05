/* =============================================================
   Vistas: Biblioteca de exercícios e detalhe do exercício
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;

  let grupo = null, parte = null, pega = null, especial = null, procura = '';

  /* ================= BIBLIOTECA ================= */
  Vistas.exercicios = {
    titulo: () => grupo ? Store.GRUPOS[grupo].name : 'Exercícios',
    sub: () => {
      if (grupo) {
        const n = listaDoGrupo().length;
        return `${n} exercício${n === 1 ? '' : 's'}`;
      }
      return `${Store.todosExercicios().length} exercícios na biblioteca`;
    },
    accoes: () => `${grupo || especial ? `<button type="button" class="btn-icone" data-voltar-g aria-label="Voltar aos grupos">${icone('voltar', 22)}</button>` : ''}
      <button type="button" class="btn-icone" data-novo aria-label="Criar exercício personalizado">${icone('mais', 24)}</button>`,

    montarCabecalho(cont) {
      const b = cont.querySelector('[data-novo]');
      if (b) b.addEventListener('click', () => Comp.criarExercicio(id => App.ir('exercicio/' + id)));
      const v = cont.querySelector('[data-voltar-g]');
      if (v) v.addEventListener('click', () => { grupo = null; parte = null; pega = null; especial = null; App.render(); });
    },

    render() {
      return `<div class="procura-wrap mb3">
          ${icone('procurar', 20)}
          <input class="entrada" type="search" inputmode="search" placeholder="Procurar exercício…"
                 aria-label="Procurar exercício" value="${esc(procura)}" data-procura>
        </div>
        <div data-resultados>${resultados()}</div>`;
    },

    montar(raiz) {
      const input = raiz.querySelector('[data-procura]');
      const res = raiz.querySelector('[data-resultados]');

      input.addEventListener('input', () => {
        clearTimeout(input._t);
        input._t = setTimeout(() => { procura = input.value.trim(); redesenhar(); }, 140);
      });

      function redesenhar() {
        res.innerHTML = resultados();
        document.getElementById('cab-titulo').textContent = Vistas.exercicios.titulo();
        const sub = document.getElementById('cab-sub');
        sub.textContent = Vistas.exercicios.sub();
        sub.hidden = false;
        document.getElementById('cab-accoes').innerHTML = Vistas.exercicios.accoes();
        Vistas.exercicios.montarCabecalho(document.getElementById('cab-accoes'));
      }

      raiz.addEventListener('click', e => {
        const det = e.target.closest('[data-detalhe]');
        if (det) return Comp.detalhes(det.dataset.detalhe, { aoRenomear: () => App.render() });

        const g = e.target.closest('[data-grupo]');
        if (g) { grupo = g.dataset.grupo; parte = null; pega = null; especial = null; UI.haptic('leve'); return redesenhar(); }

        const esp = e.target.closest('[data-especial]');
        if (esp) { especial = esp.dataset.especial; grupo = null; pega = null; UI.haptic('leve'); return redesenhar(); }

        const v = e.target.closest('[data-voltar-grupos]');
        if (v) { grupo = null; parte = null; pega = null; especial = null; UI.haptic('leve'); return redesenhar(); }

        const p = e.target.closest('[data-parte]');
        if (p) { parte = p.dataset.parte || null; pega = null; UI.haptic('leve'); return redesenhar(); }

        const pg = e.target.closest('[data-pega]');
        if (pg) { pega = pg.dataset.pega || null; UI.haptic('leve'); return redesenhar(); }

        const b = e.target.closest('[data-ex]');
        if (b) return App.ir('exercicio/' + b.dataset.ex);

        const n = e.target.closest('[data-vazio-accao]');
        if (n) return Comp.criarExercicio(id => App.ir('exercicio/' + id));
      });
    }
  };

  /** Exercícios do grupo escolhido, já com o filtro da parte e da pega */
  function listaDoGrupo() {
    const lista = Store.exerciciosDoGrupo(grupo, parte);
    return pega ? lista.filter(e => e.pg === pega) : lista;
  }

  function resultados() {
    if (procura) {
      const lista = Comp.procurarExercicios(procura);
      return listaHtml(lista, `${lista.length} resultado${lista.length === 1 ? '' : 's'}`);
    }

    if (especial) {
      const lista = Comp.listaEspecial(especial);
      if (!lista.length) {
        return Comp.vazio({
          icone: especial === 'fav' ? 'estrela' : 'editar',
          titulo: especial === 'fav' ? 'Ainda sem favoritos' : 'Ainda não criaste exercícios',
          sub: especial === 'fav'
            ? 'Abre um exercício e toca na estrela para o teres sempre à mão.'
            : 'Cria um exercício personalizado se o teu ginásio tiver uma máquina diferente.',
          accao: especial === 'fav' ? null : 'Criar exercício'
        });
      }
      return cabecalhoVoltar(Comp.tituloDeEspecial(especial)) +
        (especial === 'uni' ? `<p class="cartao__sub mb3">${icone('info', 14)} ${esc(CATALOGO.UNI_AJUDA)}</p>` : '') +
        listaHtml(lista);
    }

    if (grupo) {
      const g = Store.GRUPOS[grupo];
      const todos = Store.exerciciosDoGrupo(grupo, parte);
      const lista = listaDoGrupo();
      return cabecalhoVoltar(g.name) +
        Comp.filtrosParte(grupo, parte) +
        Comp.descricaoParte(grupo, parte) +
        Comp.filtrosPega(todos, pega) +
        descricaoPega() +
        (lista.length
          ? listaHtml(lista)
          : Comp.vazio({ icone: 'procurar', titulo: 'Nada com este filtro', sub: 'Escolhe outra parte do músculo, outra pega, ou cria um exercício.', accao: 'Criar exercício' }));
    }

    return `<p class="texto-corpo mb3">Escolhe o grupo muscular. Dentro de cada um podes afinar
        que parte queres trabalhar e com que pega.</p>
      ${Comp.grelhaGrupos(Comp.cartoesEspeciais())}`;
  }

  function descricaoPega() {
    const p = pega && CATALOGO.PEGAS[pega];
    return p ? `<p class="cartao__sub mb3">${icone('info', 14)} ${esc(p.desc)}</p>` : '';
  }

  function cabecalhoVoltar(titulo) {
    return `<div class="entre mb3">
      <button type="button" class="btn btn--fantasma btn--pequeno" data-voltar-grupos>${icone('esquerda', 18)}Grupos</button>
      <h2 class="grupo-tit grupo-tit--livre">${esc(titulo)}</h2>
    </div>`;
  }

  function listaHtml(lista, titulo) {
    if (!lista.length) {
      return Comp.vazio({
        icone: 'procurar', titulo: 'Nada encontrado',
        sub: 'Tenta outro termo ou cria um exercício personalizado.',
        accao: 'Criar exercício'
      });
    }
    return `${titulo ? `<p class="seccao__tit mb3">${esc(titulo)}</p>` : ''}
      <div class="lista">${lista.map(e => Comp.exercicioItem(e)).join('')}</div>`;
  }

  /* ================= DETALHE ================= */
  Vistas.exercicio = {
    titulo: id => { const e = Store.exercicio(id); return e ? e.n : 'Exercício'; },
    sub: id => {
      const e = Store.exercicio(id);
      if (!e) return '';
      return Comp.nomesMusculos(e.p).join(' · ');
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
      const info = window.EXECUCAO ? EXECUCAO.de(id) : null;
      const secundarios = Comp.nomesMusculos(ex.s);
      const reps = Store.repsDe(ex);
      const unidade = ex.m === 'distancia' ? 'metros' : ex.m === 'calorias' ? 'calorias'
        : ex.tempo ? 'segundos' : 'repetições';

      return `<section class="cartao mb3">
          ${Anatomia.doExercicio(ex)}
          <div class="linha mt3" style="flex-wrap:wrap;gap:var(--e2)">
            ${Comp.chipsExercicio(ex)}
            <span class="chip num">${reps[0]}–${reps[1]} ${esc(unidade)}</span>
            ${ex.cond ? '<span class="chip chip--aviso">Condição física</span>' : ''}
            ${ex.custom ? '<span class="chip chip--sucesso">Personalizado</span>' : ''}
          </div>
          ${prog ? `<p class="chip ${prog.subir ? 'chip--sucesso' : ''} mt3" style="white-space:normal;text-align:left">
              ${icone(prog.subir ? 'seta' : 'alvo', 14)}
              ${prog.subir ? `Da última vez completaste tudo — tenta ${Store.U.fmt(prog.kg)}` : `Próxima carga de referência: ${Store.U.fmt(prog.kg)}`}
            </p>` : ''}
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Como se faz</h2></div>
          <div class="cartao">
            ${info ? `<ol class="passos">${info.passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>`
              : `<p class="texto-corpo">Este exercício foi criado por ti, por isso não traz instruções.
                 Usa as notas do treino para apontares o que quiseres lembrar.</p>`}
            ${info && info.erro ? `<div class="aviso-cx mt4">
              <span class="aviso-cx__ic">${icone('aviso', 20)}</span>
              <div><p class="aviso-cx__t">Erro mais comum</p><p class="aviso-cx__s">${esc(info.erro)}</p></div>
            </div>` : ''}
            ${Comp.notasPega(ex)}
          </div>
        </section>

        ${rec ? blocoRecordes(ex, rec) : ''}
        ${grafico(ex, hist, rec)}

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Histórico</h2></div>
          ${hist.length ? `<div class="pilha">${hist.slice(0, 20).map(h => sessaoHtml(h, ex)).join('')}</div>`
          : `<div class="cartao">${Comp.vazio({ icone: 'haltere', titulo: 'Ainda sem registos', sub: 'Adiciona este exercício a um treino para começares a acompanhar a evolução.' })}</div>`}
        </section>

        <button type="button" class="btn btn--primario btn--bloco btn--grande mt4" data-adicionar>
          ${icone('mais', 20)}${Store.state.ativo ? 'Juntar ao treino a decorrer' : 'Começar treino com este exercício'}
        </button>
        <button type="button" class="btn btn--secundario btn--bloco mt2" data-renomear>
          ${icone('editar', 18)}Mudar o nome
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
          UI.toast('Juntado ao treino', 'sucesso');
          App.ir('treino');
        } else {
          const ex = Store.exercicio(id);
          Store.comecarTreino(ex.n, [id]);
          UI.haptic('sucesso');
          App.ir('treino');
        }
      });

      const ren = raiz.querySelector('[data-renomear]');
      if (ren) ren.addEventListener('click', () => Comp.renomearExercicio(id));

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

  function blocoRecordes(ex, rec) {
    const met = ex.m || 'peso';
    let caixas;
    if (met === 'distancia') {
      caixas = Comp.stat(UI.fmt(rec.distancia ? rec.distancia.valor : 0, 0), 'melhor série', 'm') +
        Comp.stat(UI.fmt(rec.melhorTotal, 0), 'melhor sessão', 'm') +
        Comp.stat(rec.sessoes, rec.sessoes === 1 ? 'sessão' : 'sessões');
    } else if (met === 'calorias') {
      caixas = Comp.stat(UI.fmt(rec.calorias ? rec.calorias.valor : 0, 0), 'melhor série', 'cal') +
        Comp.stat(UI.fmt(rec.melhorTotal, 0), 'melhor sessão', 'cal') +
        Comp.stat(rec.sessoes, rec.sessoes === 1 ? 'sessão' : 'sessões');
    } else if (met === 'tempo') {
      caixas = Comp.stat(rec.tempo ? UI.mmss(rec.tempo.valor) : '—', 'melhor tempo') +
        Comp.stat(rec.semCarga ? '—' : Store.U.fmt(rec.peso.kg, true), 'carga extra', rec.semCarga ? '' : Store.U.label()) +
        Comp.stat(rec.sessoes, rec.sessoes === 1 ? 'sessão' : 'sessões');
    } else if (rec.semCarga) {
      caixas = Comp.stat(rec.reps.reps, 'melhor série', 'repetições') +
        Comp.stat(rec.sessoes, rec.sessoes === 1 ? 'sessão' : 'sessões');
    } else {
      caixas = Comp.stat(Store.U.fmt(rec.peso.kg, true), 'peso máximo', Store.U.label()) +
        Comp.stat(UI.fmt(Store.U.mostrar(rec.rmValor), 0), '1 repetição máxima estimada', Store.U.label()) +
        Comp.stat(UI.fmt(Store.U.mostrar(rec.volume), 0), 'melhor volume', Store.U.label()) +
        Comp.stat(rec.sessoes, rec.sessoes === 1 ? 'sessão' : 'sessões');
    }

    const corpo = Store.pesoCorporal();
    const relativa = corpo && rec.rmValor && !rec.semCarga && met !== 'distancia' && met !== 'calorias'
      ? `<p class="cartao__sub mt2">Isso é <strong>${esc(UI.fmt(rec.rmValor / corpo, 2))}×</strong> o teu peso
         (${esc(Store.U.fmt(corpo))}).</p>`
      : '';

    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Recordes pessoais</h2></div>
      <div class="stats">${caixas}</div>
      <p class="cartao__sub mt3">Melhor registo: ${esc(Store.textoRecorde(rec, ex))}</p>
      ${relativa}
    </section>`;
  }

  function grafico(ex, hist, rec) {
    if (hist.length < 2) return '';
    const met = ex.m || 'peso';
    let pontos, titulo, nota;

    if (met === 'distancia' || met === 'calorias') {
      const chave = met === 'distancia' ? 'm' : 'cal';
      const un = met === 'distancia' ? 'metros' : 'calorias';
      titulo = met === 'distancia' ? 'Metros por sessão' : 'Calorias por sessão';
      nota = 'Soma de todas as séries de cada sessão.';
      pontos = hist.slice(0, 12).reverse().map(h => ({
        label: Store.D.curto(h.data), valor: Math.round(h.total[chave]),
        curto: UI.fmt(h.total[chave], 0), aria: `${UI.fmt(h.total[chave], 0)} ${un}`
      }));
    } else if (met === 'tempo') {
      titulo = 'Melhor tempo por sessão (segundos)';
      nota = 'A série mais longa de cada sessão.';
      pontos = hist.slice(0, 12).reverse().map(h => {
        const v = Math.max(...h.series.map(s => s.seg || s.reps || 0));
        return { label: Store.D.curto(h.data), valor: v, curto: String(v), aria: `${v} segundos` };
      });
    } else if (rec && !rec.semCarga) {
      titulo = `1 repetição máxima estimada (${Store.U.label()})`;
      nota = 'Fórmula de Epley a partir da melhor série de cada sessão.';
      pontos = hist.slice(0, 12).reverse().map(h => ({
        label: Store.D.curto(h.data),
        valor: Math.round(Store.U.mostrar(h.melhor.rm) * 10) / 10,
        curto: UI.fmt(Store.U.mostrar(h.melhor.rm), 0),
        aria: `${UI.fmt(Store.U.mostrar(h.melhor.rm))} ${Store.U.label()} estimado`
      }));
    } else {
      titulo = 'Repetições por sessão';
      nota = 'Soma das repetições de todas as séries.';
      pontos = hist.slice(0, 12).reverse().map(h => ({
        label: Store.D.curto(h.data), valor: h.total.reps,
        curto: String(h.total.reps), aria: `${h.total.reps} repetições`
      }));
    }

    if (pontos.every(p => !p.valor)) return '';
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">${esc(titulo)}</h2></div>
      <div class="cartao">${Charts.linha(pontos, { aria: titulo })}
        <p class="cartao__sub mt3">${esc(nota)}</p>
      </div>
    </section>`;
  }

  function sessaoHtml(h, ex) {
    const met = ex.m || 'peso';
    const resumo = met === 'distancia' ? `${UI.fmt(h.total.m, 0)} m`
      : met === 'calorias' ? `${UI.fmt(h.total.cal, 0)} cal`
      : met === 'tempo' ? UI.mmss(h.total.seg)
      : `${UI.fmt(Store.U.mostrar(h.volume), 0)} ${Store.U.label()}`;

    return `<button type="button" class="cartao cartao--plano" data-treino="${h.treinoId}" style="text-align:left;width:100%">
      <div class="entre mb3">
        <span style="font-weight:700;font-size:var(--t-md)">${esc(Store.D.curto(h.data))} · ${esc(Store.D.relativo(h.data))}</span>
        <span class="chip num">${esc(resumo)}</span>
      </div>
      <div class="linha" style="flex-wrap:wrap;gap:6px">
        ${h.series.map(s => `<span class="chip num">${esc(textoSerie(s, ex))}</span>`).join('')}
      </div>
    </button>`;
  }

  function textoSerie(s, ex) {
    const met = ex.m || 'peso';
    if (met === 'distancia') return `${UI.fmt(s.m, 0)} m${s.seg ? ' · ' + UI.mmss(s.seg) : ''}`;
    if (met === 'calorias') return `${UI.fmt(s.cal, 0)} cal${s.seg ? ' · ' + UI.mmss(s.seg) : ''}`;
    if (met === 'tempo') return `${s.reps || 0} s${s.kg ? ' · ' + Store.U.fmt(s.kg) : ''}`;
    const rir = s.rir != null ? ` · RIR ${s.rir}` : '';
    if (!s.kg) return `${s.reps || 0} repetições${rir}`;
    return `${Store.U.fmt(s.kg, true)}×${s.reps}${rir}`;
  }

  Vistas.exercicios.textoSerie = textoSerie;
})();
