<template>
  <FilterButton />
  <CollectionButton />
  <div class="hidden-sm-and-down">
    <v-btn variant="outlined" @click="showClicked()">
      Show Item<v-tooltip activator="parent" location="bottom left">
        Go to the first item
      </v-tooltip>
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import FilterButton from '../elements/FilterButton.vue'
import CollectionButton from '../elements/CollectionButton.vue'
import { useModuleStore } from '../../../../scripts/stores/module'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'

const { routerPush } = useRoutesMainStore()
const { firstSlug } = storeToRefs(useModuleStore())

async function showClicked() {
  await routerPush('show', firstSlug.value)
}
</script>
