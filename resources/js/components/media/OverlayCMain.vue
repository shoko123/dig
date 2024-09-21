<template>
  <v-btn class="ml-2 bg-grey-lighten-1" @click="goToItem()"> Visit </v-btn>
  <v-btn v-if="props.record.media.hasMedia" class="ml-2 bg-grey-lighten-1" @click="openModalCarousel()">
    Lightbox
  </v-btn>
</template>

<script lang="ts" setup>
import { TCarousel } from '../../types/mediaTypes'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useNotificationsStore } from '../../scripts/stores/notifications'

const props = defineProps<{
  itemIndex: number
  record: TCarousel<'main'>
}>()

let { routerPush } = useRoutesMainStore()
const { open } = useCarouselStore()
const { showSpinner } = useNotificationsStore()
const { pushHome } = useRoutesMainStore()

async function openModalCarousel() {
  showSpinner(`Loading carousel item...`)
  const ok = await open('main', props.itemIndex)
  showSpinner(false)
  if (!ok) {
    await pushHome(`Problem encountered! Redirected to home page.`)
  }
}

async function goToItem() {
  await routerPush('show', props.record.slug)
}
</script>
