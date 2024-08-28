<template>
  <v-chip-group v-model="selectedOptionIndexes" multiple column selected-class="primary">
    <v-chip v-for="(param, index) in options" :key="index" color="blue" large @click="paramClicked(param.key)">
      {{ param.text }}
    </v-chip>
  </v-chip-group>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTrioStore } from '../../scripts/stores/trio/trio'

let trio = useTrioStore()

const options = computed(() => {
  return trio.visibleOptions
})

const selectedOptionIndexes = computed({
  get: () => {
    let selected: number[] = []
    options.value.forEach((x, index) => {
      if (x.selected === true) {
        selected.push(index)
      }
    })
    return selected
  },
  set: (val) => {
    val
  },
})

function paramClicked(prmKey: string) {
  trio.optionClicked(prmKey)
}
</script>
