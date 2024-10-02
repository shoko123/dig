<template>
  <v-container fluid>
    <component :is="view" />
  </v-container>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useModuleStore } from '../../scripts/stores/module'
import ShowView0 from '../item/layouts/ShowView0.vue'
import ShowView1 from '../item/layouts/ShowView1.vue'
import ShowView2 from '../item/layouts/ShowView2.vue'


const { itemView } = storeToRefs(useModuleStore())

const view = computed<Component>(() => {
  switch (itemView.value) {
    case 'Main':
      return ShowView0
    case 'Media':
      return ShowView1
    case 'Related':
      return ShowView2
    default:
      console.log(`Show.vue invalid itemView: "${itemView.value}"`)
      return ShowView0
  }
})
</script>
