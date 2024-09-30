<template>
  <v-app-bar :height="35">
    <v-app-bar-nav-icon class="hidden-md-and-up" @click="showDrawer = !showDrawer" />
    <component :is="menu?.elements" />
  </v-app-bar>

  <v-navigation-drawer v-model="showDrawer" temporary color="blue-grey darken-4">
    <component :is="menu!.drawer" />
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutesMainStore } from '../../../scripts/stores/routes/routesMain'
import Welcome from './smenus/SMWelcome.vue'
import WelcomeD from './smenus/SMWelcomeDrawer.vue'
import Index from './smenus/SMIndex.vue'
import IndexD from './smenus/SMIndexDrawer.vue'
const Filter = defineAsyncComponent(() => import('./smenus/SMFilter.vue'))
const FilterD = defineAsyncComponent(() => import('./smenus/SMFilterDrawer.vue'))
// import Filter from './smenus/SMFilter.vue'
// import FilterD from './smenus/SMFilterDrawer.vue'
import Show from './smenus/SMShow.vue'
import ShowD from './smenus/SMShowDrawer.vue'
import Media from './smenus/SMMedia.vue'

const { current } = storeToRefs(useRoutesMainStore())
const showDrawer = ref<boolean>(false)

const menu = computed(() => {
  switch (current.value.name) {
    case 'welcome':
      return { elements: Welcome, drawer: WelcomeD }
    case 'index':
      return { elements: Index, drawer: IndexD }
    case 'filter':
      return { elements: Filter, drawer: FilterD }
    case 'show':
      return { elements: Show, drawer: ShowD }

    case 'media':
    default:
      return { elements: Media, drawer: WelcomeD }


  }
})
</script>
