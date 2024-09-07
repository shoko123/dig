<template>
  <v-card class="elevation-12">
    <v-card-title class="bg-grey text-black py-0 mb-4">
      {{ header }}
    </v-card-title>
    <v-card-text>
      <v-tabs v-model="catIndex" class="primary">
        <v-tab v-for="(cat, index) in visibleCategories" :key="index" color="purple"
          :class="cat.hasSelected ? 'has-selected' : ''">
          {{ cat.hasSelected ? `${cat.catName}(*)` : cat.catName }}
        </v-tab>
      </v-tabs>
      <v-tabs v-model="grpIndex">
        <v-tab v-for="(group, index) in visibleGroups" :key="index" color="purple"
          :class="[group.selectedCount > 0 ? 'has-selected' : '', 'text-capitalize']">
          {{ group.selectedCount === 0 ? group.name : `${group.name}(${group.selectedCount})` }}
        </v-tab>
      </v-tabs>

      <v-sheet elevation="10" class="ma-2">
        <div v-if="isColumnSearch">
          <Suspense>
            <OptionsAsTextSearch />
          </Suspense>
        </div>
        <div v-else-if="isOrderBy">
          <Suspense>
            <OptionsAsOrderBy />
          </Suspense>
        </div>
        <div v-else>
          <Suspense>
            <OptionsAsChips />
          </Suspense>
        </div>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>


<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
const { useTrioStore } = await import('../../scripts/stores/trio/trio')
const OptionsAsChips = defineAsyncComponent(() => import('./OptionsAsChips.vue'))
const OptionsAsTextSearch = defineAsyncComponent(() => import('./OptionsAsTextSearch.vue'))
const OptionsAsOrderBy = defineAsyncComponent(() => import('./OptionsAsOrderBy.vue'))
// import OptionsAsTextSearch from './OptionsAsTextSearch.vue'
// import OptionsAsOrderBy from './OptionsAsOrderBy.vue'
let { visibleCategories, visibleGroups, categoryIndex, groupIndex } = storeToRefs(useTrioStore())

const header = computed(() => {
  return 'Filter Selector'
})

const catIndex = computed({
  get: () => {
    return categoryIndex.value
  },
  set: (val) => {
    console.log(`categoryIndex set to ${val}`)
    groupIndex.value = 0
    categoryIndex.value = val
  },
})

const grpIndex = computed({
  get: () => {
    return groupIndex.value
  },
  set: (val) => {
    console.log(`groupIndex set to ${val}`)
    groupIndex.value = val
  },
})

const isColumnSearch = computed(() => {
  if (visibleGroups.value.length === 0) return false
  return visibleGroups.value[groupIndex.value].groupType === 'FS'
})

const isOrderBy = computed(() => {
  if (visibleGroups.value.length === 0) return false
  return visibleGroups.value[groupIndex.value].groupType === 'OB'
})
</script>
<style scoped>
.has-selected {
  background-color: rgb(212, 235, 244);
  margin: 2px;
}
</style>
