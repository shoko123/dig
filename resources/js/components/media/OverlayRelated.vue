<template>
  <v-btn class="ml-2 bg-grey-lighten-1" @click="goToItem()"> Visit </v-btn>
  <v-btn v-if="props.record.media.hasMedia" class="ml-2 bg-grey-lighten-1" @click="openModalCarousel()">
    Lightbox
  </v-btn>
</template>

<script lang="ts" setup>
import { TPage } from '../../types/collectionTypes'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'
import { useNotificationsStore } from '../../scripts/stores/notifications'

const props = defineProps<{
  itemIndex: number
  record: TPage<'related', 'Gallery'>
}>()

let { moveToRelatedItem } = useRoutesMainStore()
const { showSpinner } = useNotificationsStore()
const { pushHome } = useRoutesMainStore()
const { open } = useCarouselStore()

async function openModalCarousel() {
  showSpinner(`Loading carousel item...`)
  const ok = await open('related', props.itemIndex)
  showSpinner(false)
  if (!ok) {
    await pushHome(`Error encountered! Redirected to home page.`)
  }
}

async function goToItem() {
  await moveToRelatedItem(props.record.module, props.record.id)
}
</script>
