/**
 * Le moteur du plateau — la seule île de code client du site.
 *
 * Le DOM est déjà en place, rendu au build : ce script n'ajoute que le
 * comportement. Trois morceaux indépendants :
 *
 *   AU        le moteur audio (rendu hors-ligne, boucles synchronisées)
 *   flight()  le moteur de vol (courbes de Bézier tirées au hasard)
 *   layout()  la bascule de formation
 *
 * Rien ne s'exécute si le plateau n'est pas sur la page.
 */

import { VOICES, type VoiceId } from '../data/voices';
import { boxOf, markOf } from '../data/geometry';
import { FORMATIONS, DEFAULT_FORMATION, type Formation, type FormationId } from '../data/formations';
import { PISTES, type Piste } from '../data/pistes';

const spot = document.getElementById('spot');
if (spot) init(spot);

function init(spot: HTMLElement): void {
  const dish = document.getElementById('dish')!;
  const markEl = document.getElementById('mark')!;
  const arc = document.getElementById('arc')!;
  const arcC = document.getElementById('arcC')!;
  const hint = document.getElementById('hint')!;
  const btnPlay = document.getElementById('btnPlay') as HTMLButtonElement;
  const btnStop = document.getElementById('btnStop') as HTMLButtonElement;

  const MARK_SRC: Record<'sept' | 'kt', string> = {
    sept: markEl.dataset.markSept!,
    kt: markEl.dataset.markKt!,
  };

  /* ═══════════════════════════════════════════════════════
     Audio — chaque voix est rendue hors-ligne en une boucle,
     puis jouée par un AudioBufferSource en loop. Toutes les
     sources démarrent au même instant : synchro parfaite,
     aucun ordonnanceur à la milliseconde.
     ═══════════════════════════════════════════════════════ */

  const NOTE: Record<string, number> = {
    C: 0, 'C#': 1, D: 2, Eb: 3, 'D#': 3, E: 4, F: 5, 'F#': 6,
    G: 7, 'G#': 8, Ab: 8, A: 9, Bb: 10, 'A#': 10, B: 11,
  };

  const hz = (n: string): number => {
    const m = /^([A-G][b#]?)(-?\d)$/.exec(n);
    if (!m) throw new Error(`note illisible : ${n}`);
    return 440 * Math.pow(2, (NOTE[m[1]!]! + (+m[2]! + 1) * 12 - 69) / 12);
  };

  const AU = {
    ctx: null as AudioContext | null,
    dry: null as GainNode | null,
    wet: null as GainNode | null,
    gain: {} as Record<VoiceId, GainNode>,
    src: {} as Partial<Record<VoiceId, AudioBufferSourceNode>>,
    piste: PISTES[0]!,
    t0: 0,
    loopLen: 0,
    want: {} as Partial<Record<VoiceId, boolean>>,
    busy: false,
    loaded: null as string | null,

    ensureCtx(): void {
      if (this.ctx) return;
      const ctx = new AudioContext();
      this.ctx = ctx;

      this.dry = ctx.createGain();
      this.dry.gain.value = 0.42;
      this.dry.connect(ctx.destination);

      // Réverbe : réponse impulsionnelle générée, décroissance en puissance 2,5.
      const conv = ctx.createConvolver();
      const L = Math.floor(ctx.sampleRate * 2.4);
      const ir = ctx.createBuffer(2, L, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c);
        for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 2.5);
      }
      conv.buffer = ir;
      this.wet = ctx.createGain();
      this.wet.gain.value = 0.19;
      this.wet.connect(conv);
      conv.connect(ctx.destination);

      // Les voix sont étalées dans le stéréo du grave à l'aigu, comme en rang.
      VOICES.forEach((v, i) => {
        const g = ctx.createGain();
        g.gain.value = 0;
        const p = ctx.createStereoPanner();
        p.pan.value = (i / (VOICES.length - 1) - 0.5) * 0.6;
        g.connect(p);
        p.connect(this.dry!);
        p.connect(this.wet!);
        this.gain[v.id] = g;
      });
    },

    async renderVoice(line: Piste['lines'][VoiceId], bpm: number, idx: number): Promise<AudioBuffer> {
      const sr = this.ctx!.sampleRate;
      const beat = 60 / bpm;
      const beats = line.reduce((s, x) => s + x[1], 0);
      const len = Math.round(beats * beat * sr);

      const oc = new OfflineAudioContext(1, len, sr);
      const out = oc.createGain();
      out.gain.value = 1;
      out.connect(oc.destination);
      const env = oc.createGain();
      env.gain.value = 0;
      env.connect(out);
      const flt = oc.createBiquadFilter();
      flt.type = 'lowpass';
      flt.Q.value = 1.1;
      flt.connect(env);

      const o1 = oc.createOscillator();
      const o2 = oc.createOscillator();
      o1.type = 'sawtooth';
      o2.type = 'sawtooth';
      o2.detune.value = 7; // le battement entre les deux donne l'épaisseur

      // Vibrato, légèrement différent par voix : sinon les sept sonnent comme une.
      const lfo = oc.createOscillator();
      const lg = oc.createGain();
      lfo.frequency.value = 4.4 + idx * 0.19;
      lg.gain.value = 8;
      lfo.connect(lg);
      lg.connect(o1.detune);
      lg.connect(o2.detune);
      o1.connect(flt);
      o2.connect(flt);

      let t = 0;
      for (const [note, b] of line) {
        const dur = b * beat;
        if (note) {
          const f = hz(note);
          o1.frequency.setValueAtTime(f, t);
          o2.frequency.setValueAtTime(f, t);
          flt.frequency.setValueAtTime(Math.min(f * 3.3 + 520, 5200), t);
          env.gain.setValueAtTime(0.03, t);
          env.gain.linearRampToValueAtTime(1, t + Math.min(0.07, dur * 0.22));
          env.gain.linearRampToValueAtTime(0.78, t + dur * 0.94);
        } else {
          env.gain.setValueAtTime(0.03, t);
          env.gain.linearRampToValueAtTime(0.0005, t + Math.min(0.06, dur * 0.4));
        }
        t += dur;
      }
      env.gain.linearRampToValueAtTime(0, t); // respiration au point de boucle : pas de clic

      o1.start(0);
      o2.start(0);
      lfo.start(0);
      return await oc.startRendering();
    },

    /**
     * `discret` : rendre sans griser le transport. C'est le mode du
     * préchauffage — sinon le tout premier clic sur Lecture arrive sur un
     * bouton déjà désactivé par le pointerdown qui l'a précédé, et se perd.
     */
    async load(piste: Piste, discret = false): Promise<void> {
      this.ensureCtx();
      if (this.ctx!.state === 'suspended') await this.ctx!.resume();
      while (this.busy) await new Promise((r) => setTimeout(r, 40));
      if (this.loaded === piste.id) return;

      this.busy = true;
      if (!discret) setBusy(true);
      this.piste = piste;
      try {
        const bufs = await Promise.all(
          VOICES.map((v, i) => this.renderVoice(piste.lines[v.id], piste.bpm, i)),
        );
        Object.values(this.src).forEach((s) => {
          try {
            s?.stop();
          } catch {
            /* déjà arrêtée */
          }
        });
        this.src = {};
        this.loopLen = bufs[0]!.duration;
        const start = this.ctx!.currentTime + 0.12;
        VOICES.forEach((v, i) => {
          const s = this.ctx!.createBufferSource();
          s.buffer = bufs[i]!;
          s.loop = true;
          s.connect(this.gain[v.id]);
          s.start(start);
          this.src[v.id] = s;
        });
        this.t0 = start;
        this.loaded = piste.id;
      } finally {
        this.busy = false;
        if (!discret) setBusy(false);
      }
      VOICES.forEach((v) => this.apply(v.id)); // rétablit les voix déjà allumées
    },

    apply(id: VoiceId): void {
      if (!this.ctx) return;
      this.gain[id].gain.setTargetAtTime(this.want[id] ? 0.33 : 0, this.ctx.currentTime, 0.07);
    },

    async set(id: VoiceId, on: boolean): Promise<void> {
      this.want[id] = on;
      await this.load(this.piste);
      this.apply(id);
    },

    async pause(): Promise<void> {
      if (this.ctx && this.ctx.state === 'running') await this.ctx.suspend();
    },
    async resume(): Promise<void> {
      if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();
    },
    get paused(): boolean {
      return !!(this.ctx && this.ctx.state === 'suspended');
    },
    anyOn(): boolean {
      return VOICES.some((v) => this.want[v.id]);
    },

    /** Position dans la boucle, de 0 à 1 — c'est elle qui trace l'arc doré. */
    phase(): number {
      if (!this.ctx || !this.loopLen || this.ctx.currentTime < this.t0) return 0;
      return ((this.ctx.currentTime - this.t0) % this.loopLen) / this.loopLen;
    },
  };

  /* ═══ plateau ═══ */

  interface FaceState {
    node: HTMLButtonElement;
    on: boolean;
    /** Décalage courant en px, appliqué en transform par le moteur de vol. */
    off: { x: number; y: number };
    sc: number;
    bl: number;
    /** Centre de la boîte posée, en % du disque. null = jamais entrée. */
    ctr: { x: number; y: number } | null;
    onstage: boolean;
  }

  const el = {} as Record<VoiceId, FaceState>;

  const faces = Array.from(dish.querySelectorAll<HTMLButtonElement>('.face'));
  for (const node of faces) {
    const id = node.dataset.voice as VoiceId;
    el[id] = { node, on: false, off: { x: 0, y: 0 }, sc: 1, bl: 0, ctr: null, onstage: false };
    node.addEventListener('click', () => {
      spot.classList.add('playing');
      hint.classList.add('off');
      void setVoice(id, !el[id].on);
    });
    // Double-clic : solo. Pratique pour entendre une partie seule.
    node.addEventListener('dblclick', () => {
      for (const m of current.members) void setVoice(m, m === id);
    });
  }

  function setVoice(id: VoiceId, on: boolean): void {
    const n = el[id];
    n.on = on;
    n.node.classList.toggle('on', on);
    n.node.setAttribute('aria-pressed', String(on));
    void AU.set(id, on);

    const ms = current.members;
    spot.classList.toggle('full', ms.every((m) => el[m].on));
    const live = ms.some((m) => el[m].on);
    arc.classList.toggle('live', live);
    if (live) startTick();
    paintTransport();
  }

  function setBusy(b: boolean): void {
    btnPlay.disabled = b;
    document.querySelectorAll<HTMLButtonElement>('.piste').forEach((x) => (x.disabled = b));
  }

  /* ═══════════════════════════════════════════════════════
     Vols : les têtes entrent et sortent par la périphérie du
     disque — plutôt par l'arrière (le haut) — en suivant une
     courbe de Bézier dont la flèche est tirée au hasard.
     Deux têtes ne suivent jamais la même courbe.
     ═══════════════════════════════════════════════════════ */

  const RM = matchMedia('(prefers-reduced-motion:reduce)');
  const easeIO = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

  interface Pt { x: number; y: number }

  /** Un point tiré sur l'arc nord du disque : l'arrière du plateau. */
  function periph(): Pt {
    const a = (rnd(-135, -45) * Math.PI) / 180;
    const r = rnd(62, 82);
    return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
  }

  interface FlightOpts {
    dur: number;
    delay: number;
    s0: number;
    s1: number;
    b0: number;
    b1: number;
    done?: () => void;
  }

  let tokN = 0;
  function flight(id: VoiceId, A: Pt, B: Pt, o: FlightOpts): void {
    const st = el[id];
    const n = st.node;
    const tok = ++tokN;
    n.dataset.tok = String(tok);

    // On mémorise l'état visuel à chaque image : un changement de formation en
    // pleine animation peut ainsi repartir d'exactement là où la tête est.
    const put = (x: number, y: number, s: number, b: number): void => {
      st.off = { x, y };
      st.sc = s;
      st.bl = b;
      n.style.setProperty('--fx', x.toFixed(2) + 'px');
      n.style.setProperty('--fy', y.toFixed(2) + 'px');
      n.style.setProperty('--fs', s.toFixed(3));
      n.style.setProperty('--fb', b.toFixed(2) + 'px');
    };

    put(A.x, A.y, o.s0, o.b0); // posé dans le même repaint que left/top : plus de saut

    if (RM.matches) {
      put(B.x, B.y, o.s1, o.b1);
      o.done?.();
      return;
    }

    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const dist = Math.hypot(dx, dy) || 1;
    const bow = dist * rnd(0.16, 0.36) * (Math.random() < 0.5 ? -1 : 1);
    const cx = A.x + dx / 2 - (dy / dist) * bow;
    const cy = A.y + dy / 2 + (dx / dist) * bow;

    const t0 = performance.now() + o.delay;
    const step = (now: number): void => {
      if (n.dataset.tok !== String(tok)) return; // vol périmé
      let t = (now - t0) / o.dur;
      if (t < 0) {
        requestAnimationFrame(step);
        return;
      }
      if (t > 1) t = 1;
      const e = easeIO(t);
      const u = 1 - e;
      put(
        u * u * A.x + 2 * u * e * cx + e * e * B.x,
        u * u * A.y + 2 * u * e * cy + e * e * B.y,
        o.s0 + (o.s1 - o.s0) * e,
        o.b0 + (o.b1 - o.b0) * e,
      );
      if (t < 1) requestAnimationFrame(step);
      else o.done?.();
    };
    requestAnimationFrame(step);
  }

  /* Le logotype ne se déforme jamais d'un état à l'autre : on l'éteint, on pose
     contenu ET géométrie tant qu'il est invisible, on le rallume. */
  let markT: number | undefined;
  let markFirst = true;

  function paintMark(f: Formation): void {
    const m = markOf(f);
    markEl.style.left = m.left + '%';
    markEl.style.top = m.top + '%';
    markEl.style.width = m.w + '%';
    if (m.kind === 'img') {
      markEl.style.removeProperty('--ms');
      markEl.innerHTML =
        `<img alt="${m.asset === 'kt' ? 'Katr Tet — Barbershop' : '4+4=7 — Ensemble vocal'}"` +
        ` src="${MARK_SRC[m.asset]}">`;
    } else {
      markEl.style.setProperty('--ms', m.fs.toFixed(2) + 'cqw');
      markEl.innerHTML =
        `<div class="txt">${m.lines.join('<br>')}</div><div class="bar"></div><div class="rule2"></div>`;
    }
  }

  function swapMark(f: Formation): void {
    clearTimeout(markT);
    // Au premier appel le logotype est déjà en place, rendu au build : le
    // repeindre ne ferait que recharger l'image pour rien.
    if (markFirst) {
      markFirst = false;
      markEl.style.opacity = '1';
      return;
    }
    markEl.style.opacity = '0';
    markT = window.setTimeout(() => {
      paintMark(f);
      markEl.style.opacity = '1';
    }, 360);
  }

  let current: Formation = FORMATIONS[readFormation()];

  function readFormation(): FormationId {
    const v = spot.dataset.formation;
    return v && v in FORMATIONS ? (v as FormationId) : DEFAULT_FORMATION;
  }

  function layout(k: FormationId): void {
    const f = FORMATIONS[k];
    // Une entrée en cours vise les membres de l'ancienne formation : la laisser
    // courir rallumerait des voix qui viennent de quitter le plateau.
    annulerEntree();
    current = f;
    spot.dataset.formation = k;
    swapMark(f);

    const D = spot.clientWidth || 600;
    const toPx = (v: number): number => (v / 100) * D;
    let i = 0;

    for (const V of VOICES) {
      const st = el[V.id];
      const inside = f.members.includes(V.id);

      if (inside) {
        const b = boxOf(V.id, f);
        const T: Pt = { x: b.left + b.w / 2, y: b.top + b.h / 2 };
        const first = st.ctr === null; // n'est jamais entrée : vient des coulisses

        let A: Pt;
        let s0: number;
        let b0: number;
        if (first) {
          const S = periph();
          A = { x: toPx(S.x - T.x), y: toPx(S.y - T.y) };
          s0 = 0.5;
          b0 = 4;
        } else {
          // reprise exacte de la position visuelle courante
          A = { x: toPx(st.ctr!.x - T.x) + st.off.x, y: toPx(st.ctr!.y - T.y) + st.off.y };
          s0 = st.sc;
          b0 = st.bl;
        }

        st.node.style.left = b.left + '%';
        st.node.style.top = b.top + '%';
        st.node.style.width = b.w + '%';
        st.node.classList.remove('gone', 'leaving');
        st.node.removeAttribute('tabindex');

        flight(V.id, A, { x: 0, y: 0 }, {
          dur: first ? 1750 : 1400,
          delay: i++ * 55,
          s0, s1: 1, b0, b1: 0,
        });
        st.ctr = T;
      } else if (st.onstage) {
        const P = periph();
        const C = st.ctr!;
        st.node.setAttribute('tabindex', '-1');
        st.node.classList.add('leaving');
        if (st.on) setVoice(V.id, false);

        flight(V.id, { x: st.off.x, y: st.off.y }, { x: toPx(P.x - C.x), y: toPx(P.y - C.y) }, {
          dur: 1450,
          delay: i++ * 45,
          s0: st.sc, s1: 0.2, b0: st.bl, b1: 4,
          done: () => st.node.classList.add('gone'),
        });
      }
      st.onstage = inside;
    }

    spot.classList.toggle('full', f.members.every((m) => el[m].on));
  }

  /* ═══ onglets ═══ */
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.tab'));
  for (const t of tabs) {
    t.addEventListener('click', () => {
      for (const x of tabs) x.setAttribute('aria-selected', 'false');
      t.setAttribute('aria-selected', 'true');
      layout(t.dataset.f as FormationId);
    });
  }

  /* ═══ choix de boucle ═══ */
  const pisteBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.piste'));
  for (const b of pisteBtns) {
    const p = PISTES.find((x) => x.id === b.dataset.piste);
    if (!p) continue;
    b.addEventListener('click', async () => {
      for (const x of pisteBtns) x.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-pressed', 'true');
      AU.piste = p;
      AU.loaded = null;
      await AU.load(p);
    });
  }

  /* ═══ transport ═══ */
  const ICO = {
    play: '<svg viewBox="0 0 14 16" aria-hidden="true"><path d="M1 1l12 7-12 7z" fill="currentColor"/></svg>',
    pause:
      '<svg viewBox="0 0 14 16" aria-hidden="true"><rect x="2" y="1" width="3.6" height="14" fill="currentColor"/>' +
      '<rect x="8.4" y="1" width="3.6" height="14" fill="currentColor"/></svg>',
  };

  /**
   * Lecture fait entrer les voix une à une, par minuteries. Sans les annuler,
   * un Arrêt pendant l'entrée est suivi de voix qui se rallument toutes seules.
   */
  let entree: number[] = [];
  function annulerEntree(): void {
    for (const t of entree) clearTimeout(t);
    entree = [];
  }

  function paintTransport(): void {
    const playing = AU.anyOn() && !AU.paused;
    btnPlay.innerHTML = playing ? ICO.pause : ICO.play;
    btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Lecture');
    btnStop.disabled = !AU.anyOn();
  }

  btnPlay.addEventListener('click', async () => {
    if (AU.paused) {
      await AU.resume();
      paintTransport();
      return;
    }
    if (AU.anyOn()) {
      annulerEntree();
      await AU.pause();
      paintTransport();
      return;
    }
    // Rien ne joue : on fait entrer les voix une à une, dans l'ordre.
    spot.classList.add('playing');
    hint.classList.add('off');
    await AU.load(AU.piste);
    // Du grave vers l'aigu : c'est comme ça qu'on empile un accord barbershop.
    // `members` suit l'ordre d'empilement graphique, pas l'ordre des tessitures.
    const ordre = VOICES.filter((v) => current.members.includes(v.id)).map((v) => v.id);
    const step = ((AU.loopLen || 10) * 1000) / 8;
    annulerEntree();
    entree = ordre.map((id, i) => window.setTimeout(() => setVoice(id, true), i * step));
    paintTransport();
  });

  btnStop.addEventListener('click', async () => {
    annulerEntree();
    await AU.resume();
    for (const v of VOICES) setVoice(v.id, false);
    spot.classList.remove('playing');
    hint.classList.remove('off');
    paintTransport();
  });

  /* ═══ arc de progression ═══
     La boucle d'animation ne tourne que pendant qu'une voix chante : inutile
     de garder un requestAnimationFrame vivant sur une page à l'arrêt. */
  const R = 49.3;
  const CIRC = 2 * Math.PI * R;
  arcC.setAttribute('stroke-dasharray', String(CIRC));
  arcC.setAttribute('stroke-dashoffset', String(CIRC));

  let ticking = false;
  function startTick(): void {
    if (ticking) return;
    ticking = true;
    const loop = (): void => {
      if (!arc.classList.contains('live')) {
        ticking = false;
        arcC.setAttribute('stroke-dashoffset', String(CIRC));
        return;
      }
      arcC.setAttribute('stroke-dashoffset', String(CIRC * (1 - AU.phase())));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ═══ départ ═══
     Les têtes sont déjà à leur place finale dans le HTML. On remet l'état à
     « jamais entrée » pour qu'elles rejouent leur arrivée par la périphérie,
     puis on rend le plateau visible : le premier rendu ne montre donc jamais
     de saut. Sans JavaScript, `.ready` n'arrive jamais mais rien ne masque
     les têtes non plus — le logo reste simplement fixe. */
  paintTransport();
  layout(readFormation());
  spot.classList.add('ready');

  // Préchauffage : dès le premier geste sur la page, on prépare l'audio, sans
  // rien griser — le geste en question est souvent le clic sur Lecture.
  for (const ev of ['pointerdown', 'keydown'] as const) {
    window.addEventListener(ev, () => void AU.load(AU.piste, true), { once: true });
  }
}
