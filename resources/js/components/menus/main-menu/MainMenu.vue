<template>
  <v-app-bar :height="35" :color="menu.color" dark>
    <v-app-bar-nav-icon class="hidden-md-and-up" @click="showDrawer = !showDrawer" />
    <component :is="menu.elements" />
  </v-app-bar>

  <v-navigation-drawer v-model="showDrawer" temporary color="blue-grey darken-4">
    <component :is="menu.drawer" />
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMenusStore } from '../../../scripts/stores/menus'
import Read from './menus/MMRead.vue'
import ReadDrawer from './menus/MMReadDrawer.vue'
import Auth from './menus/MMAuth.vue'
import AuthDrawer from './menus/MMAuthDrawer.vue'
import Modify from './menus/MMModify.vue'
import Admin from './menus/MMAdmin.vue'

const { mainMenuType } = storeToRefs(useMenusStore())
const showDrawer = ref<boolean>(false)

const menu = computed(() => {
  switch (mainMenuType.value) {
    case 'Read':
      return { elements: Read, drawer: ReadDrawer, color: 'primary' }
    case 'Modify':
      return { elements: Modify, drawer: null, color: 'orange' }
    case 'Admin':
      return { elements: Admin, drawer: null, color: 'red' }
    case 'Auth':
    default:
      return { elements: Auth, drawer: AuthDrawer, color: 'primary' }
  }
})
</script>
