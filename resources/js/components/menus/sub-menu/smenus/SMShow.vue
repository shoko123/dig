<template>
  <div class="hidden-sm-and-down">
    <WelcomeButton />
    <FilterButton />
    <CollectionButton />
  </div>
  <v-divider class="ms-3" inset vertical />
  <NavigateElement />
  <v-spacer />
  <div class="hidden-sm-and-down">
    <ModifyButtons />
    <!-- -->
    <v-btn variant="outlined" color="primary" @click="toggleItemView()">
      <v-icon class="mr-2" left dark> mdi-eye </v-icon>
      {{ displayOption }}
    </v-btn>
    <!-- -->
    <!-- <v-menu>
      <template #activator="{ props }">
        <v-btn color="primary" v-bind="props">
          <v-icon class="mr-2" left dark> mdi-eye </v-icon>
          {{ itemViewText }}
        </v-btn>
      </template>
<v-list>
  <v-list-item v-for="(item, index) in displayOptions" :key="index" :value="index" @click="setItemViewIndex(index)">
    <v-list-item-title>{{ item }}</v-list-item-title>
  </v-list-item>
</v-list>
</v-menu> -->
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
// import { useItemStore } from '../../../../scripts/stores/item'
import { useModuleStore } from '../../../../scripts/stores/module'
import NavigateElement from '../elements/NavigateElement.vue'
import ModifyButtons from '../elements/ModifyButtons.vue'
import WelcomeButton from '../elements/WelcomeButton.vue'
import FilterButton from '../elements/FilterButton.vue'
import CollectionButton from '../elements/CollectionButton.vue'

// let is = useItemStore()
const moduleStore = useModuleStore()

// const displayOptions = computed(() => {
//   return is.itemViews
// })

const displayOption = computed(() => {
  return moduleStore.itemView
})

// const itemViewText = computed(() => {
//   return is.itemViews.length === 0 ? '' : is.itemView
// })
function toggleItemView() {
  moduleStore.setNextItemView()
}
// function setItemViewIndex(index: number) {
//   is.setItemViewIndex(index)
// }
</script>
