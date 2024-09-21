<template>
  <v-row wrap>
    <v-chip v-for="(item, index) in page" :key="index" :disabled="rms.inTransition"
      class="font-weight-normal ma-2 body-1" @click="goTo(item)">
      {{ item.tag }}
    </v-chip>
  </v-row>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { TCName, TPage } from '../../types/collectionTypes'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'

const props = defineProps<{
  source: TCName
  pageNoB1: number
}>()

const { getCollectionStore } = useCollectionsStore()
const rms = useRoutesMainStore()

const page = computed(() => {
  return getCollectionStore(props.source).page as TPage<'main' | 'related', 'Chips'>[]
})

async function goTo(item: TPage<'main' | 'related', 'Chips'>) {
  if (props.source === 'main') {
    await rms.routerPush('show', (<TPage<'main', 'Chips'>>item).slug)
  } else {
    const related = <TPage<'related', 'Chips'>>item
    await rms.moveToRelatedItem(related.module, related.id)
  }
}
</script>
