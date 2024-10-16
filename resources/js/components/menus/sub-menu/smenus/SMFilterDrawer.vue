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
import { useTrioStore } from '../../../../scripts/stores/trio/trio'
import { useFilterStore } from '../../../../scripts/stores/trio/filter'

const { current } = storeToRefs(useRoutesMainStore())
const { resetCategoryAndGroupIndices, filterClearOptions } = useTrioStore()
const { push } = useRouter()

const filterStore = useFilterStore()

const url_module = computed(() => {
  return current.value.url_module
})

async function submit() {
  const query = filterStore.filtersToQueryObject()
  resetCategoryAndGroupIndices()
  push({ name: 'index', params: { url_module: current.value.url_module }, query })
}

async function getCnt() {
  const { showSnackbar } = useNotificationsStore()
  let cnt = await filterStore.getCount()
  if (cnt > -1) {
    showSnackbar(`Request count result: ${cnt}`)
  }
}

function clear() {
  console.log(`filter.clear()`)
  filterClearOptions()
}
</script>
