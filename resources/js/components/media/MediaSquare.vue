<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card v-bind="props" variant="outlined" class="ml-1 mb-1">
      <v-img
        :src="data.urls?.tn"
        :lazy-src="data.urls?.tn"
        aspect-ratio="1"
        class="bg-grey-lighten-2"
      >
        <v-btn
          v-if="data.showTag"
          class="text-subtitle-1 font-weight-medium text-black"
          color="grey"
        >
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
import {
  TCollectionName,
  TPageMainGallery,
  TPageRelatedGallery,
  TPageMediaGallery,
} from '../../types/collectionTypes'
import { useCollectionsStore } from '../../scripts/stores/collections/collections'
import MediaOverlay from './MediaOverlay.vue'

const { collection } = useCollectionsStore()

const prps = defineProps<{
  source: TCollectionName
  itemIndex: number
}>()

const record = computed(() => {
  const c = collection(prps.source)
  let indexInPage = prps.itemIndex % c.value.meta.itemsPerPage
  let record = c.value.page[indexInPage]
  return record
})

const data = computed(() => {
  if (prps.source === 'main') {
    // const ma = record.value as any as TPageMainGallery
    const ma = <TPageMainGallery>record.value

    return {
      showTag: true,
      tagText: ma.tag,
      urls: ma.media?.urls,
      short: ma.short,
      record: ma,
    }
  } else if (prps.source === 'media') {
    // const med = record.value as TPageMediaGallery
    const med = <TPageMediaGallery>record.value
    return {
      showTag: false,
      tagText: '',
      urls: med?.urls,
      short: '',
      record: med,
    }
  } else {
    // const rel = record.value as TPageRelatedGallery
    const rel = <TPageRelatedGallery>record.value
    return {
      showTag: true,
      tagText: rel.relation_name,
      urls: rel.media?.urls,
      short: `${rel.module} ${rel.tag}.  ${rel.short}`,
      record: rel,
    }
  }
  // switch (prps.source) {
  //   case 'main':
  //     let ma = record.value as any as TPageMainGallery
  //     return {
  //       showTag: true,
  //       tagText: ma.tag,
  //       urls: ma.media?.urls,
  //       short: ma.short,
  //       record: ma
  //     }

  //   case 'media':
  //     let med = record.value as TPageMediaGallery
  //     return {
  //       showTag: false,
  //       tagText: '',
  //       urls: med?.urls,
  //       short: '',
  //       record: med
  //     }

  //   case 'related':
  //   default:
  //     let rel = record.value as TPageRelatedGallery
  //     return {
  //       showTag: true,
  //       tagText: rel.relation_name,
  //       urls: rel.media?.urls,
  //       short: `${rel.module} ${rel.tag}.  ${rel.short}`,
  //       record: rel
  //     }
  // }
})
</script>
