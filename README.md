<h1 align="center">Vue Border Beam</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@stevebauman/vue-border-beam"><img src="https://img.shields.io/npm/v/@stevebauman/vue-border-beam.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@stevebauman/vue-border-beam"><img src="https://img.shields.io/npm/dm/@stevebauman/vue-border-beam.svg" alt="npm downloads"></a>
  <a href="https://github.com/stevebauman/vue-border-beam/actions/workflows/tests.yml"><img src="https://github.com/stevebauman/vue-border-beam/actions/workflows/tests.yml/badge.svg?branch=master" alt="Tests"></a>
  <a href="https://github.com/stevebauman/vue-border-beam/blob/master/LICENSE"><img src="https://img.shields.io/github/license/stevebauman/vue-border-beam.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/vue-3.3%2B-42b883.svg" alt="Vue 3.3+">
</p>

---

Animated border beam effect for Vue. This is a Vue 3 port of [`border-beam`](https://github.com/Jakubantalik/border-beam), with the same visual presets and a Vue-friendly event API.

Add a traveling or breathing glow animation around any element: cards, buttons, inputs, search bars, chat boxes, or loading panels.

## Requirements

- Vue 3.3+
- Modern browser with CSS `@property` support for the smoothest rotate animations

## Install

```bash
npm install @stevebauman/vue-border-beam
```

## Quick start

```vue
<script setup lang="ts">
import { BorderBeam } from '@stevebauman/vue-border-beam';
</script>

<template>
  <BorderBeam>
    <div style="padding: 32px; border-radius: 16px; background: #1d1d1d;">
      Your content here
    </div>
  </BorderBeam>
</template>
```

`BorderBeam` wraps your content and overlays the animated effect. When `border-radius` is not provided, it auto-detects the radius of the first child element.

## Presets

Built-in presets control the glow style and motion. They fall into two families.

### Rotate

Use rotate presets for traveling beam effects.

```vue
<template>
  <!-- Full border glow (default) -->
  <BorderBeam size="md">
    <Card />
  </BorderBeam>

  <!-- Compact glow for small controls -->
  <BorderBeam size="sm">
    <button class="icon-button">
      <IconPlus />
    </button>
  </BorderBeam>

  <!-- Bottom-only traveling glow -->
  <BorderBeam size="line">
    <label class="search-bar">
      <SearchIcon />
      <input placeholder="Search" />
    </label>
  </BorderBeam>
</template>
```

### Pulse

Use pulse presets for breathing glow effects with no rotation.

```vue
<template>
  <!-- Contained breathing border glow -->
  <BorderBeam size="pulse-inner">
    <div class="status-card">
      Working...
    </div>
  </BorderBeam>

  <!-- Outward-blooming halo around the element -->
  <BorderBeam size="pulse-outside">
    <div class="chat-box">
      Build anything...
    </div>
  </BorderBeam>
</template>
```

Both pulse types support all color variants, `strength`, `theme`, and breathe speed via `duration`.

> **`pulse-outside` requires an opaque wrapped child.** The colorful core and halo render behind your content and bloom outward, so transparent children will show the inner glow through the element.

> **`pulse-outside` relies on the wrapped element's own 1px border as the idle hairline.** If your child has no border, add a subtle 1px border or inset shadow so the edge stays defined while the beam is faded out.

## Component Examples

### Card

```vue
<template>
  <BorderBeam size="md" color-variant="colorful" theme="dark">
    <article class="card">
      <p class="eyebrow">Deploying</p>
      <h2>Production release</h2>
      <p>Running migrations, warming caches, and publishing assets.</p>
    </article>
  </BorderBeam>
</template>
```

### Icon Button

```vue
<template>
  <BorderBeam size="sm" color-variant="sunset" :border-radius="999">
    <button class="icon-button" aria-label="Create">
      <PlusIcon />
    </button>
  </BorderBeam>
</template>
```

### Search Bar

```vue
<template>
  <BorderBeam size="line" color-variant="ocean" :duration="3.1" :border-radius="24">
    <label class="search-bar">
      <SearchIcon />
      <input type="search" placeholder="Search projects" />
    </label>
  </BorderBeam>
</template>
```

### Loading Panel

```vue
<template>
  <BorderBeam size="pulse-inner" color-variant="colorful" :strength="0.85">
    <section class="task-panel">
      <header>Working...</header>
      <ul>
        <li>Generate color palettes</li>
        <li>Recommend font pairings</li>
        <li>Create layout templates</li>
      </ul>
    </section>
  </BorderBeam>
</template>
```

### Chat Input

```vue
<template>
  <BorderBeam size="pulse-outside" color-variant="mono" theme="dark">
    <form class="chat-input">
      <textarea placeholder="Build anything..." />
      <button type="submit">Send</button>
    </form>
  </BorderBeam>
</template>
```

## Color variants

Four color palettes are available:

```vue
<template>
  <BorderBeam color-variant="colorful">
    <Card />
  </BorderBeam>

  <BorderBeam color-variant="mono">
    <Card />
  </BorderBeam>

  <BorderBeam color-variant="ocean">
    <Card />
  </BorderBeam>

  <BorderBeam color-variant="sunset">
    <Card />
  </BorderBeam>
</template>
```

All variants except `mono` animate through a hue-shift cycle.

## Theme

Adapt beam colors for dark or light backgrounds:

```vue
<template>
  <BorderBeam theme="dark">
    <DarkCard />
  </BorderBeam>

  <BorderBeam theme="light">
    <LightCard />
  </BorderBeam>

  <BorderBeam theme="auto">
    <Card />
  </BorderBeam>
</template>
```

## Strength

Control the overall intensity without affecting the wrapped content:

```vue
<template>
  <BorderBeam :strength="0.7">
    <Card />
  </BorderBeam>
</template>
```

`strength` accepts a value from `0` to `1`.

## CSS customization hooks

You can tune advanced glow behavior with CSS custom properties on the `BorderBeam` wrapper or a class passed to it:

```vue
<template>
  <BorderBeam class="custom-beam" size="pulse-outside">
    <Card />
  </BorderBeam>
</template>

<style>
.custom-beam {
  --pulse-glow-boost: 1.2;
  --beam-core-blur: 16px;
  --beam-bloom-blur: 34px;
  --beam-glow-brightness: 1.8;
  --beam-glow-saturate: 1.1;
  --beam-inner-opacity: 0.85;
  --beam-hue-base: 12deg;
}
</style>
```

`--pulse-glow-boost` scales the `pulse-outside` halo after it has been measured against the wrapped element. The `--beam-core-blur`, `--beam-bloom-blur`, `--beam-glow-brightness`, `--beam-glow-saturate`, `--beam-inner-opacity`, and `--beam-hue-base` hooks let you fine-tune the generated glow without replacing the component CSS.

## Play / pause

Toggle the animation with smooth fade transitions:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BorderBeam } from '@stevebauman/vue-border-beam';

