import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PointFeedbackWidget, PointFeedback, DOMInspector, escapeHtml } from '../src/index';
import { FeedbackPopover } from '../src/popover';
import { SelectedElementData } from '../src/inspector';

describe('POINT.FEEDBACK Widget Test Suite', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    PointFeedback.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  // ==================== 1. Selector Generation Tests ====================

  describe('Selector Generation', () => {
    it('generates ID selector for element with id', () => {
      const inspector = new DOMInspector(() => {});
      const btn = document.createElement('button');
      btn.id = 'checkout-btn';
      expect(inspector.computeSelector(btn)).toBe('button#checkout-btn');
      inspector.destroy();
    });

    it('generates class selector for element with classes', () => {
      const inspector = new DOMInspector(() => {});
      const div = document.createElement('div');
      div.className = 'card primary large';
      expect(inspector.computeSelector(div)).toBe('div.card.primary');
      inspector.destroy();
    });

    it('falls back to tag name for plain element', () => {
      const inspector = new DOMInspector(() => {});
      const span = document.createElement('span');
      expect(inspector.computeSelector(span)).toBe('span');
      inspector.destroy();
    });

    it('computes DOM hierarchy path', () => {
      const inspector = new DOMInspector(() => {});
      const section = document.createElement('section');
      section.id = 'main-section';
      const p = document.createElement('p');
      p.className = 'content';
      section.appendChild(p);
      document.body.appendChild(section);

      const hierarchy = inspector.computeHierarchy(p);
      expect(hierarchy[0]).toBe('body');
      expect(hierarchy).toContain('section#main-section');
      expect(hierarchy[hierarchy.length - 1]).toBe('p.content');
      inspector.destroy();
    });
  });

  // ==================== 2. XSS Escaping Tests ====================

  describe('XSS Prevention and Escaping', () => {
    it('escapes standard HTML special characters', () => {
      const input = '<div class="alert" onclick=\'evil()\'>Hello & Welcome</div>';
      const escaped = escapeHtml(input);
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).not.toContain('"');
      expect(escaped).not.toContain("'");
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).toContain('&quot;');
      expect(escaped).toContain('&#039;');
      expect(escaped).toContain('&amp;');
    });

    it('handles script tag payloads securely', () => {
      const xss = "<script>alert('pwned')</script>";
      expect(escapeHtml(xss)).toBe("&lt;script&gt;alert(&#039;pwned&#039;)&lt;/script&gt;");
    });

    it('handles empty and default input safely', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(undefined as any)).toBe('');
    });
  });

  // ==================== 3. Popover Rendering & DOM Safety ====================

  describe('Popover Rendering', () => {
    it('renders popover with safe textContent selector preventing XSS injection', () => {
      const maliciousData: SelectedElementData = {
        element: document.createElement('div'),
        tag: 'DIV',
        id: '',
        classes: '',
        selector: '<img src=x onerror=alert(1)>',
        text: 'Evil Element',
        hierarchy: ['body', 'div'],
        boundingBox: { x: 100, y: 100, width: 200, height: 50 },
        attributes: {}
      };

      const popover = new FeedbackPopover(
        maliciousData,
        async () => {},
        () => {}
      );

      const popoverEl = document.getElementById('pf-popover-card');
      expect(popoverEl).not.toBeNull();

      // Ensure no img tag was created inside the popover from the selector
      const injectedImg = popoverEl?.querySelector('img[src="x"]');
      expect(injectedImg).toBeNull();

      // Selector text is safely displayed as plain text
      const selectorSpan = popoverEl?.querySelector('#pf-selected-selector');
      expect(selectorSpan?.textContent).toBe('<img src=x onerror=alert(1)>');

      popover.destroy();
    });

    it('popover allows sentiment selection and cleans up on close', () => {
      const dummyData: SelectedElementData = {
        element: document.createElement('button'),
        tag: 'BUTTON',
        id: 'btn',
        classes: '',
        selector: 'button#btn',
        text: 'Click me',
        hierarchy: ['body', 'button#btn'],
        boundingBox: { x: 50, y: 50, width: 100, height: 40 },
        attributes: {}
      };

      const popover = new FeedbackPopover(dummyData, async () => {}, () => {});
      const popoverEl = document.getElementById('pf-popover-card');
      expect(popoverEl).not.toBeNull();

      const angryBtn = popoverEl?.querySelector('button[data-sentiment="angry"]') as HTMLButtonElement;
      angryBtn?.click();
      expect(angryBtn?.classList.contains('active')).toBe(true);

      popover.destroy();
      expect(document.getElementById('pf-popover-card')).toBeNull();
    });
  });

  // ==================== 4. Activation and Deactivation ====================

  describe('Widget Activation and Inspector Cycle', () => {
    it('creates launcher and toggles inspection mode banner', () => {
      const widget = new PointFeedbackWidget();
      expect(document.getElementById('point-feedback-root')).not.toBeNull();

      widget.activateInspectionMode();
      expect(document.getElementById('pf-banner')).not.toBeNull();
      expect(document.body.style.cursor).toBe('crosshair');

      widget.destroy();
      expect(document.getElementById('point-feedback-root')).toBeNull();
      expect(document.getElementById('pf-banner')).toBeNull();
      expect(document.body.style.cursor).toBe('default');
    });

    it('inspector deactivates on Escape key press', () => {
      const onCancel = vi.fn();
      const inspector = new DOMInspector(() => {}, onCancel);
      inspector.activate();
      expect(document.body.style.cursor).toBe('crosshair');

      // Dispatch Escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(document.body.style.cursor).toBe('default');
      expect(onCancel).toHaveBeenCalled();
      inspector.destroy();
    });
  });

  // ==================== 5. Memory Leak Prevention & Cleanup ====================

  describe('Memory Leak Prevention and Complete Cleanup', () => {
    it('destroys previous inspector on re-activation without leaving duplicate overlays', () => {
      const widget = new PointFeedbackWidget();

      // Activate first time
      widget.activateInspectionMode();
      const initialBoxes = document.querySelectorAll('#pf-highlight-box');
      expect(initialBoxes.length).toBe(1);

      // Activate second time (should destroy previous inspector overlays)
      widget.activateInspectionMode();
      const secondBoxes = document.querySelectorAll('#pf-highlight-box');
      expect(secondBoxes.length).toBe(1);

      widget.destroy();
    });

    it('destroy cleans up all event listeners and removes all nodes', () => {
      const widget = new PointFeedbackWidget();
      widget.activateInspectionMode();

      expect(document.getElementById('pf-highlight-box')).not.toBeNull();
      expect(document.getElementById('pf-inspector-tooltip')).not.toBeNull();
      expect(document.getElementById('pf-banner')).not.toBeNull();

      widget.destroy();

      // Ensure no orphan nodes remain in the DOM
      expect(document.getElementById('point-feedback-root')).toBeNull();
      expect(document.getElementById('pf-banner')).toBeNull();
      expect(document.getElementById('pf-highlight-box')).toBeNull();
      expect(document.getElementById('pf-inspector-tooltip')).toBeNull();
      expect(document.getElementById('pf-popover-card')).toBeNull();
    });
  });
});
