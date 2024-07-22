<template>
  <v-container fluid>
    <component :is="view" />
  </v-container>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import { computed } from 'vue'
import { useItemStore } from '../../scripts/stores/item'
import ShowView0 from '../item/layouts/ShowView0.vue'
import ShowView1 from '../item/layouts/ShowView1.vue'
import ShowView2 from '../item/layouts/ShowView2.vue'

let is = useItemStore()

const view = computed<Component>(() => {
  switch (is.itemViewIndex) {
    case 0:
      return ShowView0
    case 1:
      return ShowView1
    case 2:
      return ShowView2
    default:
      console.log(`Show.vue invalid itemViewIndex`)
      return ShowView0
  }
})
</script>
