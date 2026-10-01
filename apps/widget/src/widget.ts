import { DOMInspector, SelectedElementData } from './inspector';
import { FeedbackPopover, PopoverSubmitPayload } from './popover';
import { collectTelemetry } from './telemetry';
import { captureElementScreenshot } from './screenshot';
import { BRAND_ICON_SVG } from './brand-icon';

export interface WidgetConfig {
  apiKey?: string;
  apiUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  projectId?: string;
}

export class PointFeedbackWidget {
  private config: WidgetConfig;
  private launcher: HTMLDivElement | null = null;
  private inspector: DOMInspector | null = null;
  private currentPopover: FeedbackPopover | null = null;
  private banner: HTMLDivElement | null = null;

  constructor(config: WidgetConfig = {}) {
    this.config = {
      apiKey: config.apiKey || 'pf_live_default_key_2026',
      apiUrl: config.apiUrl || '/api/v1',
      position: config.position || 'bottom-right',
      projectId: config.projectId
    };
    this.init();
  }

  private init() {
    this.createLauncher();
  }

  private createLauncher() {
    const isRight = this.config.position === 'bottom-right';

    this.launcher = document.createElement('div');
    this.launcher.id = 'point-feedback-root';
    this.launcher.innerHTML = `
      <style>
        .pf-launcher-btn {
          position: fixed;
          bottom: 24px;
          ${isRight ? 'right: 24px;' : 'left: 24px;'}
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0F172A;
          border: 1.5px solid #334155;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(79, 70, 229, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2147483630;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }
        .pf-launcher-btn:hover {
          transform: scale(1.08);
          border-color: #6366F1;
          box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.7), 0 0 30px rgba(79, 70, 229, 0.55);
        }
        .pf-launcher-btn:active {
          transform: scale(0.96);
        }
        .pf-tooltip-badge {
          position: absolute;
          ${isRight ? 'right: 68px;' : 'left: 68px;'}
          background: #0F172A;
          border: 1px solid #1E293B;
          color: #E2E8F0;
          font-family: monospace;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateX(${isRight ? '6px' : '-6px'});
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        .pf-launcher-btn:hover .pf-tooltip-badge {
          opacity: 1;
          transform: translateX(0);
        }
      </style>
      <div class="pf-launcher-btn" id="pf-launcher-trigger" title="Point & Speak Feedback">
        <div style="width: 32px; height: 32px;">
          ${BRAND_ICON_SVG}
        </div>
        <div class="pf-tooltip-badge">
          Point & Speak Mode
        </div>
      </div>
    `;

    document.body.appendChild(this.launcher);

    const trigger = this.launcher.querySelector('#pf-launcher-trigger');
    trigger?.addEventListener('click', () => this.activateInspectionMode());
  }

  public activateInspectionMode() {
    if (this.currentPopover) {
      this.currentPopover.destroy();
      this.currentPopover = null;
    }

    // Fix 14: Prevent memory leaks - destroy existing inspector and clean listeners/DOM
    if (this.inspector) {
      this.inspector.destroy();
      this.inspector = null;
    }

    this.showBanner();

    this.inspector = new DOMInspector(
      (elementData) => this.handleElementSelected(elementData),
      () => this.hideBanner()
    );
    this.inspector.activate();
  }

  private showBanner() {
    if (this.banner) this.banner.remove();

    this.banner = document.createElement('div');
    this.banner.id = 'pf-banner';
    this.banner.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: #0F172A;
      border: 1.5px solid #4F46E5;
      color: #FFFFFF;
      font-family: monospace;
      font-size: 12px;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: 9999px;
      z-index: 2147483645;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(79, 70, 229, 0.5);
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
    `;
    this.banner.innerHTML = `
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38BDF8; animation: pfPulse 1.5s infinite;"></span>
      <span>POINT & SPEAK MODE: Click any element (Esc to cancel)</span>
    `;
    document.body.appendChild(this.banner);
  }

  private hideBanner() {
    if (this.banner) {
      this.banner.remove();
      this.banner = null;
    }
  }

  private async handleElementSelected(data: SelectedElementData) {
    this.hideBanner();

    // Capture screenshot of element + 200px surrounding context
    const screenshotBlob = await captureElementScreenshot(data.element, data.boundingBox);

    // Open anchored Feedback Popover near the selected element
    this.currentPopover = new FeedbackPopover(
      data,
      async (payload) => {
        await this.submitFeedback(data, payload, screenshotBlob);
      },
      () => {
        this.currentPopover = null;
      }
    );
  }

  private async submitFeedback(
    elementData: SelectedElementData,
    popoverPayload: PopoverSubmitPayload,
    screenshotBlob: Blob | null
  ) {
    const telemetry = collectTelemetry();

    const formData = new FormData();
    formData.append('comment', popoverPayload.comment);
    formData.append('sentiment', popoverPayload.sentiment);
    formData.append('selector', elementData.selector);
    formData.append('target_text', elementData.text);
    formData.append('page_url', window.location.href);
    formData.append('viewport_width', telemetry.viewportWidth.toString());
    formData.append('viewport_height', telemetry.viewportHeight.toString());
    formData.append('user_agent', telemetry.userAgent);
    formData.append('browser', telemetry.browser);
    formData.append('pixel_ratio', telemetry.pixelRatio.toString());
    formData.append('api_key', this.config.apiKey || '');
    if (this.config.projectId) formData.append('project_id', this.config.projectId);

    formData.append('telemetry', JSON.stringify(telemetry));
    formData.append('bounding_box', JSON.stringify(elementData.boundingBox));
    formData.append('dom_hierarchy', JSON.stringify(elementData.hierarchy));
    formData.append(
      'metadata',
      JSON.stringify({
        tag: elementData.tag,
        id: elementData.id,
        classes: elementData.classes,
        selector: elementData.selector,
        text: elementData.text,
        attributes: elementData.attributes
      })
    );

    if (screenshotBlob) {
      formData.append('screenshot', screenshotBlob, 'screenshot.png');
    }

    if (popoverPayload.audioBlob) {
      const mime = popoverPayload.audioBlob.type || 'audio/webm';
      const ext = mime.includes('mp4') ? 'voice.mp4' : mime.includes('ogg') ? 'voice.ogg' : 'voice.webm';
      formData.append('audio', popoverPayload.audioBlob, ext);
      formData.append('audio_duration', popoverPayload.audioDuration.toString());
    }

    const apiUrl = this.config.apiUrl || 'http://localhost:8000/api/v1';

const res = await fetch(`${apiUrl}/feedback`, {
  method: 'POST',
  body: formData
});

if (!res.ok) {
  throw new Error(`Failed to submit feedback: ${res.status}`);
}

return await res.json();
  }

  public destroy() {
    if (this.inspector) {
      this.inspector.destroy();
      this.inspector = null;
    }
    if (this.currentPopover) {
      this.currentPopover.destroy();
      this.currentPopover = null;
    }
    this.hideBanner();
    if (this.launcher) {
      this.launcher.remove();
      this.launcher = null;
    }
  }
}

