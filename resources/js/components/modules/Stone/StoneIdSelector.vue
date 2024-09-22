<template>
  <v-card>
    <v-card-text>
      <v-row wrap>
        <v-btn class="mx-4" @click="accept()">Accept new id: "{{ newFields.id }}"</v-btn> Or select a new number
        from list below:
      </v-row>
      <v-row wrap>
        <v-chip v-for="(item, index) in availableItemNumbers" :key="index" class="font-weight-normal ma-2 body-1"
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
import type { TFieldsByModule } from '@/types/moduleTypes'
import { useStoneStore } from '../../../scripts/stores/modules/Stone'
import { useItemNewStore } from '../../../scripts/stores/itemNew'
const { availableItemNumbers } = storeToRefs(useStoneStore())

const { openIdSelectorModal, newFields } = storeToRefs(useItemNewStore())

const nf = computed(() => {
  return newFields.value as TFieldsByModule<'Stone'>
})

function selected(item_no: number) {
  console.log(`Item selected: ${item_no}`)
  newFields.value.id = 'B2024.1.' + item_no

  nf.value.id_object_no = item_no
  openIdSelectorModal.value = false
}

function accept() {
  openIdSelectorModal.value = false
  console.log(`id accepted: ${newFields.value.id}`)
}

</script>
