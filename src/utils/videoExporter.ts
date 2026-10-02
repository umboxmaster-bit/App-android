import { VideoProject, VideoClip } from '../types/editor';
import { drawProceduralFrame } from './sampleMedia';
import { getAudioContext } from './audioGenerator';

export interface ExportProgress {
  progress: number;       // 0 to 100
  currentFrame: number;
  totalFrames: number;
  currentTime: number;
  totalTime: number;
  status: 'rendering' | 'encoding' | 'completed' | 'error';
  error?: string;
}

/**
 * Get canvas dimensions based on aspect ratio and resolution
 */
export function getExportDimensions(aspectRatio: VideoProject['aspectRatio'], resolution: VideoProject['resolution']): { width: number; height: number } {
  let baseLongEdge = 1920;
  if (resolution === '720p') baseLongEdge = 1280;
  if (resolution === '4K') baseLongEdge = 3840;

  switch (aspectRatio) {
    case '9:16':
      return { width: Math.round(baseLongEdge * (9 / 16)), height: baseLongEdge };
    case '16:9':
      return { width: baseLongEdge, height: Math.round(baseLongEdge * (9 / 16)) };
    case '1:1':
      const sq = resolution === '720p' ? 720 : resolution === '4K' ? 2160 : 1080;
      return { width: sq, height: sq };
    case '4:5':
      return { width: Math.round(baseLongEdge * (4 / 5)), height: baseLongEdge };
  }
}

/**
 * Apply CSS filter string for canvas 2D context
 */
export function getFilterString(filter: VideoClip['filter'], adj: VideoClip['adjustments']): string {
  let filterStr = `brightness(${adj.brightness}) contrast(${adj.contrast}) saturate(${adj.saturation}) `;
  
  if (adj.blur > 0) {
    filterStr += `blur(${adj.blur}px) `;
  }

  switch (filter) {
    case 'cinematic':
      filterStr += 'contrast(1.2) saturate(1.15) sepia(0.1) ';
      break;
    case 'cyberpunk':
      filterStr += 'saturate(1.5) hue-rotate(185deg) contrast(1.3) ';
      break;
    case 'warm':
      filterStr += 'sepia(0.3) saturate(1.2) ';
      break;
    case 'mono':
    case 'noir':
      filterStr += 'grayscale(1) contrast(1.4) ';
      break;
    case 'vintage':
      filterStr += 'sepia(0.4) contrast(0.9) brightness(1.1) ';
      break;
    case 'teal_orange':
      filterStr += 'contrast(1.25) saturate(1.3) hue-rotate(15deg) ';
      break;
    case 'sunset':
      filterStr += 'saturate(1.4) sepia(0.2) contrast(1.1) ';
      break;
    case 'vibrant':
      filterStr += 'saturate(1.6) contrast(1.1) ';
      break;
  }

  return filterStr.trim();
}

