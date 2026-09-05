/* =============================================================
   Vista: Ajustes — plano, descanso, unidades, backup
   ============================================================= */
window.Vistas = window.Vistas || {};
(function () {
  'use strict';
  const esc = UI.esc, icone = UI.icone;

  Vistas.ajustes = {
    titulo: () => 'Ajustes',
    sub: () => 'Os dados ficam só neste telemóvel',

    render() {
      const s = Store.state.settings;
      const split = CATALOGO.SPLITS[s.split] || CATALOGO.SPLITS.ppl;
      const prox = Store.proximoDiaSplit();
      const peso = Store.pesoCorporal();
      const pesos = Store.historicoPeso();
      const varPeso = Store.variacaoPeso(30);
      const horasFecho = s.fecharAuto || 4;
      const longos = Store.treinosLongos(horasFecho);

      return `
        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Perfil</h2></div>
          <div class="cartao">
            <label class="campo__l" for="a-peso">Peso corporal (${esc(Store.U.label())})</label>
            <div class="linha mt2">
              <input class="entrada crescer" id="a-peso" type="text" inputmode="decimal" autocomplete="off"
                     value="${peso != null ? esc(Store.U.fmt(peso, true)) : ''}" placeholder="por exemplo, 78"
                     aria-describedby="a-peso-a">
              <button type="button" class="btn btn--primario" data-guardar-peso>Guardar</button>
            </div>
            <p class="campo__ajuda" id="a-peso-a">${peso != null
              ? `Última pesagem ${esc(Store.D.relativo(Store.state.perfil.pesoEm))}, a ${esc(Store.D.curto(Store.state.perfil.pesoEm))}.${
                  varPeso === null ? '' : ` Nos últimos 30 dias: ${varPeso > 0 ? '+' : ''}${esc(UI.fmt(Store.U.mostrar(varPeso)))} ${esc(Store.U.label())}.`}`
              : 'Fica só neste telemóvel, como tudo o resto. Serve para veres a evolução no Progresso e para comparares a tua força com o teu peso.'}</p>
            ${pesos.length > 1 ? `<hr class="divisor">
              <span class="campo__l">Últimas pesagens</span>
              <div class="linha mt2" style="flex-wrap:wrap;gap:6px">
                ${pesos.slice(-6).reverse().map(x => `<span class="chip num">${esc(Store.D.curto(x.data))} · ${esc(Store.U.fmt(x.kg))}</span>`).join('')}
              </div>
              <p class="campo__ajuda">Guarda um valor por dia. O gráfico completo está em Progresso.</p>` : ''}
          </div>
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Objectivo</h2></div>
          <div class="pilha">
            ${Object.keys(CATALOGO.OBJETIVOS).map(k => {
              const o = CATALOGO.OBJETIVOS[k];
              const activo = s.objetivo === k;
              return `<button type="button" class="cartao objetivo-c ${activo ? 'objetivo-c--activo' : ''}" data-objetivo="${k}">
                <div class="entre">
                  <span class="lista__t">${esc(o.name)}</span>
                  ${activo ? `<span class="chip chip--primaria">${icone('check', 13)}Actual</span>` : ''}
                </div>
                <p class="cartao__sub mt2">${esc(o.desc)}</p>
                <div class="linha mt3" style="flex-wrap:wrap;gap:6px">
                  <span class="chip num">${o.reps[0]}–${o.reps[1]} repetições</span>
                  <span class="chip num">${UI.mmss(o.descanso)} de descanso</span>
                  ${o.circuitos ? '<span class="chip chip--primaria">Com circuitos</span>' : ''}
                </div>
              </button>`;
            }).join('')}
          </div>
          <p class="campo__ajuda">Escolher um objectivo repõe as repetições, o descanso, o volume e o plano.
            Depois podes afinar cada valor em baixo.</p>
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Plano de treino</h2></div>
          <div class="cartao">
            <div class="campo" style="margin-bottom:var(--e3)">
              <label class="campo__l" for="a-split">Divisão de treino</label>
              <select class="select" id="a-split" data-set="split" aria-describedby="a-split-a">
                ${Object.keys(CATALOGO.SPLITS).map(k =>
                  `<option value="${k}" ${s.split === k ? 'selected' : ''}>${esc(CATALOGO.SPLITS[k].name)}</option>`).join('')}
              </select>
              <p class="campo__ajuda" id="a-split-a">${esc(split.desc)}</p>
            </div>
            <div class="linha" style="flex-wrap:wrap;gap:6px">
              ${split.dias.map((d, i) => `<span class="chip ${i === prox.indice ? 'chip--primaria' : ''}">${esc(d.name)}</span>`).join('')}
            </div>
            <p class="cartao__sub mt3">${icone('raio', 14)} Próximo sugerido: <strong>${esc(prox.dia.name)}</strong></p>
          </div>

          <div class="cartao mt3">
            ${contador('nex', 'Exercícios por treino', s.exerciciosPorTreino, 'Entre 3 e 10. Mais exercícios = treino mais longo.')}
            <hr class="divisor">
            ${contador('nseries', 'Séries por exercício', s.seriesPorExercicio, 'Aplica-se a exercícios novos. Podes sempre juntar séries durante o treino.')}
            <hr class="divisor">
            <span class="campo__l" id="a-reps-l">Repetições por série</span>
            <div class="linha mt2" role="group" aria-labelledby="a-reps-l">
              <button type="button" class="btn-icone" data-reps="-1" aria-label="Diminuir intervalo de repetições">${icone('menos', 22)}</button>
              <span class="crescer num" data-v="reps" role="status" aria-live="polite"
                    style="text-align:center;font-size:var(--t-xl);font-weight:800">${s.repsAlvo[0]}–${s.repsAlvo[1]}</span>
              <button type="button" class="btn-icone" data-reps="1" aria-label="Aumentar intervalo de repetições">${icone('mais', 22)}</button>
            </div>
            <p class="campo__ajuda">
              3 a 6 para força · 8 a 12 para músculo · 12 a 20 para resistência.
              Exercícios que pedem repetições altas (gémeos, abdominais, elevações laterais)
              mantêm o intervalo próprio, a prancha continua em segundos e a corrida em metros.
            </p>
          </div>

          <div class="cartao mt3">
            <span class="campo__l" id="a-vol-l">Volume semanal alvo</span>
            <div class="segmento mt2" role="group" aria-labelledby="a-vol-l">
              <button type="button" class="segmento__b" data-vol="0.7" aria-pressed="${s.volume === 0.7}">Moderado</button>
              <button type="button" class="segmento__b" data-vol="1" aria-pressed="${s.volume === 1}">Padrão</button>
              <button type="button" class="segmento__b" data-vol="1.3" aria-pressed="${s.volume === 1.3}">Alto</button>
            </div>
            <p class="campo__ajuda">
              Define quantas séries por músculo a app espera por semana antes de o marcar como em atraso.
              Escolhe <strong>Moderado</strong> se treinas 3× por semana, <strong>Alto</strong> se treinas 5–6×.
              Neste momento: peito ${Math.round(Store.MUSCLES.peito.alvo * s.volume)} séries, dorsais ${Math.round(Store.MUSCLES.dorsais.alvo * s.volume)}.
            </p>
          </div>

          <div class="cartao mt3">
            <span class="campo__l" id="a-ign-l">Músculos a ignorar</span>
            <p class="campo__ajuda" style="margin:0 0 var(--e3)">
              Ficam fora das sugestões e da cobertura muscular. Os exercícios continuam na biblioteca.
            </p>
            <div class="filtros" style="flex-wrap:wrap;overflow:visible;padding:0;margin:0" role="group" aria-labelledby="a-ign-l">
              ${Object.keys(Store.MUSCLES).map(k => {
                const off = (s.musculosIgnorados || []).includes(k);
                return `<button type="button" class="filtro" data-ign="${k}" aria-pressed="${off}"
                  aria-label="${esc(Store.MUSCLES[k].name)}${off ? ': ignorado' : ': incluído'}">${esc(Store.MUSCLES[k].name)}</button>`;
              }).join('')}
            </div>
          </div>
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Descanso entre séries</h2></div>
          <div class="cartao mb3">
            <span class="campo__l" id="a-timer-l">Cronómetro de descanso</span>
            <div class="segmento mt2" role="group" aria-labelledby="a-timer-l">
              <button type="button" class="segmento__b" data-timer-modo="perguntar" aria-pressed="${(s.timerModo || 'perguntar') === 'perguntar'}">Perguntar</button>
              <button type="button" class="segmento__b" data-timer-modo="sempre" aria-pressed="${s.timerModo === 'sempre'}">Sempre</button>
              <button type="button" class="segmento__b" data-timer-modo="nunca" aria-pressed="${s.timerModo === 'nunca'}">Nunca</button>
            </div>
            <p class="campo__ajuda">
              <strong>Perguntar</strong> — no início de cada treino escolhes se queres contar o descanso.
              <strong>Sempre</strong> — arranca sozinho a cada série marcada.
              <strong>Nunca</strong> — o cronómetro nunca aparece, mas continuas a poder ligá-lo nas opções do treino.
            </p>
          </div>
          <div class="cartao">
            ${linhaDescanso('descanso', 'Exercícios compostos', s.descanso)}
            <hr class="divisor">
            ${linhaDescanso('descansoIsolamento', 'Isolamento', s.descansoIsolamento)}
            <hr class="divisor">
            ${linhaDescanso('descansoCircuito', 'Entre estações de um circuito', s.descansoCircuito)}
            <hr class="divisor">
            <p class="campo__ajuda" style="margin-bottom:var(--e3)">
              Para ganhar músculo, descansa até conseguires repetir as mesmas repetições na série
              seguinte. Se cais de 12 para 8 repetições, estás a descansar pouco. Nos circuitos é
              ao contrário: o descanso curto é o que faz o trabalho.
            </p>
            ${troca('avisoSonoro', 'Aviso sonoro', 'Toca quando o descanso acaba', s.avisoSonoro)}
            ${troca('vibrar', 'Vibração', 'Resposta táctil ao marcar séries', s.vibrar)}
          </div>
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Durante o treino</h2></div>
          <div class="cartao mb3">
            ${troca('rir', 'Registar RIR', 'Coluna extra em cada série, para as repetições que sobraram', s.rir)}
            <p class="campo__ajuda">
              RIR são as <strong>repetições em reserva</strong>: quantas ainda conseguias fazer quando
              paraste a série. 0 é falha total; 2 é o ponto habitual para ganhar músculo sem te arrasares.
              Se registares 3 ou mais em todas as séries de um exercício, a app sugere subir a carga na
              sessão seguinte, sem esperar que chegues ao topo das repetições.
            </p>
          </div>
          <div class="cartao">
            <label class="campo__l" for="a-fechar">Fechar o treino sozinho</label>
            <select class="select mt2" id="a-fechar" data-fechar-auto aria-describedby="a-fechar-a">
              ${[2, 3, 4, 6, 8].map(h => `<option value="${h}" ${s.fecharAuto === h ? 'selected' : ''}>Ao fim de ${h} horas sem registos</option>`).join('')}
              <option value="0" ${!s.fecharAuto ? 'selected' : ''}>Nunca fechar sozinho</option>
            </select>
            <p class="campo__ajuda" id="a-fechar-a">
              Se te esqueceres de terminar o treino, a app fecha-o e guarda-o com a duração até à
              <strong>última série que marcaste</strong> — em vez de ficar a contar a noite toda.
              Um treino sem nenhuma série marcada é descartado.
            </p>
            ${longos.length ? `<hr class="divisor">
              <p class="campo__ajuda" style="margin:0 0 var(--e3)">
                Tens <strong>${longos.length}</strong> treino${longos.length > 1 ? 's' : ''} no histórico
                com mais de ${horasFecho} horas. Podes trocar essas durações por uma estimativa feita a
                partir das séries registadas — a original fica guardada.</p>
              <button type="button" class="btn btn--secundario btn--bloco" data-corrigir-duracoes>
                ${icone('relogio', 18)}Corrigir ${longos.length} duraç${longos.length > 1 ? 'ões' : 'ão'}
              </button>` : ''}
          </div>
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Aparência e unidades</h2></div>
          <div class="cartao">
            <div class="campo" style="margin-bottom:var(--e4)">
              <span class="campo__l" id="a-uni-l">Unidade de peso</span>
              <div class="segmento" role="group" aria-labelledby="a-uni-l">
                <button type="button" class="segmento__b" data-uni="kg" aria-pressed="${s.unidade === 'kg'}">Quilos (kg)</button>
                <button type="button" class="segmento__b" data-uni="lb" aria-pressed="${s.unidade === 'lb'}">Libras (lb)</button>
              </div>
              <p class="campo__ajuda">Os pesos são convertidos automaticamente; nada se perde ao trocar.</p>
            </div>
            <div class="campo" style="margin-bottom:0">
              <span class="campo__l" id="a-tema-l">Tema</span>
              <div class="segmento" role="group" aria-labelledby="a-tema-l">
                <button type="button" class="segmento__b" data-tema="auto" aria-pressed="${s.tema === 'auto'}">Automático</button>
                <button type="button" class="segmento__b" data-tema="escuro" aria-pressed="${s.tema === 'escuro'}">Escuro</button>
                <button type="button" class="segmento__b" data-tema="claro" aria-pressed="${s.tema === 'claro'}">Claro</button>
              </div>
            </div>
          </div>
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Cópia de segurança</h2></div>
          <div class="cartao">
            <p class="texto-corpo" style="font-size:var(--t-md)">
              Tudo é guardado no armazenamento do Safari deste iPhone. Se apagares a app do ecrã principal
              ou limpares os dados do Safari, os treinos desaparecem. Exporta de vez em quando.
            </p>
            <div class="pilha mt4">
              <button type="button" class="btn btn--primario btn--bloco" data-exportar>${icone('descarregar', 20)}Exportar treinos</button>
              <button type="button" class="btn btn--secundario btn--bloco" data-importar>${icone('carregar', 20)}Importar de ficheiro</button>
              <input type="file" accept="application/json,.json" hidden data-ficheiro>
            </div>
            <p class="cartao__sub mt3 num">${Store.state.treinos.length} treinos · ${Store.state.exerciciosCustom.length} exercícios personalizados${pesos.length ? ` · ${pesos.length} pesagens` : ''}</p>
          </div>
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Instalar no iPhone</h2></div>
          <div class="cartao">
            <ol class="texto-corpo" style="font-size:var(--t-md);padding-left:1.2em;list-style:decimal">
              <li>Abre este endereço no <strong>Safari</strong>.</li>
              <li>Toca no botão <strong>Partilhar</strong> (quadrado com seta).</li>
              <li>Escolhe <strong>Adicionar ao ecrã principal</strong>.</li>
            </ol>
            <p class="cartao__sub mt3">Fica com ícone próprio, ecrã inteiro e funciona sem internet.</p>
          </div>
        </section>

        <section class="seccao">
          <div class="seccao__cab"><h2 class="seccao__tit">Zona de perigo</h2></div>
          <button type="button" class="btn btn--perigo-fantasma btn--bloco" data-apagar-tudo>
            ${icone('lixo', 18)}Apagar todos os dados
          </button>
          <p class="cartao__sub mt3" style="text-align:center">Treinos · v2.0 · funciona offline</p>
        </section>`;
    },

    montar(raiz) {
      const s = Store.state.settings;

      const campoPeso = raiz.querySelector('#a-peso');
      function guardarPeso() {
        const v = UI.lerNumero(campoPeso.value);
        if (v === null) { UI.toast('Escreve o teu peso primeiro', 'erro'); UI.haptic('erro'); return; }
        const kg = Store.U.paraKg(v);
        if (!(kg >= 20 && kg <= 400)) { UI.toast('Esse peso não parece certo', 'erro'); UI.haptic('erro'); return; }
        Store.definirPeso(kg);
        campoPeso.blur();
        UI.haptic('sucesso');
        UI.toast(`Peso registado: ${Store.U.fmt(kg)}`, 'sucesso');
        App.render();
      }
      raiz.querySelector('[data-guardar-peso]').addEventListener('click', guardarPeso);
      campoPeso.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); guardarPeso(); }
      });

      raiz.querySelector('[data-fechar-auto]').addEventListener('change', e => {
        s.fecharAuto = +e.target.value;
        Store.guardar(true);
        UI.haptic('leve');
        UI.toast(s.fecharAuto
          ? `O treino fecha sozinho ao fim de ${s.fecharAuto} horas paradas`
          : 'O treino nunca fecha sozinho');
        if (!App.tratarEsquecido()) App.render();
      });

      const corrigir = raiz.querySelector('[data-corrigir-duracoes]');
      if (corrigir) corrigir.addEventListener('click', async () => {
        const horas = s.fecharAuto || 4;
        const alvo = Store.treinosLongos(horas);
        if (!alvo.length) return;
        const ex = alvo[0];
        if (!(await UI.confirmar({
          titulo: `Corrigir ${alvo.length} duraç${alvo.length > 1 ? 'ões' : 'ão'}?`,
          msg: `Cada treino com mais de ${horas} horas passa a ter a duração estimada a partir das séries `
            + `registadas. Por exemplo, "${ex.nome}" passa de ${UI.fmtDuracao(ex.duracao)} para `
            + `${UI.fmtDuracao(Store.estimarDuracao(ex))}. A duração original fica guardada e podes `
            + 'sempre acertá-la à mão no detalhe de cada treino.',
          ok: 'Corrigir'
        }))) return;
        const n = Store.corrigirDuracoes(horas);
        UI.haptic('sucesso');
        UI.toast(n > 1 ? `${n} durações corrigidas` : 'Duração corrigida', 'sucesso');
        App.render();
      });

      raiz.querySelectorAll('[data-objetivo]').forEach(b => b.addEventListener('click', () => {
        const o = Store.aplicarObjetivo(b.dataset.objetivo);
        if (!o) return;
        UI.haptic('sucesso');
        UI.toast(`Objectivo: ${o.name}`, 'sucesso');
        App.render();
      }));

      raiz.querySelector('#a-split').addEventListener('change', e => {
        s.split = e.target.value;
        Store.guardar(true);
        UI.toast('Plano actualizado', 'sucesso');
        App.render();
      });

      raiz.querySelectorAll('[data-nex]').forEach(b => b.addEventListener('click', () => {
        s.exerciciosPorTreino = Math.min(10, Math.max(3, s.exerciciosPorTreino + (+b.dataset.nex)));
        raiz.querySelector('[data-v="nex"]').textContent = s.exerciciosPorTreino;
        UI.haptic('leve');
        Store.guardar();
      }));

      raiz.querySelectorAll('[data-nseries]').forEach(b => b.addEventListener('click', () => {
        s.seriesPorExercicio = Math.min(8, Math.max(1, s.seriesPorExercicio + (+b.dataset.nseries)));
        raiz.querySelector('[data-v="nseries"]').textContent = s.seriesPorExercicio;
        UI.haptic('leve');
        Store.guardar();
      }));

      raiz.querySelectorAll('[data-reps]').forEach(b => b.addEventListener('click', () => {
        const d = +b.dataset.reps;
        const min = Math.min(30, Math.max(1, s.repsAlvo[0] + d));
        s.repsAlvo = [min, Math.min(40, min + (s.repsAlvo[1] - s.repsAlvo[0]))];
        raiz.querySelector('[data-v="reps"]').textContent = `${s.repsAlvo[0]}–${s.repsAlvo[1]}`;
        UI.haptic('leve');
        Store.guardar();
      }));

      raiz.querySelectorAll('[data-vol]').forEach(b => b.addEventListener('click', () => {
        s.volume = +b.dataset.vol;
        Store.guardar(true);
        UI.haptic('leve');
        App.render();
      }));

      raiz.querySelectorAll('[data-ign]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.ign;
        const lista = s.musculosIgnorados || (s.musculosIgnorados = []);
        const i = lista.indexOf(k);
        if (i >= 0) lista.splice(i, 1); else lista.push(k);
        const off = i < 0;
        b.setAttribute('aria-pressed', String(off));
        b.setAttribute('aria-label', `${Store.MUSCLES[k].name}${off ? ': ignorado' : ': incluído'}`);
        UI.haptic('leve');
        Store.guardar(true);
        UI.toast(off ? `${Store.MUSCLES[k].name} fora das sugestões` : `${Store.MUSCLES[k].name} incluído`);
      }));

      raiz.querySelectorAll('[data-timer-modo]').forEach(b => b.addEventListener('click', () => {
        s.timerModo = b.dataset.timerModo;
        Store.guardar(true);
        // treino a decorrer ainda sem resposta: fica já decidido
        if (Store.state.ativo && Store.state.ativo.descansoAuto == null && s.timerModo !== 'perguntar') {
          Store.definirDescanso(s.timerModo === 'sempre');
        }
        UI.haptic('leve');
        UI.toast(s.timerModo === 'sempre' ? 'O descanso passa a ser contado sempre'
          : s.timerModo === 'nunca' ? 'O cronómetro deixa de aparecer'
          : 'A app pergunta no início de cada treino');
        App.render();
      }));

      raiz.querySelectorAll('[data-descanso]').forEach(b => b.addEventListener('click', () => {
        const chave = b.dataset.descanso, delta = +b.dataset.d;
        s[chave] = Math.min(600, Math.max(15, s[chave] + delta));
        raiz.querySelector(`[data-v="${chave}"]`).textContent = UI.mmss(s[chave]);
        UI.haptic('leve');
        Store.guardar();
      }));

      raiz.querySelectorAll('[data-troca]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.troca;
        s[k] = !s[k];
        b.setAttribute('aria-checked', String(s[k]));
        Store.guardar();
        if (k === 'vibrar' && s[k]) UI.haptic('medio');
        if (k === 'avisoSonoro' && s[k]) UI.beep(1);
      }));

      raiz.querySelectorAll('[data-uni]').forEach(b => b.addEventListener('click', () => {
        s.unidade = b.dataset.uni;
        Store.guardar(true);
        UI.haptic('leve');
        App.render();
      }));

      raiz.querySelectorAll('[data-tema]').forEach(b => b.addEventListener('click', () => {
        s.tema = b.dataset.tema;
        Store.guardar(true);
        App.aplicarTema();
        UI.haptic('leve');
        App.render();
      }));

      raiz.querySelector('[data-exportar]').addEventListener('click', exportar);

      const ficheiro = raiz.querySelector('[data-ficheiro]');
      raiz.querySelector('[data-importar]').addEventListener('click', () => ficheiro.click());
      ficheiro.addEventListener('change', () => {
        const f = ficheiro.files && ficheiro.files[0];
        if (f) importar(f);
        ficheiro.value = '';
      });

      raiz.querySelector('[data-apagar-tudo]').addEventListener('click', apagarTudo);
    }
  };

  function contador(chave, label, valor, ajuda) {
    return `<div>
      <span class="campo__l" id="lbl-${chave}">${esc(label)}</span>
      <div class="linha mt2" role="group" aria-labelledby="lbl-${chave}">
        <button type="button" class="btn-icone" data-${chave}="-1" aria-label="Menos em ${esc(label)}">${icone('menos', 22)}</button>
        <span class="crescer num" data-v="${chave}" role="status" aria-live="polite"
              style="text-align:center;font-size:var(--t-xl);font-weight:800">${valor}</span>
        <button type="button" class="btn-icone" data-${chave}="1" aria-label="Mais em ${esc(label)}">${icone('mais', 22)}</button>
      </div>
      ${ajuda ? `<p class="campo__ajuda">${esc(ajuda)}</p>` : ''}
    </div>`;
  }

  function linhaDescanso(chave, label, valor) {
    return `<div>
      <span class="campo__l">${esc(label)}</span>
      <div class="linha mt2">
        <button type="button" class="btn-icone" data-descanso="${chave}" data-d="-15" aria-label="Menos 15 segundos em ${esc(label)}">${icone('menos', 22)}</button>
        <span class="crescer num" data-v="${chave}" role="status" aria-live="polite"
              style="text-align:center;font-size:var(--t-xl);font-weight:800">${UI.mmss(valor)}</span>
        <button type="button" class="btn-icone" data-descanso="${chave}" data-d="15" aria-label="Mais 15 segundos em ${esc(label)}">${icone('mais', 22)}</button>
      </div>
    </div>`;
  }

  function troca(chave, titulo, sub, activo) {
    return `<button type="button" class="troca" data-troca="${chave}" role="switch"
      aria-checked="${!!activo}" aria-label="${esc(titulo)}" aria-describedby="tr-${chave}">
      <span class="crescer" style="text-align:left">
        <span class="troca__t" style="display:block">${esc(titulo)}</span>
        <span class="troca__s" style="display:block" id="tr-${chave}">${esc(sub)}</span>
      </span>
      <span class="interruptor" aria-hidden="true"></span>
    </button>`;
  }

  /* ---------- backup ---------- */
  async function exportar() {
    const json = Store.exportar();
    const nome = `treinos-${Store.D.hoje()}.json`;
    const ficheiro = new File([json], nome, { type: 'application/json' });

    if (navigator.canShare && navigator.canShare({ files: [ficheiro] })) {
      try {
        await navigator.share({ files: [ficheiro], title: 'Cópia de segurança dos treinos' });
        UI.toast('Cópia exportada', 'sucesso');
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    UI.toast('Ficheiro guardado', 'sucesso');
  }

  function importar(f) {
    const leitor = new FileReader();
    leitor.onload = async () => {
      let previsao;
      try {
        previsao = JSON.parse(leitor.result);
        if (!Array.isArray(previsao.treinos)) throw new Error();
      } catch (e) {
        UI.toast('Ficheiro inválido — usa um exportado por esta app', 'erro');
        UI.haptic('erro');
        return;
      }
      const sh = UI.sheet({
        titulo: 'Importar treinos',
        html: `<p class="texto-corpo">O ficheiro tem <strong>${previsao.treinos.length}</strong> treinos
            e <strong>${(previsao.exerciciosCustom || []).length}</strong> exercícios personalizados.</p>
          <p class="texto-corpo mt3">Tens agora ${Store.state.treinos.length} treinos guardados.</p>`,
        rodape: `<button type="button" class="btn btn--secundario" data-juntar>Juntar</button>
                 <button type="button" class="btn btn--perigo" data-substituir>Substituir tudo</button>`
      });
      sh.painel.querySelector('[data-juntar]').addEventListener('click', () => aplicar('juntar'));
      sh.painel.querySelector('[data-substituir]').addEventListener('click', async () => {
        if (await UI.confirmar({
          titulo: 'Substituir tudo?',
          msg: 'Os treinos actuais neste telemóvel serão apagados e substituídos pelos do ficheiro.',
          ok: 'Substituir', perigo: true
        })) aplicar('substituir');
      });

      function aplicar(modo) {
        try {
          const n = Store.importar(leitor.result, modo);
          UI.fecharSheet();
          UI.haptic('sucesso');
          UI.toast(`${n} treinos na app`, 'sucesso');
          App.aplicarTema();
          App.render();
        } catch (e) {
          UI.toast('Não foi possível importar', 'erro');
        }
      }
    };
    leitor.onerror = () => UI.toast('Não foi possível ler o ficheiro', 'erro');
    leitor.readAsText(f);
  }

  async function apagarTudo() {
    if (!(await UI.confirmar({
      titulo: 'Apagar todos os dados?',
      msg: 'Treinos, exercícios personalizados e definições são removidos deste telemóvel. Exporta primeiro se quiseres guardar.',
      ok: 'Apagar tudo', perigo: true
    }))) return;
    if (!(await UI.confirmar({
      titulo: 'Tens a certeza?',
      msg: 'Esta acção não pode ser anulada.',
      ok: 'Sim, apagar', perigo: true
    }))) return;
    Store.apagarTudo();
    App.aplicarTema();
    UI.haptic('erro');
    UI.toast('Todos os dados foram apagados');
    App.ir('hoje', true);
    App.render();
  }
})();
