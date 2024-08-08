<template>
  <v-card class="elevation-12">
    <v-card-title class="bg-grey text-black py-0 mb-4">
      {{ header }}
    </v-card-title>
    <v-card-text>
      <div class="mb-2">
        <v-btn color="green" @click="submit"> Submit </v-btn>
        <v-btn class="ml-2" color="red" @click="cancel"> Cancel </v-btn>
        <v-btn class="ml-2" color="blue" @click="resetToItem"> Reset To Item </v-btn>
        <v-btn class="ml-2" color="blue" @click="clear"> Clear </v-btn>
      </div>
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

      <v-sheet elevation="10" class="mt-2 pa-4">
        <div>{{ groupHeader }}</div>
        <v-chip-group v-model="selectedParams" multiple column active-class="primary">
          <v-chip v-for="(param, index) in visibleParams" :key="index" color="blue" large
            @click="paramClicked(param.key)">
            {{ param.text }}
          </v-chip>
        </v-chip-group>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrioStore } from '../../scripts/stores/trio/trio'
import { useTaggerStore } from '../../scripts/stores/trio/tagger'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useNotificationsStore } from '../../scripts/stores/notifications'

const { routerPush } = useRoutesMainStore()
const { visibleCategories, visibleGroups, visibleParams, categoryIndex, groupIndex } =
  storeToRefs(useTrioStore())
const { resetCategoryAndGroupIndices, paramClicked } = useTrioStore()
const { sync, prepareTagger, truncateNewItemParams, resetParams } = useTaggerStore()
const { showSpinner, showSnackbar } = useNotificationsStore()

const header = computed(() => {
  return 'Item Tagger'
})

const groupHeader = computed(() => {
  let group = visibleGroups.value[grpIndex.value]
  return `${group.required ? 'R' : 'Not r'}equired,  ${group.multiple ? 'multiple' : 'single'} selection`
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

const selectedParams = computed({
  get: () => {
    let selected: number[] = []
    visibleParams.value.forEach((x, index) => {
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

async function submit() {
  showSpinner('Syncing tags...')
  const res = await sync()
  showSpinner(false)

  if (res.success) {
    resetCategoryAndGroupIndices()
    truncateNewItemParams()
    routerPush('back1')
  } else {
    showSnackbar(`Syncing of tags failed. Error: ${res.message}`)
  }
}

function cancel() {
  console.log(`cancelClicked`)
  resetCategoryAndGroupIndices()
  truncateNewItemParams()
  routerPush('back1')
}

function resetToItem() {
  console.log(`resetToItem`)
  resetCategoryAndGroupIndices()
  prepareTagger()
}

function clear() {
  console.log(`clear`)
  resetCategoryAndGroupIndices()
  resetParams()
}

</script>
<style scoped>
.has-selected {
  background-color: rgb(212, 235, 244);
  margin: 2px;
}
</style>
