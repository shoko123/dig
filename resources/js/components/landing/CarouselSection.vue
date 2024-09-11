<template>
    <v-card fluid>
        <v-card-title dark class="primary title bg-light-blue-darken-4 text-white"> <span>Gallery of some of the
                excavation`s
                highlights</span>
        </v-card-title>
        <v-carousel v-model="model" height="600" continuos cycle :show-arrows="false" hide-delimiters>
            <v-carousel-item v-for="(item, i) in images" :key="i" :value="i" :src="item.media.urls.full"
                :lazy-src="item.media.urls.tn" cover>
            </v-carousel-item>

        </v-carousel>
        <v-divider />
        <div class="text-h6 font-weight-bold ml-2">{{ current.title }}</div>
        <div class="text-body-1 ml-2"> {{ current.desc }}</div>
        <v-divider />
    </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { TMediaOfItem } from '../../types/mediaTypes'
import { storeToRefs } from 'pinia'
import { useMainStore } from '../../scripts/stores/main'

let { appName, bucketUrl } = storeToRefs(useMainStore())

const model = ref<number>(0)

const images = computed(() => {
    let c: Array<{ title: string, desc: string, media: TMediaOfItem }> = []
    for (let i = 1; i <= 6; i++) {
        c.push({
            title: `Picture ${i}`, desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
            media: {
                hasMedia: true,
                urls: {
                    full: `${bucketUrl.value}app/carousel/${appName.value}${i}.jpg`,
                    tn: `${bucketUrl.value}app/carousel/${appName.value}${i}-tn.jpg`,
                },
            }
        })
    }
    return c
})

const current = computed(() => {
    return images.value[model.value]
})

</script>
<style scoped>
#overlay {
    background-color: rgba(92, 19, 19, 0.4) !important;
    z-index: 20;
}
</style>