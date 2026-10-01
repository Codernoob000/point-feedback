import { SelectedElementData } from './inspector';
import { AudioRecorder } from './audio-recorder';
import { BRAND_ICON_SVG } from './brand-icon';

export interface PopoverSubmitPayload {
  sentiment: 'angry' | 'neutral' | 'loved';
  comment: string;
  audioBlob: Blob | null;
  audioDuration: number;
}

export function escapeHtml(str: string = ''): string {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export class FeedbackPopover {
  private container: HTMLDivElement | null = null;
  private selectedData: SelectedElementData;
  private sentiment: 'angry' | 'neutral' | 'loved' = 'neutral';
  private comment = '';
  private audioRecorder: AudioRecorder;
  private audioBlob: Blob | null = null;
  private audioDuration = 0;
  private isRecording = false;
  private onSubmitCallback: (payload: PopoverSubmitPayload) => Promise<void>;
  private onCloseCallback: () => void;

  constructor(
    data: SelectedElementData,
    onSubmit: (payload: PopoverSubmitPayload) => Promise<void>,
    onClose: () => void
  ) {
    this.selectedData = data;
    this.onSubmitCallback = onSubmit;
    this.onCloseCallback = onClose;
    this.audioRecorder = new AudioRecorder();
    this.render();
  }

  private render() {
    this.container = document.createElement('div');
    this.container.id = 'pf-popover-card';
    this.container.className = 'pf-popover';

    // Calculate smart anchored coordinates near selected element
    const { x, y, width, height } = this.selectedData.boundingBox;
    const cardWidth = 340;
    const cardHeight = 420;

    let posX = x + width / 2 - cardWidth / 2;
    // Prefer placing below, otherwise above if near bottom
    let posY = y + height + 12;

    if (posY + cardHeight > window.innerHeight - 20) {
      posY = Math.max(20, y - cardHeight - 12);
    }
    if (posX + cardWidth > window.innerWidth - 20) {
      posX = window.innerWidth - cardWidth - 20;
    }
    if (posX < 20) posX = 20;

    this.container.style.cssText = `
      position: fixed;
      top: ${posY}px;
      left: ${posX}px;
      width: ${cardWidth}px;
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 14px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(79, 70, 229, 0.2);
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Geist', 'Inter', sans-serif;
      z-index: 2147483647;
      padding: 16px;
      box-sizing: border-box;
      animation: pfFadeUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    this.container.innerHTML = `
      <style>
        @keyframes pfFadeUp {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pf-btn {
          cursor: pointer;
          border: none;
          outline: none;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .pf-sentiment-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 4px;
          border-radius: 8px;
          background: #1E293B;
          color: #94A3B8;
          font-size: 16px;
          border: 1px solid transparent;
        }
        .pf-sentiment-btn.active {
          background: rgba(79, 70, 229, 0.2);
          border-color: #6366F1;
          color: #FFFFFF;
        }
        .pf-record-bar {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 24px;
          flex: 1;
          background: #0B0F19;
          border-radius: 6px;
          padding: 0 8px;
          border: 1px solid #1E293B;
        }
        .pf-wave-bar {
          flex: 1;
          height: 40%;
          background: #475569;
          border-radius: 2px;
          transition: height 0.1s ease;
        }
        .pf-wave-bar.active {
          background: #6366F1;
          box-shadow: 0 0 6px #6366F1;
        }
      </style>

      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px;">${BRAND_ICON_SVG}</div>
          <span style="font-size: 12px; font-weight: 700; font-family: monospace; letter-spacing: 0.5px; color: #E2E8F0;">
            POINT.FEEDBACK
          </span>
        </div>
        <button id="pf-close-btn" class="pf-btn" style="background: none; color: #64748B; font-size: 16px; padding: 2px 6px; border-radius: 4px;">
          ✕
        </button>
      </div>

      <!-- Target Element Tag: Secure textContent injection to prevent XSS -->
      <div style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 6px; padding: 6px 10px; margin-bottom: 12px; font-family: monospace; font-size: 11px; display: flex; align-items: center; justify-content: space-between;">
        <span id="pf-selected-selector" style="color: #818CF8; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;"></span>
        <span style="color: #64748B; font-size: 10px;">
          ${this.selectedData.boundingBox.width}×${this.selectedData.boundingBox.height}
        </span>
      </div>

      <!-- Sentiment Options -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <button type="button" class="pf-btn pf-sentiment-btn" data-sentiment="angry" title="Frustrated / Broken">
          <span>😠</span>
        </button>
        <button type="button" class="pf-btn pf-sentiment-btn active" data-sentiment="neutral" title="Neutral Observation">
          <span>😐</span>
        </button>
        <button type="button" class="pf-btn pf-sentiment-btn" data-sentiment="loved" title="Delighted">
          <span>😍</span>
        </button>
      </div>

      <!-- Comment Field -->
      <div style="margin-bottom: 12px;">
        <textarea
          id="pf-comment-input"
          placeholder="What's wrong or what would you like improved?"
          rows="3"
          style="width: 100%; box-sizing: border-box; background: #0B0F19; border: 1px solid #1E293B; border-radius: 8px; color: #F1F5F9; font-size: 12px; padding: 10px; resize: none; outline: none; font-family: inherit; line-height: 1.4;"
        ></textarea>
        <div id="pf-comment-error" style="color: #F43F5E; font-size: 10px; margin-top: 4px; display: none;">
          Please enter feedback or record a voice note.
        </div>
      </div>

      <!-- Voice Recorder (MediaRecorder API max 10s) -->
      <div style="background: #0D1527; border: 1px solid #1E293B; border-radius: 8px; padding: 10px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 600; color: #94A3B8; font-family: monospace; display: flex; align-items: center; gap: 4px;">
            🎙️ Voice Note (10s max)
          </span>
          <span id="pf-timer" style="font-size: 11px; font-family: monospace; color: #818CF8; font-weight: 600;">
            0.0s / 10.0s
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="pf-record-btn" class="pf-btn" style="padding: 6px 12px; background: #4F46E5; color: #FFFFFF; font-size: 11px; font-weight: 600; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
            <span id="pf-record-icon">⏺</span>
            <span id="pf-record-text">Record Voice</span>
          </button>

          <!-- Waveform Visualizer Bars -->
          <div class="pf-record-bar" id="pf-waveform-container">
            ${Array.from({ length: 14 })
              .map(() => '<div class="pf-wave-bar"></div>')
              .join('')}
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        id="pf-submit-btn"
        class="pf-btn"
        style="width: 100%; padding: 10px; background: #4F46E5; color: #FFFFFF; font-size: 12px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); display: flex; align-items: center; justify-content: center; gap: 6px;"
      >
        <span>Submit Contextual Feedback</span>
      </button>
    `;

    document.body.appendChild(this.container);

    // Securely set selector text via textContent (Prevent XSS)
    const selectorEl = this.container.querySelector('#pf-selected-selector');
    if (selectorEl) {
      selectorEl.textContent = this.selectedData.selector;
    }

    this.bindEvents();
  }

  private bindEvents() {
    if (!this.container) return;

    // Close button
    const closeBtn = this.container.querySelector('#pf-close-btn');
    closeBtn?.addEventListener('click', () => this.destroy());

    // Sentiment Buttons
    const sentimentBtns = this.container.querySelectorAll('.pf-sentiment-btn');
    sentimentBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sentimentBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.sentiment = (btn.getAttribute('data-sentiment') as any) || 'neutral';
      });
    });

    // Voice Recorder
    const recordBtn = this.container.querySelector('#pf-record-btn') as HTMLButtonElement;
    const recordText = this.container.querySelector('#pf-record-text') as HTMLElement;
    const recordIcon = this.container.querySelector('#pf-record-icon') as HTMLElement;
    const timerEl = this.container.querySelector('#pf-timer') as HTMLElement;
    const waveBars = this.container.querySelectorAll('.pf-wave-bar') as NodeListOf<HTMLElement>;

    this.audioRecorder.onTimeUpdate = (sec) => {
      if (timerEl) timerEl.textContent = `${sec.toFixed(1)}s / 10.0s`;
    };

    this.audioRecorder.onWaveform = (levels) => {
      waveBars.forEach((bar, idx) => {
        const val = levels[idx % levels.length] || 0.2;
        bar.style.height = `${Math.max(20, val * 100)}%`;
        if (this.isRecording) bar.classList.add('active');
      });
    };

    this.audioRecorder.onFinished = (blob, duration) => {
      this.audioBlob = blob;
      this.audioDuration = duration;
      this.isRecording = false;
      if (recordBtn) recordBtn.style.background = '#10B981';
      if (recordText) recordText.textContent = 'Voice Saved';
      if (recordIcon) recordIcon.textContent = '✓';
      waveBars.forEach((b) => b.classList.remove('active'));
    };

    this.audioRecorder.onError = (errorMsg) => {
      this.isRecording = false;
      if (recordBtn) recordBtn.style.background = '#475569';
      if (recordText) recordText.textContent = 'Mic Denied';
      if (recordIcon) recordIcon.textContent = '✕';
      if (timerEl) timerEl.textContent = 'Unavailable';
      waveBars.forEach((b) => b.classList.remove('active'));
      console.warn('Audio recorder error:', errorMsg);
    };

    recordBtn?.addEventListener('click', async () => {
      if (!this.isRecording) {
        this.isRecording = true;
        recordBtn.style.background = '#F43F5E';
        recordText.textContent = 'Stop (10s)';
        recordIcon.textContent = '⏹';
        const started = await this.audioRecorder.start();
        if (!started) {
          this.isRecording = false;
        }
      } else {
        this.audioRecorder.stop();
      }
    });

    // Submit Button
    const submitBtn = this.container.querySelector('#pf-submit-btn') as HTMLButtonElement;
    const commentInput = this.container.querySelector('#pf-comment-input') as HTMLTextAreaElement;
    const commentError = this.container.querySelector('#pf-comment-error') as HTMLElement;

    submitBtn?.addEventListener('click', async () => {
      if (this.isRecording) {
        this.audioRecorder.stop();
      }

      let enteredComment = commentInput?.value?.trim() || '';

      // If user provided a voice recording but no text comment, populate a clean default comment
      if (!enteredComment && this.audioBlob) {
        enteredComment = `Voice note on ${this.selectedData.selector}`;
      }

      if (!enteredComment) {
        if (commentError) commentError.style.display = 'block';
        commentInput?.focus();
        return;
      }

      if (commentError) commentError.style.display = 'none';

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Uploading Telemetry...</span>';
      submitBtn.style.opacity = '0.7';

      this.comment = enteredComment;

      try {
        await this.onSubmitCallback({
          sentiment: this.sentiment,
          comment: this.comment,
          audioBlob: this.audioBlob,
          audioDuration: this.audioDuration
        });

        submitBtn.style.background = '#10B981';
        submitBtn.innerHTML = '<span>✓ Feedback Captured!</span>';
        setTimeout(() => this.destroy(), 1200);
      } catch (err) {
        console.error('Submit error:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Failed. Try Again</span>';
        submitBtn.style.background = '#F43F5E';
      }
    });
  }

  public destroy() {
    if (this.isRecording) {
      this.audioRecorder.stop();
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.onCloseCallback();
  }
}

