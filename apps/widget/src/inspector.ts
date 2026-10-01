export interface SelectedElementData {
  element: HTMLElement;
  tag: string;
  id: string;
  classes: string;
  selector: string;
  text: string;
  hierarchy: string[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: Record<string, string>;
}

export class DOMInspector {
  private active = false;
  private hoveredElement: HTMLElement | null = null;
  private highlightBox: HTMLDivElement | null = null;
  private tooltip: HTMLDivElement | null = null;
  private onSelectCallback: (data: SelectedElementData) => void;
  private onCancelCallback?: () => void;

  constructor(
    onSelect: (data: SelectedElementData) => void,
    onCancel?: () => void
  ) {
    this.onSelectCallback = onSelect;
    this.onCancelCallback = onCancel;
    this.createOverlayElements();
  }

  private createOverlayElements() {
    // 2px indigo highlight box
    this.highlightBox = document.createElement('div');
    this.highlightBox.id = 'pf-highlight-box';
    this.highlightBox.style.cssText = `
      position: fixed;
      pointer-events: none;
      border: 2px solid #4F46E5;
      background: rgba(79, 70, 229, 0.08);
      z-index: 2147483640;
      display: none;
      transition: all 0.08s ease-out;
      box-shadow: 0 0 16px rgba(79, 70, 229, 0.4);
      border-radius: 3px;
    `;
    document.body.appendChild(this.highlightBox);

    // Floating selector tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'pf-inspector-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      pointer-events: none;
      background: #0F172A;
      border: 1px solid #334155;
      color: #38BDF8;
      font-family: 'Geist Mono', monospace, monospace;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      z-index: 2147483641;
      display: none;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      transition: opacity 0.1s ease;
    `;
    document.body.appendChild(this.tooltip);
  }

  public activate() {
    this.active = true;
    document.body.style.cursor = 'crosshair';

    document.addEventListener('mousemove', this.handleMouseMove, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    window.addEventListener('scroll', this.handleScrollOrResize, true);
    window.addEventListener('resize', this.handleScrollOrResize, true);
  }

  public deactivate() {
    this.active = false;
    document.body.style.cursor = 'default';
    if (this.highlightBox) this.highlightBox.style.display = 'none';
    if (this.tooltip) this.tooltip.style.display = 'none';

    document.removeEventListener('mousemove', this.handleMouseMove, true);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);
    window.removeEventListener('scroll', this.handleScrollOrResize, true);
    window.removeEventListener('resize', this.handleScrollOrResize, true);
  }

  private handleScrollOrResize = () => {
    if (!this.active) return;
    if (this.highlightBox) this.highlightBox.style.display = 'none';
    if (this.tooltip) this.tooltip.style.display = 'none';
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.active) return;

    // Get element under cursor, ignoring widget elements
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    if (!target || this.isWidgetElement(target)) {
      if (this.highlightBox) this.highlightBox.style.display = 'none';
      if (this.tooltip) this.tooltip.style.display = 'none';
      return;
    }

    this.hoveredElement = target;
    const rect = target.getBoundingClientRect();

    if (this.highlightBox) {
      this.highlightBox.style.display = 'block';
      this.highlightBox.style.top = `${rect.top}px`;
      this.highlightBox.style.left = `${rect.left}px`;
      this.highlightBox.style.width = `${rect.width}px`;
      this.highlightBox.style.height = `${rect.height}px`;
    }

    if (this.tooltip) {
      const selector = this.computeSelector(target);
      this.tooltip.textContent = selector;
      this.tooltip.style.display = 'block';

      // Position tooltip near cursor
      const tooltipX = Math.min(window.innerWidth - 180, e.clientX + 14);
      const tooltipY = Math.max(10, e.clientY - 30);
      this.tooltip.style.left = `${tooltipX}px`;
      this.tooltip.style.top = `${tooltipY}px`;
    }
  };

  private handleClick = (e: MouseEvent) => {
    if (!this.active) return;

    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    if (!target || this.isWidgetElement(target)) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = target.getBoundingClientRect();
    const selector = this.computeSelector(target);
    const hierarchy = this.computeHierarchy(target);

    const attributes: Record<string, string> = {};
    for (let i = 0; i < target.attributes.length; i++) {
      const attr = target.attributes[i];
      if (attr.name !== 'class' && attr.name !== 'id') {
        attributes[attr.name] = attr.value;
      }
    }

    const data: SelectedElementData = {
      element: target,
      tag: target.tagName,
      id: target.id || '',
      classes: target.className && typeof target.className === 'string' ? target.className : '',
      selector: selector,
      text: target.innerText?.trim().slice(0, 100) || '',
      hierarchy: hierarchy,
      boundingBox: {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      attributes
    };

    this.deactivate();
    this.onSelectCallback(data);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.deactivate();
      if (this.onCancelCallback) this.onCancelCallback();
    }
  };

  private isWidgetElement(el: HTMLElement): boolean {
    return (
      el.id === 'point-feedback-root' ||
      el.id === 'pf-highlight-box' ||
      el.id === 'pf-inspector-tooltip' ||
      el.id === 'pf-banner' ||
      el.id === 'pf-popover-card' ||
      !!el.closest('#point-feedback-root') ||
      !!el.closest('#pf-popover-card')
    );
  }

  public computeSelector(el: HTMLElement): string {
    if (el.id) return `${el.tagName.toLowerCase()}#${el.id}`;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className
        .split(' ')
        .filter((c) => c.trim().length > 0 && !c.includes(':') && !c.includes('/') && !c.includes('<') && !c.includes('>'))
        .slice(0, 2)
        .join('.');
      if (classes) return `${el.tagName.toLowerCase()}.${classes}`;
    }
    return el.tagName.toLowerCase();
  }

  public computeHierarchy(el: HTMLElement): string[] {
    const path: string[] = [];
    let current: HTMLElement | null = el;

    while (current && current !== document.body && current !== document.documentElement && path.length < 5) {
      path.unshift(this.computeSelector(current));
      current = current.parentElement;
    }
    path.unshift('body');
    return path;
  }

  public destroy() {
    this.deactivate();
    if (this.highlightBox) {
      this.highlightBox.remove();
      this.highlightBox = null;
    }
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
    this.hoveredElement = null;
  }
}

