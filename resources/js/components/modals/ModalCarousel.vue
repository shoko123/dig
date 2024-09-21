<template>
  <v-dialog v-model="isOpen" fullscreen>
    <v-container fluid>
      <v-card height="97vh">
        <v-toolbar height="36" class="bg-grey-lighten-1">
          <v-toolbar-title>{{ details.header }}</v-toolbar-title>
          <v-btn v-if="showNextArrows" size="small" icon="mdi-arrow-left" @click="nextClicked(false)" />
          <v-btn v-if="showNextArrows" size="small" icon="mdi-arrow-right" @click="nextClicked(true)" />
          <v-btn size="small" icon="mdi-close" @click="closeCarousel" />
        </v-toolbar>
        <v-card-text>
          <v-row wrap>
            <v-col :cols="widths[0]">
              <v-card>
                <ImageZoom />
              </v-card>
            </v-col>
            <v-col :cols="widths[1]">
              <v-card class="bg-purple-lighten-5">
                <component :is="details.form" />
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </v-dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { computed } from 'vue'
import type { TCarousel } from '@/js/types/mediaTypes'
import { useItemStore } from '../../scripts/stores/item'
import { useCarouselStore } from '../../scripts/stores/modals/carousel'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useNotificationsStore } from '../../scripts/stores/notifications'
import ImageZoom from './ImageZoom.vue'
import CarouselFormMain from './CarouselFormMain.vue'
import CarouselFormMedia from './CarouselFormMedia.vue'
import CarouselFormRelated from './CarouselFormRelated.vue'

const { smAndDown } = useDisplay()
const { close, nextItem } = useCarouselStore()
const { showSpinner } = useNotificationsStore()
const { pushHome } = useRoutesMainStore()
const { isOpen, index, sourceArrayLength, collectionName, carouselComputed } =
  storeToRefs(useCarouselStore())

const { derived } = storeToRefs(useItemStore())
const details = computed(() => {
  switch (collectionName.value) {
    case 'main':
      return {
        form: CarouselFormMain,
        header: mainHeader(<TCarousel<'main'>>carouselComputed.value),
      }
    case 'related':
      return {
        form: CarouselFormRelated,
        header: relatedHeader(<TCarousel<'related'>>carouselComputed.value),
      }
    case 'media':
    default:
      return { form: CarouselFormMedia, header: mediaHeader() }
  }
})

const counter = computed(() => {
  return `(${index.value + 1}/${sourceArrayLength.value})`
})

function mainHeader(item: TCarousel<'main'>) {
  return `${item?.module} ${item?.tag} ${counter.value}`
}
function relatedHeader(item: TCarousel<'related'>) {
  return smAndDown.value
    ? ``
    : `${item?.module} ${item?.tag}. Relation: ${item?.relation_name} ${counter.value}`
}
function mediaHeader() {
  return `${derived.value.moduleAndTag}: Media  ${counter.value}`
}

const widths = computed(() => {
  return smAndDown.value ? [12, 12] : [9, 3]
})

const showNextArrows = computed(() => {
  return sourceArrayLength.value > 1
})

async function nextClicked(isRight: boolean) {
  showSpinner(`Loading carousel item...`)
  const res = await nextItem(isRight)
  showSpinner(false)
  if (!res) {
    await pushHome(`Error encountered. Redirected to home page.`)
  }
}

async function closeCarousel() {
  showSpinner('Loading a new page...')
  const res = await close()
  showSpinner(false)
  if (!res) {
    await pushHome(`Error encountered. Redirected to home page.`)
  }
}
</script>
