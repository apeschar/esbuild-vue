<template>
  <div class="App">
    <InputField label="message">
      <input type="text" name="message" v-model="msg" />
    </InputField>
    <Message :msg="msg" />
  </div>
</template>
<script>
import Message from "./components/Message.vue";
import InputField from "./components/InputField.vue";

export default {
  components: {
    Message,
    InputField,
  },
  data: () => ({ msg: "" }),
  async mounted() {
    const { log } = await import("./mounted");
    log();
  },
};
</script>
<style scoped>
.App {
  min-height: 100vh;
}
</style>
