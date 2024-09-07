<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" sm="8">
        <v-card class="mx-auto" variant="outlined">
          <v-card-item>
            <v-text-field v-for="(item, index) in textSearchValues" :key="index" v-model="textSearchValues[index]"
              :label="`term-${index + 1}`" :name="`search-${index + 1}`" filled
              @update:model-value="(val: string) => searchTextChanged(index, val)" />
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" sm="2">
        <v-btn class="ml-2" @click="searchTextClearCurrent"> Clear </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
// import { useTrioStore } from '../../scripts/stores/trio/trio'
const { useTrioStore } = await import('../../scripts/stores/trio/trio')
const { textSearchValues } = storeToRefs(useTrioStore())

async function getFilterStore() {
  const { useFilterStore } = await import('../../scripts/stores/trio/filter')
  return useFilterStore()
}

async function searchTextChanged(index: number, val: string) {
  const filterStore = await getFilterStore()
  filterStore.searchTextChanged(index, val)
}

async function searchTextClearCurrent() {
  const filterStore = await getFilterStore()
  filterStore.searchTextClearCurrent()
}
</script>
