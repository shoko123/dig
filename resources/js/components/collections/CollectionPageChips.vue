<template>
  <v-row wrap>
    <v-chip
      v-for="(item, index) in page"
      :key="index"
      :disabled="rms.inTransition"
      class="font-weight-normal ma-2 body-1"
      @click="goTo(item)"
    >
      {{ item.tag }}
    </v-chip>
  </v-row>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { TCollectionName, TPage } from '../../types/collectionTypes'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'

const props = defineProps<{
  source: TCollectionName
  pageNoB1: number
}>()

const { collection } = useCollectionsStore()
const rms = useRoutesMainStore()

const c = computed(() => {
  return collection(props.source).value
})

const page = computed(() => {
  return c.value.page as TPage<'main', 'Chips'>[] | TPage<'related', 'Chips'>[]
})

function goTo(item: TPage<'main', 'Chips'> | TPage<'related', 'Chips'>) {
  if (props.source === 'main') {
    rms.routerPush('show', (<TPage<'main', 'Chips'>>item).slug)
  } else {
    const related = <TPage<'related', 'Chips'>>item
    rms.moveFromItemToItem<string>(related.slug, <string>related.id, related.module)
  }
}
</script>
