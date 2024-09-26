<template>
  <v-card>
    <v-card-text>
      <v-row wrap>
        <v-select v-model="nf.id_year" label="Select" item-title="text" item-value="extra"
          :items="yearInfo.options"></v-select>
        <v-select v-model="nf.id_object_no" label="Select" item-title="text" item-value="extra"
          :items="availableObjectNos" @update:model-value="objNoSelected"></v-select>
      </v-row>
      <v-row wrap>
        <v-btn @click="accept">Accept</v-btn>
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

function accept() {
  openIdSelectorModal.value = false
  console.log(`id accepted: ${newFields.value.id}`)
}


function objNoSelected(selected: number) {
  console.log(`objNoSelected(${selected})`)
  nf.value.id = `${nf.value.id_year}.${nf.value.id_object_no}`
}

// function accept() {
//   openIdSelectorModal.value = false
//   console.log(`id accepted: ${newFields.value.id}`)
// }
function cancel() {
  console.log(`cancel`)
}

</script>
