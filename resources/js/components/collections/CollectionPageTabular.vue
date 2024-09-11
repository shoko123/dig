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
import type { TModule } from '@/js/types/moduleTypes'
import type { TCollectionName, TPage } from '@/js/types/collectionTypes'

import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import { useCollectionRelatedStore } from '../../scripts/stores/collections/collectionRelated'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'

type THeader = { title: string, align: 'start' | 'end' | 'center' | undefined, key: string }
const props = defineProps<{
  source: TCollectionName
  pageNoB1: number
}>()

const { collection } = useCollectionsStore()
const { relatedTableHeaders } = storeToRefs(useCollectionRelatedStore())
const { routerPush, moveFromItemToItem } = useRoutesMainStore()

onMounted(async () => {
  const { useModuleStore } = await import('../../scripts/stores/module')
  let { getStore } = useModuleStore()
  const store = await getStore()
  mainTableHeaders.value = store.mainTableHeaders as THeader[]
});

const mainTableHeaders = ref<THeader[]>([])

const headers = computed(() => {
  if (props.source === 'main') {
    return mainTableHeaders.value as THeader[]
  } else {
    return relatedTableHeaders.value as THeader[]
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

async function btnClicked(item: TPage<'main', 'Tabular', TModule> | TPage<'related', 'Tabular'>) {
  console.log(`pageTable.btnClicked() item: ${JSON.stringify(item, null, 2)}`)
  if (props.source === 'main') {
    routerPush('show', item.slug)
  } else {
    const related = item as TPage<'related', 'Tabular'>
    await moveFromItemToItem(related.slug, related.id, related.module)
  }
}
</script>
