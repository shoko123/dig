<template>
  <v-container v-if="item" fluid class="pa-1 ma-0">
    <v-row v-if="inOC" wrap no-gutters>
      <div class="text-h6">View in opencontext:</div>
      <v-btn prepend-icon="mdi-map-marker" class="mb-3 ml-3 text-none" color="blue-lighten-3" @click="openContextTab()">
        {{ tag }}@opencontext.org
      </v-btn>
    </v-row>
    <v-row wrap no-gutters>
      <v-text-field v-model="item.square" label="Square" class="mr-1" filled readonly />
      <v-text-field v-model="item.context" label="Context" class="mr-1" filled readonly />
      <v-text-field v-model="item.occupation_level" label="Occupation Level" class="mr-1" filled readonly />
    </v-row>
    <v-row wrap no-gutters>
      <v-text-field v-model="item.id" label="Label" class="mr-1" filled readonly />
      <v-text-field v-model="item.excavation_object_id" label="Excavation Object ID" class="mr-1" filled readonly />
      <v-text-field v-model="item.old_museum_id" label="Old Museum ID" class="mr-1" filled readonly />
      <v-text-field v-model="excavation_date" label="Excavation Date" class="mr-1" filled readonly />
    </v-row>
    <v-row wrap no-gutters>
      <v-textarea v-model="item.cataloger_description" label="Cataloger Description" class="mr-1" filled readonly />
      <v-textarea v-model="item.conservation_notes" label="Conservation Notes" class="mr-1" filled readonly />
    </v-row>
    <v-row wrap no-gutters>
      <v-textarea v-model="item.dimension_notes" label="Dimension Notes" class="mr-1" filled readonly />
      <v-textarea v-model="item.specialist_description" label="Specialist Description" class="mr-1" filled readonly />
    </v-row>

    <v-row wrap no-gutters>
      <v-text-field v-model="item.weight" label="Weight" class="mr-1" filled readonly />
      <v-text-field v-model="item.length" label="Length" class="mr-1" filled readonly />
      <v-text-field v-model="item.width" label="Width" class="mr-1" filled readonly />
      <v-text-field v-model="item.diameter" label="Diameter" class="mr-1" filled readonly />
    </v-row>
    <v-row wrap no-gutters>
      <!-- <v-text-field v-model="excavation_date" label="Excavation Date" class="mr-1" filled readonly /> -->
      <v-text-field v-model="cataloger" label="Cataloger" class="mr-1" filled readonly />
      <v-text-field v-model="catalog_date" label="Catalog Date" class="mr-1" filled readonly />
      <v-text-field v-model="specialist" label="Specialist" class="mr-1" filled readonly />
      <v-text-field v-model="specialist_date" label="Specialist Date" class="mr-1" filled readonly />
    </v-row>
    <v-row wrap no-gutters>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { TFieldsByModule, TBespokeFieldsByModule } from '@/js/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'
import { dateStringFromDate } from '../../../scripts/utils/utils'



let { fields, tag, itemFieldsToParamsObj } = storeToRefs(useItemStore())

const item = computed(() => {
  return <TFieldsByModule<'Stone'>>fields.value
})

const inOC = computed(() => {
  return typeof item.value.uri === 'string'
})

const excavation_date = computed(() => {
  return dateStringFromDate(<Date>item.value.excavation_date)
})

const catalog_date = computed(() => {
  return dateStringFromDate(<Date>item.value.catalog_date)
})

const cvColumnsTyped = computed(() => {
  return itemFieldsToParamsObj.value as TBespokeFieldsByModule<'Stone'>
})

const cataloger = computed(() => {
  return cvColumnsTyped.value['cataloger_id']
})

const specialist = computed(() => {
  return 'Jennie Ebeling'
})

const specialist_date = computed(() => {
  return dateStringFromDate(<Date>item.value.specialist_date)
})

function openContextTab() {
  console.log(`goToOpenContext() uri: ${item.value.uri}`)
  window.open(<string>item.value.uri, '_blank', 'noreferrer')
}


</script>