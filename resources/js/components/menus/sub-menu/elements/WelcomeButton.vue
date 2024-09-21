<template>
  <v-btn variant="outlined" @click="toWelcome">
    Welcome
    <v-tooltip activator="parent" location="bottom left">
      {{ tip }}
    </v-tooltip>
  </v-btn>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'

const { routerPush } = useRoutesMainStore()

const tip = computed(() => {
  return `Go to the Welcome Page`
})

async function toWelcome() {
  await routerPush('welcome')
}
</script>
