<template>
  <v-card-text v-if="item">
    <v-row no-gutters class="text-h5"> Media for {{ derived.moduleAndTag }} </v-row>
    <v-row wrap no-gutters>
      <v-textarea v-model="derived.moduleAndTag" label="Description" class="mr-1" rows="3" readonly filled />
    </v-row>
    <v-row no-gutters>
      <v-text-field v-model="item.file_name" label="File Name" class="mr-1" readonly filled />
    </v-row>
    <v-row no-gutters>
      <v-text-field v-model="item.collection_name" label="Group" class="mr-1" readonly filled />
      <v-text-field v-model="item.size" label="Size" class="mr-1" readonly filled />
    </v-row>
  </v-card-text>
  <v-card-actions>
    <v-btn variant="outlined" @click="backToItem">
      {{ derived.moduleAndTag }}
    </v-btn>
    <!-- <v-btn @click="download" variant="outlined">Download</v-btn> -->
  </v-card-actions>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { type TCarousel } from '@/types/mediaTypes'
import { useItemStore } from '../../scripts/stores/item'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'

const { close } = useCarouselStore()
const { carouselComputed } = storeToRefs(useCarouselStore())
const { derived } = storeToRefs(useItemStore())

const item = computed(() => {
  return <TCarousel<'media'> | null>carouselComputed.value
})

async function backToItem() {
  await close()
}
</script>
