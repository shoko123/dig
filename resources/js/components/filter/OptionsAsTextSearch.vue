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
import { computed } from 'vue'
import { useTrioStore } from '../../scripts/stores/trio/trio'

const trioStore = useTrioStore()

const textSearchValues = computed(() => {
  if (trioStore.currentGroup?.code !== 'FS') {
    return []
  }
  return trioStore.currentGroup.optionKeys.map((x) => {
    return trioStore.trio.optionsObj[x]!.text
  })
})

function searchTextChanged(index: number, val: string) {
  const textSearchOptionKeys = trioStore.currentGroup?.optionKeys
  const optionKey = textSearchOptionKeys![index]!
  //console.log(`changeOccured() index: ${index} setting option with key ${optionKey} to: ${val}`)
  trioStore.trio.optionsObj[optionKey]!.text = val

  //add/remove from selected filters
  const inSelected = trioStore.filterAllOptionKeys.includes(optionKey)
  if (inSelected && val === '') {
    const i = trioStore.filterAllOptionKeys.indexOf(optionKey)
    trioStore.filterAllOptionKeys.splice(i, 1)
  }
  if (!inSelected && val !== '') {
    trioStore.filterAllOptionKeys.push(optionKey)
  }
}

function searchTextClearCurrent() {
  trioStore.SearchTextClear(true)
}

</script>
