<template>
  <MainMenu />
  <SubMenu v-if="hasSubMenu" />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useMenusStore } from '../../scripts/stores/menus'
import MainMenu from './main-menu/MainMenu.vue'
import SubMenu from './sub-menu/SubMenu.vue'

let { hasSubMenu } = storeToRefs(useMenusStore())
</script>
