/**
 * Ambient sound for the film: slow wind over sand, a faint sub drone, a little space.
 *
 * Everything is synthesised with the Web Audio API, nothing is downloaded. The graph is
 * one looped buffer of pink noise through two slow low-pass filters whose cutoff and gain
 * drift in scheduled gusts, two detuned sines near 58 Hz as a sub drone, a stereo panner
 * that wanders, a compressor and a master gain that fades in over 2.5 s and out over 1.2 s.
 *
 * Browser policy: an AudioContext may only produce sound after a user gesture, so the
 * engine never creates one before the first gesture (or an explicit toggle). `armAutoStart`
 * installs one-shot listeners for the first pointer, key, touch or wheel event. The
 * preference lives in localStorage under `liwa:sound` ("on" | "off"; default on).
 */

export type AmbienceState = {
  /** The user's intent: sound is on (it may still be waiting for the first gesture). */
  on: boolean;
  /** Sound is audibly running right now. */
  playing: boolean;
};

type Listener = (state: AmbienceState) => void;

const STORAGE_KEY = "liwa:sound";
const FADE_IN = 2.5;
const FADE_OUT = 1.2;
const MASTER_LEVEL = 0.3;

/** The live graph: the handles the engine needs after construction. */
export type AmbienceGraph = {
  master: GainNode;
  /** Appends random gusts to the wind automation up to `until` (context seconds). */
  scheduleGustsUntil: (until: number) => void;
  /** Stops the sources (the graph cannot be restarted afterwards). */
  stop: () => void;
};

type AutoplayNavigator = Navigator & {
  getAutoplayPolicy?: (type: "audiocontext") => "allowed" | "allowed-muted" | "disallowed";
  userActivation?: { hasBeenActive: boolean };
};

/* ---------- Noise ---------- */

/**
 * Pink noise (Paul Kellet's economical filter) in two independent channels so the wind has
 * width. The loop seam is dissolved by cross-fading the last 150 ms into the first 150 ms.
 */
