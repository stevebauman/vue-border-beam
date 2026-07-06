<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
  type CSSProperties,
  type StyleValue,
} from 'vue';
import type { BorderBeamColorVariant, BorderBeamProps, BorderBeamSize, BorderBeamTheme } from './types';
import { registerPulseInstance } from './pulseDriver';
import { generateBeamCSS, getPulseDriverConfig, sizePresets, sizeThemePresets } from './styles';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BorderBeamProps>(), {
  size: 'md',
  colorVariant: 'colorful',
  theme: 'dark',
  staticColors: false,
  active: true,
  hueRange: 30,
  strength: 1,
});

const emit = defineEmits<{
  activate: [];
  deactivate: [];
  animationEnd: [event: AnimationEvent];
}>();

const attrs = useAttrs();
const wrapper = ref<HTMLDivElement | null>(null);
const systemTheme = ref<'dark' | 'light'>('dark');
const isActive = ref(props.active);
const isFading = ref(false);
const isVisible = ref(true);
const detectedRadius = ref<number | null>(null);
const pulseGlowScale = ref({ x: 1, y: 1 });
const id = `vbb-${Math.random().toString(36).slice(2, 11)}`;

let themeCleanup: (() => void) | undefined;
let mutationObserver: MutationObserver | undefined;
let intersectionObserver: IntersectionObserver | undefined;
let resizeObserver: ResizeObserver | undefined;
let pulseCleanup: (() => void) | undefined;
let styleElement: HTMLStyleElement | undefined;

const resolvedTheme = computed<'dark' | 'light'>(() => resolveTheme(props.theme, systemTheme.value));
const themeConfig = computed(() => sizeThemePresets[props.size][resolvedTheme.value]);
const sizeConfig = computed(() => sizePresets[props.size]);
const isPulse = computed(() => props.size === 'pulse-inner' || props.size === 'pulse-outside');

const finalBorderRadius = computed(() => props.borderRadius ?? detectedRadius.value ?? sizeConfig.value.borderRadius);
const finalDuration = computed(() => props.duration ?? (props.size === 'line' ? 3.1 : isPulse.value ? 2.3 : 1.96));
const finalSaturation = computed(() => props.saturation ?? themeConfig.value.saturation);
const finalBrightness = computed(() => props.brightness ?? themeConfig.value.brightness ?? 1.3);
const finalHueRange = computed(() => props.size === 'line' ? Math.min(props.hueRange, 13) : props.hueRange);
const finalStaticColors = computed(() => props.colorVariant === 'mono' ? true : props.staticColors);

const css = computed(() => generateBeamCSS({
  id,
  borderRadius: finalBorderRadius.value,
  borderWidth: sizeConfig.value.borderWidth,
  duration: finalDuration.value,
  strokeOpacity: themeConfig.value.strokeOpacity,
  innerOpacity: themeConfig.value.innerOpacity,
  bloomOpacity: themeConfig.value.bloomOpacity,
  innerShadow: themeConfig.value.innerShadow,
  size: props.size,
  colorVariant: props.colorVariant,
  staticColors: finalStaticColors.value,
  brightness: finalBrightness.value,
  saturation: finalSaturation.value,
  hueRange: finalHueRange.value,
  theme: resolvedTheme.value,
  hairlineOpacity: themeConfig.value.hairlineOpacity,
}));

const driverConfig = computed(() => isPulse.value
  ? getPulseDriverConfig(
    props.size,
    resolvedTheme.value,
    finalDuration.value,
    finalHueRange.value,
    finalStaticColors.value,
    id,
  )
  : null);

const mergedStyle = computed<CSSProperties>(() => {
  const style = normalizeStyle(attrs.style as StyleValue | undefined);

  style['--beam-strength' as keyof CSSProperties] = clamp(props.strength, 0, 1) as never;

  if (props.size === 'pulse-outside') {
    style['--pulse-glow-sx' as keyof CSSProperties] = pulseGlowScale.value.x as never;
    style['--pulse-glow-sy' as keyof CSSProperties] = pulseGlowScale.value.y as never;
  }

  return style;
});

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;

  return rest;
});

watch(() => props.active, active => {
  if (active && !isActive.value && !isFading.value) {
    isActive.value = true;
  } else if (!active && isActive.value && !isFading.value) {
    isFading.value = true;
  }
});

watch(() => [props.borderRadius, props.size], () => {
  nextTick(() => {
    detectBorderRadius();
    measurePulseGlow();
  });
});

watch(() => driverConfig.value, registerPulse, { flush: 'post' });
watch([isActive, isFading, isVisible], registerPulse, { flush: 'post' });

