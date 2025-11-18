import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const ResizeObserverMock = class {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(callback: ResizeObserverCallback) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

window.HTMLElement.prototype.scrollIntoView = vi.fn();
