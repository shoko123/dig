<template>
  <v-btn color="primary" block @click="close"> Close </v-btn>
</template>

<script setup lang="ts">
//This form is shown after the password-registration was processed on the server side

function close() {
  window.close()
}
</script>
