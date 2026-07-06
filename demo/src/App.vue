<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue';
import { BorderBeam, type BorderBeamColorVariant, type BorderBeamSize } from '@stevebauman/vue-border-beam';
import CopyButton from './CopyButton.vue';
import HighlightedCode from './HighlightedCode.vue';
import {
  MockChatInput,
  MockIconButton,
  MockSearchBar,
  MockSubscribeButton,
  MockWorkingCard,
} from './MockUi';

type BeamFamily = 'rotate' | 'pulse';
type ThemeMode = 'dark' | 'light';

const familyOptions: { value: BeamFamily; label: string }[] = [
  { value: 'rotate', label: 'Rotate' },
  { value: 'pulse', label: 'Pulse' },
];

const rotateSizeOptions: { value: BorderBeamSize; label: string }[] = [
  { value: 'md', label: 'Large' },
  { value: 'sm', label: 'Small' },
  { value: 'line', label: 'Line' },
];

const pulseSizeOptions: { value: BorderBeamSize; label: string }[] = [
  { value: 'pulse-inner', label: 'Pulse Inner' },
  { value: 'pulse-outside', label: 'Pulse Outside' },
];

const sizeOptionsByFamily: Record<BeamFamily, { value: BorderBeamSize; label: string }[]> = {
  rotate: rotateSizeOptions,
  pulse: pulseSizeOptions,
};

const defaultSizeByFamily: Record<BeamFamily, BorderBeamSize> = {
  rotate: 'md',
  pulse: 'pulse-inner',
};

const colorOptions: { value: BorderBeamColorVariant; label: string }[] = [
  { value: 'colorful', label: 'Colorful' },
  { value: 'mono', label: 'Mono' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'sunset', label: 'Sunset' },
];

const baseUrl = import.meta.env.BASE_URL;
const family = ref<BeamFamily>(familyFromPath(window.location.pathname));
const playgroundActive = ref(true);
const playgroundSize = ref<BorderBeamSize>(defaultSizeByFamily[family.value]);
const playgroundColorVariant = ref<BorderBeamColorVariant>('colorful');
const playgroundStrength = ref(70);
const theme = ref<ThemeMode>(getInitialTheme());
const tabList = ref<HTMLElement | null>(null);
const tabPill = ref<HTMLSpanElement | null>(null);
let tabPillReady = false;

const sizeOptions = computed(() => sizeOptionsByFamily[family.value]);
const isPulse = computed(() => family.value === 'pulse');
const rotateTabActive = computed(() => family.value === 'rotate');
const pulseTabActive = computed(() => family.value === 'pulse');
const installCmd = 'npm install @stevebauman/vue-border-beam';
const usageCode = `import { BorderBeam } from '@stevebauman/vue-border-beam';

<BorderBeam>
  <YourCard>Content</YourCard>
</BorderBeam>`;
const playgroundCode = computed(() => `<BorderBeam size="${playgroundSize.value}" color-variant="${playgroundColorVariant.value}"${playgroundStrength.value < 100 ? ` :strength="${playgroundStrength.value / 100}"` : ''}>
  <Card>Content</Card>
</BorderBeam>`);
const pulseOutsideTunedVars: CSSProperties = {
  '--sub-glow-offset-x': '1px',
  '--sub-glow-offset-y': '0px',
  '--sub-core-blur': '10px',
  '--sub-bloom-blur': '19px',
  '--sub-glow-opacity-mul': 1.71,
} as CSSProperties;

watch(theme, value => {
  document.documentElement.dataset.theme = value;
  localStorage.setItem('theme', value);
}, { immediate: true });

watch(family, () => {
  nextTick(() => moveTabPill(tabPillReady));
});

onMounted(() => {
  moveTabPill(false);
  tabPillReady = true;

  window.addEventListener('resize', handleResize);
  window.addEventListener('popstate', handlePopState);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('popstate', handlePopState);
});

function familyFromPath(pathname: string): BeamFamily {
  const basePath = new URL(baseUrl, window.location.origin).pathname.replace(/\/$/, '');
  const path = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || '/'
    : pathname;

  return /\/pulse\/?$/i.test(path) ? 'pulse' : 'rotate';
}

function pathForFamily(value: BeamFamily): string {
  return `${baseUrl.replace(/\/$/, '')}${value === 'pulse' ? '/pulse' : '/'}`;
}

