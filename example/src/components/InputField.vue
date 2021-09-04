<template>
  <label class="InputField">
    <span class="InputField__Label">{{ label }}</span>
    <slot />
  </label>
</template>
<script>
export default {
  props: ["label"],
};
</script>
<style scoped>
.InputField {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  row-gap: 0.5rem;
}

.InputField__Label {
  font-weight: normal;
}

.InputField /deep/ input[type="text"] {
  flex-grow: 1;
  width: 100%;
  border: 1px solid currentColor;
  border-radius: 0.25rem;
}
</style>
