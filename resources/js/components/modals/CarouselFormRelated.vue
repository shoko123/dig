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
import type { TModule } from '@/types/moduleTypes'
import type { TCarousel } from '@/types/mediaTypes'

import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'

const { moveToRelatedItem } = useRoutesMainStore()
const { close } = useCarouselStore()
const { carouselComputed } = storeToRefs(useCarouselStore())

const item = computed(() => {
  return <TCarousel<'related'>>carouselComputed.value
})

async function goToItem() {
  let details = {
    slug: <string>item.value?.slug,
    id: item.value.id,
    module: <TModule>item.value?.module,
  }
  await close()
  await moveToRelatedItem(details.module, details.id)
}
</script>
