<template>
  <v-card>
    <v-card-text>
      <v-row wrap>
        <v-btn class="mx-4" @click="accept()">Accept new id: "{{ newFields.id }}"</v-btn> Or select a new number
        from list below:
      </v-row>
      <v-row wrap>
        <v-chip v-for="(item, index) in availableObjectNos" :key="index" class="font-weight-normal ma-2 body-1"
          @click="selected(item)">
          {{ item }}
        </v-chip>
      </v-row>
      <v-row wrap>
        <slot name="cancel"></slot>
        <!-- <v-btn @click="cancel">Cancel</v-btn> -->
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { TFields } from '@/types/moduleTypes'

import { useItemNewStore } from '../../../scripts/stores/itemNew'

const { openIdSelectorModal, newFields, currentIds } = storeToRefs(useItemNewStore())

const nf = computed(() => {
  return newFields.value as TFields<'Stone'>
})

const availableObjectNos = computed(() => {
  const itemNos = currentIds.value
    .filter((x) => {
      const sections = x.split('.')
      return sections[0] === 'B2024'
    })
    .map((x) => {
      const sections = x.split('.')
      return parseInt(sections[2]!)
    })

  const all = [...Array(200).keys()].map((i) => i + 1)

  return all.filter((x) => {
    return !itemNos.includes(x)
  })
})

//set default selection
selected(availableObjectNos.value[0]!)

function selected(objectNo: number) {
  console.log(`Item selected: ${objectNo}`)
  nf.value.id = 'B2024.1.' + objectNo
  nf.value.id_year = 24
  nf.value.id_access_no = 1
  nf.value.id_object_no = objectNo
}

function accept() {
  openIdSelectorModal.value = false
  console.log(`id accepted: ${newFields.value.id}`)
}

</script>
