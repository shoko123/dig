<template>
  <v-card>
    <v-card-text>
      <v-row wrap no-gutters>
        <v-select v-model="nf.id_year" label="Select" item-title="text" item-value="extra"
          :items="yearInfo.options"></v-select>
        <v-select v-model="nf.id_object_no" label="Select" item-title="text" item-value="extra"
          :items="availableObjectNos"></v-select>
      </v-row>
      <v-row wrap>
        <slot name="cancel"></slot>
        <v-btn @click="cancel">Cancel</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { TFields } from '@/types/moduleTypes'
import { useCeramicStore } from '../../../scripts/stores/modules/Ceramic'
import { useItemNewStore } from '../../../scripts/stores/itemNew'

const { availableObjectNos } = storeToRefs(useCeramicStore())
const { openIdSelectorModal, newFields, itemNewFieldsToOptionsObj } = storeToRefs(useItemNewStore())

const nf = computed(() => {
  return newFields.value as TFields<'Ceramic'>
})

const yearInfo = computed(() => {
  return itemNewFieldsToOptionsObj.value['id_year']!
})

// function selected(item_no: number) {
//   console.log(`Item selected: ${item_no}`)
//   newFields.value.id = 'B2024.1.' + item_no

//   nf.value.id_object_no = item_no
//   openIdSelectorModal.value = false
// }

// function accept() {
//   openIdSelectorModal.value = false
//   console.log(`id accepted: ${newFields.value.id}`)
// }
function cancel() {
  openIdSelectorModal.value = false
  console.log(`id accepted: ${newFields.value.id}`)
}

</script>
