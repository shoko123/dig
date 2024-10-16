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
import { useNotificationsStore } from '../../../../scripts/stores/notifications'
import { useTrioStore } from '../../../../scripts/stores/trio/trio'
import { useFilterStore } from '../../../../scripts/stores/trio/filter'
import WelcomeButton from '../elements/WelcomeButton.vue'

const router = useRouter()
const { current } = storeToRefs(useRoutesMainStore())
const { filterClearOptions } = useTrioStore()
const filterStore = useFilterStore()


function submit() {
  console.log(`filter.submit()`)
  const query = filterStore.filtersToQueryObject()
  router.push({ name: 'index', params: { url_module: current.value.url_module }, query })
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