/**
 * Render a single frame onto a canvas at target time
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  time: number,
  width: number,
  height: number,
  videoElements: Map<string, HTMLVideoElement | HTMLImageElement>
) {
  // Clear
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // 1. Render Main Video Clip
  const currentClip = project.videoClips.find(
    (c) => time >= c.start && time < c.start + c.duration
  );

  if (currentClip) {
    const clipLocalTime = (time - currentClip.start) * currentClip.speed + currentClip.sourceStart;
    
    ctx.save();

    // Check transition with previous or next clip
    const nextClip = project.videoClips.find(
      (c) => c.start === currentClip.start + currentClip.duration
    );
    const transTimeLeft = (currentClip.start + currentClip.duration) - time;
    const isTransitioning = currentClip.transition.type !== 'none' && transTimeLeft <= currentClip.transition.duration;

    // Filters & adjustments
    ctx.filter = getFilterString(currentClip.filter, currentClip.adjustments);

    // Transforms
    const scale = currentClip.transform.scale || 1.0;
    const posX = width / 2 + (currentClip.transform.x / 100) * width;
    const posY = height / 2 + (currentClip.transform.y / 100) * height;

    ctx.translate(posX, posY);
    if (currentClip.transform.rotation) {
      ctx.rotate((currentClip.transform.rotation * Math.PI) / 180);
    }
    ctx.scale(scale, scale);
    ctx.globalAlpha = currentClip.transform.opacity ?? 1.0;

    if (currentClip.type === 'procedural') {
      ctx.translate(-width / 2, -height / 2);
      drawProceduralFrame(ctx, width, height, currentClip.proceduralTheme, clipLocalTime);
    } else {
      const media = videoElements.get(currentClip.id);
      if (media) {
        ctx.drawImage(media, -width / 2, -height / 2, width, height);
      } else {
        // Fallback procedural
        ctx.translate(-width / 2, -height / 2);
        drawProceduralFrame(ctx, width, height, 'abstract_glow', clipLocalTime);
      }
    }
    ctx.restore();

    // Transition effect overlay
    if (isTransitioning && currentClip.transition.type !== 'none') {
      const transProgress = 1 - (transTimeLeft / currentClip.transition.duration);
      if (currentClip.transition.type === 'flash_white') {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(transProgress * Math.PI) * 0.9})`;
        ctx.fillRect(0, 0, width, height);
      } else if (currentClip.transition.type === 'crossfade' && nextClip) {
        ctx.save();
        ctx.globalAlpha = transProgress;
        if (nextClip.type === 'procedural') {
          drawProceduralFrame(ctx, width, height, nextClip.proceduralTheme, 0);
        }
        ctx.restore();
      } else if (currentClip.transition.type === 'glitch') {
        const sliceH = height / 10;
        for (let i = 0; i < 10; i++) {
          if (Math.random() > 0.4) {
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 0, 100, 0.3)';
            ctx.fillRect((Math.random() - 0.5) * 40, i * sliceH, width, sliceH);
          }
        }
      }
    }

    // Vignette post-process
    if (currentClip.adjustments.vignette > 0) {
      const vGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.75);
      vGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vGrad.addColorStop(1, `rgba(0,0,0,${currentClip.adjustments.vignette * 0.8})`);
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 2. Render Overlay Clips (PiP)
  for (const overlay of project.overlayClips) {
    if (time >= overlay.start && time < overlay.start + overlay.duration) {
      ctx.save();
      const oWidth = width * 0.4 * overlay.transform.scale;
      const oHeight = height * 0.4 * overlay.transform.scale;
      const oX = (overlay.transform.x / 100) * width + width / 2;
      const oY = (overlay.transform.y / 100) * height + height / 2;

      ctx.translate(oX, oY);
      if (overlay.transform.rotation) {
        ctx.rotate((overlay.transform.rotation * Math.PI) / 180);
      }
      ctx.globalAlpha = overlay.transform.opacity ?? 1.0;

      const media = videoElements.get(overlay.id);
      if (media) {
        ctx.drawImage(media, -oWidth / 2, -oHeight / 2, oWidth, oHeight);
      }
      ctx.restore();
    }
  }

  // 3. Render Stickers
  for (const sticker of project.stickers) {
    if (time >= sticker.start && time < sticker.start + sticker.duration) {
      ctx.save();
      const sx = (sticker.x / 100) * width;
      const sy = (sticker.y / 100) * height;
      ctx.translate(sx, sy);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.scale(sticker.scale, sticker.scale);

      ctx.font = `${Math.round(width * 0.08)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.emojiOrIcon, 0, 0);
      ctx.restore();
    }
  }

  // 4. Render Text Overlays
  for (const textItem of project.textOverlays) {
    if (time >= textItem.start && time < textItem.start + textItem.duration) {
      ctx.save();
      const textProgress = (time - textItem.start) / textItem.duration;
      const tx = (textItem.x / 100) * width;
      let ty = (textItem.y / 100) * height;

      // Animation calculations
      let scale = 1.0;
      let alpha = 1.0;

      if (textItem.animation === 'pop' && textProgress < 0.2) {
        scale = 0.5 + (textProgress / 0.2) * 0.5;
      } else if (textItem.animation === 'fade') {
        if (textProgress < 0.15) alpha = textProgress / 0.15;
        if (textProgress > 0.85) alpha = (1 - textProgress) / 0.15;
      } else if (textItem.animation === 'slide_up') {
        const slideOffset = (1 - Math.min(1, textProgress * 4)) * 30;
        ty += slideOffset;
      }

      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      const scaledFontSize = Math.round(textItem.fontSize * (width / 400));
      ctx.font = `${textItem.fontWeight} ${scaledFontSize}px ${textItem.fontFamily}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(textItem.text);
      const textWidth = metrics.width;
      const padX = scaledFontSize * 0.45;
      const padY = scaledFontSize * 0.35;

      // Draw background box if specified
      if (textItem.backgroundColor && textItem.backgroundColor !== 'transparent') {
        ctx.fillStyle = textItem.backgroundColor;
        const boxW = textWidth + padX * 2;
        const boxH = scaledFontSize + padY * 2;
        ctx.beginPath();
        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
        ctx.fill();
      }

      // Special styles
      if (textItem.stylePreset === 'neon') {
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 4;
        ctx.strokeText(textItem.text, 0, 0);
      }

      ctx.fillStyle = textItem.color;
      ctx.fillText(textItem.text, 0, 0);

      ctx.restore();
    }
  }
}

/**
 * Export project to a downloadable Video File using WebCodecs/MediaRecorder
 */
