<template>
  <v-list-item :to="{ name: 'welcome', params: { module } }"> Welcome </v-list-item>
  <v-list-item :to="{ name: 'filter', params: { module } }"> Filter </v-list-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
const { current } = storeToRefs(useRoutesMainStore())

const module = computed(() => {
  return current.value.url_module
})
</script>
