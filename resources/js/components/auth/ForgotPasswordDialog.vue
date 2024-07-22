<template>
  <v-btn color="primary" block @click="btnClicked"> login (After reset) </v-btn>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../scripts/stores/auth'

let { resetAndGoTo } = useAuthStore()

async function btnClicked() {
  resetAndGoTo('login')
}
</script>
