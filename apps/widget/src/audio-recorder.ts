export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private timerInterval: any = null;
  private maxDuration = 10; // 10 seconds max
  private elapsedSeconds = 0;
  private mimeType = 'audio/webm';

  public onTimeUpdate?: (seconds: number) => void;
  public onWaveform?: (levels: number[]) => void;
  public onFinished?: (blob: Blob, duration: number) => void;
  public onError?: (errorMessage: string) => void;

  async start(): Promise<boolean> {
    this.audioChunks = [];
    this.elapsedSeconds = 0;
    this.clearTimer();

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (this.onError) {
        this.onError('Microphone recording is not supported in this browser.');
      }
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported MIME type (Support Safari audio/mp4)
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          this.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          this.mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          this.mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          this.mimeType = 'audio/ogg';
        } else {
          this.mimeType = '';
        }
      }

      // Set up Web Audio Analyser for real-time waveform
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(this.stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);
        }
      } catch (e) {
        console.warn('AudioContext analyser not initialized:', e);
      }

      const options: MediaRecorderOptions = this.mimeType ? { mimeType: this.mimeType } : {};
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const baseMime = this.mimeType.split(';')[0] || 'audio/webm';
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, { type: baseMime });
          if (this.onFinished) {
            this.onFinished(audioBlob, this.elapsedSeconds);
          }
        }
        this.cleanup();
      };

      this.mediaRecorder.start(100);
      this.startTimer();
      return true;
    } catch (err: any) {
      this.cleanup();
      const message =
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
          ? 'Microphone access denied. Please allow microphone permissions.'
          : 'Microphone hardware unavailable or access error.';
      if (this.onError) {
        this.onError(message);
      }
      return false;
    }
  }

  private startTimer() {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds += 0.1;

      if (this.onTimeUpdate) {
        this.onTimeUpdate(Math.min(this.elapsedSeconds, this.maxDuration));
      }

      // Read audio frequencies for waveform
      if (this.analyser && this.onWaveform) {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        const sampled = Array.from(dataArray.slice(0, 16)).map((v) => v / 255);
        this.onWaveform(sampled);
      }

      // Auto stop after 10s
      if (this.elapsedSeconds >= this.maxDuration) {
        this.stop();
      }
    }, 100);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  stop() {
    this.clearTimer();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    } else {
      this.cleanup();
    }
  }

  private cleanup() {
    this.clearTimer();
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}

