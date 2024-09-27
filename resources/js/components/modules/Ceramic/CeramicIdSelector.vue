<template>
  <v-card class="mx-auto" min-width="800" max-width="900">
    <v-card-text>
      <v-row>
        <v-select v-model="nf.id_year" label="Year" item-title="text" item-value="extra" :items="yearInfo.options"
          class="mx-2" @update:model-value="yearSelected"></v-select>
        <v-select v-model="nf.id_object_no" label="Object No." item-title="text" item-value="extra"
          :items="availableObjectNos" @update:model-value="objNoSelected"></v-select>
        <!-- <v-text-field v-model="nf.id" label="Selected Id" class="mx-5 bg-green" filled /> -->

      </v-row>
      <v-row>
        <v-btn class="bg-grey text-black my-4">{{ nf.id }}</v-btn>
      </v-row>
      <v-row>
        <v-btn class="mx-4" @click="accept">Accept</v-btn>
        <v-btn @click="cancel">Cancel</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { TFields } from '@/types/moduleTypes'
import { useCeramicStore } from '../../../scripts/stores/modules/Ceramic'
import { useItemNewStore } from '../../../scripts/stores/itemNew'

onMounted(() => {
  objNoSelected(1)
})
const { availableObjectNos } = useCeramicStore()
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

function yearSelected(selected: number) {
  console.log(`yearSelected(${selected})`)
  nf.value.id_object_no = availableObjectNos[0]!
  nf.value.id = `${nf.value.id_year}.${nf.value.id_object_no}`
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
