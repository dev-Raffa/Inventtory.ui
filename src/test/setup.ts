/* eslint-disable @typescript-eslint/no-unused-vars */
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const ResizeObserverMock = class {
  //@ts-expect-error callback unused
  constructor(callback: ResizeObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

window.HTMLElement.prototype.scrollIntoView = vi.fn();
