<template>
  <v-data-table-virtual
    v-if="collectionIsNotEmpty"
    :headers="heads as any"
    :items="page"
    class="elevation-1"
    height="80vh"
    item-value="slug"
    fixed-header
  >
    <template #[`item.tag`]="{ item }">
      <v-btn @click="btnClicked(item)">
        {{ item.tag }}
      </v-btn>
    </template>
  </v-data-table-virtual>
</template>

<script lang="ts" setup>
import type { VDataTableVirtual } from 'vuetify/lib/components/index.mjs'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { TModule } from '@/js/types/moduleTypes'
import { TCollectionName, TPage } from '@/js/types/collectionTypes'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import { useCollectionRelatedStore } from '../../scripts/stores/collections/collectionRelated'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'

import { useModuleStore } from '../../scripts/stores/module'

const props = defineProps<{
  source: TCollectionName
  pageNoB1: number
}>()

let { collection } = useCollectionsStore()
let { getCurrentModuleStore } = storeToRefs(useModuleStore())
let { routerPush, moveFromItemToItem } = useRoutesMainStore()
const { headers } = storeToRefs(useCollectionRelatedStore())

const heads = computed(() => {
  if (props.source === 'main') {
    const store = getCurrentModuleStore
    return store.value.headers
  } else {
    return headers.value
  }
})

const c = computed(() => {
  return collection(props.source).value
})

const page = computed(() => {
  switch (props.source) {
    case 'main':
      return c.value.page as TPage<'main', 'Tabular', TModule>[]
    case 'related':
      return c.value.page as unknown as TPage<'related', 'Tabular'>[]
    default:
      return []
  }
})

const collectionIsNotEmpty = computed(() => {
  return page.value === undefined ? 0 : page.value.length > 0
})

function btnClicked(item: TPage<'main', 'Tabular', TModule> | TPage<'related', 'Tabular'>) {
  console.log(`pageTable.btnClicked() item: ${JSON.stringify(item, null, 2)}`)
  if (props.source === 'main') {
    routerPush('show', item.slug)
  } else {
    const related = item as TPage<'related', 'Tabular'>
    moveFromItemToItem(related.slug, related.id, related.module)
  }
}
</script>
