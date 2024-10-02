<template>
  <v-list-item @click="goTo('welcome')"> Welcome </v-list-item>
  <v-list-item @click="goTo('filter')"> Filter </v-list-item>
  <v-list-item @click="goTo('index')"> Collection </v-list-item>
  <v-list-item @click="toggle">{{ toggleText }}</v-list-item>
  <v-divider />
  <v-list-item>Please Note: Editing is disabled on small devices!</v-list-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { type TPageName } from '@/types/routesTypes'

import { useModuleStore } from '../../../../scripts/stores/module'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'

const { routerPush } = useRoutesMainStore()
const { itemView } = storeToRefs(useModuleStore())
const { setNextItemView } = useModuleStore()

const toggleText = computed(() => {
  return `Toggle View ["${itemView.value}"]`
})

function toggle() {
  setNextItemView()
}

async function goTo(pageName: TPageName) {
  await routerPush(pageName)
}
</script>
