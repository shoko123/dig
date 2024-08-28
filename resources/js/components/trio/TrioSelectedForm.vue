<template>
  <v-card class="elevation-12">
    <v-card-title class="bg-grey text-black py-0 mb-4">
      {{ d.header }}
    </v-card-title>
    <v-card-text>
      <div v-if="!d.data.length">
        {{ d.emptyTitle }}
      </div>
      <v-list v-if="d.data.length">
        <v-list-item v-for="(cat, keyC) in d.data" :key="keyC">
          <div class="font-weight-bold">
            {{ cat.label }}
          </div>
          <v-list-item v-for="(group, keyG) in cat.groups" :key="keyG">
            <v-list-item-title>
              <v-container fluid class="pa-0 ma-0">
                <v-row class="pa-2 ma-2">
                  <div>{{ group.label }}:</div>
                  <v-chip v-for="(param, keyP) in group.params" :key="keyP" class="ml-2 mb-2">
                    {{ param }}
                  </v-chip>
                </v-row>
              </v-container>
            </v-list-item-title>
            <v-row />
          </v-list-item>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { TrioSourceName } from '../../types/trioTypes'
import { useTrioSelectedStore } from '../../scripts/stores/trio/selectedParams'
import { useItemStore } from '../../scripts/stores/item'
let { selectedTrio } = useTrioSelectedStore()
let { derived } = storeToRefs(useItemStore())

const props = defineProps<{
  source: TrioSourceName
}>()

const d = computed(() => {
  switch (props.source) {
    case 'Filter':
      return {
        data: selectedTrio('Filter'),
        header: `Selected Filters`,
        emptyTitle: `[ No filters selected ]`,
      }

    case 'Item':
      return {
        data: selectedTrio('Item'),
        header: `${derived.value.moduleAndTag} - Tags`,
        emptyTitle: `[ Item has no tags ]`,
      }

    case 'Tagger':
    default:
      return {
        data: selectedTrio('Tagger'),
        header: `Selected Tags`,
        emptyTitle: `[ No tags selected ]`,
      }
  }
})
</script>
