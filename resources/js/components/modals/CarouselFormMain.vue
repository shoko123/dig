<template>
  <v-card-text>
    <v-row class="text-body-1">
      {{ item?.short }}
    </v-row>
  </v-card-text>
  <v-card-actions>
    <v-btn variant="outlined" @click="clicked"> {{ item?.module }} {{ item?.tag }} </v-btn>
  </v-card-actions>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { type TCarousel } from '@/js/types/mediaTypes'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'
const { routerPush } = useRoutesMainStore()
const { close } = useCarouselStore()
const { carouselItemDetails } = storeToRefs(useCarouselStore())

const item = computed(() => {
  return <TCarousel<'main'> | null>carouselItemDetails.value
})

async function clicked() {
  let slug = item.value?.slug
  await close()
  routerPush('show', slug)
}
</script>
