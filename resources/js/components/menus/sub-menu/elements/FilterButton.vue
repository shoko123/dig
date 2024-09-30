<template>
  <v-btn variant="outlined" @click="toFilter">
    Filters
    <v-tooltip activator="parent" location="bottom left">
      <v-text-field>{{ tip }}</v-text-field>
      <FilterSelected source="Filter" />
    </v-tooltip>
  </v-btn>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
const FilterSelected = defineAsyncComponent(() => import('../../../trio/TrioSelectedForm.vue'))
const { routerPush } = useRoutesMainStore()

const tip = computed(() => {
  return `Go to filters`
})

async function toFilter() {
  await routerPush('filter')
}
</script>
