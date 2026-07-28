/* =============================================================
   Treinos — Componentes reutilizáveis (devolvem HTML)
   ============================================================= */
(function (global) {
  'use strict';
  const esc = UI.esc, icone = UI.icone;

  const ESTADOS = {
    pronto:    { label: 'Pronto',         chip: 'chip--sucesso', desc: 'Recuperado e dentro do volume' },
    recuperar: { label: 'A recuperar',    chip: 'chip',          desc: 'Treinado há pouco tempo' },
    atraso:    { label: 'Em atraso',      chip: 'chip--aviso',   desc: 'Sem estímulo suficiente' },
    indirecto: { label: 'Só indirecto',   chip: 'chip--aviso',   desc: 'Só trabalhado como músculo secundário' },
    nunca:     { label: 'Nunca treinado', chip: 'chip--perigo',  desc: 'Ainda sem registos' }
  };

  function normalizar(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /** Nomes dos músculos, por extenso */
  function nomesMusculos(chaves) {
    return (chaves || []).map(k => Store.MUSCLES[k] && Store.MUSCLES[k].name).filter(Boolean);
  }

  /** Linha de músculo com barra de volume semanal */
  function musculo(m, opts) {
    opts = opts || {};
    const e = ESTADOS[m.estado];
    const dias = m.estado === 'indirecto' ? 'só indirecto'
      : m.dias === null ? 'sem registo'
      : m.dias === 0 ? 'hoje'
      : m.dias === 1 ? 'ontem'
      : `há ${m.dias} dias`;
    const ultima = m.dias === null
      ? (m.estado === 'indirecto' ? 'nunca como músculo principal' : 'sem registo')
      : `último estímulo directo ${dias}`;
    return `<button type="button" class="musculo est-${m.estado}" data-musculo="${m.key}"
      aria-label="${esc(m.nome)}: ${e.label}, ${UI.fmt(m.sets)} de ${m.alvo} séries ${opts.periodo || 'esta semana'}, ${ultima}">
      <span class="musculo__n"><i class="musculo__pt" aria-hidden="true"></i>${esc(m.nome)}</span>
      <span class="musculo__meta num">${UI.fmt(m.sets)}/${m.alvo} · ${dias}</span>
      <span class="musculo__barra"><span class="musculo__fill" style="width:${Math.round(m.pct * 100)}%"></span></span>
    </button>`;
  }

  function legendaMusculos() {
    return `<p class="legenda" role="note">
      <span><i style="background:var(--sucesso)"></i>Pronto</span>
      <span><i style="background:var(--info)"></i>A recuperar</span>
      <span><i style="background:var(--aviso)"></i>Em atraso ou só indirecto</span>
      <span><i style="background:var(--borda-forte)"></i>Sem registo</span>
    </p>`;
  }

  /** Item de exercício para listas, com figura dos músculos trabalhados */
  function exercicioItem(ex, opts) {
    opts = opts || {};
    const fav = Store.state.favoritos.includes(ex.id);
    const musc = nomesMusculos(ex.p).join(' e ');
    const rec = Store.indiceRecordes()[ex.id];
    const etiqueta = Store.melhorEtiqueta(ex, rec);
    return `<div class="lista__i lista__i--ex">
      <button type="button" class="lista__princ" data-ex="${ex.id}">
        ${Anatomia.miniDoExercicio(ex)}
        <span class="lista__corpo">
          <span class="lista__t">${esc(ex.n)}${fav ? ' ' + icone('estrela', 13, 'em-linha') : ''}</span>
          <span class="lista__s">
            <span>${esc(musc)}</span>
            <span class="chip">${esc(CATALOGO.EQUIPAMENTO[ex.e] || ex.e)}</span>
            ${etiqueta ? `<span class="chip chip--primaria num">${esc(etiqueta)}</span>` : ''}
          </span>
        </span>
        <span class="lista__fim">${opts.accao === 'add' ? icone('mais', 22, 'cor-primaria') : icone('direita', 20)}</span>
      </button>
      <button type="button" class="btn-icone lista__info" data-detalhe="${ex.id}"
              aria-label="Como se faz: ${esc(ex.n)}">${icone('info', 20)}</button>
    </div>`;
  }

  /** Item de treino no histórico */
  function treinoItem(t) {
    const vol = Store.volumeTreino(t);
    const nSeries = Store.seriesTreino(t);
    const cardio = Store.trabalhoCardio(t);
    return `<button type="button" class="lista__i" data-treino="${t.id}">
      <div class="lista__corpo">
        <div class="lista__t">${t.tipo === 'circuito' ? icone('chama', 14, 'em-linha') + ' ' : ''}${esc(t.nome)}</div>
        <div class="lista__s">
          <span>${esc(Store.D.relativo(t.data))} · ${esc(Store.D.curto(t.data))}</span>
          <span class="chip num">${t.entradas.length} exercícios</span>
          <span class="chip num">${nSeries} séries</span>
          ${vol ? `<span class="chip num">${UI.fmt(Store.U.mostrar(vol), 0)} ${Store.U.label()}</span>` : ''}
          ${cardio.metros ? `<span class="chip num">${UI.fmt(cardio.metros, 0)} m</span>` : ''}
        </div>
      </div>
      <span class="lista__fim">${icone('direita', 20)}</span>
    </button>`;
  }

  function vazio(o) {
    return `<div class="vazio">
      <div class="vazio__ic">${icone(o.icone || 'haltere', 30)}</div>
      <div>
        <p class="vazio__t">${esc(o.titulo)}</p>
        ${o.sub ? `<p class="vazio__s mt2">${esc(o.sub)}</p>` : ''}
      </div>
      ${o.accao ? `<button type="button" class="btn btn--primario" data-vazio-accao>${icone('mais', 20)}${esc(o.accao)}</button>` : ''}
    </div>`;
  }

  function stat(valor, label, unidade) {
    // role="img" + aria-label faz o leitor de ecrã ler "3 dias treinados" numa só frase
    return `<div class="stat" role="img" aria-label="${esc(valor)} ${esc(unidade || '')} ${esc(label)}">
      <div class="stat__v num" aria-hidden="true">${esc(valor)}${unidade ? `<span class="stat__u"> ${esc(unidade)}</span>` : ''}</div>
      <div class="stat__l" aria-hidden="true">${esc(label)}</div>
    </div>`;
  }

  /** Cartão de um grupo muscular, com a figura dos músculos que o compõem */
  function grupoCartao(chave, n) {
    const g = Store.GRUPOS[chave];
    return `<button type="button" class="grupo-c" data-grupo="${chave}"
      aria-label="${esc(g.name)}: ${n} exercícios">
      <span class="grupo-c__fig" aria-hidden="true">${Anatomia.mini(g.musculos, [], { vista: chave === 'costas' ? 'costas' : undefined })}</span>
      <span class="grupo-c__n">${esc(g.name)}</span>
      <span class="grupo-c__s num">${n} exercícios</span>
    </button>`;
  }

  /** Grelha com todos os grupos musculares */
  function grelhaGrupos(extra) {
    const n = Store.contagemPorGrupo();
    return `<div class="grupos">
      ${Object.keys(Store.GRUPOS).map(k => grupoCartao(k, n[k])).join('')}
      ${extra || ''}
    </div>`;
  }

  /** Filtros das partes de um grupo muscular */
  function filtrosParte(grupo, activa) {
    const g = Store.GRUPOS[grupo];
    if (!g) return '';
    return `<div class="filtros" role="group" aria-label="Que parte de ${esc(g.name.toLowerCase())} queres trabalhar">
      <button type="button" class="filtro" data-parte="" aria-pressed="${!activa}">Tudo</button>
      ${g.partes.map(p => `<button type="button" class="filtro" data-parte="${p.k}"
        aria-pressed="${activa === p.k}">${esc(p.name)}</button>`).join('')}
    </div>`;
  }

  /** Descrição da parte seleccionada */
  function descricaoParte(grupo, parte) {
    const g = Store.GRUPOS[grupo];
    if (!g || !parte) return '';
    const p = g.partes.find(x => x.k === parte);
    return p ? `<p class="cartao__sub mb3">${icone('info', 14)} ${esc(p.desc)}</p>` : '';
  }

  /* =============================================================
     Selector de exercícios: grupo muscular → parte → exercício
     ============================================================= */
  function escolherExercicio(aoEscolher, opts) {
    opts = opts || {};
    let grupo = opts.grupo || null;
    let parte = opts.parte || null;
    let especial = null;             // 'fav' | 'meus'
    let procura = '';

    const s = UI.sheet({
      titulo: opts.titulo || 'Escolher exercício',
      alto: true,
      html: `<div class="procura-wrap mb3">
          ${icone('procurar', 20)}
          <input class="entrada" type="search" inputmode="search" placeholder="Procurar exercício…"
                 aria-label="Procurar exercício" data-procura>
        </div>
        <div data-conteudo></div>`,
      rodape: `<button type="button" class="btn btn--secundario" data-novo>${icone('mais', 20)}Criar exercício</button>`
    });

    const cont = s.painel.querySelector('[data-conteudo]');
    const input = s.painel.querySelector('[data-procura]');

    function desenhar() {
      if (procura) return desenharResultados(filtrarProcura());
      if (especial) return desenharResultados(filtrarEspecial(), tituloEspecial());
      if (grupo) return desenharGrupo();
      cont.innerHTML = `<p class="seccao__tit mb3">Escolhe o grupo muscular</p>
        ${grelhaGrupos(`
          <button type="button" class="grupo-c grupo-c--simples" data-especial="fav">
            <span class="grupo-c__ic">${icone('estrela', 26)}</span>
            <span class="grupo-c__n">Favoritos</span>
            <span class="grupo-c__s num">${Store.state.favoritos.length} exercícios</span>
          </button>
          <button type="button" class="grupo-c grupo-c--simples" data-especial="meus">
            <span class="grupo-c__ic">${icone('editar', 26)}</span>
            <span class="grupo-c__n">Os meus</span>
            <span class="grupo-c__s num">${Store.state.exerciciosCustom.length} exercícios</span>
          </button>`)}`;
    }

    function desenharGrupo() {
      const g = Store.GRUPOS[grupo];
      const lista = Store.exerciciosDoGrupo(grupo, parte);
      cont.innerHTML = `<div class="entre mb3">
          <button type="button" class="btn btn--fantasma btn--pequeno" data-voltar-grupos>${icone('esquerda', 18)}Grupos</button>
          <h3 class="grupo-tit grupo-tit--livre">${esc(g.name)}</h3>
        </div>
        ${filtrosParte(grupo, parte)}
        ${descricaoParte(grupo, parte)}
        ${lista.length
          ? `<p class="seccao__tit mb3">${lista.length} exercício${lista.length > 1 ? 's' : ''}</p>
             <div class="lista">${lista.map(e => exercicioItem(e, { accao: 'add' })).join('')}</div>`
          : vazio({ icone: 'procurar', titulo: 'Nada nesta parte', sub: 'Escolhe outra parte do músculo ou cria um exercício.' })}`;
    }

    function desenharResultados(lista, titulo) {
      if (!lista.length) {
        cont.innerHTML = vazio({
          icone: 'procurar', titulo: 'Nenhum exercício encontrado',
          sub: 'Tenta outro termo ou cria um exercício personalizado.'
        });
        return;
      }
      cont.innerHTML = `${titulo ? `<div class="entre mb3">
          <button type="button" class="btn btn--fantasma btn--pequeno" data-voltar-grupos>${icone('esquerda', 18)}Grupos</button>
          <h3 class="grupo-tit grupo-tit--livre">${esc(titulo)}</h3></div>` : ''}
        <p class="seccao__tit mb3">${lista.length} exercício${lista.length > 1 ? 's' : ''}</p>
        <div class="lista">${lista.slice(0, 120).map(e => exercicioItem(e, { accao: 'add' })).join('')}</div>`;
    }

    function filtrarProcura() {
      const q = normalizar(procura);
      return Store.todosExercicios().filter(e => normalizar(e.n).includes(q));
    }
    function filtrarEspecial() {
      return especial === 'fav'
        ? Store.todosExercicios().filter(e => Store.state.favoritos.includes(e.id))
        : Store.state.exerciciosCustom.slice();
    }
    function tituloEspecial() { return especial === 'fav' ? 'Favoritos' : 'Os meus exercícios'; }

    input.addEventListener('input', () => {
      clearTimeout(input._t);
      input._t = setTimeout(() => { procura = input.value.trim(); desenhar(); }, 140);
    });

    cont.addEventListener('click', e => {
      const det = e.target.closest('[data-detalhe]');
      if (det) return detalhes(det.dataset.detalhe, { aoAdicionar: aoEscolher });

      const g = e.target.closest('[data-grupo]');
      if (g) { grupo = g.dataset.grupo; parte = null; especial = null; UI.haptic('leve'); return desenhar(); }

      const esp = e.target.closest('[data-especial]');
      if (esp) { especial = esp.dataset.especial; grupo = null; UI.haptic('leve'); return desenhar(); }

      const v = e.target.closest('[data-voltar-grupos]');
      if (v) { grupo = null; parte = null; especial = null; UI.haptic('leve'); return desenhar(); }

      const p = e.target.closest('[data-parte]');
      if (p) {
        parte = p.dataset.parte || null;
        UI.haptic('leve');
        return desenharGrupo();
      }

      const b = e.target.closest('[data-ex]');
      if (!b) return;
      UI.haptic('medio');
      aoEscolher(b.dataset.ex);
      if (!opts.manterAberto) UI.fecharSheet();
      else UI.toast('Adicionado', 'sucesso');
    });

    s.painel.querySelector('[data-novo]').addEventListener('click', () => {
      UI.fecharSheet();
      setTimeout(() => criarExercicio(id => aoEscolher(id)), 240);
    });

    desenhar();
    return s;
  }

  /* =============================================================
     Detalhes do exercício: figura, execução e erros comuns
     ============================================================= */
  function detalhes(exId, opts) {
    opts = opts || {};
    const ex = Store.exercicio(exId);
    if (!ex) return;
    const info = global.EXECUCAO ? EXECUCAO.de(exId) : null;
    const rec = Store.recordes(exId);
    const reps = Store.repsDe(ex);
    const met = Store.metricaDe(ex);
    const unidade = ex.m === 'distancia' ? 'metros' : ex.m === 'calorias' ? 'calorias'
      : ex.tempo ? 'segundos' : 'repetições';
    // vindo do selector, escolher aqui equivale a escolher na lista
    const podeJuntar = !!opts.aoAdicionar || !!Store.state.ativo;

    const sh = UI.sheet({
      titulo: ex.n,
      alto: true,
      html: `${Anatomia.doExercicio(ex)}

        <div class="linha mb3" style="flex-wrap:wrap;gap:var(--e2)">
          <span class="chip chip--primaria">${esc(CATALOGO.EQUIPAMENTO[ex.e] || ex.e)}</span>
          <span class="chip">${ex.t === 'C' ? 'Composto' : 'Isolamento'}</span>
          <span class="chip num">${reps[0]}–${reps[1]} ${esc(unidade)}</span>
          ${ex.cond ? '<span class="chip chip--aviso">Condição física</span>' : ''}
          ${ex.custom ? '<span class="chip chip--sucesso">Personalizado</span>' : ''}
        </div>

        <h3 class="seccao__tit mb3">Como se faz</h3>
        ${info ? `<ol class="passos">${info.passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>`
          : `<p class="texto-corpo mb3">Este exercício é teu, por isso não traz instruções.
             Escreve nas notas do treino o que quiseres lembrar da próxima vez.</p>`}

        ${info && info.erro ? `<div class="aviso-cx mt4">
          <span class="aviso-cx__ic">${icone('aviso', 20)}</span>
          <div><p class="aviso-cx__t">Erro mais comum</p><p class="aviso-cx__s">${esc(info.erro)}</p></div>
        </div>` : ''}

        <h3 class="seccao__tit mt4 mb3">Como registar</h3>
        <p class="texto-corpo">Cada série pede <strong>${esc(met.a.label.toLowerCase())}</strong>
          e <strong>${esc(met.b.label.toLowerCase())}</strong>.</p>

        ${rec ? `<h3 class="seccao__tit mt4 mb3">O teu melhor registo</h3>
          <div class="stats">
            ${stat(Store.textoRecorde(rec, ex), 'melhor série')}
            ${stat(rec.sessoes, rec.sessoes === 1 ? 'sessão' : 'sessões')}
          </div>` : ''}`,
      rodape: `<button type="button" class="btn btn--secundario" data-hist>${icone('grafico', 18)}Histórico</button>
        ${podeJuntar ? `<button type="button" class="btn btn--primario" data-add>${icone('mais', 18)}Escolher este</button>` : ''}`
    });

    sh.painel.querySelector('[data-hist]').addEventListener('click', () => {
      UI.fecharSheet();
      App.ir('exercicio/' + exId);
    });
    const add = sh.painel.querySelector('[data-add]');
    if (add) add.addEventListener('click', () => {
      UI.haptic('sucesso');
      UI.fecharSheet();
      if (opts.aoAdicionar) { opts.aoAdicionar(exId); return; }
      Store.state.ativo.entradas.push(Store.criarEntrada(exId));
      Store.guardar(true);
      UI.toast('Juntado ao treino', 'sucesso');
      App.ir('treino');
    });
    return sh;
  }

  /* =============================================================
     Escolher um circuito
     ============================================================= */
  function circuitoCartao(c) {
    const estacoes = c.estacoes.map(e => Store.exercicio(e.ex)).filter(Boolean);
    return `<button type="button" class="cartao cartao--plano circuito-c" data-circuito="${c.chave}">
      <div class="entre mb2">
        <span class="lista__t">${esc(c.name)}</span>
        <span class="chip chip--primaria num">${c.minutos} min</span>
      </div>
      <p class="cartao__sub" style="margin-bottom:var(--e3)">${esc(c.desc)}</p>
      <div class="linha" style="flex-wrap:wrap;gap:6px">
        <span class="chip">${esc(CATALOGO.FORMATOS[c.formato].name)}</span>
        <span class="chip num">${c.rondas} rondas</span>
        <span class="chip">${esc(c.nivel)}</span>
      </div>
      <p class="cartao__sub mt3">${esc(estacoes.map(e => e.n).join(' · '))}</p>
    </button>`;
  }

  function escolherCircuito(aoEscolher) {
    const lista = Store.circuitosSugeridos();
    const todos = Object.keys(Store.CIRCUITOS).map(k => ({ chave: k, ...Store.CIRCUITOS[k] }));
    const outros = todos.filter(c => !lista.some(x => x.chave === c.chave));

    const sh = UI.sheet({
      titulo: 'Escolher circuito',
      alto: true,
      html: `<p class="texto-corpo mb3">Treinos híbridos: corres, agachas, atiras a bola à parede e remas,
          tudo seguido. Escolhe um e a app conta as rondas por ti.</p>
        <h3 class="seccao__tit mb3">Para o teu objectivo</h3>
        <div class="pilha">${lista.map(circuitoCartao).join('')}</div>
        ${outros.length ? `<h3 class="seccao__tit mt4 mb3">Outros circuitos</h3>
          <div class="pilha">${outros.map(circuitoCartao).join('')}</div>` : ''}`
    });

    sh.painel.addEventListener('click', e => {
      const b = e.target.closest('[data-circuito]');
      if (!b) return;
      UI.haptic('medio');
      UI.fecharSheet();
      aoEscolher(b.dataset.circuito);
    });
    return sh;
  }

  /* =============================================================
     Formulário de criação de exercício personalizado
     ============================================================= */
  function criarExercicio(aoCriar) {
    const musculos = Object.keys(Store.MUSCLES);
    const s = UI.sheet({
      titulo: 'Novo exercício',
      alto: true,
      html: `<form data-form novalidate>
        <div class="campo">
          <label class="campo__l" for="ne-nome">Nome<span class="req" aria-hidden="true">*</span></label>
          <input class="entrada" id="ne-nome" name="nome" required autocomplete="off" data-auto-focus
                 aria-describedby="ne-nome-ajuda">
          <p class="campo__ajuda" id="ne-nome-ajuda">Por exemplo: supino inclinado na Smith</p>
          <p class="campo__erro" hidden data-erro="nome" role="alert"></p>
        </div>
        <div class="campo">
          <span class="campo__l" id="ne-prim">Músculos principais<span class="req" aria-hidden="true">*</span></span>
          <div class="filtros" style="flex-wrap:wrap;overflow:visible;padding:0;margin:0" role="group" aria-labelledby="ne-prim">
            ${musculos.map(k => `<button type="button" class="filtro" data-p="${k}" aria-pressed="false">${esc(Store.MUSCLES[k].name)}</button>`).join('')}
          </div>
          <p class="campo__erro" hidden data-erro="p" role="alert"></p>
        </div>
        <div class="campo">
          <span class="campo__l" id="ne-sec">Músculos secundários</span>
          <div class="filtros" style="flex-wrap:wrap;overflow:visible;padding:0;margin:0" role="group" aria-labelledby="ne-sec">
            ${musculos.map(k => `<button type="button" class="filtro" data-s="${k}" aria-pressed="false">${esc(Store.MUSCLES[k].name)}</button>`).join('')}
          </div>
          <p class="campo__ajuda">Servem para a figura mostrar tudo o que o exercício trabalha.</p>
        </div>
        <div class="campo">
          <label class="campo__l" for="ne-equip">Equipamento</label>
          <select class="select" id="ne-equip" name="equip">
            ${Object.keys(CATALOGO.EQUIPAMENTO).map(k => `<option value="${k}">${esc(CATALOGO.EQUIPAMENTO[k])}</option>`).join('')}
          </select>
        </div>
        <div class="campo">
          <label class="campo__l" for="ne-metrica">Como se mede</label>
          <select class="select" id="ne-metrica" name="metrica">
            <option value="peso">Carga e repetições</option>
            <option value="reps">Só repetições</option>
            <option value="tempo">Tempo em segundos</option>
            <option value="distancia">Distância em metros</option>
            <option value="calorias">Calorias na máquina</option>
          </select>
        </div>
        <div class="campo">
          <span class="campo__l">Tipo</span>
          <div class="segmento" role="group" aria-label="Tipo de exercício">
            <button type="button" class="segmento__b" data-t="C" aria-pressed="true">Composto</button>
            <button type="button" class="segmento__b" data-t="I" aria-pressed="false">Isolamento</button>
          </div>
          <p class="campo__ajuda">Compostos usam várias articulações (agachamento, supino). Isolamento trabalha um só músculo.</p>
        </div>
        <div class="linha" style="gap:var(--e3)">
          <div class="campo crescer">
            <label class="campo__l" for="ne-rmin">Mínimo</label>
            <input class="entrada" id="ne-rmin" name="rmin" type="text" inputmode="numeric" value="${Store.state.settings.repsAlvo[0]}">
          </div>
          <div class="campo crescer">
            <label class="campo__l" for="ne-rmax">Máximo</label>
            <input class="entrada" id="ne-rmax" name="rmax" type="text" inputmode="numeric" value="${Store.state.settings.repsAlvo[1]}">
          </div>
        </div>
      </form>`,
      rodape: `<button type="button" class="btn btn--fantasma" data-cancelar>Cancelar</button>
               <button type="button" class="btn btn--primario" data-guardar>Guardar</button>`
    });

    const form = s.painel.querySelector('[data-form]');
    const primarios = new Set();
    const secundarios = new Set();
    let tipo = 'C';

    form.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.p;
      if (primarios.has(k)) primarios.delete(k); else primarios.add(k);
      b.setAttribute('aria-pressed', String(primarios.has(k)));
      UI.haptic('leve');
    }));
    form.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.s;
      if (secundarios.has(k)) secundarios.delete(k); else secundarios.add(k);
      b.setAttribute('aria-pressed', String(secundarios.has(k)));
      UI.haptic('leve');
    }));
    form.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => {
      tipo = b.dataset.t;
      form.querySelectorAll('[data-t]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));

    function erro(campo, msg) {
      const p = form.querySelector(`[data-erro="${campo}"]`);
      p.hidden = !msg;
      p.innerHTML = msg ? icone('aviso', 15) + esc(msg) : '';
    }

    s.painel.querySelector('[data-cancelar]').addEventListener('click', () => UI.fecharSheet());
    s.painel.querySelector('[data-guardar]').addEventListener('click', () => {
      const nome = form.nome.value.trim();
      erro('nome', ''); erro('p', '');
      if (!nome) { erro('nome', 'Dá um nome ao exercício.'); form.nome.focus(); return; }
      if (!primarios.size) { erro('p', 'Escolhe pelo menos um músculo principal.'); return; }
      const rmin = UI.lerNumero(form.rmin.value) || Store.state.settings.repsAlvo[0];
      const rmax = Math.max(rmin, UI.lerNumero(form.rmax.value) || rmin + 2);
      const ex = Store.criarExercicio({
        n: nome, p: [...primarios], s: [...secundarios].filter(k => !primarios.has(k)),
        e: form.equip.value, t: tipo, m: form.metrica.value,
        r: [rmin, rmax], inc: tipo === 'C' ? 2.5 : 2
      });
      UI.fecharSheet();
      UI.haptic('sucesso');
      UI.toast('Exercício criado', 'sucesso');
      if (aoCriar) aoCriar(ex.id);
    });
  }

  global.Comp = {
    ESTADOS, normalizar, nomesMusculos,
    musculo, legendaMusculos, exercicioItem, treinoItem, vazio, stat,
    grupoCartao, grelhaGrupos, filtrosParte, descricaoParte,
    escolherExercicio, detalhes, escolherCircuito, circuitoCartao, criarExercicio
  };
})(window);