function getInitialTheme(): ThemeMode {
  const fromAttr = document.documentElement.dataset.theme;

  if (fromAttr === 'light' || fromAttr === 'dark') {
    return fromAttr;
  }

  return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
}

function toggleTheme(): void {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
}

function setFamily(value: BeamFamily): void {
  family.value = value;
  playgroundSize.value = defaultSizeByFamily[value];

  const path = pathForFamily(value);

  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }
}

function handlePopState(): void {
  const next = familyFromPath(window.location.pathname);

  family.value = next;
  playgroundSize.value = defaultSizeByFamily[next];
}

function handleResize(): void {
  moveTabPill(false);
}

function moveTabPill(animate: boolean): void {
  const pill = tabPill.value;
  const list = tabList.value;

  if (!pill || !list) {
    return;
  }

  const activeTab = list.querySelector<HTMLButtonElement>('.tab-btn[data-active="true"]');

  if (!activeTab) {
    return;
  }

  if (!animate) {
    const previousTransition = pill.style.transition;

    pill.style.transition = 'none';
    pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    pill.style.width = `${activeTab.offsetWidth}px`;
    void pill.offsetWidth;
    pill.style.transition = previousTransition;

    return;
  }

  pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
  pill.style.width = `${activeTab.offsetWidth}px`;
}
</script>

