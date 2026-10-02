import { VideoClip, AudioClip, TextOverlay, StickerOverlay, VideoProject } from '../types/editor';
import { generateSyntheticMusic } from './audioGenerator';

/**
 * Generate a thumbnail data URL for a procedural theme or canvas graphic
 */
export function generateProceduralThumbnail(theme: VideoClip['proceduralTheme']): string {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 90;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (theme === 'neon_city') {
    const grad = ctx.createLinearGradient(0, 0, 160, 90);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 160, 90);

    // Neon grid lines
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1;
    for (let i = 0; i < 160; i += 20) {
      ctx.beginPath();
      ctx.moveTo(80, 45);
      ctx.lineTo(i, 90);
      ctx.stroke();
    }
    // Neon sun
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(80, 45, 20, Math.PI, 0);
    ctx.fill();
  } else if (theme === 'sunset_skate') {
    const grad = ctx.createLinearGradient(0, 0, 0, 90);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.6, '#ec4899');
    grad.addColorStop(1, '#3b0764');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 160, 90);

    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(110, 35, 16, 0, Math.PI * 2);
    ctx.fill();

    // Palm silhouettes
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 75, 160, 15);
  } else if (theme === 'nature_drone') {
    const grad = ctx.createLinearGradient(0, 0, 0, 90);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#38bdf8');
    grad.addColorStop(1, '#059669');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 160, 90);

    // Mountain silhouettes
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(0, 90);
    ctx.lineTo(40, 40);
    ctx.lineTo(90, 70);
    ctx.lineTo(130, 35);
    ctx.lineTo(160, 90);
    ctx.fill();
  } else if (theme === 'tech_matrix') {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 160, 90);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 20, 80, 50);
    ctx.beginPath();
    ctx.arc(80, 45, 15, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const grad = ctx.createLinearGradient(0, 0, 160, 90);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#a855f7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 160, 90);
  }

  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Draw procedural video frame for any clip at a specific time
 */
