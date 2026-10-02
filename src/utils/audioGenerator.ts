/**
 * Web Audio API based audio generator for royalty-free tracks and sound effects.
 * Produces real audio buffers, playable blobs, and visual waveform data.
 */

// Global AudioContext singleton
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Generate a synthetic audio buffer and convert it to a WAV Blob URL
 */
function bufferToWave(abuffer: AudioBuffer): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);  // file length - 8
  setUint32(0x45564157); // "WAVE"

  // FMT sub-chunk
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16);          // SubChunk1Size (16 for PCM)
  setUint16(1);           // AudioFormat (1 for PCM)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample

  // data sub-chunk
  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (offset < abuffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: 'audio/wav' });
}

/**
 * Generate waveform array from AudioBuffer for UI visualization
 */
export function extractWaveform(buffer: AudioBuffer, samples = 50): number[] {
  const data = buffer.getChannelData(0);
  const step = Math.floor(data.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    let sum = 0;
    const start = i * step;
    for (let j = 0; j < step; j += 10) {
      sum += Math.abs(data[start + j] || 0);
    }
    const avg = sum / (step / 10);
    waveform.push(Math.min(1, Math.max(0.1, avg * 3.5)));
  }
  return waveform;
}

/**
 * Generate Procedural Music Tracks
 */
export function generateSyntheticMusic(type: 'lofi' | 'cinematic' | 'trap' | 'cyberpunk', durationSec = 12): { blobUrl: string; waveform: number[]; buffer: AudioBuffer } {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const numSamples = Math.floor(sampleRate * durationSec);
  const audioBuffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  const bpm = type === 'trap' ? 140 : type === 'lofi' ? 82 : type === 'cyberpunk' ? 128 : 100;
  const beatInterval = 60 / bpm;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sLeft = 0;
    let sRight = 0;

    if (type === 'lofi') {
      // Warm chords + vinyl crackle + soft kick/snare
      const chordTime = Math.floor(t / (beatInterval * 4)) % 4;
      const rootFreq = [220, 196, 174, 164][chordTime];
      
      // Electric piano Rhodes approximation (sum of sine harmonics)
      const epiano = 
        Math.sin(2 * Math.PI * rootFreq * t) * 0.2 +
        Math.sin(2 * Math.PI * rootFreq * 1.5 * t) * 0.15 +
        Math.sin(2 * Math.PI * rootFreq * 2.0 * t) * 0.1;
      
      // Drum kick on beat 0 & 2
      const beatProgress = (t % (beatInterval * 2)) / beatInterval;
      let kick = 0;
      if (beatProgress < 0.25) {
        const kickPitch = Math.max(45, 120 * Math.exp(-beatProgress * 25));
        kick = Math.sin(2 * Math.PI * kickPitch * beatProgress) * Math.exp(-beatProgress * 15) * 0.4;
      }
      
      // Snare on beat 1 & 3
      const snareOffset = (t + beatInterval) % (beatInterval * 2) / beatInterval;
      let snare = 0;
      if (snareOffset < 0.2) {
        snare = (Math.random() * 2 - 1) * Math.exp(-snareOffset * 20) * 0.2;
      }

      // Vinyl subtle crackle
      const crackle = Math.random() < 0.003 ? (Math.random() - 0.5) * 0.15 : 0;

      sLeft = (epiano + kick + snare + crackle) * 0.7;
      sRight = (epiano * 0.95 + kick + snare + crackle) * 0.7;
    } 
    else if (type === 'cinematic') {
      // Deep sub bass drone + rising string riser + epic impact
      const subBass = Math.sin(2 * Math.PI * (55 + Math.sin(t * 0.5) * 5) * t) * 0.35;
      const highString = (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 660 * t)) * 0.15 * (0.5 + 0.5 * Math.sin(t * 2));
      
      // Cinematic hit at beginning
      let hit = 0;
      if (t < 2.5) {
        hit = Math.sin(2 * Math.PI * (70 * Math.exp(-t * 2)) * t) * Math.exp(-t * 1.5) * 0.5 + (Math.random() * 2 - 1) * Math.exp(-t * 3) * 0.2;
      }

      sLeft = subBass + highString * 0.8 + hit;
      sRight = subBass + highString * 1.1 + hit;
    }
    else if (type === 'cyberpunk') {
      // Fast rolling bassline + synth arpeggio
      const bassStep = Math.floor(t / (beatInterval / 2)) % 4;
      const bassFreq = [65, 65, 73, 58][bassStep];
      const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.3 + (Math.sin(2 * Math.PI * bassFreq * 2 * t) > 0 ? 0.1 : -0.1);
      
      const arpStep = Math.floor(t / (beatInterval / 4)) % 8;
      const arpFreq = [260, 330, 392, 520, 660, 784, 660, 520][arpStep];
      const lead = Math.sin(2 * Math.PI * arpFreq * t) * 0.15;

      sLeft = (bass + lead) * 0.7;
      sRight = (bass + lead * 0.9) * 0.7;
    }
    else {
      // Upbeat Trap
      const barTime = t % (beatInterval * 4);
      const kick = barTime < 0.2 ? Math.sin(2 * Math.PI * 60 * barTime) * Math.exp(-barTime * 12) * 0.5 : 0;
      const snare = (barTime > beatInterval * 2 && barTime < beatInterval * 2 + 0.2) ? (Math.random() * 2 - 1) * 0.3 : 0;
      const hihat = (t % (beatInterval / 2) < 0.05) ? (Math.random() * 2 - 1) * 0.15 : 0;

      sLeft = kick + snare + hihat;
      sRight = kick + snare + hihat;
    }

    // Master limiting & soft clip
    left[i] = Math.max(-0.95, Math.min(0.95, sLeft));
    right[i] = Math.max(-0.95, Math.min(0.95, sRight));
  }

  const blob = bufferToWave(audioBuffer);
  const blobUrl = URL.createObjectURL(blob);
  const waveform = extractWaveform(audioBuffer, 60);

  return { blobUrl, waveform, buffer: audioBuffer };
}

