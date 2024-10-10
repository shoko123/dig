<template>
  <v-chip-group v-model="selectedOptionIndexes" multiple column selected-class="primary">
    <v-chip v-for="(param, index) in selectorOptions" :key="index" color="blue" large @click="paramClicked(param.key)">
      {{ param.text }}
    </v-chip>
  </v-chip-group>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useTrioStore } from '../../scripts/stores/trio/trio'

const { optionClicked } = useTrioStore()
const { selectorOptions } = storeToRefs(useTrioStore())

const selectedOptionIndexes = computed({
  get: () => {
    let selected: number[] = []
    selectorOptions.value.forEach((x, index) => {
      if (x.selected === true) {
        selected.push(index)
      }
    })
    return selected
  },
  // eslint-disable-next-line 
  set: (val) => { },
})

function paramClicked(prmKey: string) {
  optionClicked(prmKey)
}
</script>
