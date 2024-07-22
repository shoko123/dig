<template>
  <v-btn :disabled="disable" icon="mdi-home-circle" :to="{ name: 'home' }" rounded="0" />
  <v-btn> {{ title }} </v-btn>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'

let { current } = storeToRefs(useRoutesMainStore())
import { useMenusStore } from '../../../../scripts/stores/menus'
const { title } = storeToRefs(useMenusStore())
const disable = computed(() => {
  return current.value.name === 'reset-password'
})
</script>
