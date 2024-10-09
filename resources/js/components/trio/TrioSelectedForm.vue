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
                  <v-chip v-for="(option, keyP) in group.options" :key="keyP" class="ml-2 mb-2">
                    {{ option }}
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
import { useItemStore } from '../../scripts/stores/item'
import { useTrioStore } from '../../scripts/stores/trio/trio'

const { derived } = storeToRefs(useItemStore())
const { displayedSelectedFilter, displayedSelectedItem, displayedSelectedTagger } = storeToRefs(useTrioStore())

const props = defineProps<{
  source: TrioSourceName
}>()

const d = computed(() => {
  switch (props.source) {
    case 'Filter':
      return {
        data: displayedSelectedFilter.value,
        header: `Selected Filters`,
        emptyTitle: `[ No filters selected ]`,
      }

    case 'Item':
      return {
        data: displayedSelectedItem.value,
        header: `${derived.value.moduleAndTag} - Tags`,
        emptyTitle: `[ Item has no tags ]`,
      }

    case 'Tagger':
    default:
      return {
        data: displayedSelectedTagger.value,
        header: `Selected Tags`,
        emptyTitle: `[ No tags selected ]`,
      }
  }
})
</script>
