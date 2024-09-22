<template>
  <div id="zoomy-container" height="100vh">
    <v-img id="zoomy" :src="media?.urls.full" :lazy-src="media?.urls.tn" aspect-ratio="1" height="95vh"
      :cover="isFiller">
      <v-overlay v-model="isFiller" contained class="align-center justify-center">
        <div class="text-white text-h2">No Media Available</div>
      </v-overlay>
    </v-img>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'
import Zoomy from './zoomy/Zoomy.js'

onMounted(() => {
  //console.log(`ImageZoom.mount`)
  if (media.value?.hasMedia) {
    zm.value = new Zoomy('zoomy', options)
  } else {
    zm.value?.detach()
    zm.value = null
  }
})

onBeforeUnmount(() => {
  //console.log(`ImageZoom.unmount`)
  zm.value?.detach()
  zm.value = null
})

const { carouselComputed } = storeToRefs(useCarouselStore())

const media = computed(() => {
  return carouselComputed.value?.media
})

const zm = ref<Zoomy | null>(null)

const options = {
  zoomUpperConstraint: 8, // Upper limit for zooming (optional)
  boundaryElementId: 'zoomy-container',
}

watch(media, () => {
  //console.log('ImageZoom.media changed')
  zm.value?.disable()
  zm.value?.detach()
  if (media.value?.hasMedia) {
    zm.value = new Zoomy('zoomy', options)
  } else {
    zm.value = null
  }
})

//isFiller includes a set function as v-overlays requires a modifiable boolean
const isFiller = computed(() => {
  return !media.value?.hasMedia
})
</script>