export async function exportVideo(
  project: VideoProject,
  onProgress: (prog: ExportProgress) => void
): Promise<{ blob: Blob; url: string }> {
  const { width, height } = getExportDimensions(project.aspectRatio, project.resolution);
  const totalDuration = project.videoClips.reduce((max, c) => Math.max(max, c.start + c.duration), 0);

  if (totalDuration <= 0) {
    throw new Error('El proyecto no contiene clips de video para exportar.');
  }

  // Setup offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el contexto 2D');

  // Prepare Audio Stream
  const audioCtx = getAudioContext();
  const destNode = audioCtx.createMediaStreamDestination();

  // Connect project audio clips
  for (const clip of project.audioClips) {
    if (clip.audioBuffer) {
      const source = audioCtx.createBufferSource();
      source.buffer = clip.audioBuffer;
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = clip.volume;
      source.connect(gainNode);
      gainNode.connect(destNode);
      // Scheduled start
      source.start(audioCtx.currentTime + clip.start);
    }
  }

  // Combine Canvas stream and Audio Stream
  const canvasStream = canvas.captureStream(project.fps);
  const tracks = [...canvasStream.getVideoTracks(), ...destNode.stream.getAudioTracks()];
  const combinedStream = new MediaStream(tracks);

  // Supported mimeTypes:
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4'
  ];
  let selectedMime = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: project.resolution === '4K' ? 25000000 : 12000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(100);

  const fps = project.fps;
  const totalFrames = Math.ceil(totalDuration * fps);
  const frameIntervalMs = 1000 / fps;

  const videoElements = new Map<string, HTMLVideoElement | HTMLImageElement>();

  return new Promise((resolve, reject) => {
    let currentFrame = 0;

    const renderStep = () => {
      if (currentFrame > totalFrames) {
        onProgress({
          progress: 99,
          currentFrame,
          totalFrames,
          currentTime: totalDuration,
          totalTime: totalDuration,
          status: 'encoding',
        });

        setTimeout(() => {
          recorder.onstop = () => {
            const finalBlob = new Blob(chunks, { type: selectedMime });
            const url = URL.createObjectURL(finalBlob);
            onProgress({
              progress: 100,
              currentFrame: totalFrames,
              totalFrames,
              currentTime: totalDuration,
              totalTime: totalDuration,
              status: 'completed',
            });
            resolve({ blob: finalBlob, url });
          };
          recorder.stop();
        }, 300);
        return;
      }

      const currentTime = currentFrame / fps;
      renderFrame(ctx, project, currentTime, width, height, videoElements);

      const progress = Math.min(98, Math.round((currentFrame / totalFrames) * 100));
      onProgress({
        progress,
        currentFrame,
        totalFrames,
        currentTime,
        totalTime: totalDuration,
        status: 'rendering',
      });

      currentFrame++;
      setTimeout(renderStep, frameIntervalMs / 2); // fast render
    };

    renderStep();
  });
}
