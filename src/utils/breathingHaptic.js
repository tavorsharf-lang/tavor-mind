// Audio-haptic for the breathing exercise.
// iOS Safari does not expose the Vibration API, so we approximate Taptic feel through Web Audio:
// 70Hz sine bursts read as sub-bass thumps through headphones and stay audible on phone speakers.
// The iOS silent switch / system volume is the natural mute — no in-app toggle.

class BreathingHaptic {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.scheduled = [];
  }

  ensure() {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.4;
      this.master.connect(this.ctx.destination);
    } catch (_) {
      this.ctx = null;
    }
    return this.ctx;
  }

  resumeIfNeeded() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // One short percussive tap at audio-time `when`, intensity 0..1.
  // Body = 70Hz sine for the felt thump, click = 220Hz triangle (very brief) for definition on small speakers.
  scheduleTap(when, intensity) {
    const ctx = this.ctx;
    if (!ctx) return;
    const body = ctx.createOscillator();
    body.type = 'sine';
    body.frequency.value = 70;
    const click = ctx.createOscillator();
    click.type = 'triangle';
    click.frequency.value = 220;
    const g = ctx.createGain();
    const peak = Math.max(0.0005, Math.min(1, intensity));
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.13);
    body.connect(g);
    click.connect(g);
    g.connect(this.master);
    body.start(when);
    body.stop(when + 0.16);
    click.start(when);
    click.stop(when + 0.045);
    this.scheduled.push(body, click);
  }

  // Inhale: N taps with shrinking intervals (gamma<1 in t = T·p^gamma) and rising intensity.
  // For a 4s inhale → 8 taps; intervals 1244ms → 352ms; volume 0.2 → 1.0.
  scheduleInhale(durationSec) {
    if (!this.ensure()) return;
    this.resumeIfNeeded();
    this.cancel();
    const N = Math.max(4, Math.round(durationSec * 2));
    const start = this.ctx.currentTime;
    const gamma = 0.6;
    for (let i = 0; i < N; i++) {
      const p = i / (N - 1);
      const t = durationSec * Math.pow(p, gamma);
      const intensity = 0.2 + 0.8 * p;
      this.scheduleTap(start + t, intensity);
    }
  }

  cancel() {
    const t = this.ctx ? this.ctx.currentTime : 0;
    this.scheduled.forEach((o) => {
      try { o.stop(t); } catch (_) {}
      try { o.disconnect(); } catch (_) {}
    });
    this.scheduled = [];
  }
}

let singleton = null;

export function getBreathingHaptic() {
  if (!singleton) singleton = new BreathingHaptic();
  return singleton;
}
