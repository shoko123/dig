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
const { useTrioStore } = await import('../../scripts/stores/trio/trio')
const { textSearchValues } = storeToRefs(useTrioStore())

async function getFilterStore() {
  const { useFilterStore } = await import('../../scripts/stores/trio/filter')
  return useFilterStore()
}

async function localSearchTextChanged(index: number, val: string) {
  const filterStore = await getFilterStore()
  await filterStore.searchTextChanged(index, val)
}

async function localSearchTextClearCurrent() {
  const filterStore = await getFilterStore()
  await filterStore.searchTextClearCurrent()
}
</script>
