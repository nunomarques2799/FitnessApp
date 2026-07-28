# Treinos

App web de registo de treinos, feita para correr no iPhone a partir do ecrã principal — sem App Store,
sem conta, sem servidor. **Todos os dados ficam guardados no telemóvel** (`localStorage`).

---

## O que faz

| Ecrã | O que tem |
|---|---|
| **Hoje** | Sugestão de treino para o dia, cobertura muscular dos últimos 7 dias, resumo da semana |
| **Treino** | Registo de séries (peso × reps), cronómetro de descanso automático, deteção de recordes |
| **Histórico** | Calendário do mês com os dias treinados, detalhe de cada sessão, editar/apagar/repetir |
| **Exercícios** | 108 exercícios com músculos e equipamento, procura, favoritos, exercícios personalizados |
| **Progresso** | Volume por semana, distribuição por grupo muscular (30 dias), recordes, top exercícios |
| **Ajustes** | Plano de treino, tempos de descanso, kg/lb, tema, exportar/importar cópia de segurança |

### Configuração de origem

Afinada para hipertrofia: **3 séries por exercício, 10–12 repetições**, 7 exercícios por sessão
(21 séries), descanso de 1:30 nos compostos e 1:00 no isolamento, plano Push/Pull/Legs.
**Glúteos estão fora** das sugestões e da cobertura muscular.

Cada sessão põe os compostos à frente e o isolamento no fim, e distribui os exercícios extra
pelos grupos com maior défice **absoluto** de séries — por isso os dorsais e o peito levam dois
ou três exercícios antes de o trapézio levar um segundo.

Exercícios que pedem repetições altas mantêm o intervalo próprio — gémeos e elevações laterais
12–20, abdominais 15–25 — e a prancha continua em segundos. Tudo isto se muda em **Ajustes**,
incluindo quais os músculos a ignorar.

Os alvos semanais por músculo seguem a referência de 10–20 séries para hipertrofia
(peito 16, dorsais 18, quadríceps 16, bíceps e tríceps 14…). O selector **Volume semanal alvo**
escala-os: *Moderado* se treinas 3× por semana, *Alto* se treinas 5–6×.

### Como decide o que sugerir

1. Olha para o **plano escolhido** (Push/Pull/Legs, Superior/Inferior, Corpo inteiro ou Peito+Costas/Ombros+Braços/Pernas)
   e vê qual foi o último dia feito — sugere o seguinte.
2. Conta as **séries por músculo dos últimos 7 dias** (séries em que o músculo é secundário contam metade)
   e compara com um alvo semanal por grupo.
3. Escolhe os exercícios pela ordem do dia, dando prioridade aos que já tens histórico
   (para saber a carga), aos favoritos e aos movimentos de referência.
4. Se algum músculo estiver **7+ dias sem estímulo**, mete um exercício desse grupo mesmo que não seja do dia.
5. Se na última sessão completaste todas as séries no topo do intervalo de reps (12), **sugere subir a carga**
   e volta ao fundo do intervalo (10). É dupla progressão: sobes as reps de 10 até 12, depois sobes o peso.

---

## Pôr no iPhone

A app precisa de um endereço `https://` **fixo**, porque os dados ficam guardados por endereço.
Se o endereço mudar, os treinos antigos deixam de aparecer. Escolhe uma destas opções e mantém-na.

### Opção A — GitHub Pages (recomendada, grátis e permanente)

```bash
cd C:\Users\nuno_\Desktop\treinos
git init
git add .
git commit -m "Treinos"
gh repo create treinos --private --source=. --push
```

No GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
Ao fim de um minuto ficas com `https://<o-teu-utilizador>.github.io/treinos/`.

> Repositórios privados só servem GitHub Pages em contas Pro. Com conta gratuita usa `--public`
> ou a Opção B — a app não tem dados nenhuns dentro, os treinos ficam sempre só no telemóvel.

### Opção B — Netlify Drop (mais rápida, sem git)

1. Vai a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrasta a pasta `treinos` para a página.
3. Ficas com um endereço `https://…netlify.app`. Cria conta grátis para o endereço não expirar.

### Opção C — Só em casa, pela rede Wi-Fi

```bash
node tools/servidor.js
```

Mostra o endereço `http://192.168.x.x:8080` para abrires no iPhone (tem de estar no mesmo Wi-Fi).
Serve para experimentar, mas **não é boa para uso diário**: sem `https` não funciona offline,
e se o IP do PC mudar perdes o acesso aos treinos guardados.

### Adicionar ao ecrã principal

1. Abre o endereço no **Safari** (tem mesmo de ser o Safari, não o Chrome).
2. Toca em **Partilhar** (o quadrado com a seta para cima).
3. **Adicionar ao ecrã principal** → **Adicionar**.

Fica com ícone próprio, abre em ecrã inteiro sem barra do Safari e funciona sem internet.

---

## Cópias de segurança

Os dados vivem no armazenamento do Safari. Desaparecem se apagares a app do ecrã principal
ou limpares os dados do site. **Ajustes → Exportar treinos** gera um ficheiro `.json`
que podes guardar no iCloud Drive; **Importar** repõe tudo (juntar ou substituir).

Vale a pena exportar uma vez por mês.

---

## Estrutura

```
index.html              estrutura da app
styles.css              sistema de design (tokens, tema claro/escuro, safe areas)
manifest.webmanifest    metadados para o ecrã principal
sw.js                   service worker — faz a app funcionar offline
icons/                  ícones PNG gerados
js/
  exercises.js          catálogo: 15 grupos musculares, 108 exercícios, 4 planos
  store.js              dados em localStorage + motor de sugestão e estatísticas
  ui.js                 ícones SVG, sheets, toasts, vibração, som
  charts.js             gráficos SVG sem bibliotecas
  components.js         peças de interface reutilizadas
  app.js                router por hash, navegação, cronómetro de descanso
  views/                um ficheiro por ecrã
tools/
  servidor.js           servidor estático local (sem dependências)
  gerar-icones.js       gera os PNG dos ícones
```

Sem dependências, sem passo de build. Editas um ficheiro e recarregas.

> Ao alterar código, sobe `VERSAO` em `sw.js` — senão o telemóvel continua a servir
> a versão em cache até ao segundo arranque.

---

## Notas técnicas

- **Offline**: o service worker guarda em cache todos os ficheiros no primeiro arranque.
- **Privado**: nada sai do telemóvel. Não há pedidos de rede, analytics nem contas.
- **Acessibilidade**: alvos de toque ≥ 44 pt, contraste AA nos dois temas, `prefers-reduced-motion`,
  etiquetas para VoiceOver, navegação por teclado nas sheets.
- **1RM estimado**: fórmula de Epley — `peso × (1 + reps/30)`.
