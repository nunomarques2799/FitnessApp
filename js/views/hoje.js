/* =============================================================
   Vista: Hoje — objectivo, sugestão do dia, cobertura muscular
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;

  function saudacao() {
    const h = new Date().getHours();
    if (h < 6) return 'Boa madrugada';
    if (h < 13) return 'Bom dia';
    if (h < 20) return 'Boa tarde';
    return 'Boa noite';
  }

  Vistas.hoje = {
    titulo: () => saudacao(),
    sub: () => {
      const d = new Date();
      return `${Store.D.nomeDia(Store.D.hoje())}, ${d.getDate()} de ${Store.D.nomeMes(d.getMonth())}`;
    },
    accoes: () => `<button type="button" class="btn-icone" data-livre aria-label="Começar treino livre">${icone('mais', 24)}</button>`,

    montarCabecalho(cont) {
      const b = cont.querySelector('[data-livre]');
      if (b) b.addEventListener('click', comecarLivre);
    },

    render() {
      const s = Store.state;
      const musculos = Store.estadoMusculos();
      const atencao = musculos
        .filter(m => m.estado === 'atraso' || m.estado === 'nunca' || m.estado === 'indirecto')
        .sort((a, b) => (b.dias === null ? 999 : b.dias) - (a.dias === null ? 999 : a.dias))
        .slice(0, 5);
      const primeiraVez = !s.treinos.length && !s.ativo && !Store.planoActivo();

      return [
        primeiraVez ? escolhaObjetivo() : '',
        s.ativo ? cartaoAtivo(s.ativo) : cartaoSugestao(),
        accoesRapidas(),
        primeiraVez ? '' : (Store.planoActivo() ? cartaoPlano() : cartaoObjetivo()),
        resumoSemana(),
        cobertura(musculos, atencao),
        ultimosTreinos()
      ].join('');
    },

    montar(raiz) {
      const q = sel => raiz.querySelector(sel);

      const cont = q('[data-continuar]');
      if (cont) cont.addEventListener('click', () => App.ir('treino'));

      const desc = q('[data-descartar]');
      if (desc) desc.addEventListener('click', async () => {
        if (await UI.confirmar({ titulo: 'Descartar treino?', msg: 'As séries registadas neste treino serão perdidas.', ok: 'Descartar', perigo: true })) {
          Store.descartarTreino();
          UI.toast('Treino descartado');
          App.render();
        }
      });

      const com = q('[data-comecar]');
      if (com) com.addEventListener('click', () => {
        const sug = Store.sugerirTreino();
        if (sug.tipo === 'circuito') return comecarCircuito(sug.chave, sug);
        if (sug.tipo === 'plano') {
          Store.comecarPlano(sug.planoDia);
          UI.haptic('sucesso');
          return App.ir('treino');
        }
        const t = Store.comecarTreino(sug.nome, sug.exercicios.map(e => e.ex.id));
        t.splitId = sug.splitId; t.splitDia = sug.splitDia;
        Store.guardar(true);
        UI.haptic('sucesso');
        App.ir('treino');
      });

      const aj = q('[data-ajustar]');
      if (aj) aj.addEventListener('click', () => {
        const sug = Store.sugerirTreino();
        sheetTreino({ nome: sug.nome, ids: sug.exercicios.map(e => e.ex.id), splitId: sug.splitId, splitDia: sug.splitDia });
      });

      raiz.addEventListener('click', e => {
        if (e.target.closest('[data-ver-plano]')) return App.ir('plano');
        if (e.target.closest('[data-livre-b]')) return comecarLivre();
        if (e.target.closest('[data-montar]')) return sheetTreino({ nome: '', ids: [], titulo: 'Montar treino' });
        if (e.target.closest('[data-circuito-b]')) return Comp.escolherCircuito(c => comecarCircuito(c));
        if (e.target.closest('[data-mudar-objetivo]')) return sheetObjetivo();
        const obj = e.target.closest('[data-objetivo]');
        if (obj) return definirObjetivo(obj.dataset.objetivo);
        const m = e.target.closest('[data-musculo]');
        if (m) return sheetMusculo(m.dataset.musculo);
        const t = e.target.closest('[data-treino]');
        if (t) return App.ir('sessao/' + t.dataset.treino);
        if (e.target.closest('[data-todos-musculos]')) return sheetTodosMusculos();
      });
    }
  };

  /* ---------- objectivo ---------- */

  function escolhaObjetivo() {
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">O que queres deste treino?</h2></div>
      <div class="pilha">
        ${Object.keys(Store.OBJETIVOS).map(k => {
          const o = Store.OBJETIVOS[k];
          const activo = Store.state.settings.objetivo === k;
          return `<button type="button" class="cartao objetivo-c ${activo ? 'objetivo-c--activo' : ''}" data-objetivo="${k}">
            <div class="entre">
              <span class="lista__t">${esc(o.name)}</span>
              ${activo ? `<span class="chip chip--primaria">${icone('check', 13)}Escolhido</span>` : ''}
            </div>
            <p class="cartao__sub mt2">${esc(o.desc)}</p>
          </button>`;
        }).join('')}
      </div>
      <p class="campo__ajuda">Podes mudar quando quiseres. A app ajusta as repetições, o descanso e o plano.</p>
    </section>`;
  }

  function cartaoObjetivo() {
    const o = Store.objetivo();
    const s = Store.state.settings;
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Objectivo</h2>
        <button type="button" class="seccao__accao" data-mudar-objetivo>Mudar</button></div>
      <div class="cartao cartao--plano">
        <div class="entre">
          <span class="lista__t">${esc(o.name)}</span>
          <span class="chip num">${s.repsAlvo[0]}–${s.repsAlvo[1]} repetições</span>
        </div>
        <p class="cartao__sub mt2">${esc(o.desc)}</p>
      </div>
    </section>`;
  }

  function definirObjetivo(chave) {
    const o = Store.aplicarObjetivo(chave);
    if (!o) return;
    UI.haptic('sucesso');
    UI.toast(`Objectivo: ${o.name}`, 'sucesso');
    App.render();
  }

  function sheetObjetivo() {
    const sh = UI.sheet({
      titulo: 'Objectivo de treino',
      alto: true,
      html: `<p class="texto-corpo mb3">Ao mudares de objectivo, a app ajusta as repetições,
          o descanso entre séries, o volume semanal e o plano sugerido. Podes afinar tudo em Ajustes.</p>
        <div class="pilha">
          ${Object.keys(Store.OBJETIVOS).map(k => {
            const o = Store.OBJETIVOS[k];
            const activo = Store.state.settings.objetivo === k;
            return `<button type="button" class="cartao objetivo-c ${activo ? 'objetivo-c--activo' : ''}" data-objetivo="${k}">
              <div class="entre">
                <span class="lista__t">${esc(o.name)}</span>
                ${activo ? `<span class="chip chip--primaria">${icone('check', 13)}Actual</span>` : ''}
              </div>
              <p class="cartao__sub mt2">${esc(o.desc)}</p>
              <div class="linha mt3" style="flex-wrap:wrap;gap:6px">
                <span class="chip num">${o.reps[0]}–${o.reps[1]} repetições</span>
                <span class="chip num">${UI.mmss(o.descanso)} de descanso</span>
                <span class="chip">${esc(CATALOGO.SPLITS[o.split].name)}</span>
                ${o.circuitos ? '<span class="chip chip--primaria">Com circuitos</span>' : ''}
              </div>
            </button>`;
          }).join('')}
        </div>`
    });
    sh.painel.addEventListener('click', e => {
      const b = e.target.closest('[data-objetivo]');
      if (!b) return;
      UI.fecharSheet();
      definirObjetivo(b.dataset.objetivo);
    });
  }

  /* ---------- cartões ---------- */

  function cartaoAtivo(a) {
    const min = Math.floor((Date.now() - a.inicio) / 60000);
    const feitas = a.entradas.reduce((n, e) => n + e.series.filter(s => s.feita).length, 0);
    return `<section class="cartao cartao--destaque mb3">
      <div class="cartao__cab">
        <div class="crescer">
          <span class="chip chip--primaria">${icone('chama', 13)}A decorrer</span>
          <h2 class="cartao__tit mt2">${esc(a.nome)}</h2>
          <p class="cartao__sub num">${min} min · ${feitas} ${a.tipo === 'circuito' ? 'estações concluídas' : `série${feitas === 1 ? '' : 's'} concluída${feitas === 1 ? '' : 's'}`}</p>
        </div>
      </div>
      <button type="button" class="btn btn--primario btn--grande btn--bloco" data-continuar>
        ${icone('play', 20)}Continuar treino
      </button>
      <button type="button" class="btn btn--fantasma btn--bloco mt2" data-descartar>Descartar</button>
    </section>`;
  }

  function cartaoSugestao() {
    const sug = Store.sugerirTreino();
    if (sug.tipo === 'circuito') return cartaoCircuito(sug);
    if (!sug.exercicios.length) {
      return `<section class="cartao cartao--destaque mb3">
        ${Comp.vazio({
          icone: 'raio', titulo: 'Vamos começar',
          sub: 'Monta um treino por grupo muscular, escolhe um circuito ou começa um treino livre.'
        })}
        <button type="button" class="btn btn--primario btn--grande btn--bloco" data-montar>${icone('mais', 20)}Montar treino</button>
      </section>`;
    }

    const doPlano = sug.tipo === 'plano';
    const linhas = sug.exercicios.map(x => `<li class="entre" style="padding:var(--e2) 0;border-bottom:1px solid var(--borda)">
      <span class="crescer truncar" style="font-weight:600;font-size:var(--t-md)">${esc(x.ex.n)}</span>
      <span class="num" style="font-size:var(--t-sm);color:var(--txt-2);white-space:nowrap">
        ${x.series}×${x.reps[0]}${x.reps[0] === x.reps[1] ? '' : '-' + x.reps[1]}${x.ex.tempo ? ' seg' : ''}${
          x.max ? ' · máximo' : x.kg ? ' · ' + Store.U.fmt(x.kg) : ''}
        ${x.subir ? `<span class="chip chip--sucesso" style="margin-left:4px">${icone('seta', 11)}subir</span>` : ''}
        ${x.mudou ? `<span class="chip" style="margin-left:4px">antes ${Store.U.fmt(x.anterior)}</span>` : ''}
      </span>
    </li>`).join('');

    return `<section class="cartao cartao--destaque mb3">
      <div class="cartao__cab">
        <div class="crescer">
          <span class="chip chip--primaria">${icone('raio', 13)}${doPlano ? 'Dia ' + esc(sug.dia.k) + ' do plano' : 'Sugestão de hoje'}</span>
          <h2 class="cartao__tit mt2">${esc(doPlano ? sug.dia.nome : sug.nome)}</h2>
          <p class="cartao__sub">${esc(sug.splitNome)} · ${sug.exercicios.length} exercícios</p>
        </div>
      </div>
      ${doPlano && sug.aquecimento ? `<p class="chip chip--multilinha mb3">${icone('chama', 14)}${esc(sug.aquecimento)}</p>` : ''}
      ${doPlano && sug.nota ? `<p class="chip chip--multilinha mb3">${icone('info', 14)}${esc(sug.nota)}</p>` : ''}
      ${sug.alerta ? `<p class="chip chip--aviso chip--multilinha mb3">${icone('aviso', 14)}${esc(sug.alerta)}</p>` : ''}
      <ul style="margin-bottom:var(--e4)">${linhas}</ul>
      <button type="button" class="btn btn--primario btn--grande btn--bloco" data-comecar>
        ${icone('play', 20)}Começar este treino
      </button>
      <div class="linha mt2" style="gap:var(--e2)">
        ${doPlano
          ? `<button type="button" class="btn btn--secundario crescer" data-ver-plano>${icone('lista', 18)}Ver plano</button>`
          : `<button type="button" class="btn btn--secundario crescer" data-ajustar>${icone('editar', 18)}Ajustar</button>`}
        <button type="button" class="btn btn--fantasma crescer" data-livre-b>Treino livre</button>
      </div>
    </section>`;
  }

  /** Como vai o plano embutido, com atalho para o ecrã do plano */
  function cartaoPlano() {
    const e = Store.estadoPlano();
    if (!e) return '';
    const comCarga = e.exercicios.filter(x => x.chao != null);
    const subiram = comCarga.filter(x => x.degraus > 0).length;
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Plano</h2>
        <button type="button" class="seccao__accao" data-ver-plano>Ver plano</button></div>
      <button type="button" class="cartao cartao--plano" data-ver-plano style="text-align:left;width:100%">
        <div class="entre">
          <span class="lista__t">${esc(e.plano.nome)}</span>
          <span class="chip num">Semana ${e.semana} de ${e.plano.semanas}</span>
        </div>
        <p class="cartao__sub mt2">${e.sessoes} ${e.sessoes === 1 ? 'sessão feita' : 'sessões feitas'} ·
          ${subiram} de ${comCarga.length} cargas já subiram um degrau</p>
        <div class="linha mt3" style="flex-wrap:wrap;gap:6px">
          ${e.dias.map(d => `<span class="chip ${d.indice === e.proximo.indice ? 'chip--primaria' : ''} num">${esc(d.k)} · ${d.total}×</span>`).join('')}
        </div>
      </button>
    </section>`;
  }

  function cartaoCircuito(sug) {
    const c = sug.circuito;
    const formato = CATALOGO.FORMATOS[c.formato];
    const linhas = sug.exercicios.map(x => {
      const unidade = x.ex.m === 'distancia' ? 'metros' : x.ex.m === 'calorias' ? 'calorias'
        : x.ex.tempo ? 'segundos' : 'repetições';
      return `<li class="entre" style="padding:var(--e2) 0;border-bottom:1px solid var(--borda)">
        <span class="crescer truncar" style="font-weight:600;font-size:var(--t-md)">${esc(x.ex.n)}</span>
        <span class="num" style="font-size:var(--t-sm);color:var(--txt-2);white-space:nowrap">${x.alvo} ${esc(unidade)}</span>
      </li>`;
    }).join('');

    return `<section class="cartao cartao--destaque mb3">
      <div class="cartao__cab">
        <div class="crescer">
          <span class="chip chip--primaria">${icone('chama', 13)}Circuito de hoje</span>
          <h2 class="cartao__tit mt2">${esc(c.name)}</h2>
          <p class="cartao__sub">${esc(formato.name)} · ${c.rondas} rondas · cerca de ${c.minutos} minutos</p>
        </div>
      </div>
      <p class="texto-corpo mb3" style="font-size:var(--t-md)">${esc(c.desc)}</p>
      <ul style="margin-bottom:var(--e4)">${linhas}</ul>
      <button type="button" class="btn btn--primario btn--grande btn--bloco" data-comecar>
        ${icone('play', 20)}Começar o circuito
      </button>
      <div class="linha mt2" style="gap:var(--e2)">
        <button type="button" class="btn btn--secundario crescer" data-circuito-b>${icone('lista', 18)}Outro circuito</button>
        <button type="button" class="btn btn--fantasma crescer" data-montar>Treino de força</button>
      </div>
    </section>`;
  }

  function accoesRapidas() {
    return `<section class="seccao">
      <div class="accoes-r">
        <button type="button" class="accao-r" data-montar>
          <span class="accao-r__ic">${icone('haltere', 22)}</span>
          <span class="accao-r__t">Montar treino</span>
          <span class="accao-r__s">Por grupo muscular</span>
        </button>
        <button type="button" class="accao-r" data-circuito-b>
          <span class="accao-r__ic">${icone('chama', 22)}</span>
          <span class="accao-r__t">Circuito</span>
          <span class="accao-r__s">Corrida, bola, remo</span>
        </button>
        <button type="button" class="accao-r" data-livre-b>
          <span class="accao-r__ic">${icone('play', 22)}</span>
          <span class="accao-r__t">Treino livre</span>
          <span class="accao-r__s">Começar do zero</span>
        </button>
      </div>
    </section>`;
  }

  function resumoSemana() {
    const dias = Store.diasTreinados(7);
    const semana = Store.volumeSemanal(1)[0];
    const seq = Store.sequencia();
    const cardio = semana.metros;
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Últimos 7 dias</h2></div>
      <div class="stats">
        ${Comp.stat(dias, dias === 1 ? 'dia treinado' : 'dias treinados')}
        ${Comp.stat(semana.series, 'séries')}
        ${cardio
          ? Comp.stat(UI.fmt(cardio, 0), 'distância', 'm')
          : Comp.stat(UI.fmt(Store.U.mostrar(semana.volume), 0), 'volume', Store.U.label())}
        ${Comp.stat(seq, seq === 1 ? 'semana seguida' : 'semanas seguidas')}
      </div>
    </section>`;
  }

  function cobertura(musculos, atencao) {
    const ok = musculos.filter(m => m.estado === 'pronto').length;
    return `<section class="seccao">
      <div class="seccao__cab">
        <h2 class="seccao__tit">Cobertura muscular</h2>
        <button type="button" class="seccao__accao" data-todos-musculos>Ver todos (${musculos.length})</button>
      </div>
      ${atencao.length ? `
        <p class="texto-corpo mb3" style="font-size:var(--t-md)">
          ${atencao.length} grupo${atencao.length > 1 ? 's' : ''} a precisar de atenção · ${ok} em dia
        </p>
        <div class="musculos">${atencao.map(m => Comp.musculo(m)).join('')}</div>
      ` : `
        <div class="cartao cartao--plano">
          <div class="linha">
            <span style="color:var(--sucesso-txt)">${icone('checkCirculo', 24)}</span>
            <div class="crescer">
              <p style="font-weight:650">Todos os grupos em dia</p>
              <p class="cartao__sub">Estás a cobrir o corpo todo nos últimos 7 dias.</p>
            </div>
          </div>
        </div>
      `}
      ${Comp.legendaMusculos()}
    </section>`;
  }

  function ultimosTreinos() {
    const t = Store.state.treinos.slice(0, 3);
    if (!t.length) return '';
    return `<section class="seccao">
      <div class="seccao__cab">
        <h2 class="seccao__tit">Últimos treinos</h2>
        <a class="seccao__accao" href="#/historico">Ver tudo</a>
      </div>
      <div class="lista">${t.map(Comp.treinoItem).join('')}</div>
    </section>`;
  }

  /* ---------- acções ---------- */

  function comecarLivre() {
    if (Store.state.ativo) { App.ir('treino'); return; }
    Store.comecarTreino('Treino livre', []);
    UI.haptic('medio');
    App.ir('treino');
  }

  async function comecarCircuito(chave, sug) {
    if (Store.state.ativo && !(await UI.confirmar({
      titulo: 'Já tens um treino a decorrer',
      msg: 'Queres descartá-lo e começar este circuito?', ok: 'Descartar e começar', perigo: true
    }))) return;
    if (Store.state.ativo) Store.descartarTreino();
    const t = Store.comecarCircuito(chave);
    if (!t) { UI.toast('Circuito não encontrado', 'erro'); return; }
    if (sug) { t.splitId = sug.splitId; t.splitDia = sug.splitDia; Store.guardar(true); }
    UI.haptic('sucesso');
    App.ir('treino');
  }

  /**
   * Montar ou ajustar um treino de força.
   * `estado` preserva o que já foi editado quando se reabre o painel.
   */
  function sheetTreino(estado) {
    let ids = (estado.ids || []).slice();
    const nomeInicial = estado.nome || '';

    const s = UI.sheet({
      titulo: estado.titulo || 'Ajustar treino',
      alto: true,
      html: `<div class="campo">
          <label class="campo__l" for="sug-nome">Nome do treino</label>
          <input class="entrada" id="sug-nome" value="${esc(nomeInicial)}" placeholder="Por exemplo: Costas e bíceps" autocomplete="off">
        </div>
        <div class="seccao__cab"><h3 class="seccao__tit">Exercícios</h3>
          <button type="button" class="seccao__accao" data-add>+ Adicionar</button></div>
        <div data-lista></div>`,
      rodape: `<button type="button" class="btn btn--fantasma" data-cancelar>Cancelar</button>
               <button type="button" class="btn btn--primario" data-ok>Começar</button>`
    });

    const lista = s.painel.querySelector('[data-lista]');
    function desenhar() {
      if (!ids.length) {
        lista.innerHTML = `<div class="cartao cartao--plano">${Comp.vazio({
          icone: 'haltere', titulo: 'Treino vazio',
          sub: 'Toca em Adicionar para escolheres o grupo muscular e os exercícios.'
        })}</div>`;
        return;
      }
      lista.innerHTML = `<div class="lista">${ids.map((id, i) => {
        const ex = Store.exercicio(id);
        if (!ex) return '';
        return `<div class="lista__i">
          ${Anatomia.miniDoExercicio(ex)}
          <div class="lista__corpo">
            <div class="lista__t">${esc(ex.n)}</div>
            <div class="lista__s">${esc(Comp.nomesMusculos(ex.p).join(' e '))}</div>
          </div>
          <span class="lista__fim">
            <button type="button" class="btn-icone" data-sobe="${i}" aria-label="Mover ${esc(ex.n)} para cima" ${i === 0 ? 'disabled' : ''}>${icone('cima', 20)}</button>
            <button type="button" class="btn-icone btn-icone--perigo" data-rem="${i}" aria-label="Remover ${esc(ex.n)}">${icone('lixo', 20)}</button>
          </span>
        </div>`;
      }).join('')}</div>`;
    }

    lista.addEventListener('click', e => {
      const r = e.target.closest('[data-rem]');
      if (r) { ids.splice(+r.dataset.rem, 1); UI.haptic('leve'); desenhar(); return; }
      const u = e.target.closest('[data-sobe]');
      if (u) { const i = +u.dataset.sobe; [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]]; UI.haptic('leve'); desenhar(); }
    });

    s.painel.querySelector('[data-add]').addEventListener('click', () => {
      const nome = s.painel.querySelector('#sug-nome').value;
      UI.fecharSheet();
      setTimeout(() => Comp.escolherExercicio(id => {
        ids.push(id);
        // reabre o painel com o que já estava editado
        setTimeout(() => sheetTreino({ ...estado, nome, ids }), 260);
      }), 240);
    });

    s.painel.querySelector('[data-cancelar]').addEventListener('click', () => UI.fecharSheet());
    s.painel.querySelector('[data-ok]').addEventListener('click', () => {
      if (!ids.length) { UI.toast('Adiciona pelo menos um exercício', 'erro'); return; }
      const nome = s.painel.querySelector('#sug-nome').value.trim() || nomeDoTreino(ids);
      const t = Store.comecarTreino(nome, ids);
      if (estado.splitId) { t.splitId = estado.splitId; t.splitDia = estado.splitDia; }
      Store.guardar(true);
      UI.fecharSheet();
      UI.haptic('sucesso');
      App.ir('treino');
    });

    desenhar();
  }

  /** Nome automático a partir dos grupos musculares escolhidos */
  function nomeDoTreino(ids) {
    const grupos = [];
    ids.forEach(id => {
      const ex = Store.exercicio(id);
      (ex && ex.p || []).forEach(m => {
        const g = Store.MUSCLES[m] && Store.MUSCLES[m].grupo;
        if (g && !grupos.includes(g)) grupos.push(g);
      });
    });
    if (!grupos.length) return 'Treino livre';
    return grupos.slice(0, 3).map(g => Store.GRUPOS[g].name).join(' e ');
  }

  /* ---------- sheets de músculo ---------- */

  function sheetMusculo(key) {
    const m = Store.estadoMusculos(true).find(x => x.key === key);
    if (!m) return;
    const e = Comp.ESTADOS[m.estado];
    const sugeridos = Store.todosExercicios()
      .filter(ex => (ex.p || []).includes(key) && !ex.cond)
      .sort((a, b) => (b.t === 'C' ? 1 : 0) - (a.t === 'C' ? 1 : 0))
      .slice(0, 8);

    const s = UI.sheet({
      titulo: m.nome,
      alto: true,
      html: `<div class="an-solo mb3">${Anatomia.mini([key], [], { vista: Anatomia.melhorVista([key], []) })}</div>
        <div class="stats mb3">
          ${Comp.stat(UI.fmt(m.sets), 'séries em 7 dias')}
          ${Comp.stat(m.alvo, 'alvo semanal')}
          ${Comp.stat(m.dias === null ? '—' : m.dias, m.dias === 1 ? 'dia desde' : 'dias desde')}
        </div>
        <p class="chip ${e.chip} mb3" style="white-space:normal;text-align:left;line-height:1.4">
          ${icone(m.estado === 'pronto' ? 'checkCirculo' : (m.estado === 'atraso' || m.estado === 'indirecto' || m.estado === 'nunca') ? 'aviso' : 'relogio', 14)}${esc(e.label)} — ${esc(e.desc)}</p>
        <div class="musculos mb3">${Comp.musculo(m)}</div>
        <h3 class="seccao__tit mt4 mb3">Exercícios para ${esc(m.nome.toLowerCase())}</h3>
        <div class="lista">${sugeridos.map(ex => Comp.exercicioItem(ex, { accao: Store.state.ativo ? 'add' : null })).join('')}</div>`,
      rodape: Store.state.ativo
        ? `<button type="button" class="btn btn--secundario" data-fechar-x>Fechar</button>`
        : `<button type="button" class="btn btn--primario" data-comecar-m>${icone('play', 18)}Treinar ${esc(m.nome.toLowerCase())}</button>`
    });

    s.painel.addEventListener('click', ev => {
      const det = ev.target.closest('[data-detalhe]');
      if (det) return Comp.detalhes(det.dataset.detalhe);
      const b = ev.target.closest('[data-ex]');
      if (b) {
        if (Store.state.ativo) {
          Store.state.ativo.entradas.push(Store.criarEntrada(b.dataset.ex));
          Store.guardar(true);
          UI.haptic('sucesso');
          UI.fecharSheet();
          App.ir('treino');
        } else {
          App.ir('exercicio/' + b.dataset.ex);
          UI.fecharSheet();
        }
      }
    });

    const fx = s.painel.querySelector('[data-fechar-x]');
    if (fx) fx.addEventListener('click', () => UI.fecharSheet());

    const cm = s.painel.querySelector('[data-comecar-m]');
    if (cm) cm.addEventListener('click', () => {
      Store.comecarTreino(m.nome, sugeridos.slice(0, 4).map(x => x.id));
      UI.fecharSheet();
      UI.haptic('sucesso');
      App.ir('treino');
    });
  }

  function sheetTodosMusculos() {
    const musculos = Store.estadoMusculos();
    const zonas = CATALOGO.ZONAS;
    const html = Object.keys(zonas).map(z => {
      const lista = musculos.filter(m => m.zona === z);
      if (!lista.length) return '';
      return `<h3 class="seccao__tit mt4 mb3">${esc(zonas[z].name)}</h3>
        <div class="musculos">${lista.map(m => Comp.musculo(m)).join('')}</div>`;
    }).join('');
    const fora = (Store.state.settings.musculosIgnorados || [])
      .map(k => Store.MUSCLES[k] && Store.MUSCLES[k].name).filter(Boolean);

    const s = UI.sheet({
      titulo: 'Todos os grupos musculares',
      alto: true,
      html: `<p class="texto-corpo mb3" style="font-size:var(--t-md)">Séries realizadas nos últimos 7 dias face ao alvo semanal.
          Séries em que o músculo é secundário contam como meia série. Os exercícios de condição física
          não entram nesta contagem.</p>
        ${html}${Comp.legendaMusculos()}
        ${fora.length ? `<p class="cartao__sub mt4">${icone('info', 14)} A ignorar: ${esc(fora.join(', '))}. Muda em Ajustes.</p>` : ''}`
    });

    s.painel.addEventListener('click', ev => {
      const b = ev.target.closest('[data-musculo]');
      if (b) { UI.fecharSheet(); setTimeout(() => sheetMusculo(b.dataset.musculo), 240); }
    });
  }
})();
