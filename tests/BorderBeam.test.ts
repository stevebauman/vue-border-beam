import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BorderBeam from '../src/BorderBeam.vue';

class TestIntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {}

  observe(): void {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }

  disconnect(): void {}

  unobserve(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class TestResizeObserver {
  constructor(public callback: ResizeObserverCallback) {}

  observe(): void {
    this.callback([], this as unknown as ResizeObserver);
  }

  disconnect(): void {}

  unobserve(): void {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
});

afterEach(() => {
  document.head.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('BorderBeam', () => {
  it('renders slotted content and generated beam layers', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        borderRadius: 18,
      },
      slots: {
        default: '<button class="child">Launch</button>',
      },
    });

    expect(wrapper.find('.child').text()).toBe('Launch');
    expect(wrapper.find('[data-beam]').exists()).toBe(true);
    expect(wrapper.find('[data-beam-bloom]').exists()).toBe(true);
    expect(document.head.querySelector('style')?.textContent).toContain('[data-beam=');
    expect(wrapper.find('[data-beam]').attributes('data-active')).toBe('');
  });

  it('uses props to generate the expected variant css', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        size: 'line',
        colorVariant: 'ocean',
        theme: 'light',
        duration: 4,
        strength: 0.35,
      },
      slots: {
        default: '<div style="border-radius: 12px">Search</div>',
      },
    });

    const style = document.head.querySelector('style')?.textContent ?? '';

    expect(style).toContain('beam-travel');
    expect(style).toContain('4s');
    expect(style).toContain('rgb(80, 60, 200)');
    expect((wrapper.find('[data-beam]').element as HTMLElement).style.getPropertyValue('--beam-strength')).toBe('0.35');
  });

  it('clamps strength without changing wrapped content opacity', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        strength: 3,
      },
      slots: {
        default: '<div>Card</div>',
      },
    });

    expect((wrapper.find('[data-beam]').element as HTMLElement).style.getPropertyValue('--beam-strength')).toBe('1');
  });

  it('emits lifecycle events when fade animations finish', async () => {
    const wrapper = mount(BorderBeam, {
      props: {
        active: true,
      },
      slots: {
        default: '<div>Card</div>',
      },
    });

    await wrapper.setProps({ active: false });

    const element = wrapper.find('[data-beam]').element;

    element.dispatchEvent(animationEnd('beam-fade-out-test'));

    expect(wrapper.emitted('deactivate')).toHaveLength(1);
    expect(wrapper.find('[data-beam]').attributes('data-active')).toBeUndefined();

    await wrapper.setProps({ active: true });

    element.dispatchEvent(animationEnd('beam-fade-in-test'));

    expect(wrapper.emitted('activate')).toHaveLength(1);
    expect(wrapper.emitted('animationEnd')).toHaveLength(2);
  });

  it('registers pulse instances while active', () => {
    mount(BorderBeam, {
      props: {
        size: 'pulse-inner',
      },
      slots: {
        default: '<div>Card</div>',
      },
    });

    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('resolves auto theme from system preference', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    const wrapper = mount(BorderBeam, {
      props: {
        theme: 'auto',
      },
      slots: {
        default: '<div>Card</div>',
      },
    });

    expect(document.head.querySelector('style')?.textContent).toContain('rgba(255, 255, 255');
  });
});

function animationEnd(animationName: string): Event {
  const event = new Event('animationend', { bubbles: true });

  Object.defineProperty(event, 'animationName', {
    value: animationName,
  });

  return event;
}
