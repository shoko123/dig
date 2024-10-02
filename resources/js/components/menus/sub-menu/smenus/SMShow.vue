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
    <v-btn variant="outlined" color="primary" @click="toggle()">
      <v-icon class="mr-2" left dark> mdi-eye </v-icon>
      {{ displayOption }}
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useModuleStore } from '../../../../scripts/stores/module'
import NavigateElement from '../elements/NavigateElement.vue'
import ModifyButtons from '../elements/ModifyButtons.vue'
import WelcomeButton from '../elements/WelcomeButton.vue'
import FilterButton from '../elements/FilterButton.vue'
import CollectionButton from '../elements/CollectionButton.vue'

const moduleStore = useModuleStore()

const displayOption = computed(() => {
  return moduleStore.itemView
})

function toggle() {
  moduleStore.setNextItemView()
}
</script>
