<template>
  <v-card class="elevation-12">
    <v-toolbar class="bg-grey text-black" density="compact" :height="50">
      <v-toolbar-title>{{ header }}</v-toolbar-title>

      <v-pagination v-if="paginator.show" v-model="page" :length="paginator.pages"
        :total-visible="`${mdAndDown ? 4 : 10}`" />

      <v-btn v-if="showBtnViewToggle" :icon="ico" size="small" variant="tonal"
        @click="toggleCollectionDisplayOption()" />
    </v-toolbar>
    <v-card-text>
      <v-container fluid class="ma-0 pa-0">
        <component :is="collectionPage" :source="props.source" :page-no-b1="meta2.pageNoB1" />
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { type Component, computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'

import type { TModule } from '@/js/types/moduleTypes'
import type { TCollectionName } from '@/js/types/collectionTypes'
import { useItemStore } from '../../scripts/stores/item'
import { useNotificationsStore } from '../../scripts/stores/notifications'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'

const CollectionPageGallery = defineAsyncComponent(() => import('./CollectionPageGallery.vue'))
const CollectionPageChips = defineAsyncComponent(() => import('./CollectionPageChips.vue'))
const CollectionPageTabular = defineAsyncComponent(() => import('./CollectionPageTabular.vue'))

const props = defineProps<{
  source: TCollectionName
}>()

const { collection, loadGenericPage, toggleCollectionView } = useCollectionsStore()
const { pushHome } = useRoutesMainStore()
const { derived } = storeToRefs(useItemStore())
const { showSpinner } = useNotificationsStore()
const { smAndDown, mdAndDown } = useDisplay()

const viewToIcon = {
  Gallery: 'mdi-image-area',
  Tabular: 'mdi-table-of-contents',
  Chips: 'mdi-dots-horizontal',
}

const meta2 = computed(() => {
  const c = collection(props.source)
  return c.value.meta2
})
const ico = computed(() => {
  return viewToIcon[displayOption.value]
})

async function asynLoadPage(val: number) {
  showSpinner('Loading page...')
  const res = await loadGenericPage(
    props.source,
    val,
    meta2.value.viewName,
    meta2.value.itemsPerPage,
    <TModule>derived.value.module,
  )
  showSpinner(false)
  if (!res.success) {
    pushHome(`${res.message}. Redirected to home page`)
  }
}

const page = computed({
  get: () => {
    return paginator.value.page
  },
  set: (val) => {
    asynLoadPage(val)
  },
})

const header = computed(() => {
  let pageInfo,
    headerText = ``
  switch (meta2.value.length) {
    case 0:
      pageInfo = `(Empty)`
      break
    case 1:
      pageInfo = `(P1)`
      break
    default:
      pageInfo = `(P${meta2.value.pageNoB1}/${meta2.value.noOfPages})`
  }

  switch (props.source) {
    case 'main':
      headerText = smAndDown.value
        ? `Collection(${meta2.value.length}): ${pageInfo}`
        : `${derived.value.module} Collection(${meta2.value.length}): ${pageInfo}, items (${meta2.value.firstItemNo}-${meta2.value.lastItemNo})`
      break
    case 'media':
      headerText = smAndDown.value
        ? `Media(${meta2.value.length}) ${pageInfo}`
        : `${derived.value.moduleAndTag} - Media(${meta2.value.length}) ${pageInfo}`
      break
    case 'related':
      headerText = smAndDown.value
        ? `Related(${meta2.value.length}) ${pageInfo}`
        : `${derived.value.moduleAndTag} - Related(${meta2.value.length}) ${pageInfo}`
  }
  return headerText
})

const paginator = computed(() => {
  return {
    show: meta2.value.noOfPages > 1,
    page: meta2.value.pageNoB1,
    pages: meta2.value.noOfPages,
  }
})

const collectionPage = computed<Component>(() => {
  switch (meta2.value.viewName) {
    case 'Gallery':
      return CollectionPageGallery
    case 'Chips':
      return CollectionPageChips
    case 'Tabular':
      return CollectionPageTabular
    default:
      console.log(`Collection.vue invalid collectionPage: ${meta2.value.viewIndex}`)
      return CollectionPageGallery
  }
})

const showBtnViewToggle = computed(() => {
  return meta2.value.length > 0 && meta2.value.views.length > 1
})
const displayOption = computed(() => {
  return meta2.value.viewName
})

async function toggleCollectionDisplayOption() {
  showSpinner('Toggle view - loading page...')
  await toggleCollectionView(props.source)
  showSpinner(false)
}
</script>