export function drawProceduralFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VideoClip['proceduralTheme'],
  time: number
) {
  if (theme === 'neon_city') {
    // Cyberpunk synthwave city
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#090514');
    grad.addColorStop(0.4, '#1e1035');
    grad.addColorStop(0.55, '#f43f5e');
    grad.addColorStop(1, '#05020a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Moving Retro Sun
    const sunY = height * 0.45;
    const sunRadius = Math.min(width, height) * 0.22;
    const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.5, '#f43f5e');
    sunGrad.addColorStop(1, '#7e22ce');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width / 2, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal sun lines
    ctx.fillStyle = '#090514';
    for (let i = 0; i < 6; i++) {
      const lineY = sunY + (i / 6) * sunRadius;
      const lh = 2 + i * 2;
      ctx.fillRect(width / 2 - sunRadius, lineY, sunRadius * 2, lh);
    }

    // Perspective moving grid floor
    ctx.save();
    const horizon = height * 0.55;
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 8;

    // Horizon line
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(width, horizon);
    ctx.stroke();

    // Vanishing perspective lines
    const numLines = 14;
    for (let i = 0; i <= numLines; i++) {
      const bottomX = (width / numLines) * i;
      ctx.beginPath();
      ctx.moveTo(width / 2, horizon);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }

    // Moving horizontal grid lines
    const speed = 1.2;
    const offset = (time * speed) % 1;
    for (let i = 1; i <= 8; i++) {
      const progress = Math.pow((i + offset) / 9, 2);
      const lineY = horizon + progress * (height - horizon);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(width, lineY);
      ctx.stroke();
    }
    ctx.restore();

    // Floating particles
    ctx.fillStyle = '#38bdf8';
    for (let p = 0; p < 20; p++) {
      const px = ((p * 137.5 + time * 30) % width);
      const py = ((p * 83.1 + Math.sin(time + p) * 20) % (height * 0.5));
      ctx.beginPath();
      ctx.arc(px, py, (p % 3) + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'sunset_skate') {
    // Golden hour horizon with motion
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.3, '#fb923c');
    grad.addColorStop(0.65, '#c026d3');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing sun
    const glowGrad = ctx.createRadialGradient(width * 0.7, height * 0.35, 10, width * 0.7, height * 0.35, width * 0.4);
    glowGrad.addColorStop(0, '#ffffff');
    glowGrad.addColorStop(0.2, '#fed7aa');
    glowGrad.addColorStop(0.6, 'rgba(251, 146, 60, 0.4)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Silhouette road / ramp curve
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.75);
    ctx.bezierCurveTo(
      width * 0.3, height * 0.75,
      width * 0.6, height * 0.85,
      width, height * 0.7
    );
    ctx.lineTo(width, height);
    ctx.fill();

    // Skateboarder silhouette motion
    const skaterProgress = (time * 0.4) % 1.2;
    const skateX = width * 0.2 + skaterProgress * (width * 0.6);
    const skateY = height * 0.75 + Math.sin(skaterProgress * Math.PI) * -60;

    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.translate(skateX, skateY);
    ctx.rotate(Math.sin(time * 3) * 0.1);
    
    // Head & Torso
    ctx.beginPath();
    ctx.arc(0, -32, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-4, -25, 8, 18);
    // Skateboard deck
    ctx.fillRect(-18, 0, 36, 4);
    ctx.beginPath();
    ctx.arc(-12, 5, 3, 0, Math.PI * 2);
    ctx.arc(12, 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (theme === 'nature_drone') {
    // Cinematic drone shot over mountain lake
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.5);

    // Moving subtle clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const cloudOffset = (time * 15) % width;
    ctx.beginPath();
    ctx.arc(cloudOffset, height * 0.15, 40, 0, Math.PI * 2);
    ctx.arc(cloudOffset + 35, height * 0.12, 50, 0, Math.PI * 2);
    ctx.arc(cloudOffset + 70, height * 0.15, 35, 0, Math.PI * 2);
    ctx.fill();

    // Mountains in layers
    const mountainColors = ['#334155', '#1e293b', '#0f172a'];
    for (let m = 0; m < 3; m++) {
      ctx.fillStyle = mountainColors[m];
      ctx.beginPath();
      const baseY = height * (0.35 + m * 0.08);
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);
      for (let x = 0; x <= width; x += 40) {
        const peak = Math.sin((x + m * 80 + time * 5) * 0.015) * (40 - m * 8);
        ctx.lineTo(x, baseY - peak);
      }
      ctx.lineTo(width, height);
      ctx.fill();
    }

    // Emerald Lake with reflection ripples
    const lakeGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
    lakeGrad.addColorStop(0, '#047857');
    lakeGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = lakeGrad;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);

    // Water ripple highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 5; r++) {
      const ry = height * (0.7 + r * 0.06) + Math.sin(time * 2 + r) * 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.2, ry);
      ctx.lineTo(width * 0.8, ry);
      ctx.stroke();
    }
  } else if (theme === 'tech_matrix') {
    // Cyber HUD interface
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    // Rotating tech rings
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, time * 0.8, time * 0.8 + Math.PI * 1.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, -time * 1.2, -time * 1.2 + Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, time * 2, time * 2 + Math.PI * 0.8);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 1.2, centerY);
    ctx.lineTo(centerX + radius * 1.2, centerY);
    ctx.moveTo(centerX, centerY - radius * 1.2);
    ctx.lineTo(centerX, centerY + radius * 1.2);
    ctx.stroke();

    // Data streams
    ctx.fillStyle = '#22d3ee';
    ctx.font = '10px monospace';
    ctx.fillText(`SYS: 60FPS // T: ${time.toFixed(2)}s`, centerX - radius, centerY + radius + 25);
    ctx.fillText(`BUFFER: ACTIVE // PRO-CORE`, centerX - radius, centerY + radius + 40);
    ctx.restore();
  }
}

/**
 * Generate Initial Default Sample Project
 */
