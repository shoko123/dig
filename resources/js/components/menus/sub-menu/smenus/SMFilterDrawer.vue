<template>
  <v-list-item @click="submit"> Submit </v-list-item>
  <v-list-item @click="getCnt"> Count </v-list-item>
  <v-list-item @click="clear"> Clear </v-list-item>
  <v-divider />
  <v-list-item :to="{ name: 'welcome', params: { module } }"> Welcome </v-list-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import { useTrioStore } from '../../../../scripts/stores/trio/trio'
import { useFilterStore } from '../../../../scripts/stores/trio/filter'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '../../../../scripts/stores/notifications'

const { current } = storeToRefs(useRoutesMainStore())
const { resetCategoryAndGroupIndices } = useTrioStore()
const { filtersToQueryObject, clearSelectedFilters, getCount } = useFilterStore()
const { push } = useRouter()

const module = computed(() => {
  return current.value.url_module
})

function submit() {
  const query = filtersToQueryObject()
  resetCategoryAndGroupIndices()
  push({ name: 'index', params: { module: current.value.url_module }, query })
}

async function getCnt() {
  const { showSnackbar } = useNotificationsStore()

  let cnt = await getCount()
  if (cnt > -1) {
    showSnackbar(`Request count result: ${cnt}`)
  }
}

function clear() {
  console.log(`filter.clear()`)
  resetCategoryAndGroupIndices()
  clearSelectedFilters()
}
</script>
