<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" sm="8">
        <v-card class="mx-auto" variant="outlined">
          <v-card-item>
            <v-text-field v-for="(item, index) in textSearchValues" :key="index" v-model="textSearchValues[index]"
              :label="`term-${index + 1}`" :name="`search-${index + 1}`" filled
              @update:model-value="(val: string) => localSearchTextChanged(index, val)" />
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" sm="2">
        <v-btn class="ml-2" @click="localSearchTextClearCurrent"> Clear </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useTrioStore } from '../../scripts/stores/trio/trio'
import { useFilterStore } from '../../scripts/stores/trio/filter'

const { textSearchValues } = storeToRefs(useTrioStore())

function getFilterStore() {
  return useFilterStore()
}

function localSearchTextChanged(index: number, val: string) {
  const filterStore = getFilterStore()
  filterStore.searchTextChanged(index, val)
}

function localSearchTextClearCurrent() {
  const filterStore = getFilterStore()
  filterStore.searchTextClearCurrent()
}
</script>