<template>
  <a href="#main-content" class="skip-link">
    Skip to content
  </a>

  <main id="main-content" class="app">
    <header class="header">
      <nav aria-label="External links" class="top-bar-links">
        <button
          type="button"
          class="icon-btn theme-toggle"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <span class="theme-icon-stack" :data-active="theme === 'dark' ? 'sun' : 'moon'" aria-hidden="true">
            <svg class="theme-icon theme-icon-moon" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path fill="currentColor" d="M6.04458 1.60806C6.1589 1.35528 6.10472 1.05812 5.90855 0.861947C5.71237 0.665775 5.41522 0.611597 5.16244 0.725914C2.51258 1.92428 0.666626 4.59176 0.666626 7.69181C0.666626 11.9121 4.08786 15.3334 8.30817 15.3334C11.4082 15.3334 14.0757 13.4874 15.2741 10.8375C15.3884 10.5848 15.3342 10.2876 15.138 10.0914C14.9419 9.89526 14.6447 9.84108 14.3919 9.9554C13.6009 10.3131 12.7225 10.5126 11.7956 10.5126C8.31168 10.5126 5.4874 7.6883 5.4874 4.20438C5.4874 3.27752 5.68686 2.39905 6.04458 1.60806Z" />
            </svg>
            <svg class="theme-icon theme-icon-sun" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path fill="currentColor" d="M8.66663 1.33333C8.66663 0.965143 8.36815 0.666666 7.99996 0.666666C7.63177 0.666666 7.33329 0.965143 7.33329 1.33333V2.66667C7.33329 3.03486 7.63177 3.33333 7.99996 3.33333C8.36815 3.33333 8.66663 3.03486 8.66663 2.66667V1.33333Z" />
              <path fill="currentColor" d="M8.66663 13.3333C8.66663 12.9651 8.36815 12.6667 7.99996 12.6667C7.63177 12.6667 7.33329 12.9651 7.33329 13.3333V14.6667C7.33329 15.0349 7.63177 15.3333 7.99996 15.3333C8.36815 15.3333 8.66663 15.0349 8.66663 14.6667V13.3333Z" />
              <path fill="currentColor" d="M0.666626 8C0.666626 7.63181 0.965103 7.33333 1.33329 7.33333H2.66663C3.03482 7.33333 3.33329 7.63181 3.33329 8C3.33329 8.36819 3.03482 8.66667 2.66663 8.66667H1.33329C0.965103 8.66667 0.666626 8.36819 0.666626 8Z" />
              <path fill="currentColor" d="M3.73797 2.7952C3.47762 2.53485 3.05551 2.53485 2.79516 2.7952C2.53481 3.05555 2.53481 3.47766 2.79516 3.73801L3.73797 4.68081C3.99831 4.94116 4.42042 4.94116 4.68077 4.68081C4.94112 4.42046 4.94112 3.99836 4.68077 3.73801L3.73797 2.7952Z" />
              <path fill="currentColor" d="M13.2048 2.7952C13.4651 3.05555 13.4651 3.47766 13.2048 3.73801L12.262 4.68081C12.0016 4.94116 11.5795 4.94116 11.3192 4.68081C11.0588 4.42046 11.0588 3.99836 11.3192 3.73801L12.262 2.7952C12.5223 2.53485 12.9444 2.53485 13.2048 2.7952Z" />
              <path fill="currentColor" d="M4.68077 12.2647C4.94112 12.0043 4.94112 11.5822 4.68077 11.3219C4.42042 11.0615 3.99831 11.0615 3.73797 11.3219L2.79516 12.2647C2.53481 12.525 2.53481 12.9472 2.79516 13.2075C3.05551 13.4679 3.47762 13.4679 3.73797 13.2075L4.68077 12.2647Z" />
              <path fill="currentColor" d="M11.3192 11.3219C11.5795 11.0615 12.0016 11.0615 12.262 11.3219L13.2048 12.2647C13.4651 12.525 13.4651 12.9472 13.2048 13.2075C12.9444 13.4679 12.5223 13.4679 12.262 13.2075L11.3192 12.2647C11.0588 12.0043 11.0588 11.5822 11.3192 11.3219Z" />
              <path fill="currentColor" d="M13.3333 7.33333C12.9651 7.33333 12.6666 7.63181 12.6666 8C12.6666 8.36819 12.9651 8.66667 13.3333 8.66667H14.6666C15.0348 8.66667 15.3333 8.36819 15.3333 8C15.3333 7.63181 15.0348 7.33333 14.6666 7.33333H13.3333Z" />
              <path fill="currentColor" d="M7.99996 4C5.79082 4 3.99996 5.79086 3.99996 8C3.99996 10.2091 5.79082 12 7.99996 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 7.99996 4Z" />
            </svg>
          </span>
        </button>
        <a class="icon-btn" href="https://github.com/stevebauman/vue-border-beam" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </nav>

      <div class="header-icon" aria-hidden="true">
        <img class="header-icon-img header-icon-img--dark" :src="`${baseUrl}icon-web.png`" alt="" width="207" height="138">
        <img class="header-icon-img header-icon-img--light" :src="`${baseUrl}icon-web-light.png`" alt="" width="207" height="138">
      </div>
      <h1 class="title">Border beam</h1>
      <p class="subtitle-sm">Animated border beam component</p>
    </header>

    <nav ref="tabList" class="tab-nav" role="tablist" aria-label="Effect family">
      <span ref="tabPill" class="tab-nav-pill" aria-hidden="true" />
      <button
        v-for="option in familyOptions"
        :key="option.value"
        class="tab-btn"
        role="tab"
        :aria-selected="family === option.value"
        :data-active="family === option.value ? 'true' : 'false'"
        @click="setFamily(option.value)"
      >
        {{ option.label }}
      </button>
    </nav>

    <section class="examples-section t-page-slide" :data-page="family === 'rotate' ? '1' : '2'" aria-label="Effect demonstrations">
      <div class="t-page examples-page examples-page--rotate" data-page-id="1" :aria-hidden="family !== 'rotate'">
        <div class="example-row-full">
          <BorderBeam class="beam-host" size="md" color-variant="colorful" :theme="theme" :active="rotateTabActive">
            <MockChatInput />
          </BorderBeam>
        </div>
        <div class="example-row-split">
          <div class="example-cell">
            <BorderBeam class="beam-host" size="sm" color-variant="colorful" :theme="theme" :active="rotateTabActive">
              <MockIconButton />
            </BorderBeam>
          </div>
          <div class="example-cell">
            <BorderBeam class="beam-host" size="line" color-variant="colorful" :theme="theme" :active="rotateTabActive" :duration="3.1" :border-radius="20">
              <MockSearchBar />
            </BorderBeam>
          </div>
        </div>
      </div>

      <div class="t-page examples-page examples-page--pulse" data-page-id="2" :aria-hidden="family !== 'pulse'">
        <div class="example-row-full">
          <BorderBeam class="beam-host beam-host--soft" size="pulse-inner" color-variant="colorful" :theme="theme" :active="pulseTabActive">
            <MockWorkingCard />
          </BorderBeam>
        </div>
        <div class="example-row-split">
          <div class="example-cell">
            <BorderBeam class="beam-host beam-host--pill" size="pulse-inner" color-variant="colorful" :theme="theme" :active="pulseTabActive">
              <MockSubscribeButton />
            </BorderBeam>
          </div>
          <div class="example-cell">
            <BorderBeam class="beam-host beam-host--pulse-outside-tuned" size="pulse-outside" color-variant="colorful" :theme="theme" :active="pulseTabActive">
              <MockChatInput />
            </BorderBeam>
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-label="Installation">
      <h2 class="section-title">Installation</h2>
      <div class="code-block">
        <HighlightedCode :code="installCmd" language="bash" />
        <CopyButton :text="installCmd" label="Copy install command" />
      </div>
    </section>

    <section class="section" aria-label="Usage">
      <h2 class="section-title section-title--muted">Usage</h2>
      <div class="code-block code-block--multi">
        <HighlightedCode :code="usageCode" language="vue" />
        <CopyButton :text="usageCode" label="Copy usage example" />
      </div>
    </section>

    <section class="playground-section" aria-label="Interactive playground">
      <h2 class="section-title">Playground</h2>

      <div class="playground-controls">
        <div class="control-group" role="radiogroup" aria-label="Effect type">
          <span class="control-label">Type</span>
          <div class="control-options">
            <button
              v-for="option in sizeOptions"
              :key="option.value"
              class="tab-btn"
              role="radio"
              :aria-checked="playgroundSize === option.value"
              :data-active="playgroundSize === option.value ? 'true' : 'false'"
              @click="playgroundSize = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="control-group" role="radiogroup" aria-label="Color variant">
          <span class="control-label">Color</span>
          <div class="control-options">
            <button
              v-for="option in colorOptions"
              :key="option.value"
              class="tab-btn"
              role="radio"
              :aria-checked="playgroundColorVariant === option.value"
              :data-active="playgroundColorVariant === option.value ? 'true' : 'false'"
              @click="playgroundColorVariant = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="control-group control-group--strength">
          <span class="control-label">Strength</span>
          <div class="strength-track">
            <div v-if="playgroundStrength > 0" class="strength-fill" :style="{ width: `${playgroundStrength}%` }" />
            <span class="strength-value">{{ playgroundStrength }}%</span>
            <input
              v-model.number="playgroundStrength"
              type="range"
              class="strength-input"
              min="0"
              max="100"
              step="1"
              aria-label="Effect strength"
            >
          </div>
        </div>
      </div>

      <div :class="['playground-preview', { 'playground-preview--pulse': isPulse }]">
        <BorderBeam
          :class="playgroundSize === 'pulse-outside' ? 'beam-host--pulse-outside-tuned' : undefined"
          :size="playgroundSize"
          :color-variant="playgroundColorVariant"
          :theme="theme"
          :active="playgroundActive"
          :strength="playgroundStrength / 100"
          :style="playgroundSize === 'pulse-outside' ? pulseOutsideTunedVars : undefined"
        >
          <div :class="['card', playgroundSize === 'sm' ? 'card-sm' : 'card-md']">
            <p class="card-text">
              {{ playgroundSize === 'sm' ? '' : 'Build anything...' }}
            </p>
          </div>
        </BorderBeam>

        <div class="playground-toolbar">
          <button
            type="button"
            class="playground-toggle"
            :aria-pressed="playgroundActive"
            :aria-label="playgroundActive ? 'Pause animation' : 'Play animation'"
            :title="playgroundActive ? 'Pause' : 'Play'"
            @click="playgroundActive = !playgroundActive"
          >
            <svg v-if="playgroundActive" aria-hidden="true" viewBox="0 0 16 16">
              <rect x="4" y="3" width="3" height="10" rx="1" />
              <rect x="9" y="3" width="3" height="10" rx="1" />
            </svg>
            <svg v-else aria-hidden="true" viewBox="0 0 16 16">
              <path d="M4.5 2.5v11l9-5.5z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="code-block code-block--multi">
        <HighlightedCode :code="playgroundCode" language="vue" />
        <CopyButton :text="playgroundCode" label="Copy playground code" />
      </div>
    </section>

    <footer class="footer">
      <span class="footer-muted">Vue port of</span>
      {{ ' ' }}
      <a class="footer-name" href="https://github.com/Jakubantalik/border-beam" target="_blank" rel="noopener noreferrer">border-beam</a>
    </footer>
  </main>
</template>
