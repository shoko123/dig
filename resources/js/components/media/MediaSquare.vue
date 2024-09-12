<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card v-bind="props" variant="outlined" class="ml-1 mb-1">
      <v-img :src="data.urls?.tn" :lazy-src="data.urls?.tn" aspect-ratio="1" class="bg-grey-lighten-2">
        <v-btn v-if="data.showTag" class="text-subtitle-1 font-weight-medium text-black" color="grey">
          {{ data.tagText }}
        </v-btn>
        <v-card class="mx-auto" color="transparent" flat>
          <v-card-text class="text-body-1 text-black">
            {{ data.short }}
          </v-card-text>
        </v-card>
        <v-overlay v-if="isHovering">
          <template #activator>
            <MediaOverlay :source="source" :item-index="itemIndex" :record="data.record" />
          </template>
        </v-overlay>
      </v-img>
    </v-card>
  </v-hover>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { TCollectionName, TGalleryIntersection } from '../../types/collectionTypes'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import MediaOverlay from './MediaOverlay.vue'

const { getCollectionStore } = useCollectionsStore()

const prps = defineProps<{
  source: TCollectionName
  itemIndex: number
}>()

const record = computed(() => {
  const c = getCollectionStore(prps.source)
  let indexInPage = prps.itemIndex % c.info.itemsPerPage
  return c.page[indexInPage] as TGalleryIntersection // TPage<TCollectionName, 'Gallery', TModule>
})

const data = computed(() => {
  switch (prps.source) {
    case 'main':
      return {
        showTag: true,
        tagText: record.value.tag,
        urls: record.value.media?.urls,
        short: record.value.short,
        record: record.value,
      }
    case 'media':
      return {
        showTag: false,
        tagText: '',
        urls: record.value?.urls,
        short: '',
        record: record.value,
      }
    case 'related':
    default:
      return {
        showTag: true,
        tagText: record.value.relation_name,
        urls: record.value.media?.urls,
        short: `${record.value.module} ${record.value.tag}.  ${record.value.short}`,
        record: record.value,
      }
  }
})
</script>
