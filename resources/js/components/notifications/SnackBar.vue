<template>
  <v-snackbar
    v-model="snackbar.model"
    location="center center"
    left
    :color="snackbar.color"
    :timeout="snackbar.timeout"
  >
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="outlined" @click="snackbar.model = false"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '../../scripts/stores/notifications'
import { storeToRefs } from 'pinia'

let { snackbar } = storeToRefs(useNotificationsStore())
</script>
