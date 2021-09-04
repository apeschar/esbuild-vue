<template>
  <p class="Message">{{ msg }}</p>
</template>
<script>
export default {
  props: ["msg"],
};
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