function makePinkNoise(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(seconds * rate);
  const buffer = ctx.createBuffer(2, length, rate);
  const seam = Math.floor(0.15 * rate);

  for (let ch = 0; ch < 2; ch += 1) {
    const data = buffer.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    // Equal-power cross-fade across the seam so the loop is inaudible.
    for (let i = 0; i < seam; i += 1) {
      const t = i / seam;
      const head = data[i];
      const tail = data[length - seam + i];
      data[i] = head * Math.sin((t * Math.PI) / 2) + tail * Math.cos((t * Math.PI) / 2);
    }
    // Keep the peak well below full scale.
    let peak = 0;
    for (let i = 0; i < length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
    const norm = peak > 0 ? 0.5 / peak : 1;
    for (let i = 0; i < length; i += 1) data[i] *= norm;
  }
  return buffer;
}

/* ---------- Graph ---------- */

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/**
 * Builds the whole ambience into `ctx` and connects it to `ctx.destination`. Works with an
 * OfflineAudioContext too (used to measure levels). The master gain starts at 0.
 */
export function buildAmbienceGraph(ctx: BaseAudioContext): AmbienceGraph {
  const now = ctx.currentTime;

  // Wind: pink noise, two gentle low-passes (24 dB/oct), a high-pass to clear the sub band.
  const noise = ctx.createBufferSource();
  noise.buffer = makePinkNoise(ctx, 5);
  noise.loop = true;

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 70;
  highpass.Q.value = 0.5;

  const lowA = ctx.createBiquadFilter();
  lowA.type = "lowpass";
  lowA.frequency.value = 420;
  lowA.Q.value = 0.6;

  const lowB = ctx.createBiquadFilter();
  lowB.type = "lowpass";
  lowB.frequency.value = 900;
  lowB.Q.value = 0.4;

  const windGain = ctx.createGain();
  windGain.gain.value = 0.38;

  // A slow breath under the gusts: ±60 Hz on the first cutoff every ~22 s.
  const breath = ctx.createOscillator();
  breath.type = "sine";
  breath.frequency.value = 0.045;
  const breathDepth = ctx.createGain();
  breathDepth.gain.value = 60;
  breath.connect(breathDepth).connect(lowA.frequency);

  // Stereo: the wind wanders slowly from side to side, never far.
  const panner = ctx.createStereoPanner();
  const panLfo = ctx.createOscillator();
  panLfo.type = "sine";
  panLfo.frequency.value = 0.018;
  const panDepth = ctx.createGain();
  panDepth.gain.value = 0.32;
  panLfo.connect(panDepth).connect(panner.pan);

  noise.connect(highpass).connect(lowA).connect(lowB).connect(windGain).connect(panner);

  // Sub drone: two detuned sines, a slow beat between them, barely there.
  const droneA = ctx.createOscillator();
  droneA.type = "sine";
  droneA.frequency.value = 58;
  const droneB = ctx.createOscillator();
  droneB.type = "sine";
  droneB.frequency.value = 58.45;
  const droneLow = ctx.createBiquadFilter();
  droneLow.type = "lowpass";
  droneLow.frequency.value = 110;
  droneLow.Q.value = 0.5;
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.034;
  const droneSwell = ctx.createOscillator();
  droneSwell.type = "sine";
  droneSwell.frequency.value = 0.027;
  const droneSwellDepth = ctx.createGain();
  droneSwellDepth.gain.value = 0.012;
  droneSwell.connect(droneSwellDepth).connect(droneGain.gain);
  droneA.connect(droneLow);
  droneB.connect(droneLow);
  droneLow.connect(droneGain);

  // Master: a soft compressor as a safety net, then the fade gain.
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -26;
  compressor.knee.value = 14;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.05;
  compressor.release.value = 0.5;

  const master = ctx.createGain();
  master.gain.value = 0;

  panner.connect(compressor);
  droneGain.connect(compressor);
  compressor.connect(master).connect(ctx.destination);

  noise.start(now);
  breath.start(now);
  panLfo.start(now);
  droneA.start(now);
  droneB.start(now);
  droneSwell.start(now);

  // Gusts: every 6 to 14 s the cutoff and the wind gain glide to a new place over 3 to 8 s.
  let scheduled = now;
  lowA.frequency.setValueAtTime(420, now);
  windGain.gain.setValueAtTime(0.38, now);
  const scheduleGustsUntil = (until: number) => {
    while (scheduled < until) {
      const wait = rand(6, 14);
      const glide = rand(3, 8);
      const at = scheduled + wait;
      const cutoff = rand(240, 820);
      // Louder gusts open the filter; the two move together so a gust feels like one thing.
      const level = 0.2 + ((cutoff - 240) / 580) * 0.4 + rand(-0.04, 0.04);
      lowA.frequency.linearRampToValueAtTime(cutoff, at + glide);
      windGain.gain.linearRampToValueAtTime(Math.max(0.14, Math.min(0.66, level)), at + glide);
      scheduled = at + glide;
    }
  };

  const stop = () => {
    for (const src of [noise, breath, panLfo, droneA, droneB, droneSwell]) {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    }
  };

  return { master, scheduleGustsUntil, stop };
}

/* ---------- Engine ---------- */

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function writePreference(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* private mode or blocked storage: the session still works */
  }
}

const GESTURES = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

class Ambience {
  private ctx: AudioContext | null = null;
  private graph: AmbienceGraph | null = null;
  private state: AmbienceState = { on: readPreference(), playing: false };
  private listeners = new Set<Listener>();
  private gestureCleanup: (() => void) | null = null;
  private fadeTimer: number | undefined;
  private gustTimer: number | undefined;
  private visibilityBound = false;
  private sequence = 0;

  /** Current state as a stable snapshot (safe for useSyncExternalStore). */
  getState = (): AmbienceState => this.state;

  isOn(): boolean {
    return this.state.on;
  }