onMounted(() => {
  mountStyleElement();
  watchSystemTheme();
  detectBorderRadius();
  observeChildChanges();
  observeVisibility();
  measurePulseGlow();
  observePulseResize();
  registerPulse();
});

onBeforeUnmount(() => {
  themeCleanup?.();
  mutationObserver?.disconnect();
  intersectionObserver?.disconnect();
  resizeObserver?.disconnect();
  pulseCleanup?.();
  styleElement?.remove();
});

watch(css, value => {
  if (styleElement) {
    styleElement.textContent = value;
  }
});

function resolveTheme(theme: BorderBeamTheme, currentSystemTheme: 'dark' | 'light'): 'dark' | 'light' {
  return theme === 'auto' ? currentSystemTheme : theme;
}

function watchSystemTheme(): void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return;
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemTheme.value = mediaQuery.matches ? 'dark' : 'light';

  const handler = (event: MediaQueryListEvent) => {
    systemTheme.value = event.matches ? 'dark' : 'light';
  };

  mediaQuery.addEventListener('change', handler);
  themeCleanup = () => mediaQuery.removeEventListener('change', handler);
}

function detectBorderRadius(): void {
  if (props.borderRadius != null) {
    return;
  }

  const child = wrapper.value?.firstElementChild as HTMLElement | null;

  if (!child) {
    return;
  }

  const radius = parseFloat(getComputedStyle(child).borderTopLeftRadius);

  if (!Number.isNaN(radius) && radius > 0) {
    detectedRadius.value = radius;
  }
}

function observeChildChanges(): void {
  const element = wrapper.value;

  if (!element || typeof MutationObserver === 'undefined') {
    return;
  }

  mutationObserver = new MutationObserver(detectBorderRadius);
  mutationObserver.observe(element, { childList: true, subtree: false });
}

function observeVisibility(): void {
  const element = wrapper.value;

  if (!element || typeof IntersectionObserver === 'undefined') {
    return;
  }

  intersectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      isVisible.value = entry.isIntersecting;
    }
  }, { rootMargin: '256px' });

  intersectionObserver.observe(element);
}

function measurePulseGlow(): void {
  if (props.size !== 'pulse-outside') {
    pulseGlowScale.value = { x: 1, y: 1 };
    return;
  }

  const child = wrapper.value?.firstElementChild as HTMLElement | null;

  if (!child) {
    return;
  }

  const rect = child.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    return;
  }

  const x = Number(clamp(rect.width / 350, 0.35, 4).toFixed(3));
  const y = Number(clamp(rect.height / 140, 0.35, 4).toFixed(3));

  if (pulseGlowScale.value.x !== x || pulseGlowScale.value.y !== y) {
    pulseGlowScale.value = { x, y };
  }
}

function observePulseResize(): void {
  const child = wrapper.value?.firstElementChild as HTMLElement | null;

  if (!child || typeof ResizeObserver === 'undefined') {
    return;
  }

  resizeObserver = new ResizeObserver(measurePulseGlow);
  resizeObserver.observe(child);
}

function registerPulse(): void {
  pulseCleanup?.();
  pulseCleanup = undefined;

  const config = driverConfig.value;
  const element = wrapper.value;

  if (!config || !element || !(isActive.value || isFading.value) || !isVisible.value) {
    return;
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  pulseCleanup = registerPulseInstance(element, config);
}

function handleAnimationEnd(event: AnimationEvent): void {
  if (event.animationName.includes('fade-out')) {
    isActive.value = false;
    isFading.value = false;
    emit('deactivate');
  } else if (event.animationName.includes('fade-in')) {
    emit('activate');
  }

  emit('animationEnd', event);
}

function mountStyleElement(): void {
  if (typeof document === 'undefined') {
    return;
  }

  styleElement = document.createElement('style');
  styleElement.textContent = css.value;
  document.head.appendChild(styleElement);
}

function normalizeStyle(style: StyleValue | undefined): CSSProperties {
  if (style == null || typeof style === 'string') {
    return {};
  }

  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(normalizeStyle));
  }

  return { ...style };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
</script>

<template>
  <div
    v-bind="rootAttrs"
    ref="wrapper"
    :data-beam="id"
    :data-active="isActive && !isFading ? '' : undefined"
    :data-fading="isFading ? '' : undefined"
    :data-paused="isActive && !isFading && !isVisible ? '' : undefined"
    :class="attrs.class"
    :style="mergedStyle"
    @animationend="handleAnimationEnd"
  >
    <slot />
    <div data-beam-bloom />
  </div>
</template>
