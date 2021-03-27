<template>
  <div>
    <p>
      Please enter your name here:
      <input v-model="name" />
    </p>
    <h1 v-if="name">Hello, {{ name }}!</h1>
  </div>
</template>

<script>
export default {
  data: () => ({
    name: ""
  })
};
</script>

<style scoped>
div {
  font-family: sans-serif;
}
</style>
