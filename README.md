# vue-border-beam

Animated border beam effect for Vue. This is a Vue 3 port of [`border-beam`](https://github.com/Jakubantalik/border-beam), with the same visual presets and a Vue-friendly event API.

## Install

```bash
npm install vue-border-beam
```

## Usage

```vue
<script setup lang="ts">
import { BorderBeam } from 'vue-border-beam';
</script>

<template>
  <BorderBeam size="pulse-inner" color-variant="colorful" theme="dark">
    <div class="card">
      Your content here
    </div>
  </BorderBeam>
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
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

## Events

| Event | Description |
| --- | --- |
| `activate` | Emitted after the fade-in animation completes |
| `deactivate` | Emitted after the fade-out animation completes |
| `animationEnd` | Re-emits the native animation end event |

## Development

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run build
```
