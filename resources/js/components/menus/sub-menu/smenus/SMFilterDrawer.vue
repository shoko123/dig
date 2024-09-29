<template>
  <v-list-item @click="submit"> Submit </v-list-item>
  <v-list-item @click="getCnt"> Count </v-list-item>
  <v-list-item @click="clear"> Clear </v-list-item>
  <v-divider />
  <v-list-item :to="{ name: 'welcome', params: { url_module } }"> Welcome </v-list-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import { useNotificationsStore } from '../../../../scripts/stores/notifications'
const { useTrioStore } = await import('../../../../scripts/stores/trio/trio')



const { current } = storeToRefs(useRoutesMainStore())
const { resetCategoryAndGroupIndices, clearFilterOptions } = useTrioStore()
const { push } = useRouter()

async function getFilterStore() {
  const { useFilterStore } = await import('../../../../scripts/stores/trio/filter')
  return useFilterStore()
}
const url_module = computed(() => {
  return current.value.url_module
})

async function submit() {
  const filterStore = await getFilterStore()
  const query = await filterStore.filtersToQueryObject()
  resetCategoryAndGroupIndices()
  push({ name: 'index', params: { url_module: current.value.url_module }, query })
}

async function getCnt() {
  const { showSnackbar } = useNotificationsStore()
  const filterStore = await getFilterStore()
  let cnt = await filterStore.getCount()
  if (cnt > -1) {
    showSnackbar(`Request count result: ${cnt}`)
  }
}

function clear() {
  console.log(`filter.clear()`)
  resetCategoryAndGroupIndices()
  clearFilterOptions()
}
</script>