export function createDefaultProject(): VideoProject {
  const music = generateSyntheticMusic('lofi', 16);

  const clip1: VideoClip = {
    id: 'clip-1',
    type: 'procedural',
    proceduralTheme: 'neon_city',
    title: 'Intro Neón Cyber',
    src: '',
    thumbnail: generateProceduralThumbnail('neon_city'),
    start: 0,
    duration: 4.5,
    sourceStart: 0,
    sourceDuration: 10,
    speed: 1.0,
    volume: 1.0,
    isMuted: false,
    filter: 'cyberpunk',
    adjustments: {
      brightness: 1.05,
      contrast: 1.15,
      saturation: 1.2,
      exposure: 0.1,
      vignette: 0.3,
      blur: 0,
      glitch: 0,
    },
    transition: {
      type: 'crossfade',
      duration: 0.6,
    },
    transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
  };

  const clip2: VideoClip = {
    id: 'clip-2',
    type: 'procedural',
    proceduralTheme: 'sunset_skate',
    title: 'Sunset Skate 4K',
    src: '',
    thumbnail: generateProceduralThumbnail('sunset_skate'),
    start: 4.5,
    duration: 5.0,
    sourceStart: 0,
    sourceDuration: 10,
    speed: 1.0,
    volume: 1.0,
    isMuted: false,
    filter: 'sunset',
    adjustments: {
      brightness: 1.0,
      contrast: 1.1,
      saturation: 1.25,
      exposure: 0,
      vignette: 0.2,
      blur: 0,
      glitch: 0,
    },
    transition: {
      type: 'flash_white',
      duration: 0.5,
    },
    transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
  };

  const clip3: VideoClip = {
    id: 'clip-3',
    type: 'procedural',
    proceduralTheme: 'nature_drone',
    title: 'Drone Cinematic',
    src: '',
    thumbnail: generateProceduralThumbnail('nature_drone'),
    start: 9.5,
    duration: 5.0,
    sourceStart: 0,
    sourceDuration: 10,
    speed: 1.0,
    volume: 1.0,
    isMuted: false,
    filter: 'cinematic',
    adjustments: {
      brightness: 1.0,
      contrast: 1.08,
      saturation: 1.1,
      exposure: 0.05,
      vignette: 0.35,
      blur: 0,
      glitch: 0,
    },
    transition: {
      type: 'none',
      duration: 0.5,
    },
    transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
  };

  const text1: TextOverlay = {
    id: 'text-1',
    text: 'NOVACUT PRO ⚡',
    start: 0.8,
    duration: 3.2,
    x: 50,
    y: 35,
    fontSize: 28,
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    fontFamily: 'Syne',
    fontWeight: '800',
    stylePreset: 'neon',
    animation: 'pop',
  };

  const text2: TextOverlay = {
    id: 'text-2',
    text: 'Edición Móvil en 4K 📱',
    start: 5.0,
    duration: 3.5,
    x: 50,
    y: 75,
    fontSize: 20,
    color: '#fef08a',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    stylePreset: 'subtitles',
    animation: 'fade',
  };

  const sticker1: StickerOverlay = {
    id: 'sticker-1',
    emojiOrIcon: '🔥',
    label: 'Fuego',
    start: 1.5,
    duration: 2.8,
    x: 82,
    y: 22,
    scale: 1.3,
    rotation: 12,
  };

  const audioTrack: AudioClip = {
    id: 'audio-1',
    title: 'Lo-Fi Chill Sunset',
    src: music.blobUrl,
    start: 0,
    duration: 14.5,
    volume: 0.85,
    fadeIn: 0.5,
    fadeOut: 1.0,
    category: 'music',
    waveform: music.waveform,
    audioBuffer: music.buffer,
  };

  return {
    id: 'proj-default-1',
    name: 'Mi Proyecto Android #1',
    aspectRatio: '9:16',
    fps: 30,
    resolution: '1080p',
    videoClips: [clip1, clip2, clip3],
    overlayClips: [],
    audioClips: [audioTrack],
    textOverlays: [text1, text2],
    stickers: [sticker1],
    lastModified: Date.now(),
  };
}

/**
 * Helper to extract thumbnail from user uploaded Video file
 */
export function extractThumbnailFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.readAsDataURL(file);
      return;
    }

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.currentTime = 1.0;

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 160, 90);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve('');
      }
    };

    video.onerror = () => {
      resolve(generateProceduralThumbnail('abstract_glow'));
    };
  });
}
