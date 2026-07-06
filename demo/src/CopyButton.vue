<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

defineProps<{
  text: string;
  label: string;
}>();

const copied = ref(false);
const swapState = ref<'copy' | 'copied'>('copy');
const swap = ref<HTMLSpanElement | null>(null);
let iconTimer: number | undefined;
let swapTimer: number | undefined;

onMounted(() => {
  nextTick(() => {
    const element = swap.value;

    if (!element) {
      return;
    }

    const labels = element.querySelectorAll<HTMLElement>('.tt-label');
    const widths: number[] = [];

    labels.forEach(label => {
      const previousPosition = label.style.position;
      const previousDisplay = label.style.display;

      label.style.position = 'static';
      label.style.display = 'inline-block';
      widths.push(label.getBoundingClientRect().width);
      label.style.position = previousPosition;
      label.style.display = previousDisplay;
    });

    if (widths.length >= 2) {
      element.style.setProperty('--tt-w-a', `${widths[0]}px`);
      element.style.setProperty('--tt-w-b', `${widths[1]}px`);
    }
  });
});

onBeforeUnmount(() => {
  window.clearTimeout(iconTimer);
  window.clearTimeout(swapTimer);
});

async function copy(text: string): Promise<void> {
  const ok = await writeText(text);

  if (!ok) {
    return;
  }

  copied.value = true;
  swapState.value = 'copied';
  window.clearTimeout(iconTimer);
  window.clearTimeout(swapTimer);

  const isTouch = window.matchMedia?.('(hover: none)').matches;
  const dwell = isTouch ? 2000 : 1600;

  iconTimer = window.setTimeout(() => {
    copied.value = false;
    swapTimer = window.setTimeout(() => {
      swapState.value = 'copy';
    }, 200);
  }, dwell);
}

async function writeText(value: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall back to execCommand for local and older browser contexts.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.padding = '0';
  textarea.style.border = 'none';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, value.length);

  let ok = false;

  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }

  textarea.remove();

  if (savedRange && selection) {
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }

  return ok;
}
</script>

<template>
  <button
    type="button"
    class="copy-btn"
    :data-copied="copied ? 'true' : 'false'"
    :aria-label="copied ? 'Copied' : label"
    @click="copy(text)"
  >
    <svg class="icon-copy" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
    <svg class="icon-check" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span class="copy-btn-tooltip" role="tooltip" aria-hidden="true">
      <span class="tt-text">
        <span class="tt-stem">Cop</span>
        <span ref="swap" class="tt-swap" :data-state="swapState">
          <span class="tt-label tt-a">y code</span>
          <span class="tt-label tt-b">ied</span>
        </span>
      </span>
    </span>
  </button>
</template>
