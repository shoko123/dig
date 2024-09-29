<template>
  <v-data-table-virtual v-if="collectionIsNotEmpty" :headers="headers" :items="page" class="elevation-1" height="80vh"
    item-value="slug" fixed-header>
    <template #[`item.tag`]="{ item }">
      <v-btn @click="btnClicked(item)">
        {{ item.tag }}
      </v-btn>
    </template>
  </v-data-table-virtual>
</template>

<script lang="ts" setup>
import type { VDataTableVirtual } from 'vuetify/lib/components/index.mjs'
import type { TModule } from '@/types/moduleTypes'
import type { TCName, TPage } from '@/types/collectionTypes'

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import { useCollectionRelatedStore } from '../../scripts/stores/collections/collectionRelated'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'

type THeader = { title: string, align: 'start' | 'end' | 'center' | undefined, key: string }
const props = defineProps<{
  source: TCName
  pageNoB1: number
}>()

const { getCollectionStore } = useCollectionsStore()
const { current } = storeToRefs(useRoutesMainStore())
const { relatedTableHeaders } = storeToRefs(useCollectionRelatedStore())
const { routerPush, moveToRelatedItem } = useRoutesMainStore()

const headers = computed(() => {
  if (props.source === 'main') {
    return mainHeaders.value
  } else {
    return relatedTableHeaders.value as THeader[]
  }
})

const c = computed(() => {
  return getCollectionStore(props.source)
})

const mainHeaders = computed(() => {
  return headersByModule[current.value.module!]
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

async function btnClicked(item: TPage<'main', 'Tabular', TModule> | TPage<'related', 'Tabular'>) {
  console.log(`pageTable.btnClicked() item: ${JSON.stringify(item, null, 2)}`)
  if (props.source === 'main') {
    await routerPush('show', item.slug)
  } else {
    const related = item as TPage<'related', 'Tabular'>
    await moveToRelatedItem(related.module, related.id)
  }
}

const headersByModule: Record<TModule, THeader[]> = {
  Ceramic: [
    { title: 'Name', align: 'start', key: 'tag' },
    { title: 'Year', align: 'start', key: 'id_year' },
    { title: 'Field Description', align: 'start', key: 'field_description' },
    { title: 'Specialist Description', align: 'start', key: 'specialist_description' },
  ],
  Locus: [
    { title: 'Label', align: 'start', key: 'tag' },
    { title: 'OC Label', align: 'start', key: 'oc_label' },
    { title: 'Square', align: 'start', key: 'square' },
    { title: 'Published Date', align: 'start', key: 'published_date' },
  ],
  Stone: [
    { title: 'Label', align: 'start', key: 'tag' },
    { title: 'Context', align: 'start', key: 'context' },
    { title: 'Excavation Date', align: 'start', key: 'excavation_date' },
    { title: 'Cataloger Description', align: 'start', key: 'cataloger_description' },
    { title: 'Conservation Notes', align: 'start', key: 'conservation_notes' },
  ]
}
</script>
