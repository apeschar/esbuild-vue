<template lang="pug">
  .Message 
    span {{ uppercaseMsg }}
    span {{ variant }}
</template>
<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue'

const variants = ['primary', 'secondary'] as const;

/**
 * ```html
 * <script>
 * export default Vue.extend({})
 * <\/script> 
 * ```
 */
export default Vue.extend({
  props: {
    msg: {
      type: String,
      required: true
    },
    variant: {
      type: String as PropType<typeof variants[number]>,
      default: variants[0],
      validator: (v: any) => variants.includes(v) 
    }
  },
  computed: {
    uppercaseMsg(): string {
      return this.msg.toUpperCase()
    }
  }
});
</script>
<style scoped>
.Message {
  padding: 1rem;
  line-height: 1.5;
  background-color: #eee;
}

.Message::before {
  content: "";
  display: inline-block;
}
</style>
