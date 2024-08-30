<template>
  <v-card class="elevation-12">
    <v-card-title class="bg-grey text-black py-0 mb-4">
      {{ title }}
    </v-card-title>
    <v-card-text>
      <div v-if="hasMedia">
        <v-row wrap no-gutters>
          <v-col :cols="widths[0]">
            <component :is="itemForm" />
          </v-col>
          <v-col :cols="widths[1]" class="px-1">
            <MediaSquare v-bind="{
        source: 'media',
        itemIndex: 0,
      }" />
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <component :is="itemForm" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { type Component, computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { useItemStore } from '../../../scripts/stores/item'
import { useCollectionMediaStore } from '../../../scripts/stores/collections/collectionMedia'
import MediaSquare from '../../media/MediaSquare.vue'



const { smAndDown } = useDisplay()
let { array } = storeToRefs(useCollectionMediaStore())
let { derived } = storeToRefs(useItemStore())

const itemForm = computed<Component | null>(() => {

  switch (derived.value.module) {
    case 'Ceramic':
      {
        const CeramicForm = defineAsyncComponent(() => import('../../modules/Ceramic/CeramicForm.vue'))
        return CeramicForm
      }
    case 'Stone':
      {
        const StoneForm = defineAsyncComponent(() => import('../../modules/Stone/StoneForm.vue'))
        return StoneForm
      }
    default:
      return null
  }
})

const title = computed(() => {
  return `${derived.value.moduleAndTag} - Details`
})

const hasMedia = computed(() => {
  return array.value.length > 0
})

const widths = computed(() => {
  return smAndDown.value ? [12, 12] : [9, 3]
})
</script>
