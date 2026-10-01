import { PointFeedbackWidget, WidgetConfig } from './widget';
import { DOMInspector } from './inspector';
import { escapeHtml } from './popover';

let instance: PointFeedbackWidget | null = null;

export const PointFeedback = {
  init(config: WidgetConfig = {}): PointFeedbackWidget {
    if (instance) {
      instance.destroy();
    }
    instance = new PointFeedbackWidget(config);
    return instance;
  },

  activate(): void {
    if (instance) {
      instance.activateInspectionMode();
    }
  },

  destroy(): void {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }
};

// Auto-attach to window for script tags
if (typeof window !== 'undefined') {
  (window as any).PointFeedback = PointFeedback;
}

export { PointFeedbackWidget, DOMInspector, escapeHtml };
export type { WidgetConfig };
export default PointFeedback;

