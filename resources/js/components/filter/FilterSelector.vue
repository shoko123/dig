<template>
  <v-card class="elevation-12">
    <v-card-title class="bg-grey text-black py-0 mb-4">
      {{ header }}
    </v-card-title>
    <v-card-text>
      <v-tabs v-model="catIndex" class="primary">
        <v-tab v-for="(cat, index) in selectorCategoryTabs" :key="index" color="purple"
          :class="cat.selectedCount > 0 ? 'has-selected' : ''">
          {{ cat.selectedCount > 0 ? `${cat.catName}(*)` : cat.catName }}
        </v-tab>
      </v-tabs>
      <v-tabs v-model="grpIndex">
        <v-tab v-for="(group, index) in selectorGroupTabs" :key="index" color="purple"
          :class="[group.selectedCount! > 0 ? 'has-selected' : '', 'text-capitalize']">
          {{ group.selectedCount === 0 ? group.name : `${group.name}(${group.selectedCount})` }}
        </v-tab>
      </v-tabs>

      <v-sheet elevation="10" class="ma-2">
        <component :is="OptionForm" />
      </v-sheet>
    </v-card-text>
  </v-card>
</template>


<script lang="ts" setup>
import { computed, defineAsyncComponent, type Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrioStore } from '../../scripts/stores/trio/trio'

const OptionsAsChips = defineAsyncComponent(() => import('./OptionsAsChips.vue'))
const OptionsAsTextSearch = defineAsyncComponent(() => import('./OptionsAsTextSearch.vue'))
const OptionsAsOrderBy = defineAsyncComponent(() => import('./OptionsAsOrderBy.vue'))

const { selectorCategoryIndex, selectorGroupIndex, selectorCategoryTabs, selectorGroupTabs } = storeToRefs(useTrioStore())

const header = computed(() => {
  return 'Filter Selector'
})

const OptionForm = computed<Component>(() => {
  switch (selectorGroupTabs.value[selectorGroupIndex.value]?.groupType) {
    case 'OB':
      return OptionsAsOrderBy
    case 'FS':
      return OptionsAsTextSearch
    default:
      return OptionsAsChips
  }
})

const catIndex = computed({
  get: () => {
    console.log(`Filter.selectorCategoryIndex get: ${selectorCategoryIndex.value}`)
    return selectorCategoryIndex.value
  },
  set: (val) => {
    console.log(`Filter.selectorCategoryIndex set: ${val}`)
    selectorGroupIndex.value = 0
    selectorCategoryIndex.value = val
  },
})

const grpIndex = computed({
  get: () => {
    console.log(`selectorGroupIndex get:  ${selectorGroupIndex.value}`)
    return selectorGroupIndex.value
  },
  set: (val) => {
    console.log(`selectorGroupIndex set: ${val}`)
    selectorGroupIndex.value = val
  },
})

</script>
<style scoped>
.has-selected {
  background-color: rgb(212, 235, 244);
  margin: 2px;
}
</style>