/**
 * Generate Sound Effects (SFX)
 */
export function generateSFX(type: 'whoosh' | 'shutter' | 'impact' | 'pop' | 'glitch'): { blobUrl: string; duration: number } {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  let duration = 0.5;

  if (type === 'whoosh') duration = 0.8;
  if (type === 'impact') duration = 1.2;
  if (type === 'shutter') duration = 0.3;
  if (type === 'pop') duration = 0.15;
  if (type === 'glitch') duration = 0.4;

  const numSamples = Math.floor(sampleRate * duration);
  const audioBuffer = ctx.createBuffer(1, numSamples, sampleRate);
  const channel = audioBuffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = 0;

    if (type === 'whoosh') {
      const p = t / duration;
      const freq = 150 + Math.sin(p * Math.PI) * 1200;
      const noise = (Math.random() * 2 - 1);
      s = noise * Math.sin(p * Math.PI) * 0.4 + Math.sin(2 * Math.PI * freq * t) * Math.sin(p * Math.PI) * 0.2;
    } else if (type === 'shutter') {
      if (t < 0.08 || (t > 0.12 && t < 0.2)) {
        s = (Math.random() * 2 - 1) * 0.6;
      }
    } else if (type === 'impact') {
      s = Math.sin(2 * Math.PI * (120 * Math.exp(-t * 4)) * t) * Math.exp(-t * 2.5) * 0.7 + (Math.random() * 2 - 1) * Math.exp(-t * 6) * 0.3;
    } else if (type === 'pop') {
      const freq = 400 + (1 - t / duration) * 600;
      s = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 25) * 0.6;
    } else if (type === 'glitch') {
      const freq = (i % 200 > 100) ? 880 : 330;
      s = (Math.sin(2 * Math.PI * freq * t) + (Math.random() > 0.8 ? 0.4 : 0)) * 0.3;
    }

    channel[i] = Math.max(-0.95, Math.min(0.95, s));
  }

  const blob = bufferToWave(audioBuffer);
  const blobUrl = URL.createObjectURL(blob);
  return { blobUrl, duration };
}