  isPlaying(): boolean {
    return this.state.playing;
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Turn the sound on (from a user gesture or a page where autoplay is allowed). */
  enable(): void {
    this.setState({ on: true });
    writePreference(true);
    this.disarm();
    void this.start();
  }

  /** Turn the sound off: fade, then suspend the context. */
  disable(): void {
    this.setState({ on: false });
    writePreference(false);
    this.disarm();
    this.fadeOutAndSuspend();
  }

  toggle(): void {
    if (this.state.on) this.disable();
    else this.enable();
  }

  /**
   * Starts the sound when the browser allows it: at once if the page already has an
   * activation or the browser reports autoplay as allowed, otherwise on the first gesture.
   * Does nothing if the visitor turned the sound off earlier.
   */
  armAutoStart(): void {
    if (typeof window === "undefined") return;
    this.bindVisibility();
    if (!this.state.on) return;
    const nav = navigator as AutoplayNavigator;
    const allowedNow = nav.userActivation?.hasBeenActive === true || nav.getAutoplayPolicy?.("audiocontext") === "allowed";
    if (allowedNow) {
      void this.start();
      return;
    }
    this.arm();
  }

  /* ---- internals ---- */

  private setState(patch: Partial<AmbienceState>) {
    const next = { ...this.state, ...patch };
    if (next.on === this.state.on && next.playing === this.state.playing) return;
    this.state = next;
    for (const l of this.listeners) l(next);
  }

  private arm() {
    if (this.gestureCleanup) return;
    const onGesture = () => {
      this.disarm();
      if (this.state.on) void this.start();
    };
    for (const type of GESTURES) window.addEventListener(type, onGesture, { once: true, passive: true });
    this.gestureCleanup = () => {
      for (const type of GESTURES) window.removeEventListener(type, onGesture);
    };
  }

  private disarm() {
    this.gestureCleanup?.();
    this.gestureCleanup = null;
  }

  private bindVisibility() {
    if (this.visibilityBound) return;
    this.visibilityBound = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        if (this.state.playing) this.fadeOutAndSuspend();
      } else if (this.state.on && this.ctx) {
        void this.start();
      }
    });
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor({ latencyHint: "playback" });
    } catch {
      return null;
    }
    return this.ctx;
  }

  private async start(): Promise<void> {
    const seq = ++this.sequence;
    window.clearTimeout(this.fadeTimer);
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch {
        /* fall through: the state check below handles it */
      }
    }
    if (seq !== this.sequence || !this.state.on) return;
    if (ctx.state !== "running") {
      // Blocked: wait for a gesture and try again.
      this.arm();
      return;
    }
    if (!this.graph) this.graph = buildAmbienceGraph(ctx);
    const g = this.graph.master.gain;
    const now = ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(g.value, 0.0001), now);
    g.linearRampToValueAtTime(MASTER_LEVEL, now + FADE_IN);
    this.topUpGusts();
    this.setState({ playing: true });
  }

  private topUpGusts() {
    window.clearInterval(this.gustTimer);
    const tick = () => {
      if (this.ctx && this.graph) this.graph.scheduleGustsUntil(this.ctx.currentTime + 40);
    };
    tick();
    this.gustTimer = window.setInterval(tick, 15000);
  }

  private fadeOutAndSuspend() {
    const seq = ++this.sequence;
    window.clearInterval(this.gustTimer);
    window.clearTimeout(this.fadeTimer);
    const ctx = this.ctx;
    this.setState({ playing: false });
    if (!ctx || !this.graph) return;
    const g = this.graph.master.gain;
    const now = ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + FADE_OUT);
    this.fadeTimer = window.setTimeout(() => {
      if (seq !== this.sequence) return;
      void ctx.suspend().catch(() => undefined);
    }, FADE_OUT * 1000 + 60);
  }
}

let instance: Ambience | null = null;

/** The one ambience engine for the page. */
export function getAmbience(): Ambience {
  if (!instance) instance = new Ambience();
  return instance;
}
