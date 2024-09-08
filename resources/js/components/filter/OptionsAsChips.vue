<template>
  <v-chip-group v-model="selectedOptionIndexes" multiple column selected-class="primary">
    <v-chip v-for="(param, index) in options" :key="index" color="blue" large @click="paramClicked(param.key)">
      {{ param.text }}
    </v-chip>
  </v-chip-group>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
const { useTrioStore } = await import('../../scripts/stores/trio/trio')
const trioStore = useTrioStore()

const options = computed(() => {
  return trioStore.visibleOptions
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
  trioStore.optionClicked(prmKey)
}
</script>
