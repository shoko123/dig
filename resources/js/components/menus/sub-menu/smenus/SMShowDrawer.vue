<template>
  <v-list-item @click="goTo('welcome')"> Welcome </v-list-item>
  <v-list-item @click="goTo('filter')"> Filter </v-list-item>
  <v-list-item @click="goTo('index')"> Collection </v-list-item>
  <v-list-item @click="toggle"> Toggle View </v-list-item>
  <v-divider />
  <v-list-item>Please Note: Editing is disabled on small devices!</v-list-item>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { type TPageName } from '@/js/types/routesTypes'
import { useItemStore } from '../../../../scripts/stores/item'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'

const { routerPush } = useRoutesMainStore()
const { itemViewIndex, itemViews } = storeToRefs(useItemStore())

function goTo(pageName: TPageName) {
  routerPush(pageName)
}

function toggle() {
  itemViewIndex.value = (itemViewIndex.value + 1) % itemViews.value.length
}
</script>
