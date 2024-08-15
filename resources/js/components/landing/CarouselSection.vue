<template>
    <v-card fluid>
        <v-card-title dark class="primary title bg-light-blue-darken-4 text-white"> <span>Gallery of some of the
                excavation
                highlights</span></v-card-title>
        <v-carousel height="600" continuos cycle :show-arrows="false" hide-delimiters>
            <v-carousel-item v-for="(item, i) in images" :key="i" :src="item.media.urls.full"
                :lazy-src="item.media.urls.tn" cover>
                <v-container id="overlay" fluid style="height: 100vh;">
                    <v-card id="card" height="100%" class="fluid mx-auto" max-width="70%" flat
                        color="rgb(255, 0, 0, 0)">
                        <v-card-title class="text-h4 font-weight-black text-orange">
                            <v-row justify="center">{{ item.title }}</v-row>
                        </v-card-title>
                        <v-card-text class="text-h5 font-weight-medium mb-2 text-white" justify="start">
                            {{ item.desc }}
                        </v-card-text>
                    </v-card>
                </v-container>
            </v-carousel-item>
        </v-carousel>
    </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMediaStore } from '../../scripts/stores/media'
import { TMediaOfItem } from '../../types/mediaTypes'
import { storeToRefs } from 'pinia'
import appConfig from '../../scripts/app.config'

let { bucketUrl } = storeToRefs(useMediaStore())
let { appName } = appConfig()

const images = computed(() => {
    let c: Array<{ title: string, desc: string, media: TMediaOfItem }> = []
    for (let i = 1; i <= 6; i++) {
        c.push({
            title: `Picture ${i}`, desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
            media: {
                hasMedia: true,
                urls: {
                    full: `${bucketUrl.value}app/carousel/${appName}${i}.jpg`,
                    tn: `${bucketUrl.value}app/carousel/${appName}${i}-tn.jpg`,
                },
            }
        })
    }
    return c
})

</script>
<style scoped>
#overlay {
    background-color: rgba(92, 19, 19, 0.4) !important;
    z-index: 20;
}
</style>