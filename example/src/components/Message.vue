<template lang="pug">
  .Message {{ uppercaseMsg }}
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: ["msg"],
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
