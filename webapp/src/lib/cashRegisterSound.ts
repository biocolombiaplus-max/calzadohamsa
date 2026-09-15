// Campanita de "caja registradora" para avisar pedidos nuevos en el admin —
// sintetizada en el navegador con Web Audio API (sin archivo de audio de
// por medio), para que suene igual sin depender de conexión ni licencias.

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  return sharedContext;
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
  gain.gain.linearRampToValueAtTime(peakGain, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.02);
}

function playClick(ctx: AudioContext, time: number) {
  const bufferSize = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2800;
  filter.Q.value = 1.2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.45, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(time);
  noise.stop(time + 0.05);
}

// El clásico "cha-ching": un golpe seco (mecanismo de la caja) seguido de
// dos campanadas metálicas brillantes, la segunda un poco más aguda.
export function playCashRegisterSound(): void {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  playClick(ctx, now);
  playTone(ctx, now + 0.02, 1568, 0.35, 0.22, 'triangle');
  playTone(ctx, now + 0.02, 1976, 0.35, 0.14, 'sine');
  playTone(ctx, now + 0.17, 2093, 0.55, 0.22, 'triangle');
  playTone(ctx, now + 0.17, 2637, 0.55, 0.13, 'sine');
}
