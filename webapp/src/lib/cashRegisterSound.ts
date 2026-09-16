// Campanita de "caja registradora antigua" para avisar pedidos nuevos en el
// admin — sintetizada en el navegador con Web Audio API (sin archivo de
// audio de por medio), para que suene igual sin depender de conexión ni
// licencias.

let sharedContext: AudioContext | null = null;
let sharedMasterBus: AudioNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  return sharedContext;
}

// Todo el sonido pasa por un compresor antes de salir — deja subir mucho el
// volumen de cada capa (para que suene fuerte y con cuerpo) sin que se
// distorsione o "reviente" al sumarse todas a la vez.
function getMasterBus(ctx: AudioContext): AudioNode {
  if (!sharedMasterBus) {
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.15;
    const boost = ctx.createGain();
    boost.gain.value = 1.6;
    compressor.connect(boost);
    boost.connect(ctx.destination);
    sharedMasterBus = compressor;
  }
  return sharedMasterBus;
}

// Los navegadores bloquean el audio hasta que hay una interacción real del
// usuario (clic) — esto debe llamarse desde dentro de ese clic para
// "desbloquear" el sonido para el resto de la sesión.
export async function unlockAudio(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  return ctx.state === 'running';
}

function playTone(
  ctx: AudioContext,
  bus: AudioNode,
  time: number,
  freq: number,
  duration: number,
  peakGain: number,
  type: OscillatorType,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(peakGain, time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(bus);
  osc.start(time);
  osc.stop(time + duration + 0.02);
}

function playNoiseBurst(
  ctx: AudioContext,
  bus: AudioNode,
  time: number,
  durationSec: number,
  freq: number,
  q: number,
  peakGain: number,
) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(peakGain, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + durationSec);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(bus);
  noise.start(time);
  noise.stop(time + durationSec);
}

// Golpe grave del mecanismo (el "clank" metálico del cajón al abrirse).
function playMechThunk(ctx: AudioContext, bus: AudioNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(85, time + 0.12);
  gain.gain.setValueAtTime(0.85, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  osc.connect(gain);
  gain.connect(bus);
  osc.start(time);
  osc.stop(time + 0.17);
}

// Una sola campanada brillante y resonante, como la campanita de escritorio
// de una caja registradora de manivela: dos frecuencias casi idénticas
// (para el "aleteo" natural de un timbre real) más un armónico agudo por
// encima, con una caída larga como si siguiera vibrando.
function playBell(ctx: AudioContext, bus: AudioNode, time: number) {
  playTone(ctx, bus, time, 2100, 1.1, 0.5, 'triangle');
  playTone(ctx, bus, time, 2114, 1.1, 0.45, 'sine');
  playTone(ctx, bus, time, 4200, 0.6, 0.14, 'sine');
}

// El clásico timbre de caja registradora antigua: la manivela (trinquete
// mecánico), el golpe del cajón al abrirse y la campanada de escritorio.
export function playCashRegisterSound(): void {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  const bus = getMasterBus(ctx);
  const now = ctx.currentTime;

  // Manivela: 4 clics mecánicos parejos.
  for (let i = 0; i < 4; i++) {
    playNoiseBurst(ctx, bus, now + i * 0.045, 0.025, 3200, 2.5, 0.4);
  }

  playMechThunk(ctx, bus, now + 0.19);
  playNoiseBurst(ctx, bus, now + 0.19, 0.06, 2200, 1.1, 0.6);

  playBell(ctx, bus, now + 0.34);
}