const active = ref(true);
</script>

<template>
  <BorderBeam
    :active="active"
    @deactivate="console.log('faded out')"
  >
    <Card />
  </BorderBeam>

  <button type="button" @click="active = !active">
    {{ active ? 'Pause' : 'Play' }}
  </button>
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| default slot | `VNodeChild` | — | Content to wrap |
| `size` | `'sm' \| 'md' \| 'line' \| 'pulse-outside' \| 'pulse-inner'` | `'md'` | Beam preset |
| `colorVariant` | `'colorful' \| 'mono' \| 'ocean' \| 'sunset'` | `'colorful'` | Beam palette |
| `theme` | `'dark' \| 'light' \| 'auto'` | `'dark'` | Background adaptation |
| `strength` | `number` | `1` | Effect opacity from `0` to `1` |
| `duration` | `number` | preset-based | Animation cycle duration in seconds |
| `active` | `boolean` | `true` | Whether the beam is active |
| `borderRadius` | `number` | auto-detected | Border radius in pixels |
| `brightness` | `number` | preset-based | Glow brightness multiplier |
| `saturation` | `number` | preset-based | Glow saturation multiplier |
| `hueRange` | `number` | `30` | Hue rotation range in degrees |
| `staticColors` | `boolean` | `false` | Disable hue-shift animation |

All standard `HTMLDivElement` attributes are forwarded to the wrapper, including `class`, `style`, `id`, and `aria-*`.

## Events

| Event | Description |
| --- | --- |
| `activate` | Emitted after the fade-in animation completes |
| `deactivate` | Emitted after the fade-out animation completes |
| `animationEnd` | Re-emits the native animation end event |

## How it works

`BorderBeam` renders a wrapper `<div>` with:

- `::after`: the beam stroke
- `::before`: the inner glow layer
- `[data-beam-bloom]`: the outer bloom/glow layer

The effect layers are decorative and use `pointer-events: none`, so they do not interfere with input, hover, focus, or screen readers.

Rotate and line presets animate with generated CSS keyframes. Pulse presets use a shared, frame-rate-capped `requestAnimationFrame` driver for breathing motion and automatically pause when inactive, offscreen, or when the user prefers reduced motion.
