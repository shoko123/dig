<template>
  <v-container v-if="item" fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <v-text-field v-model="item.id" label="Name" class="mr-1" readonly filled />
      <v-text-field v-model="item.area" label="Area" class="mr-1" readonly filled />
      <v-text-field v-model="item.area" label="Square" class="mr-1" readonly filled />
      <v-text-field v-model="item.area" label="Stratum" class="mr-1" name="width" readonly filled />
    </v-row>

    <v-row>
      <v-textarea v-model="item.area" label="Notes" class="mr-1" name="length" readonly filled />
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { TFieldsByModule } from '@/js/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'

let { fields } = useItemStore()

const item = computed(() => {
  return fields as TFieldsByModule<'Ceramic'>
})
</script>
