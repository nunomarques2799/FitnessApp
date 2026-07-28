/* =============================================================
   Vista: Hoje — sugestão do dia, cobertura muscular, resumo
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

      return [
        s.ativo ? cartaoAtivo(s.ativo) : cartaoSugestao(),
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
        const t = Store.comecarTreino(sug.nome, sug.exercicios.map(e => e.ex.id));
        t.splitId = sug.splitId; t.splitDia = sug.splitDia;
        Store.guardar(true);
        UI.haptic('sucesso');
        App.ir('treino');
      });

      const aj = q('[data-ajustar]');
      if (aj) aj.addEventListener('click', () => sheetSugestao());

      const livre = q('[data-livre-b]');
      if (livre) livre.addEventListener('click', comecarLivre);

      raiz.addEventListener('click', e => {
        const m = e.target.closest('[data-musculo]');
        if (m) return sheetMusculo(m.dataset.musculo);
        const t = e.target.closest('[data-treino]');
        if (t) return App.ir('sessao/' + t.dataset.treino);
        const todos = e.target.closest('[data-todos-musculos]');
        if (todos) return sheetTodosMusculos();
      });
    }
  };

  /* ---------- cartões ---------- */

  function cartaoAtivo(a) {
    const min = Math.floor((Date.now() - a.inicio) / 60000);
    const feitas = a.entradas.reduce((n, e) => n + e.series.filter(s => s.feita).length, 0);
    return `<section class="cartao cartao--destaque mb3">
      <div class="cartao__cab">
        <div class="crescer">
          <span class="chip chip--primaria">${icone('chama', 13)}A decorrer</span>
          <h2 class="cartao__tit mt2">${esc(a.nome)}</h2>
          <p class="cartao__sub num">${min} min · ${feitas} série${feitas === 1 ? '' : 's'} concluída${feitas === 1 ? '' : 's'}</p>
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
    if (!sug.exercicios.length) {
      return `<section class="cartao cartao--destaque mb3">
        ${Comp.vazio({
          icone: 'raio', titulo: 'Vamos começar',
          sub: 'Escolhe o teu plano em Ajustes ou começa já um treino livre.'
        })}
        <button type="button" class="btn btn--primario btn--grande btn--bloco" data-livre-b>${icone('play', 20)}Treino livre</button>
      </section>`;
    }

    const linhas = sug.exercicios.map(x => `<li class="entre" style="padding:var(--e2) 0;border-bottom:1px solid var(--borda)">
      <span class="crescer truncar" style="font-weight:600;font-size:var(--t-md)">${esc(x.ex.n)}</span>
      <span class="num" style="font-size:var(--t-sm);color:var(--txt-2);white-space:nowrap">
        ${x.series}×${x.reps[0]}-${x.reps[1]}${x.ex.tempo ? ' seg' : ''}${x.kg ? ' · ' + Store.U.fmt(x.kg) : ''}
        ${x.subir ? `<span class="chip chip--sucesso" style="margin-left:4px">${icone('seta', 11)}subir</span>` : ''}
      </span>
    </li>`).join('');

    return `<section class="cartao cartao--destaque mb3">
      <div class="cartao__cab">
        <div class="crescer">
          <span class="chip chip--primaria">${icone('raio', 13)}Sugestão de hoje</span>
          <h2 class="cartao__tit mt2">${esc(sug.nome)}</h2>
          <p class="cartao__sub">${esc(sug.splitNome)} · ${sug.exercicios.length} exercícios</p>
        </div>
      </div>
      ${sug.alerta ? `<p class="chip chip--aviso mb3" style="white-space:normal;text-align:left;line-height:1.4">${icone('aviso', 14)}${esc(sug.alerta)}</p>` : ''}
      <ul style="margin-bottom:var(--e4)">${linhas}</ul>
      <button type="button" class="btn btn--primario btn--grande btn--bloco" data-comecar>
        ${icone('play', 20)}Começar este treino
      </button>
      <div class="linha mt2" style="gap:var(--e2)">
        <button type="button" class="btn btn--secundario crescer" data-ajustar>${icone('editar', 18)}Ajustar</button>
        <button type="button" class="btn btn--fantasma crescer" data-livre-b>Treino livre</button>
      </div>
    </section>`;
  }

  function resumoSemana() {
    const dias = Store.diasTreinados(7);
    const semana = Store.volumeSemanal(1)[0];
    const seq = Store.sequencia();
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Últimos 7 dias</h2></div>
      <div class="stats">
        ${Comp.stat(dias, dias === 1 ? 'dia treinado' : 'dias treinados')}
        ${Comp.stat(semana.series, 'séries')}
        ${Comp.stat(UI.fmt(Store.U.mostrar(semana.volume), 0), 'volume', Store.U.label())}
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

  /** Ajustar a sugestão antes de começar.
      `estado` preserva o que já foi editado quando se reabre o painel. */
  function sheetSugestao(estado) {
    const sug = Store.sugerirTreino();
    let ids = estado ? estado.ids.slice() : sug.exercicios.map(e => e.ex.id);
    const nomeInicial = estado ? estado.nome : sug.nome;

    const s = UI.sheet({
      titulo: 'Ajustar treino',
      alto: true,
      html: `<div class="campo">
          <label class="campo__l" for="sug-nome">Nome do treino</label>
          <input class="entrada" id="sug-nome" value="${esc(nomeInicial)}" autocomplete="off">
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
        lista.innerHTML = `<p class="texto-corpo" style="padding:var(--e4) 0">Sem exercícios. Adiciona pelo menos um.</p>`;
        return;
      }
      lista.innerHTML = `<div class="lista">${ids.map((id, i) => {
        const ex = Store.exercicio(id);
        if (!ex) return '';
        return `<div class="lista__i">
          <div class="lista__corpo">
            <div class="lista__t">${esc(ex.n)}</div>
            <div class="lista__s">${esc((ex.p || []).map(k => Store.MUSCLES[k].curto).join(' · '))}</div>
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
        setTimeout(() => sheetSugestao({ nome, ids }), 260);
      }), 240);
    });

    s.painel.querySelector('[data-cancelar]').addEventListener('click', () => UI.fecharSheet());
    s.painel.querySelector('[data-ok]').addEventListener('click', () => {
      if (!ids.length) { UI.toast('Adiciona pelo menos um exercício', 'erro'); return; }
      const nome = s.painel.querySelector('#sug-nome').value.trim() || sug.nome;
      const t = Store.comecarTreino(nome, ids);
      t.splitId = sug.splitId; t.splitDia = sug.splitDia;
      Store.guardar(true);
      UI.fecharSheet();
      UI.haptic('sucesso');
      App.ir('treino');
    });

    desenhar();
  }

  /* ---------- sheets de músculo ---------- */

  function sheetMusculo(key) {
    const m = Store.estadoMusculos().find(x => x.key === key);
    if (!m) return;
    const e = Comp.ESTADOS[m.estado];
    const sugeridos = Store.todosExercicios()
      .filter(ex => (ex.p || []).includes(key))
      .sort((a, b) => (b.t === 'C' ? 1 : 0) - (a.t === 'C' ? 1 : 0))
      .slice(0, 8);

    const s = UI.sheet({
      titulo: m.nome,
      alto: true,
      html: `<div class="stats mb3">
          ${Comp.stat(UI.fmt(m.sets), 'séries / 7 dias')}
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
        : `<button type="button" class="btn btn--primario" data-comecar-m>${icone('play', 18)}Treinar ${esc(m.curto)}</button>`
    });

    s.painel.addEventListener('click', ev => {
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
      html: `<p class="texto-corpo mb3" style="font-size:var(--t-md)">Séries realizadas nos últimos 7 dias face ao alvo semanal. Séries em que o músculo é secundário contam como meia série.</p>
        ${html}${Comp.legendaMusculos()}
        ${fora.length ? `<p class="cartao__sub mt4">${icone('info', 14)} A ignorar: ${esc(fora.join(', '))}. Muda em Ajustes.</p>` : ''}`
    });

    s.painel.addEventListener('click', ev => {
      const b = ev.target.closest('[data-musculo]');
      if (b) { UI.fecharSheet(); setTimeout(() => sheetMusculo(b.dataset.musculo), 240); }
    });
  }
})();
