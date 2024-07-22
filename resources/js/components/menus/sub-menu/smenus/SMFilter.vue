<template>
  <v-btn class="primary--text" large variant="outlined" @click="submit"> Submit </v-btn>
  <v-btn class="primary--text" large variant="outlined" @click="getCnt"> Count </v-btn>
  <v-btn class="primary--text" large variant="outlined" @click="clear"> clear </v-btn>

  <div class="hidden-sm-and-down">
    <WelcomeButton />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import { useTrioStore } from '../../../../scripts/stores/trio/trio'
import { useFilterStore } from '../../../../scripts/stores/trio/filter'
import { useNotificationsStore } from '../../../../scripts/stores/notifications'
import WelcomeButton from '../elements/WelcomeButton.vue'

const router = useRouter()
const { current } = storeToRefs(useRoutesMainStore())
const { resetCategoryAndGroupIndices } = useTrioStore()
const { filtersToQueryObject, clearSelectedFilters, getCount } = useFilterStore()

function submit() {
  console.log(`filter.submit()`)
  const query = filtersToQueryObject()
  resetCategoryAndGroupIndices()
  router.push({ name: 'index', params: { module: current.value.url_module }, query })
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
