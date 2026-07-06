<script setup lang="ts">
import { computed } from 'vue';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github-dark.css';

const props = defineProps<{
  code: string;
  language: 'bash' | 'vue';
}>();

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('vue', xml);

const highlighted = computed(() => {
  return hljs.highlight(props.code, { language: props.language }).value;
});
</script>

<template>
  <code class="hljs" v-html="highlighted" />
</template>
