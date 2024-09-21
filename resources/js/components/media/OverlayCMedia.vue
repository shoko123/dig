<template>
  <v-row justify="center" align="center">
    <v-btn class="bg-grey-lighten-1" @click="openModalCarousel()"> Lightbox </v-btn>
  </v-row>
</template>

<script lang="ts" setup>
import type { TArray } from '../../types/collectionTypes'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useNotificationsStore } from '../../scripts/stores/notifications'

const props = defineProps<{
  itemIndex: number
  record: TArray<'media'>
}>()

const { open } = useCarouselStore()
const { showSpinner } = useNotificationsStore()
const { pushHome } = useRoutesMainStore()

async function openModalCarousel() {
  console.log(`Open carousel clicked .....`)
  showSpinner(`Loading carousel item...`)
  const ok = await open('media', props.itemIndex)
  showSpinner(false)
  if (!ok) {
    await pushHome(`Problem encountered! Redirected to home page.`)
  }
}
</script>
