<template>
  <v-carousel height="96vh" continuos cycle>
    <v-carousel-item
      v-for="(med, i) in media"
      :key="i"
      :src="med.urls.full"
      :lazy-src="med.urls.tn"
      cover
    />
  </v-carousel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMediaStore } from '../../scripts/stores/media'
import { TMediaOfItem } from '../../types/mediaTypes'
import { storeToRefs } from 'pinia'
import appConfig from '../../scripts/app.config'
let { bucketUrl } = storeToRefs(useMediaStore())
let { appName } = appConfig()
const media = computed(() => {
  let c: Array<TMediaOfItem> = []
  for (let i = 1; i <= 6; i++) {
    c.push({
      hasMedia: true,
      urls: {
        full: `${bucketUrl.value}app/carousel/${appName}${i}.jpg`,
        tn: `${bucketUrl.value}app/carousel/${appName}${i}-tn.jpg`,
      },
    })
  }
  return c
})
</script>
../../scripts/app.config
