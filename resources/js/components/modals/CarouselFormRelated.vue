<template>
  <v-card-text>
    <v-row class="text-body-1">
      {{ item?.short }}
    </v-row>
  </v-card-text>
  <v-card-actions>
    <v-btn variant="outlined" @click="goToItem"> {{ item?.module }} {{ item?.tag }} </v-btn>
  </v-card-actions>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { TModule } from '@/js/types/moduleTypes'
import type { TCarousel } from '@/js/types/mediaTypes'

import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'

const { moveFromItemToItem } = useRoutesMainStore()
const { close } = useCarouselStore()
const { carouselItemDetails } = storeToRefs(useCarouselStore())

const item = computed(() => {
  return <TCarousel<'related'>>carouselItemDetails.value
})

async function goToItem() {
  let details = {
    slug: <string>item.value?.slug,
    id: item.value.id,
    module: <TModule>item.value?.module,
  }
  await close()
  await moveFromItemToItem(details.slug, details.id, details.module)
}
</script>
