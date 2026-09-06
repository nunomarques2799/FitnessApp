/* =============================================================
   Vista: Plano — o plano embutido e como ele vai ao longo do tempo
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;
  const D = Store.D;

  Vistas.plano = {
    titulo: () => {
      const P = Store.plano();
      return P ? P.nome : 'Plano';
    },
    sub: () => {
      const e = Store.estadoPlano();
      if (!e) return 'Sem plano activo';
      return `Semana ${e.semana} de ${e.plano.semanas} · ${e.sessoes} ${e.sessoes === 1 ? 'sessão feita' : 'sessões feitas'}`;
    },
    accoes: () => `<button type="button" class="btn-icone" data-voltar aria-label="Voltar">${icone('voltar', 22)}</button>
      <button type="button" class="btn-icone" data-relatorio aria-label="Relatório da semana">${icone('descarregar', 22)}</button>`,

    montarCabecalho(cont) {
      const v = cont.querySelector('[data-voltar]');
      if (v) v.addEventListener('click', () => App.voltar('hoje'));
      const r = cont.querySelector('[data-relatorio]');
      if (r) r.addEventListener('click', () => sheetRelatorio());
    },

    render() {
      const e = Store.estadoPlano();
      if (!e) {
        return Comp.vazio({
          icone: 'lista', titulo: 'Plano desligado',
          sub: 'Liga o plano em Ajustes para a app passar a propor os dias A a E com as cargas escritas.',
          accao: 'Ir para Ajustes'
        });
      }
      return proximoCartao(e) + rotacao(e) + cargas(e) + volume(e) + controlo(e) + regras(e);
    },

    montar(raiz) {
      const b = raiz.querySelector('[data-vazio-accao]');
      if (b) return b.addEventListener('click', () => App.ir('ajustes'));

      raiz.addEventListener('click', ev => {
        if (ev.target.closest('[data-relatorio-b]')) return sheetRelatorio();
        const c = ev.target.closest('[data-comecar-dia]');
        if (c) return comecarDia(+c.dataset.comecarDia);
        const x = ev.target.closest('[data-ex]');
        if (x) return App.ir('exercicio/' + x.dataset.ex);
      });
    }
  };

  /* ---------- próximo dia ---------- */
  function proximoCartao(e) {
    const sug = Store.sugerirPlano();
    if (!sug) return '';
    const linhas = sug.exercicios.map(x => `<li class="entre" style="padding:var(--e2) 0;border-bottom:1px solid var(--borda)">
      <span class="crescer truncar" style="font-weight:600;font-size:var(--t-md)">${esc(x.ex.n)}</span>
      <span class="num" style="font-size:var(--t-sm);color:var(--txt-2);white-space:nowrap">
        ${x.series}×${x.reps[0]}${x.reps[0] === x.reps[1] ? '' : '-' + x.reps[1]}${x.ex.tempo ? ' seg' : ''}${x.max ? ' · máximo' : x.kg ? ' · ' + Store.U.fmt(x.kg) : ''}
        ${x.subir ? `<span class="chip chip--sucesso" style="margin-left:4px">${icone('seta', 11)}subir</span>` : ''}
      </span>
    </li>`).join('');

    return `<section class="cartao cartao--destaque mb3">
      <div class="cartao__cab">
        <div class="crescer">
          <span class="chip chip--primaria">${icone('raio', 13)}A seguir</span>
          <h2 class="cartao__tit mt2">${esc(sug.nome)}</h2>
          <p class="cartao__sub">${sug.exercicios.length} exercícios · ${sug.exercicios.reduce((n, x) => n + x.series, 0)} séries</p>
        </div>
      </div>
      ${sug.aquecimento ? `<p class="chip chip--multilinha mb3">${icone('chama', 14)}${esc(sug.aquecimento)}</p>` : ''}
      ${sug.nota ? `<p class="chip chip--multilinha mb3">${icone('info', 14)}${esc(sug.nota)}</p>` : ''}
      <ul style="margin-bottom:var(--e4)">${linhas}</ul>
      <button type="button" class="btn btn--primario btn--grande btn--bloco" data-comecar-dia="${sug.planoDia}">
        ${icone('play', 20)}Começar o dia ${esc(sug.dia.k)}
      </button>
    </section>`;
  }

  /* ---------- roda dos cinco dias ---------- */
  function rotacao(e) {
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Os cinco dias</h2></div>
      <p class="campo__ajuda" style="margin:0 0 var(--e3)">${esc(e.plano.rotacao)}. Toca num dia para o fazer fora da ordem.</p>
      <div class="lista">${e.dias.map(d => {
        const proximo = d.indice === e.proximo.indice;
        return `<button type="button" class="lista__i" data-comecar-dia="${d.indice}">
          <span class="estacao__n num" aria-hidden="true">${esc(d.k)}</span>
          <div class="lista__corpo">
            <div class="lista__t">${esc(d.nome)}${d.livre ? ' <span class="chip">livre</span>' : ''}</div>
            <div class="lista__s">
              <span>${d.ultima ? esc(D.relativo(d.ultima)) : 'Ainda não fizeste'}</span>
              <span class="chip num">${d.total}×</span>
              ${proximo ? `<span class="chip chip--primaria">${icone('raio', 12)}a seguir</span>` : ''}
            </div>
          </div>
          <span class="lista__fim">${icone('play', 20)}</span>
        </button>`;
      }).join('')}</div>
    </section>`;
  }

  /* ---------- cargas: chão do plano, onde estás, degraus ---------- */
  function cargas(e) {
    const comCarga = e.exercicios.filter(x => x.chao != null);
    const semCarga = e.exercicios.filter(x => x.chao == null);
    const subiram = comCarga.filter(x => x.degraus > 0).length;

    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Cargas</h2></div>
      <p class="campo__ajuda" style="margin:0 0 var(--e3)">
        As cargas escritas no plano são o chão da primeira sessão. Daí para a frente manda o que registas:
        ${subiram ? `<strong>${subiram} de ${comCarga.length}</strong> já subiram pelo menos um degrau.`
        : 'ainda nenhuma subiu um degrau.'}
        A barra enche a quatro degraus, o que é uma boa colheita em 8 semanas.
      </p>
      <div class="musculos">${comCarga.map(x => {
        // a barra conta degraus ganhos sobre o chão, com quatro como horizonte das 8 semanas
        const pct = Math.max(0, Math.min(1, (x.degraus || 0) / 4));
        const estado = x.actual == null ? 'nunca' : x.degraus > 0 ? 'pronto' : x.degraus < 0 ? 'atraso' : 'recuperar';
        return `<button type="button" class="musculo est-${estado}" data-ex="${x.id}"
          aria-label="${esc(x.nome)}: plano ${Store.U.fmt(x.chao)}, agora ${x.actual ? Store.U.fmt(x.actual) : 'sem registo'}${
            x.degraus ? `, ${x.degraus} degraus` : ''}">
          <span class="musculo__n">${esc(x.nome)}</span>
          <span class="musculo__meta num">${x.actual ? Store.U.fmt(x.actual) : 'sem registo'}${
            x.degraus ? ` · ${x.degraus > 0 ? '+' : ''}${x.degraus} degrau${Math.abs(x.degraus) === 1 ? '' : 's'}` : ` · chão ${Store.U.fmt(x.chao, true)}`}</span>
          <span class="musculo__barra"><span class="musculo__fill" style="width:${Math.round(pct * 100)}%"></span></span>
        </button>`;
      }).join('')}</div>
      ${semCarga.length ? `<p class="campo__ajuda">Sem carga escrita: ${esc(semCarga.map(x => x.nome).join(', '))}.</p>` : ''}
      <button type="button" class="btn btn--secundario btn--bloco mt3" data-relatorio-b>
        ${icone('descarregar', 18)}Relatório da semana
      </button>
    </section>`;
  }

  /* ---------- volume da última rotação ---------- */
  function volume(e) {
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Volume da última rotação</h2></div>
      <div class="stats mb3">
        ${Comp.stat(e.sessoesSemana, e.sessoesSemana === 1 ? 'sessão' : 'sessões', 'em 7 dias')}
        ${Comp.stat(e.seriesRotacao, 'séries do plano', 'de ' + e.seriesPrevistas)}
        ${Comp.stat(e.semana, 'semana', 'de ' + e.plano.semanas)}
      </div>
      <div class="musculos">${e.volume.map(v => {
        const pct = Math.min(1, v.sets / (v.alvo || 1));
        const estado = pct >= 0.9 ? 'pronto' : pct >= 0.6 ? 'recuperar' : v.sets ? 'atraso' : 'nunca';
        return `<div class="musculo est-${estado}">
          <span class="musculo__n">${esc(v.nome)}</span>
          <span class="musculo__meta num">${v.sets}/${v.alvo}</span>
          <span class="musculo__barra"><span class="musculo__fill" style="width:${Math.round(pct * 100)}%"></span></span>
        </div>`;
      }).join('')}</div>
      <p class="campo__ajuda">Séries feitas nas últimas ${e.rotacaoSessoes} sessões do plano, contra as que
        os cinco dias prescrevem. Conta só as séries de trabalho dos exercícios do plano, cada uma no músculo
        principal do exercício — a mesma conta que o plano faz.
        No papel está escrito ${esc(e.volume.map(v => `${v.nome.toLowerCase()} ${v.escrito}`).join(', '))}.</p>
    </section>`;
  }

  /* ---------- ponto de controlo ---------- */
  function controlo(e) {
    const c = e.plano.controlo;
    const chegou = e.semana >= c.semana;
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Controlo da semana ${c.semana}</h2></div>
      <div class="cartao">
        <p class="texto-corpo" style="font-size:var(--t-md)">${esc(c.texto)}</p>
        <div class="pilha mt3">
          ${e.controlo.map(x => `<div class="entre">
            <span style="font-size:var(--t-md);font-weight:600">${esc(x.nome)}</span>
            <span class="chip ${x.subiu ? 'chip--sucesso' : chegou ? 'chip--aviso' : ''} num">
              ${x.degraus == null ? 'sem registo' : `${x.degraus > 0 ? '+' : ''}${x.degraus} degrau${Math.abs(x.degraus) === 1 ? '' : 's'}`}
            </span>
          </div>`).join('')}
        </div>
        <p class="campo__ajuda">${chegou
          ? 'Já estás na semana do controlo — olha para os dois números acima.'
          : `Faltam ${c.semana - e.semana} semana${c.semana - e.semana === 1 ? '' : 's'} para esta verificação.`}</p>
      </div>
    </section>`;
  }

  /* ---------- regras do plano ---------- */
  function regras(e) {
    return `<section class="seccao">
      <div class="seccao__cab"><h2 class="seccao__tit">Como progredir</h2></div>
      <div class="cartao">
        <ul class="texto-corpo" style="font-size:var(--t-md);padding-left:1.1em;list-style:disc">
          ${e.plano.regras.map(r => `<li style="margin-bottom:var(--e2)">${esc(r)}</li>`).join('')}
        </ul>
        <hr class="divisor">
        <p class="cartao__sub">${esc(e.plano.origem)}. Versão ${e.plano.versao}, revista a ${esc(D.curto(e.plano.revisto))}.</p>
        <p class="cartao__sub mt2">${esc(e.plano.notasDaRevisao)}</p>
      </div>
    </section>`;
  }

  /* ---------- acções ---------- */
  async function comecarDia(indice) {
    if (Store.state.ativo && !(await UI.confirmar({
      titulo: 'Já tens um treino a decorrer',
      msg: 'Queres descartá-lo e começar este dia do plano?', ok: 'Descartar e começar', perigo: true
    }))) return;
    if (Store.state.ativo) Store.descartarTreino();
    const t = Store.comecarPlano(indice);
    if (!t) { UI.toast('Não foi possível montar este dia', 'erro'); return; }
    UI.haptic('sucesso');
    App.ir('treino');
  }

  /** Relatório em texto para exportar e rever o plano ao fim da semana */
  function sheetRelatorio() {
    let recuar = 0;
    const sh = UI.sheet({
      titulo: 'Relatório da semana',
      alto: true,
      html: `<div class="segmento mb3" role="group" aria-label="Semana">
          <button type="button" class="segmento__b" data-semana="0" aria-pressed="true">Esta semana</button>
          <button type="button" class="segmento__b" data-semana="1" aria-pressed="false">Anterior</button>
        </div>
        <pre class="relatorio" data-texto></pre>
        <p class="campo__ajuda">Partilha este texto para reverem o plano. Junta-lhe a cópia de segurança
          completa em Ajustes → Exportar treinos se quiseres os dados todos.</p>`,
      rodape: `<button type="button" class="btn btn--secundario" data-copiar>${icone('duplicar', 18)}Copiar</button>
               <button type="button" class="btn btn--primario" data-partilhar>${icone('descarregar', 18)}Partilhar</button>`
    });

    const pre = sh.painel.querySelector('[data-texto]');
    function desenhar() {
      pre.textContent = Store.relatorioPlano(recuar) || 'Sem treinos nesta semana.';
      sh.painel.querySelectorAll('[data-semana]').forEach(b =>
        b.setAttribute('aria-pressed', String(+b.dataset.semana === recuar)));
    }
    desenhar();

    sh.painel.querySelectorAll('[data-semana]').forEach(b => b.addEventListener('click', () => {
      recuar = +b.dataset.semana;
      UI.haptic('leve');
      desenhar();
    }));

    sh.painel.querySelector('[data-copiar]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent);
        UI.haptic('sucesso');
        UI.toast('Relatório copiado', 'sucesso');
      } catch (err) {
        UI.toast('O telemóvel não deixou copiar — usa Partilhar', 'erro');
      }
    });

    sh.painel.querySelector('[data-partilhar]').addEventListener('click', async () => {
      const texto = pre.textContent;
      const nome = `plano-semana-${Store.semanaDoPlano() - recuar}.md`;
      const ficheiro = new File([texto], nome, { type: 'text/markdown' });
      if (navigator.canShare && navigator.canShare({ files: [ficheiro] })) {
        try {
          await navigator.share({ files: [ficheiro], title: 'Relatório da semana' });
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
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
