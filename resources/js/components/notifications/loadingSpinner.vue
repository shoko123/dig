<template>
<Teleport to="#modal">
  <v-overlay :model-value="spinner.isOn" class="align-center justify-center">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    <h1>{{ spinner.message }}</h1>
  </v-overlay>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '../../scripts/stores/notifications'
import { storeToRefs } from 'pinia'
let { spinner } = storeToRefs(useNotificationsStore())
</script>