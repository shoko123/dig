<template>
  <v-container v-if="item" fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <v-text-field v-model="item.id" label="Name" class="mr-1" readonly filled />
      <v-text-field v-model="item.id_year" label="Year" class="mr-1" readonly filled />
      <v-text-field v-model="item.id_object_no" label="Object Number" class="mr-1" readonly filled />
    </v-row>

    <v-row>
      <v-textarea v-model="item.field_description" label="Field Description" class="mr-1" readonly filled />
      <v-textarea v-model="item.specialist_description" label="Specialist Description" class="mr-1" readonly filled />
      <v-textarea v-model="item.notes" label="Notes" class="mr-1" readonly filled />
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { TFields } from '@/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'

let { fields } = storeToRefs(useItemStore())

const item = computed(() => {
  return fields.value as TFields<'Ceramic'>
})
</script>
