<template>
  <v-row wrap no-gutters>
    <v-col v-for="(item, index) in page" :key="index" :cols="`${mediaSizeInColumns}`">
      <MediaSquare v-bind="{
        source: source,
        itemIndex: itemIndex(index),
      }" />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import { TCName } from '../../types/collectionTypes'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import MediaSquare from '../media/MediaSquare.vue'

const props = defineProps<{
  source: TCName
  pageNoB1: number
}>()

const { name } = useDisplay()
let { getCollectionStore } = useCollectionsStore()



const page = computed(() => {
  return getCollectionStore(props.source).page
})

const mediaSizeInColumns = computed(() => {
  switch (name.value) {
    case 'xs':
    case 'sm':
      return 6

    case 'md':
      return 4

    case 'lg':
    case 'xl':
    case 'xxl':
      return 2

    default:
      return 1
  }
})
function itemIndex(index: number): number {
  return (props.pageNoB1 - 1) * getCollectionStore(props.source).info.itemsPerPage + index
}
</script>
