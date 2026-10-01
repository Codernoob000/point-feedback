import html2canvas from 'html2canvas';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function captureElementScreenshot(element: HTMLElement, bbox: BoundingBox): Promise<Blob | null> {
  try {
    // 200px surrounding area
    const padding = 200;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const cropX = Math.max(0, bbox.x + scrollX - padding);
    const cropY = Math.max(0, bbox.y + scrollY - padding);
    const cropWidth = bbox.width + padding * 2;
    const cropHeight = bbox.height + padding * 2;

    const fullCanvas = await html2canvas(document.body, {
      x: cropX,
      y: cropY,
      width: Math.min(cropWidth, document.body.scrollWidth - cropX),
      height: Math.min(cropHeight, document.body.scrollHeight - cropY),
      useCORS: true,
      logging: false,
      ignoreElements: (el) => el.id === 'point-feedback-root' || el.classList.contains('pf-ignore')
    });

    // Draw an indigo highlight rectangle around the selected element on the screenshot canvas
    const ctx = fullCanvas.getContext('2d');
    if (ctx) {
      const relX = bbox.x + scrollX - cropX;
      const relY = bbox.y + scrollY - cropY;
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 3;
      ctx.strokeRect(relX, relY, bbox.width, bbox.height);

      // Add a small tag label
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(relX, Math.max(0, relY - 20), Math.min(140, bbox.width), 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('TARGET', relX + 6, Math.max(14, relY - 6));
    }

    return new Promise((resolve) => {
      fullCanvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } catch (err) {
    console.warn('html2canvas capture fallback:', err);
    // Fallback: draw synthetic representative canvas
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 640;
    fallbackCanvas.height = 360;
    const ctx = fallbackCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(0, 0, 640, 360);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 600, 320);

      // Target box
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(79, 70, 229, 0.15)';
      ctx.fillRect(180, 120, 280, 80);
      ctx.strokeRect(180, 120, 280, 80);

      ctx.fillStyle = '#818CF8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(element.tagName.toLowerCase(), 195, 150);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px sans-serif';
      const text = element.innerText?.slice(0, 35) || 'Selected Element';
      ctx.fillText(text, 195, 175);
    }

    return new Promise((resolve) => {
      fallbackCanvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }
}
